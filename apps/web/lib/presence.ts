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
const ERROR_SUPPRESSION_MS = 60000; // 60 seconds

// Connection health tracking
let lastSuccessfulOperation: number | null = null;
let lastErrorLogTime: number = 0;
let consecutiveFailures = 0;

/**
 * Check if error is transient (network-related) or permanent (config-related)
 */
function isTransientError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    const cause = (error as { cause?: Error })?.cause;
    const causeMessage = cause?.message?.toLowerCase() || "";

    // Network errors are transient
    if (
      message.includes("fetch failed") ||
      message.includes("enotfound") ||
      message.includes("econnreset") ||
      message.includes("timeout") ||
      message.includes("network") ||
      causeMessage.includes("enotfound") ||
      causeMessage.includes("econnreset")
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Log error with suppression (only log once per ERROR_SUPPRESSION_MS)
 */
function logError(operation: string, error: unknown): void {
  const now = Date.now();
  if (now - lastErrorLogTime < ERROR_SUPPRESSION_MS) {
    return; // Suppress repeated errors
  }

  lastErrorLogTime = now;
  const isTransient = isTransientError(error);
  const errorType = isTransient ? "transient" : "permanent";

  console.error(
    `[presence] ${operation} failed (${errorType}, ${consecutiveFailures} consecutive failures):`,
    error
  );
}

/**
 * Track successful operation
 */
function trackSuccess(): void {
  lastSuccessfulOperation = Date.now();
  consecutiveFailures = 0;
}

/**
 * Track failed operation
 */
function trackFailure(): void {
  consecutiveFailures++;
}

/**
 * Check if Redis connection is healthy
 */
export function isRedisHealthy(): boolean {
  if (!redis) {
    return false;
  }
  // Consider healthy if we had a successful operation in the last 2 minutes
  if (lastSuccessfulOperation === null) {
    return true; // Haven't tried yet, assume healthy
  }
  const timeSinceLastSuccess = Date.now() - lastSuccessfulOperation;
  return timeSinceLastSuccess < 120000; // 2 minutes
}

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
    return; // Silently skip if not configured
  }

  try {
    const key = getPresenceKey(subject);
    // Add user to set and refresh TTL
    await redis.sadd(key, userId);
    await redis.expire(key, PRESENCE_TTL);
    trackSuccess();
  } catch (error) {
    trackFailure();
    logError("pingPresence", error);
    // Don't throw - presence is non-critical
  }
}

/**
 * Get current presence count for a subject
 */
export async function getPresenceCount(subject: string): Promise<number> {
  if (!redis) {
    return 0; // Silently return 0 if not configured
  }

  try {
    const key = getPresenceKey(subject);
    const count = await redis.scard(key);
    const result = typeof count === "number" ? count : 0;
    trackSuccess();
    return result;
  } catch (error) {
    trackFailure();
    logError("getPresenceCount", error);
    return 0; // Graceful degradation: return 0 on error
  }
}

/**
 * Get presence counts for multiple subjects at once
 * Returns a map of subject -> count
 */
export async function getPresenceCounts(
  subjects: string[]
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();

  if (!redis) {
    return counts; // Silently return empty map if not configured
  }

  try {
    // Fetch all counts in parallel
    const promises = subjects.map(async (subject) => {
      const count = await getPresenceCount(subject);
      return { subject, count };
    });

    const results = await Promise.all(promises);
    results.forEach(({ subject, count }) => {
      counts.set(subject, count);
    });

    return counts;
  } catch (error) {
    trackFailure();
    logError("getPresenceCounts", error);
    return counts; // Graceful degradation: return empty map on error
  }
}
