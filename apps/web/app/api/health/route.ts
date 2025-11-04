import { NextResponse } from "next/server";
import { db } from "@/db/index";
import { sql } from "drizzle-orm";
import { Redis } from "@upstash/redis";

// Mark route as dynamic to prevent build-time evaluation
export const dynamic = "force-dynamic";

// Initialize Redis if UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are provided
// Otherwise, check for standard REDIS_URL (for non-Upstash Redis)
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

export async function GET() {
  const health: { db: string; redis: string } = {
    db: "error",
    redis: "error",
  };

  // Check database
  try {
    await db.execute(sql`SELECT 1`);
    health.db = "ok";
  } catch (error) {
    console.error("Database health check failed:", error);
    health.db = "error";
  }

  // Check Redis
  if (redis) {
    try {
      await redis.ping();
      health.redis = "ok";
    } catch (error) {
      console.error("Redis health check failed:", error);
      health.redis = "error";
    }
  } else {
    health.redis = "not_configured";
  }

  const statusCode = health.db === "ok" && health.redis !== "error" ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}
