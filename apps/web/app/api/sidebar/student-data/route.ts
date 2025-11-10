import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { userSubjects, subjects, usersProfiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
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
        longestStreak: userSubjects.longestStreak,
        lastActivityAt: userSubjects.lastActivityAt,
      })
      .from(userSubjects)
      .innerJoin(subjects, eq(userSubjects.subjectId, subjects.id))
      .where(eq(userSubjects.userId, userId))
      .orderBy(desc(userSubjects.lastActivityAt));

    // Fetch overall streak from users_profiles
    const [profile] = await db
      .select({ overallStreak: usersProfiles.overallStreak })
      .from(usersProfiles)
      .where(eq(usersProfiles.userId, userId))
      .limit(1);

    const streak = profile?.overallStreak ?? 0;
    const now = new Date();
    const streakAtRisk = now.getHours() >= 20 && streak > 0; // After 8 PM

    // Get presence counts for enrolled subjects
    const subjectSlugs = enrolledSubjects.map((s) => s.subjectSlug);
    const presenceCounts = await getPresenceCounts(subjectSlugs);

    // Build subjects list with real presence data
    const subjectsData = enrolledSubjects.map((subject) => ({
      name: subject.subjectName,
      activeUsers: presenceCounts.get(subject.subjectSlug) || 0,
      totalXp: subject.totalXp,
      currentStreak: subject.currentStreak,
      longestStreak: subject.longestStreak,
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
    });
  } catch (error) {
    console.error("[student-sidebar-data] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sidebar data" },
      { status: 500 }
    );
  }
}

