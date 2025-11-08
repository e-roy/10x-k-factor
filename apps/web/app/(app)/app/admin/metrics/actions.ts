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

export interface ReferralMetrics {
  loop: string;
  total_referrals: number;
  completed_actions: number;
  completion_rate: number;
  inviter_rewarded: number;
  invitee_rewarded: number;
  avg_conversion_time_hours: number | null;
}

export interface RecentReferral {
  inviter_email: string;
  invitee_email: string;
  loop: string;
  completed_action: boolean;
  inviter_rewarded: boolean;
  invitee_rewarded: boolean;
  created_at: Date;
  completed_at: Date | null;
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

/**
 * Get referral metrics aggregated by loop for a date range
 * 
 * @param from Start date (YYYY-MM-DD format)
 * @param to End date (YYYY-MM-DD format)
 * @returns Array of referral metrics grouped by loop
 */
export async function getReferralMetrics(
  from: string,
  to: string
): Promise<ReferralMetrics[]> {
  try {
    const result = await db.execute(sql`
      SELECT 
        loop,
        COUNT(*) AS total_referrals,
        COUNT(*) FILTER (WHERE invitee_completed_action = true) AS completed_actions,
        ROUND(
          COUNT(*) FILTER (WHERE invitee_completed_action = true)::numeric / 
          NULLIF(COUNT(*), 0) * 100, 
          1
        ) AS completion_rate,
        COUNT(*) FILTER (WHERE inviter_rewarded = true) AS inviter_rewarded,
        COUNT(*) FILTER (WHERE invitee_rewarded = true) AS invitee_rewarded,
        ROUND(
          AVG(
            CASE 
              WHEN completed_at IS NOT NULL 
              THEN EXTRACT(EPOCH FROM (completed_at - created_at)) / 3600
              ELSE NULL
            END
          )::numeric,
          2
        ) AS avg_conversion_time_hours
      FROM referrals
      WHERE created_at BETWEEN ${from}::timestamp AND (${to}::timestamp + INTERVAL '1 day')
      GROUP BY loop
      ORDER BY total_referrals DESC;
    `);

    return (result as unknown as ReferralMetrics[]) || [];
  } catch (error) {
    console.error("[metrics] Failed to fetch referral metrics:", error);
    throw error;
  }
}

/**
 * Get recent referrals with inviter and invitee details
 * 
 * @param from Start date (YYYY-MM-DD format)
 * @param to End date (YYYY-MM-DD format)
 * @param limit Maximum number of records to return
 * @returns Array of recent referrals
 */
export async function getRecentReferrals(
  from: string,
  to: string,
  limit: number = 50
): Promise<RecentReferral[]> {
  try {
    const result = await db.execute(sql`
      SELECT 
        inviter.email AS inviter_email,
        invitee.email AS invitee_email,
        r.loop,
        r.invitee_completed_action AS completed_action,
        r.inviter_rewarded,
        r.invitee_rewarded,
        r.created_at,
        r.completed_at
      FROM referrals r
      LEFT JOIN auth_users inviter ON r.inviter_id = inviter.id
      LEFT JOIN auth_users invitee ON r.invitee_id = invitee.id
      WHERE r.created_at BETWEEN ${from}::timestamp AND (${to}::timestamp + INTERVAL '1 day')
      ORDER BY r.created_at DESC
      LIMIT ${limit};
    `);

    return (result as unknown as RecentReferral[]) || [];
  } catch (error) {
    console.error("[metrics] Failed to fetch recent referrals:", error);
    throw error;
  }
}

