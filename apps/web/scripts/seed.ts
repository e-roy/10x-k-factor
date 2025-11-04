import { db } from "../db/index";
import { users, smartLinks, results, cohorts } from "../db/schema";
import { randomUUID } from "crypto";

async function seed() {
  console.log("Starting seed...");

  try {
    // Check if data already exists
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      console.log("Seed data already exists. Skipping seed.");
      return;
    }

    // Create sample users
    const studentId = randomUUID();
    const parentId = randomUUID();
    const tutorId = randomUUID();
    const student2Id = randomUUID();

    const sampleUsers = [
      {
        id: studentId,
        persona: "student",
        minor: true,
        guardianId: parentId,
        createdAt: new Date(),
      },
      {
        id: student2Id,
        persona: "student",
        minor: false,
        guardianId: null,
        createdAt: new Date(),
      },
      {
        id: parentId,
        persona: "parent",
        minor: false,
        guardianId: null,
        createdAt: new Date(),
      },
      {
        id: tutorId,
        persona: "tutor",
        minor: false,
        guardianId: null,
        createdAt: new Date(),
      },
    ];

    await db.insert(users).values(sampleUsers);
    console.log("✓ Created users");

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
