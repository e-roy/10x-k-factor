import { Redis } from "@upstash/redis";

// Initialize Redis if UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are provided
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const LEADERBOARD_KEY_PREFIX = "leaderboard:";

/**
 * Get Redis key for a subject's leaderboard
 */
function getLeaderboardKey(subject: string): string {
  return `${LEADERBOARD_KEY_PREFIX}${subject}`;
}

/**
 * Validate and sanitize subject
 */
function validateSubject(subject: unknown): string | null {
  if (typeof subject !== "string") {
    return null;
  }
  if (subject.length === 0 || subject.length > 64) {
    return null;
  }
  // Allow alphanumeric, hyphens, spaces
  if (!/^[a-zA-Z0-9\-\s]+$/.test(subject)) {
    return null;
  }
  return subject.trim();
}

export interface LeaderboardEntry {
  userId: string;
  score: number;
  rank: number;
}

/**
 * Increment leaderboard score for a user in a subject
 * Uses Redis ZSET ZINCRBY operation
 *
 * @param subject - Subject name (e.g., "algebra", "geometry")
 * @param userId - User ID to increment score for
 * @param score - Score increment (default: 1)
 * @returns New score after increment, or null if Redis not configured
 */
export async function incrementLeaderboard(
  subject: string,
  userId: string,
  score: number = 1
): Promise<number | null> {
  if (!redis) {
    console.warn("[leaderboard] Redis not configured, skipping increment");
    return null;
  }

  const validatedSubject = validateSubject(subject);
  if (!validatedSubject) {
    console.warn("[leaderboard] Invalid subject, skipping increment:", subject);
    return null;
  }

  try {
    const key = getLeaderboardKey(validatedSubject);
    const newScore = await redis.zincrby(key, score, userId);
    return typeof newScore === "number" ? newScore : null;
  } catch (error) {
    console.error("[leaderboard] Failed to increment leaderboard:", error);
    // Don't throw - leaderboard is non-critical
    return null;
  }
}

/**
 * Get leaderboard for a subject
 * Returns top N entries ordered by score (descending)
 *
 * @param subject - Subject name
 * @param limit - Number of entries to return (default: 10)
 * @returns Array of leaderboard entries with rank, userId, and score
 */
export async function getLeaderboard(
  subject: string,
  limit: number = 10
): Promise<LeaderboardEntry[]> {
  if (!redis) {
    console.warn("[leaderboard] Redis not configured, returning empty leaderboard");
    return [];
  }

  const validatedSubject = validateSubject(subject);
  if (!validatedSubject) {
    console.warn("[leaderboard] Invalid subject, returning empty leaderboard:", subject);
    return [];
  }

  try {
    const key = getLeaderboardKey(validatedSubject);
    // Use zrange with rev and withScores options for reverse range with scores
    // Upstash Redis uses zrange with rev option instead of zrevrange
    const results = await redis.zrange(key, 0, limit - 1, { 
      rev: true, 
      withScores: true 
    });

    if (!results || !Array.isArray(results)) {
      return [];
    }

    // Results come as an array of [member, score, member, score, ...] pairs
    const entries: LeaderboardEntry[] = [];
    for (let i = 0; i < results.length; i += 2) {
      const userId = results[i] as string;
      const score = results[i + 1];
      
      if (userId && (typeof score === "number" || typeof score === "string")) {
        entries.push({
          userId,
          score: Math.round(typeof score === "string" ? parseFloat(score) : score),
          rank: entries.length + 1,
        });
      }
    }

    return entries;
  } catch (error) {
    console.error("[leaderboard] Failed to get leaderboard:", error);
    return [];
  }
}

/**
 * Get a user's rank and score for a subject
 *
 * @param subject - Subject name
 * @param userId - User ID
 * @returns Rank and score, or null if not found
 */
export async function getUserRank(
  subject: string,
  userId: string
): Promise<{ rank: number; score: number } | null> {
  if (!redis) {
    return null;
  }

  const validatedSubject = validateSubject(subject);
  if (!validatedSubject) {
    return null;
  }

  try {
    const key = getLeaderboardKey(validatedSubject);
    // Get user's score
    const score = await redis.zscore(key, userId);
    
    if (score === null || typeof score !== "number") {
      return null;
    }

    // Get rank (ZREVRANK returns 0-based index, so add 1)
    const rankIndex = await redis.zrevrank(key, userId);
    
    if (rankIndex === null || typeof rankIndex !== "number") {
      return null;
    }

    return {
      rank: rankIndex + 1,
      score: Math.round(score),
    };
  } catch (error) {
    console.error("[leaderboard] Failed to get user rank:", error);
    return null;
  }
}

