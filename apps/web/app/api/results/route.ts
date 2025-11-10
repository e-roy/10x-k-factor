import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { results, userSubjects, subjects, usersProfiles } from "@/db/schema/index";
import { auth } from "@/lib/auth";
import { randomUUID } from "crypto";
import { z } from "zod";
import { eq, desc, sql } from "drizzle-orm";

const createResultSchema = z.object({
  subject: z.string().max(64).optional(),
  score: z.number().int().min(0).max(100).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const dynamic = "force-dynamic";

/**
 * POST /api/results
 * Create a new result for the authenticated user
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
    const validated = createResultSchema.parse(body);

    const resultId = randomUUID();

    const [result] = await db
      .insert(results)
      .values({
        id: resultId,
        userId: session.user.id,
        subject: validated.subject || null,
        score: validated.score || null,
        metadata: validated.metadata || {},
        createdAt: new Date(),
      })
      .returning();

    // Increment challenges completed for this subject if subject is provided
    if (validated.subject) {
      // Find the subject by name (case-insensitive match)
      const [subjectRecord] = await db
        .select({ id: subjects.id })
        .from(subjects)
        .where(sql`LOWER(${subjects.name}) = LOWER(${validated.subject})`)
        .limit(1);

      if (subjectRecord) {
        // Find user's enrollment for this subject
        const [enrollment] = await db
          .select()
          .from(userSubjects)
          .where(
            sql`${userSubjects.userId} = ${session.user.id} AND ${userSubjects.subjectId} = ${subjectRecord.id}`
          )
          .limit(1);

        if (enrollment) {
          // Increment challenges completed
          await db
            .update(userSubjects)
            .set({
              challengesCompleted: sql`${userSubjects.challengesCompleted} + 1`,
            })
            .where(
              sql`${userSubjects.userId} = ${session.user.id} AND ${userSubjects.subjectId} = ${subjectRecord.id}`
            );
          console.log(
            `[results] Incremented challenges completed for user ${session.user.id}, subject ${validated.subject}`
          );
        } else {
          console.warn(
            `[results] User ${session.user.id} not enrolled in subject ${validated.subject}`
          );
        }
      } else {
        console.warn(`[results] Subject ${validated.subject} not found in database`);
      }
    }

    // Increment overall current streak in users_profiles
    // Check if user has already completed a challenge today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayResults = await db
      .select()
      .from(results)
      .where(
        sql`${results.userId} = ${session.user.id} AND ${results.createdAt} >= ${today.toISOString()} AND ${results.createdAt} < ${tomorrow.toISOString()}`
      )
      .limit(1);

    // Only increment streak if this is the first challenge completed today
    if (todayResults.length === 1) {
      // This is the first result today, increment streak
      // Get user's profile to check last activity
      const [profile] = await db
        .select({ overallStreak: usersProfiles.overallStreak, updatedAt: usersProfiles.updatedAt })
        .from(usersProfiles)
        .where(eq(usersProfiles.userId, session.user.id))
        .limit(1);

      if (profile) {
        const lastUpdate = profile.updatedAt ? new Date(profile.updatedAt) : null;
        const lastUpdateDate = lastUpdate ? new Date(lastUpdate.setHours(0, 0, 0, 0)) : null;
        const todayDate = new Date(today.setHours(0, 0, 0, 0));

        // If last update was yesterday or earlier, increment streak
        // If last update was today, don't increment (already counted)
        if (!lastUpdateDate || lastUpdateDate.getTime() < todayDate.getTime()) {
          // Check if streak should continue or reset
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          const yesterdayResults = await db
            .select()
            .from(results)
            .where(
              sql`${results.userId} = ${session.user.id} AND ${results.createdAt} >= ${yesterday.toISOString()} AND ${results.createdAt} < ${today.toISOString()}`
            )
            .limit(1);

          if (yesterdayResults.length > 0 || profile.overallStreak === 0) {
            // Consecutive day or starting new streak
            await db
              .update(usersProfiles)
              .set({
                overallStreak: sql`${usersProfiles.overallStreak} + 1`,
                updatedAt: new Date(),
              })
              .where(eq(usersProfiles.userId, session.user.id));
            console.log(
              `[results] Incremented overall streak for user ${session.user.id}`
            );
          } else {
            // Streak broken, reset to 1 (today's challenge)
            await db
              .update(usersProfiles)
              .set({
                overallStreak: 1,
                updatedAt: new Date(),
              })
              .where(eq(usersProfiles.userId, session.user.id));
            console.log(
              `[results] Reset and started new streak (1) for user ${session.user.id}`
            );
          }
        }
      }
    }

    return NextResponse.json(
      { success: true, result },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[results] Error creating result:", error);
    return NextResponse.json(
      { error: "Failed to create result" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/results
 * Get all results for the authenticated user
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userResults = await db
      .select()
      .from(results)
      .where(eq(results.userId, session.user.id))
      .orderBy(desc(results.createdAt))
      .limit(100);

    return NextResponse.json({ results: userResults });
  } catch (error) {
    console.error("[results] Error fetching results:", error);
    return NextResponse.json(
      { error: "Failed to fetch results" },
      { status: 500 }
    );
  }
}

