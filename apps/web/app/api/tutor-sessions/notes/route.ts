import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import { tutorSessions } from "@/db/schema/index";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateNotesSchema = z.object({
  sessionId: z.string().uuid(),
  tutorNotes: z.string(),
});

/**
 * POST /api/tutor-sessions/notes
 * Update tutor notes for a tutoring session
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
    const validated = updateNotesSchema.parse(body);

    // Verify the session belongs to this tutor
    const [tutorSession] = await db
      .select()
      .from(tutorSessions)
      .where(eq(tutorSessions.id, validated.sessionId))
      .limit(1);

    if (!tutorSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (tutorSession.tutorId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized: This session does not belong to you" },
        { status: 403 }
      );
    }

    // Update tutor notes
    await db
      .update(tutorSessions)
      .set({ tutorNotes: validated.tutorNotes })
      .where(eq(tutorSessions.id, validated.sessionId));

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("[api/tutor-sessions/notes] Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

