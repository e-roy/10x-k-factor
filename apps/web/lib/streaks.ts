import { db } from "@/db/index";
import { results } from "@/db/schema";
import { sql } from "drizzle-orm";

/**
 * Calculate current streak for a user
 * Streak = consecutive days with at least one result
 * 
 * @param userId - User ID
 * @returns Current streak count (number of consecutive days)
 */
export async function calculateStreak(userId: string): Promise<number> {
  try {
    // Get all results for user from last 30 days (reasonable limit)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const userResults = await db
      .select({
        createdAt: results.createdAt,
      })
      .from(results)
      .where(
        sql`${results.userId} = ${userId} AND ${results.createdAt} >= ${thirtyDaysAgo.toISOString()}`
      )
      .orderBy(sql`${results.createdAt} DESC`);

    if (userResults.length === 0) {
      return 0;
    }

    // Extract unique dates (YYYY-MM-DD format)
    const dates = new Set<string>();
    userResults.forEach((result) => {
      if (result.createdAt) {
        const date = new Date(result.createdAt);
        dates.add(date.toISOString().split("T")[0]);
      }
    });

    const sortedDates = Array.from(dates).sort().reverse(); // Most recent first

    // Check if today or yesterday has a result (streak is active)
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (!sortedDates.includes(today) && !sortedDates.includes(yesterdayStr)) {
      // No result today or yesterday, streak is broken
      return 0;
    }

    // Count consecutive days starting from today/yesterday
    let streak = 0;
    const currentDate = new Date();
    
    // Start from today or yesterday (whichever has a result)
    if (!sortedDates.includes(today)) {
      currentDate.setDate(currentDate.getDate() - 1);
    }

    const checkDate = new Date(currentDate);
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const dateStr = checkDate.toISOString().split("T")[0];
      if (sortedDates.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error("[streaks] Failed to calculate streak:", error);
    return 0;
  }
}

