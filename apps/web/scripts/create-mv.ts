/**
 * Script to create the materialized view for daily loop metrics
 * Run this after schema changes: pnpm tsx scripts/create-mv.ts
 */

import { db } from "../db/index";
import { sql } from "drizzle-orm";

async function createMaterializedView() {
  try {
    console.log("Creating materialized view mv_loop_daily...");

    await db.execute(sql`
      CREATE MATERIALIZED VIEW IF NOT EXISTS mv_loop_daily AS
      SELECT
        date_trunc('day', ts)::date AS d,
        coalesce(loop, 'unknown') AS loop,
        count(*) FILTER (WHERE name = 'invite.sent')::float AS invites_sent,
        count(*) FILTER (WHERE name = 'invite.joined')::float AS joins,
        count(*) FILTER (WHERE name = 'invite.fvm')::float AS fvms,
        count(DISTINCT user_id) FILTER (WHERE name = 'invite.sent') AS inviters
      FROM events
      GROUP BY 1,2;
    `);

    console.log("Creating indexes...");

    await db.execute(sql`
      CREATE UNIQUE INDEX IF NOT EXISTS mv_loop_daily_idx ON mv_loop_daily (d, loop);
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS mv_loop_daily_d_idx ON mv_loop_daily (d);
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS mv_loop_daily_loop_idx ON mv_loop_daily (loop);
    `);

    console.log("✅ Materialized view created successfully!");
  } catch (error) {
    console.error("❌ Error creating materialized view:", error);
    process.exit(1);
  }
}

createMaterializedView();

