/**
 * Seed script to populate student progress data
 * Simulates data from an external service tracking:
 * - Classes taken vs total classes
 * - Tutoring sessions (will be incremented when transcripts are generated)
 * - Challenges completed (will be incremented when challenges are completed)
 * 
 * Run: pnpm tsx scripts/seed-progress.ts
 */

import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { db } from "../db/index";
import {
  usersProfiles,
  userSubjects,
  subjects,
  xpEvents,
  xpWeights,
} from "../db/schema/index";
import { eq, and, sql } from "drizzle-orm";

// Load .env files (monorepo root and local)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, "../../../.env") });
config({ path: resolve(__dirname, "../../../.env.local") });
config({ path: resolve(__dirname, "../.env") });
config({ path: resolve(__dirname, "../.env.local") });

/**
 * Generate a random integer between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function seedProgress() {
  try {
    console.log("🌱 Seeding student progress data...");

    // Ensure XP weights exist for tutoring sessions and challenges
    const tutoringWeight = { eventType: "tutoring.session_completed", multiplier: 12 };
    const challengeWeight = { eventType: "challenge.completed", multiplier: 5.0 };

    await db
      .insert(xpWeights)
      .values([tutoringWeight, challengeWeight])
      .onConflictDoUpdate({
        target: xpWeights.eventType,
        set: {
          multiplier: sql`EXCLUDED.multiplier`,
          updatedAt: new Date(),
        },
      });

    console.log("✓ Ensured XP weights exist");

    // Find all students
    const students = await db
      .select({
        userId: usersProfiles.userId,
      })
      .from(usersProfiles)
      .where(eq(usersProfiles.persona, "student"));

    if (students.length === 0) {
      console.log("⚠️  No students found. Please run the main seed script first.");
      process.exit(0);
    }

    console.log(`📚 Found ${students.length} student(s)`);

    // Get all available subjects
    const allSubjects = await db.select().from(subjects).where(eq(subjects.active, true));

    if (allSubjects.length === 0) {
      console.log("⚠️  No active subjects found. Please run seed:subjects first.");
      process.exit(0);
    }

    console.log(`📖 Found ${allSubjects.length} active subject(s)`);

    let createdCount = 0;
    let updatedCount = 0;
    let xpEventsCreated = 0;

    // For each student, ensure they have enrollments and update progress
    for (const student of students) {
      // Get existing enrolled subjects for this student
      const existingEnrollments = await db
        .select({
          userId: userSubjects.userId,
          subjectId: userSubjects.subjectId,
        })
        .from(userSubjects)
        .where(eq(userSubjects.userId, student.userId));

      const existingSubjectIds = new Set(existingEnrollments.map((e) => e.subjectId));

      // If student has no enrollments, randomly assign 2-4 subjects
      if (existingEnrollments.length === 0) {
        const numSubjectsToAssign = randomInt(2, Math.min(4, allSubjects.length));
        const shuffledSubjects = shuffle(allSubjects);
        const subjectsToAssign = shuffledSubjects.slice(0, numSubjectsToAssign);

        console.log(
          `  📝 Creating ${subjectsToAssign.length} enrollment(s) for student ${student.userId}...`
        );

        // Create new enrollments
        const newEnrollments = subjectsToAssign.map((subject) => ({
          userId: student.userId,
          subjectId: subject.id,
          classesTaken: 0,
          totalClasses: 0,
          tutoringSessions: 0,
          challengesCompleted: 0,
          totalXp: 0,
          currentStreak: 0,
          longestStreak: 0,
          favorite: false,
          notificationsEnabled: true,
          enrolledAt: new Date(),
        }));

        await db.insert(userSubjects).values(newEnrollments);
        createdCount += newEnrollments.length;

        // Add newly created subjects to existing set for progress update
        subjectsToAssign.forEach((subject) => {
          existingSubjectIds.add(subject.id);
        });
      }

      // Get all enrollments (including newly created ones) with subject names
      const allEnrollments = await db
        .select({
          userId: userSubjects.userId,
          subjectId: userSubjects.subjectId,
          subjectName: subjects.name,
        })
        .from(userSubjects)
        .innerJoin(subjects, eq(userSubjects.subjectId, subjects.id))
        .where(eq(userSubjects.userId, student.userId));

      const xpEventsToCreate: Array<{
        userId: string;
        personaType: "student";
        eventType: string;
        referenceId: string | null;
        rawXp: number;
        createdAt: Date;
      }> = [];

      // Update each enrollment with progress data and create XP events
      for (const enrollment of allEnrollments) {
        // Generate realistic progress data
        // Total classes: typically 30-40 for a semester/year
        const totalClasses = randomInt(30, 40);
        // Classes taken: count of classes completed (simulating mid-semester progress)
        // Range: 6-36 classes (ensuring it's always less than totalClasses)
        const classesTaken = randomInt(6, Math.min(36, totalClasses - 1));
        // Initial tutoring sessions: 0-5 (will increment when transcripts are generated)
        const tutoringSessions = randomInt(0, 5);
        // Initial challenges completed: 0-8 (will increment when challenges are completed)
        const challengesCompleted = randomInt(0, 8);
        // Set streak based on challenges completed (current streak = challenges completed, longest = same or higher)
        const currentStreak = challengesCompleted;
        const longestStreak = randomInt(challengesCompleted, challengesCompleted + 3);

        // Create XP events for tutoring sessions
        for (let i = 0; i < tutoringSessions; i++) {
          xpEventsToCreate.push({
            userId: enrollment.userId,
            personaType: "student",
            eventType: "tutoring.session_completed",
            referenceId: enrollment.subjectId,
            rawXp: 1,
            createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000), // Stagger dates
          });
        }

        // Create XP events for challenges completed
        for (let i = 0; i < challengesCompleted; i++) {
          xpEventsToCreate.push({
            userId: enrollment.userId,
            personaType: "student",
            eventType: "challenge.completed",
            referenceId: enrollment.subjectId,
            rawXp: 1,
            createdAt: new Date(Date.now() - i * 12 * 60 * 60 * 1000), // Stagger dates
          });
        }

        await db
          .update(userSubjects)
          .set({
            classesTaken,
            totalClasses,
            tutoringSessions,
            challengesCompleted,
            currentStreak,
            longestStreak,
          })
          .where(
            and(
              eq(userSubjects.userId, enrollment.userId),
              eq(userSubjects.subjectId, enrollment.subjectId)
            )
          );

        updatedCount++;
        console.log(
          `  ✓ ${enrollment.subjectName}: ${classesTaken}/${totalClasses} classes, ${tutoringSessions} tutoring sessions, ${challengesCompleted} challenges`
        );
      }

      // Create XP events for this student
      if (xpEventsToCreate.length > 0) {
        await db.insert(xpEvents).values(xpEventsToCreate);
        xpEventsCreated += xpEventsToCreate.length;
      }

      // Calculate total XP for this student and update user_subjects.totalXp
      // Get XP weights
      const weights = await db
        .select()
        .from(xpWeights)
        .where(
          sql`${xpWeights.eventType} IN ('tutoring.session_completed', 'challenge.completed')`
        );

      const weightMap = new Map(weights.map((w) => [w.eventType, w.multiplier]));

      // Calculate XP per subject
      for (const enrollment of allEnrollments) {
        const enrollmentData = await db
          .select()
          .from(userSubjects)
          .where(
            and(
              eq(userSubjects.userId, enrollment.userId),
              eq(userSubjects.subjectId, enrollment.subjectId)
            )
          )
          .limit(1);

        if (enrollmentData.length > 0) {
          const { tutoringSessions, challengesCompleted } = enrollmentData[0];
          const tutoringMultiplier = weightMap.get("tutoring.session_completed") || 12;
          const challengeMultiplier = weightMap.get("challenge.completed") || 5;

          const totalXp =
            tutoringSessions * tutoringMultiplier + challengesCompleted * challengeMultiplier;

          await db
            .update(userSubjects)
            .set({ totalXp: Math.floor(totalXp) })
            .where(
              and(
                eq(userSubjects.userId, enrollment.userId),
                eq(userSubjects.subjectId, enrollment.subjectId)
              )
            );
        }
      }

    }

    console.log(`\n✅ Successfully created ${createdCount} new enrollment(s)!`);
    console.log(`✅ Successfully updated progress for ${updatedCount} subject enrollment(s)!`);
    console.log(`✅ Created ${xpEventsCreated} XP event(s)!`);
    console.log(`✅ Updated streak counters (currentStreak/longestStreak) for all subjects!`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding progress:", error);
    process.exit(1);
  }
}

seedProgress();

