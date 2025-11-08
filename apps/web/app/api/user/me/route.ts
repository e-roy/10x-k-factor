import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { userSubjects, subjects } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch user's enrolled subjects
    const enrolledSubjects = await db
      .select({
        name: subjects.name,
        slug: subjects.slug,
        progress: userSubjects.progress,
      })
      .from(userSubjects)
      .innerJoin(subjects, eq(userSubjects.subjectId, subjects.id))
      .where(eq(userSubjects.userId, session.user.id));

    return NextResponse.json({
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      persona: session.user.persona || "student",
      role: session.user.role || null,
      subjects: enrolledSubjects.map((s) => s.name), // Return subject names for backward compatibility
      subjectsDetail: enrolledSubjects, // Include detailed subject info with progress
    });
  } catch (error) {
    console.error("[api/user/me] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

