import { db } from "@/db/index";
import { results } from "@/db/learning-schema";
import { users } from "@/db/auth-schema";
import { sql, eq, and, desc } from "drizzle-orm";

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
  userName: string | null;
  score: number;
  rank: number;
}

/**
 * Increment leaderboard score for a user in a subject
 *
 * @deprecated Leaderboard scores are now calculated from the results table.
 * This function is kept for backward compatibility but does nothing.
 * Scores are automatically calculated when querying the leaderboard.
 *
 * @param subject - Subject name (e.g., "algebra", "geometry")
 * @param userId - User ID to increment score for
 * @param score - Score increment (default: 1)
 * @returns Always returns null (no-op)
 */
export async function incrementLeaderboard(
  subject: string,
  userId: string,
  _score: number = 1
): Promise<number | null> {
  // No-op: leaderboard scores are now calculated from results table
  // Parameters are kept for backward compatibility but unused
  console.log(
    "[leaderboard] incrementLeaderboard called but scores are now calculated from results table",
    { subject, userId }
  );
  return null;
}

/**
 * Get leaderboard for a subject
 * Returns top N entries ordered by score (descending)
 * Scores are calculated from the results table (COUNT of results per user)
 *
 * @param subject - Subject name
 * @param limit - Number of entries to return (default: 10)
 * @returns Array of leaderboard entries with rank, userId, userName, and score
 */
export async function getLeaderboard(
  subject: string,
  limit: number = 10
): Promise<LeaderboardEntry[]> {
  const validatedSubject = validateSubject(subject);
  if (!validatedSubject) {
    console.warn(
      "[leaderboard] Invalid subject, returning empty leaderboard:",
      subject
    );
    return [];
  }

  try {
    // Query leaderboard using Postgres
    // Score = COUNT(*) of results per user for the subject
    // Rank calculated in JavaScript after ordering
    const leaderboardData = await db
      .select({
        userId: results.userId,
        userName: users.name,
        score: sql<number>`COUNT(*)::integer`.as("score"),
      })
      .from(results)
      .innerJoin(users, eq(results.userId, users.id))
      .where(
        and(
          eq(results.subject, validatedSubject),
          sql`${results.subject} IS NOT NULL`
        )
      )
      .groupBy(results.userId, users.name)
      .orderBy(desc(sql`COUNT(*)`))
      .limit(limit);

    // Calculate ranks (1-based, with ties getting the same rank)
    return leaderboardData.map((entry, index) => {
      // If scores are tied with previous entry, use the same rank
      const prevEntry = index > 0 ? leaderboardData[index - 1] : null;
      let rank: number;

      if (prevEntry && prevEntry.score === entry.score) {
        // Find the first entry with this score to get the correct rank
        const firstIndexWithScore = leaderboardData.findIndex(
          (e) => e.score === entry.score
        );
        rank = firstIndexWithScore + 1;
      } else {
        rank = index + 1;
      }

      return {
        userId: entry.userId,
        userName: entry.userName,
        score: entry.score,
        rank,
      };
    });
  } catch (error) {
    console.error("[leaderboard] Failed to get leaderboard:", error);
    return [];
  }
}

/**
 * Get a user's rank and score for a subject
 * Calculates rank by counting how many users have higher scores
 *
 * @param subject - Subject name
 * @param userId - User ID
 * @returns Rank and score, or null if not found
 */
export async function getUserRank(
  subject: string,
  userId: string
): Promise<{ rank: number; score: number } | null> {
  const validatedSubject = validateSubject(subject);
  if (!validatedSubject) {
    return null;
  }

  try {
    // Get user's score (count of results)
    const userScoreData = await db
      .select({
        score: sql<number>`COUNT(*)::integer`.as("score"),
      })
      .from(results)
      .where(
        and(
          eq(results.userId, userId),
          eq(results.subject, validatedSubject),
          sql`${results.subject} IS NOT NULL`
        )
      )
      .groupBy(results.userId);

    if (!userScoreData || userScoreData.length === 0) {
      return null;
    }

    const userScore = userScoreData[0].score;

    // Calculate rank by counting distinct users with higher scores
    const rankResult = await db.execute(sql`
      SELECT COUNT(DISTINCT r.user_id)::integer + 1 as rank
      FROM results r
      WHERE r.subject = ${validatedSubject}
        AND r.subject IS NOT NULL
        AND r.user_id != ${userId}
      GROUP BY r.user_id
      HAVING COUNT(*) > ${userScore}
    `);

    const rank = (rankResult as unknown as { rank: number }[])?.[0]?.rank ?? 1;

    return {
      rank,
      score: userScore,
    };
  } catch (error) {
    console.error("[leaderboard] Failed to get user rank:", error);
    return null;
  }
}
