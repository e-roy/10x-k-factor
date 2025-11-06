import { Redis } from "@upstash/redis";

// Initialize Redis if UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are provided
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const RATE_LIMIT_KEY_PREFIX = "rate:invite:";
const DEFAULT_DAILY_LIMIT = parseInt(
  process.env.INVITE_RATE_LIMIT_DAILY || "20",
  10
);

/**
 * Get current date string in YYYY-MM-DD format
 */
function getCurrentDate(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Get Redis key for invite rate limit
 */
function getRateLimitKey(userId: string, date: string): string {
  return `${RATE_LIMIT_KEY_PREFIX}${userId}:${date}`;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: Date;
}

/**
 * Check if user can send invites (rate limit check)
 * Returns current count and whether action is allowed
 *
 * @param userId - User ID
 * @param date - Date string in YYYY-MM-DD format (defaults to today)
 * @returns Rate limit status
 */
export async function checkInviteRateLimit(
  userId: string,
  date: string = getCurrentDate()
): Promise<RateLimitResult> {
  if (!redis) {
    console.warn("[rate-limit] Redis not configured, allowing action");
    return {
      allowed: true,
      remaining: DEFAULT_DAILY_LIMIT,
      limit: DEFAULT_DAILY_LIMIT,
      resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Reset at midnight next day
    };
  }

  try {
    const key = getRateLimitKey(userId, date);
    
    // Get current count
    const count = await redis.get<number>(key);
    const currentCount = typeof count === "number" ? count : 0;

    const allowed = currentCount < DEFAULT_DAILY_LIMIT;
    const remaining = Math.max(0, DEFAULT_DAILY_LIMIT - currentCount);

    // Calculate reset time (next midnight in UTC)
    const resetDate = new Date(date);
    resetDate.setUTCHours(24, 0, 0, 0); // Next midnight UTC

    return {
      allowed,
      remaining,
      limit: DEFAULT_DAILY_LIMIT,
      resetAt: resetDate,
    };
  } catch (error) {
    console.error("[rate-limit] Failed to check rate limit:", error);
    // On error, allow the action (fail open)
    return {
      allowed: true,
      remaining: DEFAULT_DAILY_LIMIT,
      limit: DEFAULT_DAILY_LIMIT,
      resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
  }
}

/**
 * Increment invite rate limit counter
 * Sets TTL to expire at midnight next day
 *
 * @param userId - User ID
 * @param date - Date string in YYYY-MM-DD format (defaults to today)
 * @returns New count after increment, or null if Redis not configured
 */
export async function incrementInviteRateLimit(
  userId: string,
  date: string = getCurrentDate()
): Promise<number | null> {
  if (!redis) {
    console.warn("[rate-limit] Redis not configured, skipping increment");
    return null;
  }

  try {
    const key = getRateLimitKey(userId, date);
    
    // Increment counter (creates if doesn't exist)
    const newCount = await redis.incr(key);

    // Calculate TTL until next midnight UTC
    const resetDate = new Date(date);
    resetDate.setUTCHours(24, 0, 0, 0); // Next midnight UTC
    const ttlSeconds = Math.floor((resetDate.getTime() - Date.now()) / 1000);

    // Set TTL (expires at midnight)
    if (ttlSeconds > 0) {
      await redis.expire(key, ttlSeconds);
    }

    return typeof newCount === "number" ? newCount : null;
  } catch (error) {
    console.error("[rate-limit] Failed to increment rate limit:", error);
    return null;
  }
}

