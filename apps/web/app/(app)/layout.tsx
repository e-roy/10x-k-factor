import type { ReactNode } from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { InviteJoinedTracker } from "@/components/InviteJoinedTracker";
import { SidebarNav } from "@/components/app-layout/SidebarNav";
import { CommandPalette } from "@/components/app-layout/CommandPalette";
import { InviteButton } from "@/components/InviteButton";
import { HeaderContent } from "@/components/app-layout/HeaderContent";
import { CohortProvider } from "@/components/app-layout/CohortContext";
import { PersonaProvider } from "@/components/PersonaProvider";
import { ModalProvider } from "@/components/ModalManager";
import { StudentSidebar } from "@/components/app-layout/StudentSidebar";
import type { Persona } from "@/lib/persona-utils";
import { cn } from "@/lib/utils";

export default async function AppLayout({ children }: { children: ReactNode }) {
  let session;
  try {
    session = await auth();
  } catch (error) {
    // If session is invalid, redirect to login
    session = null;
  }

  if (!session) {
    redirect("/login");
  }

  // Check if user has admin role
  const showAdmin = session.user.role === "admin";
  const persona = (session.user.persona || "student") as Persona;

  // Fetch user's custom colors from profile
  const { db } = await import("@/db/index");
  const { usersProfiles } = await import("@/db/schema");
  const { eq } = await import("drizzle-orm");
  
  const [profile] = await db
    .select()
    .from(usersProfiles)
    .where(eq(usersProfiles.userId, session.user.id))
    .limit(1);

  // Fetch student sidebar data
  const sidebarData = await fetchStudentSidebarData(session.user.id, persona);

  return (
    <PersonaProvider 
      persona={persona}
      primaryColor={profile?.primaryColor}
      secondaryColor={profile?.secondaryColor}
    >
      <CohortProvider>
        <ModalProvider>
          <InviteJoinedTracker />
          <CommandPalette />
        <div className="grid grid-cols-[260px_1fr] min-h-screen">
          {/* Left Sidebar */}
          <aside className="border-r bg-background p-4 flex flex-col">
            <Link href="/app" className="font-semibold text-lg block mb-6">
              K-Factor
            </Link>
            <SidebarNav showAdmin={showAdmin} />
            <div className="mt-auto pt-4">
              <InviteButton
                userId={session.user.id}
                persona={persona}
                variant="default"
                size="sm"
                className="w-full"
              />
            </div>
          </aside>
          
          {/* Main Content */}
          <div className="flex flex-col">
            <header className="h-14 border-b flex items-center justify-between px-4 bg-background">
              <HeaderContent
                userId={session.user.id}
                userName={session.user.name}
                userEmail={session.user.email}
                userImage={session.user.image}
              />
            </header>
            <div className={cn(
              "flex-1 overflow-auto",
              persona === "student" ? "flex" : ""
            )}>
              <main className="flex-1 p-4">{children}</main>
              
              {/* Right Sidebar (Students Only) */}
              {persona === "student" && (
                <StudentSidebar
                  userId={session.user.id}
                  userName={session.user.name}
                  persona={persona}
                  data={sidebarData}
                />
              )}
            </div>
          </div>
        </div>
        </ModalProvider>
      </CohortProvider>
    </PersonaProvider>
  );
}

// Helper function to fetch student sidebar data
async function fetchStudentSidebarData(userId: string, persona: string) {
  // Only fetch for students
  if (persona !== "student") {
    return {
      xp: 0,
      level: 1,
      streak: 0,
      streakAtRisk: false,
      badges: [],
      subjects: [],
      cohorts: [],
    };
  }

  const { db } = await import("@/db/index");
  const { cohorts, results } = await import("@/db/schema");
  const { eq, desc } = await import("drizzle-orm");
  const { calculateStreak } = await import("@/lib/streaks");
  const { getUserXpWithLevel } = await import("@/lib/xp");

  // Fetch XP and level from the real system
  const xpData = await getUserXpWithLevel(userId);

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

  // Fetch recent results to determine subjects
  const recentResults = await db
    .select()
    .from(results)
    .where(eq(results.userId, userId))
    .orderBy(desc(results.createdAt))
    .limit(20);

  // Extract unique subjects
  const subjectsSet = new Set<string>();
  recentResults.forEach((result) => {
    if (result.subject) subjectsSet.add(result.subject);
  });
  userCohorts.forEach((cohort) => {
    if (cohort.subject) subjectsSet.add(cohort.subject);
  });

  const subjects = Array.from(subjectsSet).map((subject) => ({
    name: subject,
    activeUsers: Math.floor(Math.random() * 20) + 1, // TODO: Get from presence system
  }));

  return {
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
    subjects: subjects.length > 0 ? subjects : [
      { name: "Algebra", activeUsers: 12 },
      { name: "Geometry", activeUsers: 8 },
    ],
    cohorts: userCohorts.map((cohort) => ({
      id: cohort.id,
      name: cohort.name,
      subject: cohort.subject || "General",
      activeUsers: Math.floor(Math.random() * 10) + 1, // TODO: Get from presence system
    })),
  };
}
