import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import {
  usersProfiles,
  results,
  cohorts,
  subjects,
  userSubjects,
} from "@/db/schema/index";
import { eq, desc } from "drizzle-orm";
import { StudentDashboard } from "@/components/dashboards/StudentDashboard";
import { OnboardingWrapper } from "@/components/OnboardingWrapper";
import { calculateStreak } from "@/lib/streaks";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null; // Will be redirected by layout
  }

  const userId = session.user.id;
  const persona = session.user.persona || "student";

  // Fetch user profile including onboarding status
  const [profile] = await db
    .select()
    .from(usersProfiles)
    .where(eq(usersProfiles.userId, userId))
    .limit(1);

  // Fetch user's recent results
  const recentResults = await db
    .select()
    .from(results)
    .where(eq(results.userId, userId))
    .orderBy(desc(results.createdAt))
    .limit(10);

  // Fetch user's cohorts
  const userCohorts = await db
    .select()
    .from(cohorts)
    .where(eq(cohorts.createdBy, userId))
    .orderBy(desc(cohorts.createdAt))
    .limit(5);

  // Calculate streak
  const streak = await calculateStreak(userId);

  // Get most common subject
  const mostCommonSubject =
    recentResults[0]?.subject || userCohorts[0]?.subject || "algebra";

  // Get enrolled subjects from user_subjects table with progress data
  const enrolledSubjectsData = await db
    .select({
      name: subjects.name,
      totalXp: userSubjects.totalXp,
      classesTaken: userSubjects.classesTaken,
      totalClasses: userSubjects.totalClasses,
      tutoringSessions: userSubjects.tutoringSessions,
      challengesCompleted: userSubjects.challengesCompleted,
      currentStreak: userSubjects.currentStreak,
      longestStreak: userSubjects.longestStreak,
    })
    .from(userSubjects)
    .innerJoin(subjects, eq(userSubjects.subjectId, subjects.id))
    .where(eq(userSubjects.userId, userId))
    .orderBy(desc(userSubjects.lastActivityAt));

  const enrolledSubjects = enrolledSubjectsData.map((s) => s.name);

  // Fetch persona-specific dashboard data
  const dashboardData = await fetchDashboardData(persona, {
    recentResults,
    userCohorts,
    streak,
    mostCommonSubject,
    enrolledSubjects,
    enrolledSubjectsData,
  });

  return (
    <>
      <OnboardingWrapper
        userId={userId}
        currentPersona={persona}
        onboardingCompleted={profile?.onboardingCompleted ?? false}
      />

      {persona === "student" && (
        <StudentDashboard
          user={{ id: userId, name: session.user.name, persona }}
          data={dashboardData}
        />
      )}

      {persona === "parent" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Parent Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Track your child&apos;s learning progress
            </p>
          </div>
          {/* TODO: Implement ParentDashboard component */}
          <div className="text-center py-20 text-muted-foreground">
            Parent dashboard coming soon...
          </div>
        </div>
      )}

      {persona === "tutor" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Tutor Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Manage your students and sessions
            </p>
          </div>
          {/* TODO: Implement TutorDashboard component */}
          <div className="text-center py-20 text-muted-foreground">
            Tutor dashboard coming soon...
          </div>
        </div>
      )}
    </>
  );
}

// Helper function to fetch dashboard data based on persona
async function fetchDashboardData(
  persona: string,
  context: {
    recentResults: (typeof results.$inferSelect)[];
    userCohorts: (typeof cohorts.$inferSelect)[];
    streak: number;
    mostCommonSubject: string;
    enrolledSubjects: string[];
    enrolledSubjectsData: Array<{
      name: string;
      totalXp: number;
      classesTaken: number;
      totalClasses: number;
      tutoringSessions: number;
      challengesCompleted: number;
      currentStreak: number;
      longestStreak: number;
    }>;
  }
): Promise<{
  subjects: Array<{
    name: string;
    totalXp: number;
    classesTaken: number;
    totalClasses: number;
    tutoringSessions: number;
    challengesCompleted: number;
    currentStreak: number;
    longestStreak: number;
  }>;
  streak: number;
  friendsOnline: number;
  challenges: Array<{
    id: string;
    subject: string;
    from: string;
  }>;
}> {
  if (persona === "student") {
    // Use enrolled subjects data, fallback to defaults if none enrolled
    const subjectsData =
      context.enrolledSubjectsData.length > 0
        ? context.enrolledSubjectsData
        : [
            {
              name: "Algebra",
              totalXp: 0,
              classesTaken: 0,
              totalClasses: 0,
              tutoringSessions: 0,
              challengesCompleted: 0,
              currentStreak: 0,
              longestStreak: 0,
            },
            {
              name: "Geometry",
              totalXp: 0,
              classesTaken: 0,
              totalClasses: 0,
              tutoringSessions: 0,
              challengesCompleted: 0,
              currentStreak: 0,
              longestStreak: 0,
            },
          ]; // Default fallback

    return {
      subjects: subjectsData.map((subject) => ({
        name: subject.name,
        totalXp: subject.totalXp,
        classesTaken: subject.classesTaken,
        totalClasses: subject.totalClasses,
        tutoringSessions: subject.tutoringSessions,
        challengesCompleted: subject.challengesCompleted,
        currentStreak: subject.currentStreak,
        longestStreak: subject.longestStreak,
      })),
      streak: context.streak,
      friendsOnline: 12, // TODO: Get from presence system
      challenges: [], // TODO: Get from results/challenges
    };
  }

  // For non-student personas, return default structure
  // TODO: Implement proper data fetching for parent/tutor personas
  return {
    subjects: [],
    streak: context.streak,
    friendsOnline: 0,
    challenges: [],
  };
}
