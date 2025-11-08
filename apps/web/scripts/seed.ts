import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { db } from "@/db/index";
import {
  usersProfiles,
  smartLinks,
  results,
  cohorts,
  xpWeights,
  type Persona,
} from "@/db/schema/index";
import { users } from "@/db/auth-schema";
import { randomUUID } from "crypto";
import { inArray } from "drizzle-orm";

// Load .env files (monorepo root and local)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, "../../../.env") });
config({ path: resolve(__dirname, "../../../.env.local") });
config({ path: resolve(__dirname, "../.env") });
config({ path: resolve(__dirname, "../.env.local") });

async function seed() {
  console.log("Starting seed...");

  try {
    // Check if seed data already exists by looking for seed-specific smart links
    const seedSmartLinkCodes = ["abc123xyz", "def456uvw"];
    const existingSeedLinks = await db
      .select()
      .from(smartLinks)
      .where(inArray(smartLinks.code, seedSmartLinkCodes))
      .limit(1);

    if (existingSeedLinks.length > 0) {
      console.log("Seed data already exists. Skipping seed.");
      console.log(
        "To re-seed, delete the seed smart links (codes: abc123xyz, def456uvw) first."
      );
      return;
    }

    // Create sample users (auth data only)
    const studentId = randomUUID();
    const parentId = randomUUID();
    const tutorId = randomUUID();
    const student2Id = randomUUID();

    const sampleUsers = [
      {
        id: studentId,
        name: "Alice Student",
        email: "alice@example.com",
        createdAt: new Date(),
      },
      {
        id: student2Id,
        name: "Bob Student",
        email: "bob@example.com",
        createdAt: new Date(),
      },
      {
        id: parentId,
        name: "Carol Parent",
        email: "carol@example.com",
        createdAt: new Date(),
      },
      {
        id: tutorId,
        name: "Dave Tutor",
        email: "dave@example.com",
        createdAt: new Date(),
      },
    ];

    await db.insert(users).values(sampleUsers);
    console.log("✓ Created users");

    // Create sample user profiles
    const sampleProfiles = [
      {
        userId: studentId,
        persona: "student" as Persona,
        minor: true,
        guardianId: parentId,
        onboardingCompleted: true,
        createdAt: new Date(),
      },
      {
        userId: student2Id,
        persona: "student" as Persona,
        minor: false,
        guardianId: null,
        onboardingCompleted: true,
        createdAt: new Date(),
      },
      {
        userId: parentId,
        persona: "parent" as Persona,
        minor: false,
        guardianId: null,
        onboardingCompleted: true,
        createdAt: new Date(),
      },
      {
        userId: tutorId,
        persona: "tutor" as Persona,
        minor: false,
        guardianId: null,
        onboardingCompleted: true,
        createdAt: new Date(),
      },
    ];

    await db.insert(usersProfiles).values(sampleProfiles);
    console.log("✓ Created user profiles");

    // Create sample results
    const sampleResults = [
      {
        id: randomUUID(),
        userId: studentId,
        subject: "algebra",
        score: 85,
        metadata: { questions: 20, correct: 17 },
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        userId: student2Id,
        subject: "geometry",
        score: 92,
        metadata: { questions: 15, correct: 14 },
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        userId: studentId,
        subject: "calculus",
        score: 78,
        metadata: { questions: 25, correct: 19 },
        createdAt: new Date(),
      },
    ];

    await db.insert(results).values(sampleResults);
    console.log("✓ Created results");

    // Create sample cohorts
    const cohortId = randomUUID();
    const cohort2Id = randomUUID();

    const sampleCohorts = [
      {
        id: cohortId,
        name: "Algebra Study Group",
        subject: "algebra",
        createdBy: tutorId,
        createdAt: new Date(),
      },
      {
        id: cohort2Id,
        name: "Geometry Challenge",
        subject: "geometry",
        createdBy: tutorId,
        createdAt: new Date(),
      },
    ];

    await db.insert(cohorts).values(sampleCohorts);
    console.log("✓ Created cohorts");

    // Create sample smart links
    // Note: In production, signatures would be generated with HMAC
    // For seed data, we'll use placeholder signatures
    const sampleSmartLinks = [
      {
        code: "abc123xyz",
        inviterId: studentId,
        loop: "buddy_challenge",
        params: { subject: "algebra", deckId: "deck-1" },
        sig: "placeholder_signature_for_seed_data_abc123xyz",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        createdAt: new Date(),
      },
      {
        code: "def456uvw",
        inviterId: tutorId,
        loop: "tutor_spotlight",
        params: { subject: "geometry", classId: "class-1" },
        sig: "placeholder_signature_for_seed_data_def456uvw",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        createdAt: new Date(),
      },
    ];

    await db.insert(smartLinks).values(sampleSmartLinks);
    console.log("✓ Created smart links");

    // Create XP weight multipliers
    const sampleXpWeights = [
      { eventType: "challenge.completed", multiplier: 5 },
      { eventType: "challenge.perfect", multiplier: 8 },
      { eventType: "challenge.streak_kept", multiplier: 3 },
      { eventType: "invite.sent", multiplier: 1 },
      { eventType: "invite.accepted", multiplier: 20 },
      { eventType: "invitee.fvm_reached", multiplier: 30 },
      { eventType: "results.viewed", multiplier: 0.5 },
      { eventType: "presence.session_minute", multiplier: 0.2 },
      { eventType: "cohort.leaderboard_top3", multiplier: 10 },
      { eventType: "session.tutor_5star", multiplier: 15 },
      { eventType: "parent.recap_shared", multiplier: 6 },
    ];

    await db.insert(xpWeights).values(sampleXpWeights);
    console.log("✓ Created XP weights");

    console.log("Seed completed successfully!");
  } catch (error) {
    console.error("Seed failed:", error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log("Seed script finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed script error:", error);
    process.exit(1);
  });
