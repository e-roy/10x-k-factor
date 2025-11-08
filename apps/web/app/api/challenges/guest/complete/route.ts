import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { challenges, guestChallengeCompletions } from "@/db/schema/index";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { z } from "zod";

const guestCompleteSchema = z.object({
  challengeId: z.string().uuid(),
  guestSessionId: z.string().min(10).max(64),
  answers: z.record(z.string(), z.number().int().min(0)),
  smartLinkCode: z.string().length(12).optional(),
  inviterId: z.string().uuid().optional(),
});

export const dynamic = "force-dynamic";

/**
 * POST /api/challenges/guest/complete
 * Store guest challenge completion before signup
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = guestCompleteSchema.parse(body);

    // Fetch challenge
    const [challenge] = await db
      .select({
        id: challenges.id,
        questions: challenges.questions,
        expiresAt: challenges.expiresAt,
        status: challenges.status,
        userId: challenges.userId,
      })
      .from(challenges)
      .where(eq(challenges.id, validated.challengeId))
      .limit(1);

    if (!challenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    // Check if expired
    if (challenge.expiresAt && new Date(challenge.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "Challenge has expired" },
        { status: 410 }
      );
    }

    // Calculate score
    const questions = challenge.questions as Array<{
      question: string;
      options: string[];
      correctAnswer: number;
      explanation?: string;
    }>;

    let correctCount = 0;
    const answersRecord: Record<number, number> = {};

    questions.forEach((question, idx) => {
      const userAnswer = validated.answers[idx.toString()];
      if (userAnswer !== undefined) {
        answersRecord[idx] = userAnswer;
        if (userAnswer === question.correctAnswer) {
          correctCount++;
        }
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);

    // Create guest completion record
    const completionId = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expire in 7 days

    await db.insert(guestChallengeCompletions).values({
      id: completionId,
      challengeId: validated.challengeId,
      guestSessionId: validated.guestSessionId,
      score,
      answers: answersRecord,
      smartLinkCode: validated.smartLinkCode || null,
      inviterId: validated.inviterId || challenge.userId, // Default to challenge creator
      converted: false,
      convertedUserId: null,
      metadata: {
        completedAt: new Date().toISOString(),
        subject: (challenge as unknown as { subject?: string }).subject,
      },
      createdAt: new Date(),
      expiresAt,
    });

    return NextResponse.json(
      {
        success: true,
        completionId,
        score,
        correctCount,
        totalQuestions: questions.length,
        results: questions.map((q, idx) => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          userAnswer: answersRecord[idx],
          isCorrect: answersRecord[idx] === q.correctAnswer,
          explanation: q.explanation,
        })),
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[guest/complete] Error:", error);
    return NextResponse.json(
      { error: "Failed to save completion" },
      { status: 500 }
    );
  }
}

