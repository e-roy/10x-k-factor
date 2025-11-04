import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { Pool } from "pg";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

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
    dbInstance = drizzle(client, { schema });
  } else {
    // Use pg Pool for standard Postgres
    const pool = new Pool({
      connectionString: databaseUrl,
    });
    dbInstance = drizzlePg(pool, { schema });
  }

  return dbInstance;
}

// Lazy initialization - only create connection when actually used
export const db = new Proxy({} as DbInstance, {
  get(_target, prop) {
    return getDb()[prop as keyof DbInstance];
  },
});

export { schema };
