import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import { users, results, cohorts } from "@/db/schema";
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

  // Fetch user data including onboarding status
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
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
  const mostCommonSubject = recentResults[0]?.subject || userCohorts[0]?.subject || "algebra";

  // Fetch persona-specific dashboard data
  const dashboardData = await fetchDashboardData(userId, persona, {
    recentResults,
    userCohorts,
    streak,
    mostCommonSubject,
  });

  return (
    <>
      <OnboardingWrapper
        userId={userId}
        currentPersona={persona}
        onboardingCompleted={user?.onboardingCompleted ?? false}
      />
      
      {persona === "student" && (
        <StudentDashboard
          user={{ id: userId, name: user?.name, persona }}
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
  userId: string, 
  persona: string,
  context: {
    recentResults: any[];
    userCohorts: any[];
    streak: number;
    mostCommonSubject: string;
  }
) {
  if (persona === "student") {
    // For now, return mock data
    // TODO: Build real data from context.recentResults and other DB queries
    
    // Extract unique subjects from recent results
    const subjects = ["Algebra", "Geometry", "Calculus"]; // Mock for now
    
    return {
      subjects: subjects.map((subject, index) => ({
        name: subject,
        progress: Math.floor(Math.random() * 100),
        level: Math.floor(Math.random() * 10) + 1,
        xp: Math.floor(Math.random() * 500),
        xpToNextLevel: 500,
      })),
      streak: context.streak,
      friendsOnline: 12, // TODO: Get from presence system
      challenges: [], // TODO: Get from results/challenges
    };
  }
  
  if (persona === "parent") {
    // TODO: Fetch child progress data
    return {};
  }
  
  if (persona === "tutor") {
    // TODO: Fetch student roster and session data
    return {};
  }
  
  return {};
}
