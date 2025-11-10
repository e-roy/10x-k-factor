/**
 * Seed script to populate xp_weights table with initial multipliers
 * Run: pnpm tsx scripts/seed-xp-weights.ts
 */

import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { db } from "../db/index";
import { xpWeights } from "../db/schema/index";

// Load .env files (monorepo root and local)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, "../../../.env") });
config({ path: resolve(__dirname, "../../../.env.local") });
config({ path: resolve(__dirname, "../.env") });
config({ path: resolve(__dirname, "../.env.local") });

// XP weight multipliers for different event types
const XP_WEIGHT_DEFINITIONS = [
  { eventType: "challenge.completed", multiplier: 5 },
  { eventType: "challenge.perfect", multiplier: 8 },
  { eventType: "challenge.streak_kept", multiplier: 3 },
  { eventType: "invite.sent", multiplier: 1 },
  { eventType: "invite.accepted", multiplier: 20 },
  { eventType: "invitee.fvm_reached", multiplier: 30 },
  { eventType: "results.viewed", multiplier: 0.5 },
  { eventType: "presence.session_minute", multiplier: 0.2 },
  { eventType: "session.tutor_5star", multiplier: 15 },
  { eventType: "tutoring.session_completed", multiplier: 12 },
  { eventType: "parent.recap_shared", multiplier: 6 },
];

async function seedXpWeights() {
  try {
    console.log("🌱 Seeding XP weights...");

    // Insert all XP weights (using onConflictDoUpdate to allow re-running)
    for (const weight of XP_WEIGHT_DEFINITIONS) {
      await db
        .insert(xpWeights)
        .values(weight)
        .onConflictDoUpdate({
          target: xpWeights.eventType,
          set: {
            multiplier: weight.multiplier,
            updatedAt: new Date(),
          },
        });
    }

    console.log(`✅ Successfully seeded ${XP_WEIGHT_DEFINITIONS.length} XP weights!`);

    // Verify
    const allWeights = await db.select().from(xpWeights);
    console.log(`📊 Total XP weights in database: ${allWeights.length}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding XP weights:", error);
    process.exit(1);
  }
}

seedXpWeights();

