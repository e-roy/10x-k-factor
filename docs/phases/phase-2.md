Phase 2 — Event Schema & Ingest (Postgres + Tinybird)

**Goal**: Typed event pipeline with dual‑write to Postgres and Tinybird.

**Tasks**

1. **Types & validation**

   - `packages/lib/events.ts`: Zod schemas for `invite.sent|opened|joined|fvm`, `presence.ping`, `reward.granted`, `exp.exposed`.
   - Export `type EventName = ...; type Event<T>`.

2. **Client SDK**

   - `apps/web/lib/track.ts`: `track(name, payload)` → POST `/api/events` with `visitor_id` cookie.

3. **API route**

   - `apps/web/app/api/events/route.ts`: validate body, write to Postgres `events` table, and `fetch` Tinybird ingest endpoint.

4. **Tinybird**

   - Create Data Source `events_raw` with column types; add Pipe `k_factor_by_loop` (SQL) and publish API endpoint.

**Deliverables**: Events visible in DB; Tinybird endpoint returns aggregates.

**Acceptance Tests**

- `curl -XPOST /api/events -d '{...}'` returns 200 and row appears.
- `GET https://api.tinybird.co/v0/pipes/k_factor_by_loop.json?...` returns JSON with `k_est`.

**Pipe Example (Tinybird SQL)**

```sql
SELECT loop,
       AVG(invites_per_user) * AVG(invite_to_fvm_rate) AS k_est
FROM   loop_daily_metrics
WHERE  cohort_date BETWEEN {{d1}} AND {{d2}}
GROUP BY loop
ORDER BY k_est DESC;
```
