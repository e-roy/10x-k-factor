import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { db } from "../db";
import { sql } from "drizzle-orm";

// Load .env files (monorepo root and local)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, "../../../.env") });
config({ path: resolve(__dirname, "../../../.env.local") });
config({ path: resolve(__dirname, "../.env") });
config({ path: resolve(__dirname, "../.env.local") });

/**
 * Script to add the missing `progress` column to `user_subjects` table
 * This fixes the error: column user_subjects.progress does not exist
 */
async function addProgressColumn() {
  try {
    console.log("Checking if progress column exists in user_subjects table...");

    // Add the column if it doesn't exist
    await db.execute(sql`
      ALTER TABLE user_subjects 
      ADD COLUMN IF NOT EXISTS progress integer DEFAULT 0 NOT NULL;
    `);

    console.log("✓ Added progress column to user_subjects table");

    // Create the index if it doesn't exist
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_user_subjects_progress 
      ON user_subjects(progress);
    `);

    console.log("✓ Created index idx_user_subjects_progress");

    console.log("\n✅ Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding progress column:", error);
    process.exit(1);
  }
}

addProgressColumn();
