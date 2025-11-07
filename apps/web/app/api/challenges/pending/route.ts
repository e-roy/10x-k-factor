import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { challenges } from "@/db/schema";
import { eq, and, or } from "drizzle-orm";

/**
 * Get all pending challenges for the current user
 * GET /api/challenges/pending
 */
export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch all pending or active challenges that haven't expired
    const pendingChallenges = await db
      .select()
      .from(challenges)
      .where(
        and(
          eq(challenges.userId, userId),
          or(
            eq(challenges.status, "pending"),
            eq(challenges.status, "active")
          )
        )
      );

    // Filter out expired challenges
    const now = new Date();
    const validChallenges = pendingChallenges.filter(
      (challenge) => !challenge.expiresAt || new Date(challenge.expiresAt) > now
    );

    return NextResponse.json(validChallenges);
  } catch (error) {
    console.error("[get-pending-challenges] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending challenges" },
      { status: 500 }
    );
  }
}

