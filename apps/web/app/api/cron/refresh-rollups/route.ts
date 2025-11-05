import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Vercel Cron endpoint to refresh materialized view
 *
 * Configure in Vercel dashboard:
 * - Path: /api/cron/refresh-rollups
 * - Schedule: every 5 minutes
 * - Secret header: Authorization: Bearer CRON_SECRET
 */
export async function GET(request: NextRequest) {
  // Verify secret header for security
  const authHeader = request.headers.get("authorization");
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret) {
    console.error("[cron] CRON_SECRET not configured");
    return NextResponse.json(
      { error: "Cron secret not configured" },
      { status: 500 }
    );
  }

  const expectedAuth = `Bearer ${expectedSecret}`;
  if (authHeader !== expectedAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Refresh materialized view concurrently (non-blocking)
    await db.execute(
      sql`REFRESH MATERIALIZED VIEW CONCURRENTLY mv_loop_daily;`
    );

    return NextResponse.json(
      { success: true, message: "Materialized view refreshed" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[cron] Failed to refresh materialized view:", error);

    // If view doesn't exist yet, that's okay (migration might not have run)
    if (error instanceof Error && error.message.includes("does not exist")) {
      return NextResponse.json(
        { error: "Materialized view not found. Run migration first." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to refresh materialized view" },
      { status: 500 }
    );
  }
}
