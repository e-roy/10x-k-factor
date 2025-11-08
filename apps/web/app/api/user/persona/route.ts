import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import { usersProfiles, subjects, userSubjects } from "@/db/schema/index";
import { eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updatePersonaSchema = z.object({
  persona: z.enum(["student", "parent", "tutor"]),
  subjects: z.array(z.string()).optional(), // Array of subject names
});

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
    const validated = updatePersonaSchema.parse(body);

    // Update persona
    await db
      .update(usersProfiles)
      .set({ persona: validated.persona })
      .where(eq(usersProfiles.userId, session.user.id));

    // Handle subject enrollments if provided
    if (validated.subjects && validated.subjects.length > 0) {
      // Fetch subject IDs for the provided names
      const subjectRecords = await db
        .select({ id: subjects.id, name: subjects.name })
        .from(subjects)
        .where(inArray(subjects.name, validated.subjects));

      if (subjectRecords.length > 0) {
        // Remove existing enrollments
        await db
          .delete(userSubjects)
          .where(eq(userSubjects.userId, session.user.id));

        // Insert new enrollments
        const enrollments = subjectRecords.map((subject) => ({
          userId: session.user.id!,
          subjectId: subject.id,
          progress: 0,
          sessionsCompleted: 0,
          totalXp: 0,
          currentStreak: 0,
          longestStreak: 0,
          favorite: false,
          notificationsEnabled: true,
        }));

        await db.insert(userSubjects).values(enrollments);

        // Update enrollment counts for affected subjects
        for (const subject of subjectRecords) {
          await db.execute(sql`
            UPDATE subjects
            SET enrollment_count = (
              SELECT COUNT(*)
              FROM user_subjects
              WHERE user_subjects.subject_id = ${subject.id}
            )
            WHERE id = ${subject.id}
          `);
        }
      }
    }

    return NextResponse.json({
      success: true,
      persona: validated.persona,
      subjects: validated.subjects,
    });
  } catch (error) {
    console.error("[api/user/persona] Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

