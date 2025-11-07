import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { rewards, ledgerEntries, users } from "@/db/schema";
import { randomUUID } from "crypto";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { checkSafety } from "@/lib/safety";
import { getRewardPolicy, calculateTotalCost } from "@/lib/rewards/policies";
import { track } from "@/lib/track";

export const dynamic = "force-dynamic";

const grantRewardSchema = z.object({
  userId: z.string().uuid(),
  rewardType: z.enum(["streak_shield", "ai_minutes", "badge", "credits"]),
  amount: z.number().int().positive().optional(),
  loop: z.string().max(24).optional(),
  dedupeKey: z.string().max(255),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * POST /api/rewards/grant
 * Grant a reward to a user (idempotent)
 */
export async function POST(request: NextRequest) {
  try {
    // Note: This endpoint can be called by anyone (e.g., from FVM completion)
    // The userId in the request body identifies who gets the reward
    const body = await request.json();
    const validated = grantRewardSchema.parse(body);

    const { userId, rewardType, amount, loop, dedupeKey, metadata } = validated;

    // Check idempotency: if reward with this dedupe_key already exists and is granted, return it
    const existingReward = await db
      .select()
      .from(rewards)
      .where(eq(rewards.dedupeKey, dedupeKey))
      .limit(1);

    if (existingReward.length > 0) {
      const existing = existingReward[0];
      if (existing.status === "granted") {
        // Already granted, return success
        return NextResponse.json(
          {
            success: true,
            rewardId: existing.id,
            message: "Reward already granted",
          },
          { status: 200 }
        );
      }
      // If status is denied or pending, we'll continue to process
    }

    // Get user to determine persona
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const persona = (user.persona || "student") as "student" | "parent" | "tutor";

    // Get reward policy for this persona and trigger (on_fvm_complete)
    const policy = getRewardPolicy(persona, "on_fvm_complete");
    
    if (!policy) {
      return NextResponse.json(
        { error: "No reward policy found for this persona" },
        { status: 400 }
      );
    }

    // Validate reward type matches policy
    if (policy.type !== rewardType) {
      return NextResponse.json(
        { error: `Reward type mismatch: expected ${policy.type}, got ${rewardType}` },
        { status: 400 }
      );
    }

    // Use amount from policy if not provided
    const rewardAmount = amount ?? policy.amount ?? 1;

    // Check Trust & Safety
    const safetyResult = await checkSafety(userId, {
      loop,
      rewardType,
      amount: rewardAmount,
      metadata,
    });

    const rewardId = existingReward.length > 0 
      ? existingReward[0].id 
      : randomUUID();

    const now = new Date();

    if (!safetyResult.allowed) {
      // Denied: write reward with denied status
      await db
        .insert(rewards)
        .values({
          id: rewardId,
          userId,
          type: rewardType,
          amount: rewardAmount,
          loop: loop || null,
          dedupeKey,
          status: "denied",
          deniedReason: safetyResult.reason || "Safety check failed",
          createdAt: now,
        })
        .onConflictDoUpdate({
          target: rewards.dedupeKey,
          set: {
            status: "denied",
            deniedReason: safetyResult.reason || "Safety check failed",
          },
        });

      // Write ledger entry for denied reward (for tracking)
      const deniedCost = calculateTotalCost(rewardType, rewardAmount);
      await db.insert(ledgerEntries).values({
        userId,
        rewardId,
        type: "reward_denied",
        unitCostCents: policy.unitCostCents,
        quantity: rewardAmount,
        totalCostCents: deniedCost,
        loop: loop || null,
        metadata: {
          ...(metadata || {}),
          reward_type: rewardType,
          reason: safetyResult.reason || "Safety check failed",
        },
        createdAt: now,
      });

      // Note: reward.denied event not tracked (not in EventName type)
      // Ledger entry is sufficient for cost tracking

      return NextResponse.json(
        {
          success: false,
          error: "Reward denied",
          reason: safetyResult.reason,
        },
        { status: 403 }
      );
    }

    // Granted: write reward with granted status
    await db
      .insert(rewards)
      .values({
        id: rewardId,
        userId,
        type: rewardType,
        amount: rewardAmount,
        loop: loop || null,
        dedupeKey,
        status: "granted",
        grantedAt: now,
        createdAt: now,
      })
      .onConflictDoUpdate({
        target: rewards.dedupeKey,
        set: {
          status: "granted",
          grantedAt: now,
        },
      });

    // Calculate costs
    const totalCostCents = calculateTotalCost(rewardType, rewardAmount);

    // Write ledger entry
    await db.insert(ledgerEntries).values({
      userId,
      rewardId,
      type: "reward_grant",
      unitCostCents: policy.unitCostCents,
      quantity: rewardAmount,
      totalCostCents,
      loop: loop || null,
      metadata: {
        ...(metadata || {}),
        reward_type: rewardType,
      },
      createdAt: now,
    });

    // Track event
    await track("reward.granted", {
      user_id: userId,
      reward_type: rewardType,
      amount: rewardAmount,
      loop: loop || undefined,
    }, { user_id: userId });

    return NextResponse.json(
      {
        success: true,
        rewardId,
        rewardType,
        amount: rewardAmount,
        unitCostCents: policy.unitCostCents,
        totalCostCents,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[rewards/grant] Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

