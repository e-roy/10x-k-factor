import { Redis } from "@upstash/redis";

// Initialize Redis if UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are provided
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const PRESENCE_TTL = 30; // seconds
const PRESENCE_KEY_PREFIX = "presence:subject:";

/**
 * Get Redis key for a subject's presence set
 */
function getPresenceKey(subject: string): string {
  return `${PRESENCE_KEY_PREFIX}${subject}`;
}

/**
 * Ping presence for a user viewing a subject
 * Adds user to Redis SET and sets TTL of 30s
 */
export async function pingPresence(
  subject: string,
  userId: string
): Promise<void> {
  if (!redis) {
    console.warn("[presence] Redis not configured, skipping ping");
    return;
  }

  try {
    const key = getPresenceKey(subject);
    // Add user to set and refresh TTL
    await redis.sadd(key, userId);
    await redis.expire(key, PRESENCE_TTL);
  } catch (error) {
    console.error("[presence] Failed to ping presence:", error);
    // Don't throw - presence is non-critical
  }
}

/**
 * Get current presence count for a subject
 */
export async function getPresenceCount(subject: string): Promise<number> {
  if (!redis) {
    console.warn("[presence] Redis not configured, returning 0");
    return 0;
  }

  try {
    const key = getPresenceKey(subject);
    const count = await redis.scard(key);
    return typeof count === "number" ? count : 0;
  } catch (error) {
    console.error("[presence] Failed to get presence count:", error);
    return 0;
  }
}
