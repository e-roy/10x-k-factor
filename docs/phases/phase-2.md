Phase 2 — Event Schema & Ingest (Postgres-only)

**Goal**: Typed event pipeline writing to Postgres only, with materialized views refreshed by Vercel Cron Jobs.

**Tasks**

1. **Types & validation**

   - `packages/lib/events.ts`: Zod schemas for `invite.sent|opened|joined|fvm`, `presence.ping`, `reward.granted`, `exp.exposed`.
   - Export `type EventName = ...; type Event<T>`.

2. **Client SDK**

   - `apps/web/lib/track.ts`: `track(name, payload)` → POST `/api/events` with `visitor_id` cookie.

3. **Materialized view (daily rollup)**

   - Migration SQL for `mv_loop_daily` materialized view
   - Vercel Cron Job to refresh view every 5 minutes

4. **API route**

   - `apps/web/app/api/events/route.ts`: validate body with Zod, insert into `events` table, return `201`.

5. **Server action for dashboards**

   - `apps/web/app/admin/metrics/actions.ts`: `getKByLoop(from, to)` function to query materialized view.

6. **Vercel Cron Job**

   - `/api/cron/refresh-rollups` route that refreshes materialized view.

**Deliverables**: Events table + indices; MV `mv_loop_daily`; `/api/events` insert path; cron endpoint to refresh MV; server action to fetch K.

**Acceptance Tests**

- `curl -XPOST /api/events -d '{...}'` returns 201 and row appears.
- Manual call to `/api/cron/refresh-rollups` succeeds and MV row count increases.
- `/admin/metrics` page renders K by loop for a date range directly from Postgres.
