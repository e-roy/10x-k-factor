import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// Load .env from current directory and parent directories
config({ path: "../../.env" });
config({ path: ".env" });

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL environment variable is required. Make sure .env file exists at project root or in apps/web/"
  );
}

export default defineConfig({
  schema: [
    "./db/auth-schema.ts",
    "./db/user-schema.ts",
    "./db/viral-schema.ts",
    "./db/learning-schema.ts",
    "./db/events-schema.ts",
    "./db/rewards-schema.ts",
    "./db/xp-schema.ts",
  ],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
