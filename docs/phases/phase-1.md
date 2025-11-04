Phase 1 — Drizzle + Postgres Wiring

**Goal**: OLTP database ready with migrations, connection pooling, and health checks.

**Inputs**: Neon/Supabase connection string.

**Tasks**

1. **Install & init**

   - `pnpm add drizzle-orm pg postgres` ; `pnpm add -D drizzle-kit`
   - `apps/web/db/schema.ts`: define tables (see §B snapshot below).
   - `apps/web/db/index.ts` create client with `neon` or `pg` pool.

2. **Drizzle Kit**

   - `drizzle.config.ts` at repo root pointing to `apps/web/db/schema.ts` and output `drizzle/`.
   - Scripts: `pnpm drizzle:gen`, `pnpm drizzle:push`.

3. **Health route**

   - `apps/web/app/api/health/route.ts` → `SELECT 1` and Redis ping.

4. **Seeds**

   - `apps/web/scripts/seed.ts` to insert sample users, results, cohorts.

**Deliverables**: Migrations applied; seed data present.

**Acceptance Tests**

- `pnpm drizzle:gen && pnpm drizzle:push` succeeds.
- `GET /api/health` returns `{ db: 'ok', redis: 'ok' }`.

**Schema Snapshot (Drizzle)**

```ts
// apps/web/db/schema.ts (excerpt)
import {
  pgTable,
  varchar,
  boolean,
  jsonb,
  integer,
  timestamp,
  primaryKey,
} from "drizzle-orm/pg-core";
export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  persona: varchar("persona", { length: 12 }).notNull(), // 'student'|'parent'|'tutor'
  minor: boolean("minor").default(false),
  guardianId: varchar("guardian_id", { length: 36 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
export const smartLinks = pgTable("smart_links", {
  code: varchar("code", { length: 12 }).primaryKey(),
  inviterId: varchar("inviter_id", { length: 36 }).notNull(),
  loop: varchar("loop", { length: 24 }).notNull(),
  params: jsonb("params").$type<Record<string, unknown>>(),
  sig: varchar("sig", { length: 128 }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
```
