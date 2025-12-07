import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import {
  usersProfiles,
  results,
  subjects,
  userSubjects,
  users,
  derivedUserXp,
  tutorSessions,
} from "@/db/schema/index";
import { eq, desc, and } from "drizzle-orm";
import { StudentDashboard } from "@/components/dashboards/StudentDashboard";
import { ParentDashboard } from "@/components/dashboards/ParentDashboard";
import { TutorDashboard } from "@/components/dashboards/TutorDashboard";
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

  // Fetch overall streak from users_profiles
  const streak = profile?.overallStreak ?? 0;

  // Get most common subject
  const mostCommonSubject =
    recentResults[0]?.subject || "algebra";

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
        <ParentDashboard
          user={{ id: userId, name: session.user.name, persona }}
          students={await fetchParentStudents(userId)}
        />
      )}

      {persona === "tutor" && (
        <TutorDashboard
          user={{ id: userId, name: session.user.name, persona }}
          xp={await fetchTutorXp(userId)}
          streak={profile?.overallStreak ?? 0}
          sessions={getHardcodedSessions()}
          tutorSessions={await fetchTutorSessions(userId)}
          subjects={await fetchTutorSubjects(userId)}
        />
      )}
    </>
  );
}

// Helper function to fetch dashboard data based on persona
async function fetchDashboardData(
  persona: string,
  context: {
    recentResults: (typeof results.$inferSelect)[];
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
      friendsOnline: 0, // Now fetched client-side via usePresence hook in StudentDashboard
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

// Fetch parent's students with their progress data
async function fetchParentStudents(parentId: string) {
  try {
    // Get all students where guardianId = parentId
    const studentProfiles = await db
      .select({
        userId: usersProfiles.userId,
        name: users.name,
      })
      .from(usersProfiles)
      .innerJoin(users, eq(usersProfiles.userId, users.id))
      .where(eq(usersProfiles.guardianId, parentId));

    // For each student, get their subject progress and calculate stats
    const studentsData = await Promise.all(
      studentProfiles.map(async (student) => {
        // Get subject progress
        const studentSubjects = await db
          .select({
            name: subjects.name,
            totalXp: userSubjects.totalXp,
            classesTaken: userSubjects.classesTaken,
            totalClasses: userSubjects.totalClasses,
            currentStreak: userSubjects.currentStreak,
            longestStreak: userSubjects.longestStreak,
          })
          .from(userSubjects)
          .innerJoin(subjects, eq(userSubjects.subjectId, subjects.id))
          .where(eq(userSubjects.userId, student.userId))
          .orderBy(desc(userSubjects.lastActivityAt));

        // Calculate overall streak
        const overallStreak = await calculateStreak(student.userId);

        // Calculate total XP (sum from userSubjects or use derivedUserXp)
        const totalXp = studentSubjects.reduce(
          (sum, subj) => sum + subj.totalXp,
          0
        );

        return {
          id: student.userId,
          name: student.name,
          subjects: studentSubjects,
          overallStreak,
          totalXp,
        };
      })
    );

    return studentsData;
  } catch (error) {
    console.error("[fetchParentStudents] Error:", error);
    return [];
  }
}

// Fetch tutor's total XP (calculated like for students - sum from userSubjects)
async function fetchTutorXp(tutorId: string): Promise<number> {
  try {
    // Calculate total XP by summing XP from all enrolled subjects (same as students)
    const tutorSubjects = await db
      .select({
        totalXp: userSubjects.totalXp,
      })
      .from(userSubjects)
      .where(eq(userSubjects.userId, tutorId));

    const totalXp = tutorSubjects.reduce(
      (sum, subject) => sum + (subject.totalXp ?? 0),
      0
    );

    return totalXp;
  } catch (error) {
    console.error("[fetchTutorXp] Error:", error);
    // Fallback: try derivedUserXp view if userSubjects query fails
    try {
      const [xpData] = await db
        .select({
          xp: derivedUserXp.xp,
        })
        .from(derivedUserXp)
        .where(eq(derivedUserXp.userId, tutorId))
        .limit(1);

      return xpData?.xp ?? 0;
    } catch (fallbackError) {
      console.error("[fetchTutorXp] Fallback error:", fallbackError);
      return 0;
    }
  }
}

// Fetch tutor's sessions from tutor_sessions table
async function fetchTutorSessions(tutorId: string) {
  try {
    const sessions = await db
      .select({
        id: tutorSessions.id,
        subjectSlug: tutorSessions.subject,
        summary: tutorSessions.summary,
        transcript: tutorSessions.transcript,
        tutorNotes: tutorSessions.tutorNotes,
        duration: tutorSessions.duration,
        createdAt: tutorSessions.createdAt,
        studentId: tutorSessions.studentId,
        subjectName: subjects.name,
      })
      .from(tutorSessions)
      .leftJoin(subjects, eq(tutorSessions.subject, subjects.slug))
      .where(eq(tutorSessions.tutorId, tutorId))
      .orderBy(desc(tutorSessions.createdAt));

    // Fetch student names for each session
    const sessionsWithStudents = await Promise.all(
      sessions.map(async (session) => {
        const [student] = await db
          .select({
            name: users.name,
          })
          .from(users)
          .where(eq(users.id, session.studentId))
          .limit(1);

        // Parse student name (assuming format "FirstName LastName")
        const nameParts = student?.name?.split(" ") || [];
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        return {
          id: session.id,
          // Use subject name from subjects table if available, otherwise fallback to slug
          subject: session.subjectName || session.subjectSlug,
          summary: session.summary,
          transcript: session.transcript,
          tutorNotes: session.tutorNotes,
          duration: session.duration,
          createdAt: session.createdAt ?? new Date(),
          student: {
            firstName,
            lastName,
          },
        };
      })
    );

    return sessionsWithStudents;
  } catch (error) {
    console.error("[fetchTutorSessions] Error:", error);
    return [];
  }
}

// Fetch tutor's subjects with progress data
async function fetchTutorSubjects(tutorId: string) {
  try {
    // First, get all subjects from user_subjects (primary source)
    const enrolledSubjects = await db
      .select({
        subjectId: userSubjects.subjectId,
        subjectName: subjects.name,
        totalXp: userSubjects.totalXp,
        currentStreak: userSubjects.currentStreak,
        longestStreak: userSubjects.longestStreak,
        tutoringSessions: userSubjects.tutoringSessions,
      })
      .from(userSubjects)
      .innerJoin(subjects, eq(userSubjects.subjectId, subjects.id))
      .where(eq(userSubjects.userId, tutorId))
      .orderBy(desc(userSubjects.lastActivityAt));

    // Count actual sessions from tutor_sessions for each subject
    const subjectsData = await Promise.all(
      enrolledSubjects.map(async (subject) => {
        // Count sessions for this subject (by slug/name match)
        const sessionsForSubject = await db
          .select({ id: tutorSessions.id })
          .from(tutorSessions)
          .where(
            and(
              eq(tutorSessions.tutorId, tutorId),
              eq(tutorSessions.subject, subject.subjectName)
            )
          );

        const actualSessionsCount = sessionsForSubject.length;

        return {
          name: subject.subjectName,
          totalXp: subject.totalXp ?? 0,
          // Use the actual session count from tutor_sessions if available
          tutoringSessions: actualSessionsCount > 0 ? actualSessionsCount : (subject.tutoringSessions ?? 0),
          currentStreak: subject.currentStreak ?? 0,
          longestStreak: subject.longestStreak ?? 0,
        };
      })
    );

    return subjectsData;
  } catch (error) {
    console.error("[fetchTutorSubjects] Error:", error);
    return [];
  }
}

// Generate hardcoded upcoming sessions for tutor
function getHardcodedSessions() {
  const now = new Date();
  const sessions = [
    {
      id: "session-1",
      subject: "Algebra",
      scheduledAt: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
      duration: 45,
    },
    {
      id: "session-2",
      subject: "Geometry",
      scheduledAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
      duration: 60,
    },
    {
      id: "session-3",
      subject: "Calculus",
      scheduledAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
      duration: 30,
    },
    {
      id: "session-4",
      subject: "Physics",
      scheduledAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      duration: 60,
    },
    {
      id: "session-5",
      subject: "Chemistry",
      scheduledAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      duration: 45,
    },
  ];

  return sessions;
}
