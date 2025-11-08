import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { tutorSessions } from "@/db/schema/index";
import { eq, desc } from "drizzle-orm";

/**
 * List tutor sessions (cached transcripts) for the current user
 * GET /api/tutor-sessions/list
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch tutor sessions for this user, ordered by most recent first
    const sessions = await db
      .select({
        id: tutorSessions.id,
        subject: tutorSessions.subject,
        summary: tutorSessions.summary,
        transcript: tutorSessions.transcript,
        createdAt: tutorSessions.createdAt,
        duration: tutorSessions.duration,
      })
      .from(tutorSessions)
      .where(eq(tutorSessions.studentId, userId))
      .orderBy(desc(tutorSessions.createdAt))
      .limit(50); // Limit to 50 most recent

    return NextResponse.json({
      sessions: sessions.map((s) => ({
        id: s.id,
        subject: s.subject,
        summary: s.summary,
        transcriptPreview: s.transcript.substring(0, 200) + "...", // Preview only
        fullTranscript: s.transcript, // Include full transcript for selected items
        createdAt: s.createdAt,
        duration: s.duration,
      })),
    });
  } catch (error) {
    console.error("[list-tutor-sessions] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tutor sessions" },
      { status: 500 }
    );
  }
}

