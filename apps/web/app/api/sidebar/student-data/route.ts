import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { cohorts, userSubjects, subjects } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { calculateStreak } from "@/lib/streaks";
import { getUserXpWithLevel } from "@/lib/xp";
import { getPresenceCounts } from "@/lib/presence";

/**
 * Fetch student sidebar data
 * GET /api/sidebar/student-data
 */
export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const persona = session.user.persona || "student";

    // Only fetch for students
    if (persona !== "student") {
      return NextResponse.json({
        xp: 0,
        level: 1,
        streak: 0,
        streakAtRisk: false,
        badges: [],
        subjects: [],
        cohorts: [],
      });
    }

    // Fetch XP and level from the real system
    const xpData = await getUserXpWithLevel(userId);

    // Fetch user's enrolled subjects
    const enrolledSubjects = await db
      .select({
        subjectId: subjects.id,
        subjectName: subjects.name,
        subjectSlug: subjects.slug,
        totalXp: userSubjects.totalXp,
        currentStreak: userSubjects.currentStreak,
        lastActivityAt: userSubjects.lastActivityAt,
      })
      .from(userSubjects)
      .innerJoin(subjects, eq(userSubjects.subjectId, subjects.id))
      .where(eq(userSubjects.userId, userId))
      .orderBy(desc(userSubjects.lastActivityAt));

    // Fetch user's cohorts
    const userCohorts = await db
      .select()
      .from(cohorts)
      .where(eq(cohorts.createdBy, userId))
      .orderBy(desc(cohorts.createdAt))
      .limit(5);

    // Calculate streak
    const streak = await calculateStreak(userId);
    const now = new Date();
    const streakAtRisk = now.getHours() >= 20 && streak > 0; // After 8 PM

    // Get presence counts for enrolled subjects
    const subjectSlugs = enrolledSubjects.map((s) => s.subjectSlug);
    const presenceCounts = await getPresenceCounts(subjectSlugs);

    // Build subjects list with real presence data
    const subjectsData = enrolledSubjects.map((subject) => ({
      name: subject.subjectName,
      activeUsers: presenceCounts.get(subject.subjectSlug) || 0,
    }));

    return NextResponse.json({
      xp: xpData.xp,
      level: xpData.level,
      streak,
      streakAtRisk,
      badges: [
        { id: "1", name: "First Win", icon: "🏆", earnedAt: new Date() },
        { id: "2", name: "Week Warrior", icon: "⚔️", earnedAt: new Date() },
        { id: "3", name: "Math Master", icon: "🧮", earnedAt: new Date() },
        { id: "4", name: "Speed Demon", icon: "⚡", earnedAt: new Date() },
        { id: "5", name: "Perfect Score", icon: "💯", earnedAt: new Date() },
        { id: "6", name: "Study Buddy", icon: "🤝", earnedAt: new Date() },
      ], // TODO: Fetch from rewards system
      subjects: subjectsData,
      cohorts: userCohorts.map((cohort) => ({
        id: cohort.id,
        name: cohort.name,
        subject: cohort.subject || "General",
        activeUsers: Math.floor(Math.random() * 10) + 1, // TODO: Get from presence system
      })),
    });
  } catch (error) {
    console.error("[student-sidebar-data] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sidebar data" },
      { status: 500 }
    );
  }
}

