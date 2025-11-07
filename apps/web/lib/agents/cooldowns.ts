import { db } from "@/db/index";
import { events } from "@/db/schema/index";
import { eq, and, gte, sql } from "drizzle-orm";

/**
 * Calculate cooldowns for loops based on recent invite.sent events
 * Returns a record like { "buddy_challenge_hours": 12, "results_rally_hours": 24 }
 */
export async function getCooldowns(
  userId: string | null
): Promise<Record<string, number>> {
  if (!userId) {
    return {};
  }

  try {
    // Get recent invite.sent events for this user (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentInvites = await db
      .select({
        loop: events.loop,
        ts: events.ts,
      })
      .from(events)
      .where(
        and(
          eq(events.userId, userId),
          eq(events.name, "invite.sent"),
          gte(events.ts, sevenDaysAgo)
        )
      )
      .orderBy(sql`${events.ts} DESC`);

    // Calculate hours since last invite for each loop
    const cooldowns: Record<string, number> = {};
    const now = Date.now();

    for (const invite of recentInvites) {
      if (!invite.loop) continue;

      const loopKey = `${invite.loop}_hours`;
      if (cooldowns[loopKey] !== undefined) {
        // Already have a more recent invite for this loop
        continue;
      }

      const inviteTime = invite.ts.getTime();
      const hoursSince = (now - inviteTime) / (1000 * 60 * 60);
      cooldowns[loopKey] = hoursSince;
    }

    return cooldowns;
  } catch (error) {
    console.error("[getCooldowns] Error:", error);
    return {};
  }
}
