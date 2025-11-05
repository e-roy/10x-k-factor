Phase 2 — Event Schema & Ingest (Postgres‑only)

**Goal**: Typed analytics pipeline writing to **Postgres only**, with **materialized views** refreshed by **Vercel Cron Jobs**.

**Tasks**

1. **Types & validation**
   - `packages/lib/events.ts`: Zod schemas for `invite.sent|opened|joined|fvm`, `presence.ping`, `reward.granted`, `exp.exposed`.
   - Export `type EventName` and `EventPayloads` mapped to Zod types.

2. **DB schema (Drizzle)**
   - `apps/web/db/schema.events.ts`:

     ```ts
     import {
       pgTable,
       bigserial,
       timestamp,
       text,
       jsonb,
     } from "drizzle-orm/pg-core";
     export const events = pgTable("events", {
       id: bigserial("id", { mode: "number" }).primaryKey(),
       ts: timestamp("ts", { withTimezone: true }).defaultNow().notNull(),
       userId: text("user_id"),
       anonId: text("anon_id"),
       loop: text("loop"), // buddy_challenge, results_rally, etc.
       name: text("name").notNull(), // invite.sent, invite.opened, invite.joined, invite.fvm, reward.granted
       props: jsonb("props").$type<Record<string, unknown>>().default({}),
     });
     ```

   - Add indices via raw SQL migrations:

     ```sql
     CREATE INDEX IF NOT EXISTS idx_events_name_ts ON events(name, ts);
     CREATE INDEX IF NOT EXISTS idx_events_loop_ts ON events(loop, ts);
     CREATE INDEX IF NOT EXISTS idx_events_user ON events(user_id);
     CREATE INDEX IF NOT EXISTS idx_events_props_gin ON events USING GIN (props);
     ```

3. **Materialized view (daily rollup)**
   - Migration SQL:

     ```sql
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

     CREATE UNIQUE INDEX IF NOT EXISTS mv_loop_daily_idx ON mv_loop_daily (d, loop);
     ```

   - Optional: add more MVs later (retention, guardrails).

4. **API route**
   - `apps/web/app/api/events/route.ts`: validate body with Zod, insert into `events` (single or batched), return `201`.

5. **Server action for dashboards**
   - `apps/web/app/admin/metrics/actions.ts`:

     ```ts
     export async function getKByLoop(from: string, to: string) {
       return db.execute(sql`SELECT d, loop,
         (invites_sent / NULLIF(inviters,0)) AS invites_per_user,
         (fvms / NULLIF(invites_sent,0)) AS invite_to_fvm_rate,
         (invites_sent / NULLIF(inviters,0)) * (fvms / NULLIF(invites_sent,0)) AS k_est
       FROM mv_loop_daily WHERE d BETWEEN ${from} AND ${to} ORDER BY d, loop;`);
     }
     ```

6. **Vercel Cron Job (refresh MV)**
   - Add `/api/cron/refresh-rollups` route that runs:

     ```ts
     await db.execute(
       sql`REFRESH MATERIALIZED VIEW CONCURRENTLY mv_loop_daily;`
     );
     ```

   - Configure **Vercel → Settings → Cron Jobs**: `*/5 * * * *` hitting `/api/cron/refresh-rollups` (Protect with secret header).

**Deliverables**: Events table + indices; MV `mv_loop_daily`; `/api/events` insert path; cron endpoint to refresh MV; server action to fetch K.

**Acceptance Tests**

- `POST /api/events` inserts rows and returns 201.
- Manual call to `/api/cron/refresh-rollups` succeeds and MV row count increases.
- `/admin/metrics` page renders K by loop for a date range directly from Postgres.
