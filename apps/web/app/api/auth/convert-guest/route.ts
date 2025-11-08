import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  guestChallengeCompletions,
  challenges,
  referrals,
} from "@/db/schema/index";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import { trackXpEvent } from "@/lib/xp";
import type { Persona } from "@/db/types";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/convert-guest
 * Convert guest challenge completions to real user after signup
 * Called by the registration flow after successful account creation
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { guestSessionId } = body;

    if (!guestSessionId) {
      return NextResponse.json(
        { error: "Missing guestSessionId" },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const persona = (session.user.persona || "student") as Persona;

    // Fetch all guest completions for this session
    const guestCompletions = await db
      .select()
      .from(guestChallengeCompletions)
      .where(
        and(
          eq(guestChallengeCompletions.guestSessionId, guestSessionId),
          eq(guestChallengeCompletions.converted, false)
        )
      );

    if (guestCompletions.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No guest completions to convert",
        xpEarned: 0,
        completionsConverted: 0,
      });
    }

    let totalXpEarned = 0;
    const conversions = [];

    for (const completion of guestCompletions) {
      try {
        // 1. Fetch the original challenge to update invitedUserId
        const [challenge] = await db
          .select()
          .from(challenges)
          .where(eq(challenges.id, completion.challengeId))
          .limit(1);

        if (challenge) {
          // Update challenge with invited user ID
          await db
            .update(challenges)
            .set({ invitedUserId: userId })
            .where(eq(challenges.id, completion.challengeId));
        }

        // 2. Create XP event for challenge completion
        const isPerfect = completion.score === 100;
        const eventType = isPerfect ? "challenge.perfect" : "challenge.completed";
        const rawXp = isPerfect ? 50 : Math.max(10, Math.floor(completion.score / 10));

        await trackXpEvent({
          userId,
          personaType: persona,
          eventType,
          referenceId: completion.challengeId,
          metadata: {
            subject: (completion.metadata as { subject?: string })?.subject,
            score: completion.score,
          },
          rawXp,
        });

        totalXpEarned += rawXp;

        // 3. Create referral record
        if (completion.inviterId && completion.inviterId !== userId) {
          const referralId = randomUUID();

          await db
            .insert(referrals)
            .values({
              id: referralId,
              inviterId: completion.inviterId,
              inviteeId: userId,
              smartLinkCode: completion.smartLinkCode,
              loop: "buddy_challenge",
              inviteeCompletedAction: true,
              inviterRewarded: false, // Will be rewarded by separate process
              inviteeRewarded: true, // Just got XP
              metadata: {
                challengeId: completion.challengeId,
                inviteeScore: completion.score,
                conversionTimeMs: Date.now() - new Date(completion.createdAt).getTime(),
              },
              createdAt: new Date(completion.createdAt),
              completedAt: new Date(),
            })
            .onConflictDoNothing(); // Prevent duplicates

          // 4. Award inviter XP for successful referral
          try {
            await trackXpEvent({
              userId: completion.inviterId,
              personaType: "student", // Assume student for referrer
              eventType: "invite.accepted",
              referenceId: referralId,
              metadata: {
                inviteId: referralId, // Use referralId as inviteId
                subject: (completion.metadata as { subject?: string })?.subject,
              },
              rawXp: 25, // Referral bonus
            });

            // Update referral to mark inviter as rewarded
            await db
              .update(referrals)
              .set({
                inviterRewarded: true,
                rewardedAt: new Date(),
              })
              .where(eq(referrals.id, referralId));
          } catch (error) {
            console.error(
              "[convert-guest] Failed to reward inviter:",
              error
            );
            // Don't fail the whole conversion if inviter reward fails
          }
        }

        // 5. Mark guest completion as converted
        await db
          .update(guestChallengeCompletions)
          .set({
            converted: true,
            convertedUserId: userId,
            convertedAt: new Date(),
          })
          .where(eq(guestChallengeCompletions.id, completion.id));

        conversions.push({
          challengeId: completion.challengeId,
          score: completion.score,
          xpEarned: rawXp,
        });
      } catch (error) {
        console.error(
          `[convert-guest] Failed to convert completion ${completion.id}:`,
          error
        );
        // Continue with other completions
      }
    }

    // Dispatch event for sidebar refresh
    // (This will be picked up by client-side code)
    return NextResponse.json({
      success: true,
      xpEarned: totalXpEarned,
      completionsConverted: conversions.length,
      conversions,
    });
  } catch (error) {
    console.error("[convert-guest] Error:", error);
    return NextResponse.json(
      { error: "Failed to convert guest completions" },
      { status: 500 }
    );
  }
}

