import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { challenges } from "@/db/schema/index";
import { eq } from "drizzle-orm";

/**
 * Get a specific challenge by ID
 * GET /api/challenges/[id]
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: challengeId } = await params;

    const [challenge] = await db
      .select()
      .from(challenges)
      .where(eq(challenges.id, challengeId))
      .limit(1);

    if (!challenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    // Verify the challenge belongs to the user
    if (challenge.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(challenge);
  } catch (error) {
    console.error("[get-challenge] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch challenge" },
      { status: 500 }
    );
  }
}

/**
 * Update challenge (for marking as complete)
 * PATCH /api/challenges/[id]
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: challengeId } = await params;
    const body = await req.json();
    const { status, score } = body;

    // Verify the challenge belongs to the user
    const [challenge] = await db
      .select()
      .from(challenges)
      .where(eq(challenges.id, challengeId))
      .limit(1);

    if (!challenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    if (challenge.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update challenge
    const updates: Partial<typeof challenge> = {};
    
    if (status) {
      updates.status = status;
    }
    
    if (score !== undefined) {
      updates.score = score;
    }
    
    if (status === "completed") {
      updates.completedAt = new Date();
    }

    await db
      .update(challenges)
      .set(updates)
      .where(eq(challenges.id, challengeId));

    // Fetch updated challenge
    const [updatedChallenge] = await db
      .select()
      .from(challenges)
      .where(eq(challenges.id, challengeId))
      .limit(1);

    return NextResponse.json(updatedChallenge);
  } catch (error) {
    console.error("[update-challenge] Error:", error);
    return NextResponse.json(
      { error: "Failed to update challenge" },
      { status: 500 }
    );
  }
}

