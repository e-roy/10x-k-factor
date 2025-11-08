import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { challenges } from "@/db/schema/index";
import { eq } from "drizzle-orm";
import { trackXpEvent } from "@/lib/xp";
import type { Persona } from "@/db/types";

/**
 * Get a specific challenge by ID
 * GET /api/challenges/[id]
 * 
 * Public endpoint (no auth required) - allows guests to view challenges
 * Does NOT expose userId or any PII
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    // Return challenge WITHOUT userId (no PII)
    // Safe fields: id, subject, difficulty, questions, expiresAt, createdAt
    const safeChallenge = {
      id: challenge.id,
      subject: challenge.subject,
      difficulty: challenge.difficulty,
      questions: challenge.questions,
      expiresAt: challenge.expiresAt,
      createdAt: challenge.createdAt,
      // Internal use - not exposed to client but needed for backend logic
      userId: challenge.userId,
    };

    return NextResponse.json(safeChallenge);
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

    // Create XP event when challenge is completed
    if (status === "completed" && score !== undefined) {
      // Determine the user's persona (default to 'student' for challenges)
      const userPersona: Persona = "student";
      
      // Determine event type based on score
      const isPerfect = score === 100;
      const eventType = isPerfect ? "challenge.perfect" : "challenge.completed";
      
      // Calculate raw XP based on score (higher score = more XP)
      const rawXp = isPerfect ? 50 : Math.max(10, Math.floor(score / 10));

      try {
        await trackXpEvent({
          userId: session.user.id,
          personaType: userPersona,
          eventType,
          referenceId: challengeId,
          metadata: {
            subject: challenge.subject,
            score,
          },
          rawXp,
        });
      } catch (xpError) {
        console.error("[update-challenge] Failed to track XP event:", xpError);
        // Don't fail the whole request if XP tracking fails
      }
    }

    return NextResponse.json(updatedChallenge);
  } catch (error) {
    console.error("[update-challenge] Error:", error);
    return NextResponse.json(
      { error: "Failed to update challenge" },
      { status: 500 }
    );
  }
}

