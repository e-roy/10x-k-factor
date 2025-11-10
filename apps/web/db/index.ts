import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { Pool } from "pg";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import * as authSchema from "@/db/auth-schema";
import * as userSchema from "@/db/user-schema";
import * as viralSchema from "@/db/viral-schema";
import * as learningSchema from "@/db/learning-schema";
import * as eventsSchema from "@/db/events-schema";
import * as rewardsSchema from "@/db/rewards-schema";
import * as xpSchema from "@/db/xp-schema";
import * as subjectsSchema from "@/db/subjects-schema";

// Combine all schemas for Drizzle adapter
const combinedSchema = {
  ...authSchema,
  ...userSchema,
  ...viralSchema,
  ...learningSchema,
  ...eventsSchema,
  ...rewardsSchema,
  ...xpSchema,
  ...subjectsSchema,
};

type DbInstance = ReturnType<typeof drizzle> | ReturnType<typeof drizzlePg>;

let dbInstance: DbInstance | null = null;

function getDb(): DbInstance {
  if (dbInstance) {
    return dbInstance;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  // Detect Neon vs standard Postgres
  // Neon uses postgres:// with @neon.tech or neon.tech in the host
  // Standard Postgres uses pg package with Pool
  const isNeon =
    databaseUrl.includes("neon.tech") || databaseUrl.includes("@neon");

  if (isNeon) {
    // Use postgres client for Neon
    const client = postgres(databaseUrl, {
      max: 1, // Neon serverless works best with max 1 connection
    });
    dbInstance = drizzle(client, { schema: combinedSchema });
  } else {
    // Use pg Pool for standard Postgres
    const pool = new Pool({
      connectionString: databaseUrl,
    });
    dbInstance = drizzlePg(pool, { schema: combinedSchema });
  }

  return dbInstance;
}

// Lazy initialization - only create connection when actually used
export const db = new Proxy({} as DbInstance, {
  get(_target, prop) {
    return getDb()[prop as keyof DbInstance];
  },
});

// Export function to get the actual db instance for adapters that need it
export function getDbInstance(): DbInstance {
  return getDb();
}

export {
  authSchema,
  userSchema,
  viralSchema,
  learningSchema,
  eventsSchema,
  rewardsSchema,
  xpSchema,
  subjectsSchema,
  combinedSchema,
};
