import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { cohorts, usersProfiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { calculateStreak } from "@/lib/streaks";
import { getUserXpWithLevel } from "@/lib/xp";
import type { Persona } from "@/db/types";

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

    // Fetch user profile to get enrolled subjects
    const [profile] = await db
      .select()
      .from(usersProfiles)
      .where(eq(usersProfiles.userId, userId))
      .limit(1);

    const enrolledSubjects = (profile?.subjects as string[]) || [];

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

    // Use enrolled subjects from profile
    const subjects = enrolledSubjects.length > 0 
      ? enrolledSubjects.map((subject) => ({
          name: subject,
          activeUsers: Math.floor(Math.random() * 20) + 1, // TODO: Get from presence system
        }))
      : [
          { name: "Algebra", activeUsers: 12 },
          { name: "Geometry", activeUsers: 8 },
        ];

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
      subjects,
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

