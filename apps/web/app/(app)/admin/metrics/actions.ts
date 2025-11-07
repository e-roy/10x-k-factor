"use server";

import { db } from "@/db/index";
import { sql } from "drizzle-orm";

export interface KFactorRow {
  d: Date;
  loop: string;
  invites_per_user: number | null;
  invite_to_fvm_rate: number | null;
  k_est: number | null;
}

/**
 * Get K-factor metrics by loop for a date range
 * 
 * @param from Start date (YYYY-MM-DD format)
 * @param to End date (YYYY-MM-DD format)
 * @returns Array of K-factor metrics grouped by date and loop
 */
export async function getKByLoop(
  from: string,
  to: string
): Promise<KFactorRow[]> {
  try {
    const result = await db.execute(sql`
      SELECT 
        d,
        loop,
        (invites_sent / NULLIF(inviters, 0)) AS invites_per_user,
        (fvms / NULLIF(invites_sent, 0)) AS invite_to_fvm_rate,
        (invites_sent / NULLIF(inviters, 0)) * (fvms / NULLIF(invites_sent, 0)) AS k_est
      FROM mv_loop_daily
      WHERE d BETWEEN ${from}::date AND ${to}::date
      ORDER BY d DESC, loop ASC;
    `);

    return (result as unknown as KFactorRow[]) || [];
  } catch (error) {
    console.error("[metrics] Failed to fetch K-factor data:", error);
    
    // If view doesn't exist, return empty array
    if (error instanceof Error && error.message.includes("does not exist")) {
      console.warn("[metrics] Materialized view not found. Run migration first.");
      return [];
    }

    throw error;
  }
}

