# 10x K Factor — PWA Build Playbook (Drizzle + Postgres + Tinybird)

> **Scope**: Single, self‑contained execution guide for a **PWA‑first** implementation. Stack: **Next.js (App Router) + TypeScript + Tailwind + shadcn/ui + Drizzle ORM + Postgres (Neon/Supabase) + Upstash Redis + next‑pwa/Workbox + Web Push (VAPID) + MCP agents (Fastify/Node) + Tinybird (recommended) or ClickHouse (optional)**. Mobile apps deferred.

---

## 0) Global Conventions

- **Repo layout**

  - `apps/web` — Next.js PWA (App Router)
  - `apps/agents` — MCP agent services (Fastify TS)
  - `packages/ui` — shared UI (optional)
  - `packages/lib` — shared types & utilities
  - `infra/` — IaC, env templates, scripts

- **Env files**: `.env`, `.env.local`, `.env.example` (always include example with fake values)
- **Naming**: kebab-case routes, snake_case DB columns, PascalCase TS types.
- **Security**: Never log raw PII; hash with `sha256(salt + value)`.

---

## 1) Phase 0 — Project Scaffold & PWA Baseline (Expanded)

**Goal**: Installable, deployable PWA skeleton with CI, lint, format, and SW cache.

**Inputs/Prereqs**: Node 20, pnpm, GitHub repo, Vercel project (or self‑hosted). Upstash & Neon accounts created.

**Tasks**

1. **Initialize**

   - `pnpm dlx create-next-app@latest apps/web --ts --eslint --src-dir --app --tailwind`
   - `pnpm init -y` at monorepo root; add `pnpm-workspace.yaml` including `apps/*` and `packages/*`.
   - `pnpm add -D turbo prettier @types/node` ; add `turbo.json` with pipeline: build, lint, dev.

2. **UI & components**

   - In `apps/web`: `pnpm dlx shadcn-ui@latest init` → install base components (Button, Card, Tabs, Toast).

3. **PWA**

   - `pnpm add next-pwa workbox-window`
   - `apps/web/next.config.mjs`:

     ```js
     import withPWA from "next-pwa";
     export default withPWA({
       dest: "public",
       disable: process.env.NODE_ENV === "development",
     })({});
     ```

   - Add `public/manifest.json` (name, icons, start_url, display=standalone, background_color, theme_color).
   - Generate icons with RealFaviconGenerator; place in `public/`.

4. **Service Worker**

   - Add `public/sw.js` with Workbox precache + runtime strategies (HTML NetworkFirst, static CacheFirst, API StaleWhileRevalidate for `/api/` GETs).

5. **CI** (GitHub Actions)

   - `.github/workflows/ci.yml` running `pnpm i`, `pnpm lint`, `pnpm build` on PR.

6. **Quality gates**

   - Prettier config; ESLint with `@typescript-eslint` rules; `tsconfig.json` `noImplicitAny: true`.

**Deliverables**: Running PWA at `/`, installs to home screen, passes Lighthouse PWA.

**Acceptance Tests**

- Chrome Lighthouse PWA ≥ 90, install prompt visible.
- `window.matchMedia('(display-mode: standalone)').matches` becomes true after install.
- CI passes on new PR.

**Notes**: SW disabled in dev to avoid cache thrash; test SW in preview.

---

## 2) Phase 1 — Drizzle + Postgres Wiring

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

---

## 3) Phase 2 — Event Schema & Ingest (Postgres + Tinybird)

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

---

## 4) Phase 3 — Smart Links & Attribution

**Goal**: Short codes with HMAC signature, expiry, UTM capture, last‑touch attribution.

**Tasks**

1. **Signer**

   - `apps/web/lib/signing.ts` HMAC SHA256 of canonical query; 7‑day expiry.

2. **Create link**

   - Server action `createSmartLink({ inviterId, loop, params })` → insert `smart_links` row.

3. **Resolver**

   - `apps/web/app/sl/[code]/route.ts`: lookup → verify `sig` and `expires_at` → set `vt_attrib` cookie (UTM + inviter + loop) → redirect to deep route.

4. **Attribution**

   - `apps/web/lib/attrib.ts` parse cookie in middleware; write `invite.opened` event.

**Deliverables**: Working `vt.to/xyz` equivalent and attribution cookie.

**Acceptance Tests**

- Invalid/expired links 302 to safe page; valid links 302 to deep route and log `invite.opened`.

---

## 5) Phase 4 — Results Pages → Share Cards (Safe by Persona)

**Goal**: Results as viral surfaces with OG images and share CTAs.

**Tasks**

1. **Results UI**

   - `apps/web/app/results/[id]/page.tsx` shows score, heatmap, recommendations.

2. **OG Cards**

   - `apps/web/app/api/og/route.ts` using `@vercel/og` (Edge) to render 1200×630 cards; student/parent/tutor variants; never include PII.

3. **Share CTA**

   - Web Share API → fallback copy link; insert `invites` row and fire `invite.sent` event.

**Deliverables**: Correct unfurls in Slack/Twitter/Teams; links deep‑link to FVM task.

**Acceptance Tests**

- Facebook Debugger/Twitter Validator show expected OG; clicking card lands on micro‑deck with context.

---

## 6) Phase 5 — FVM Micro‑Task Landing

**Goal**: Bite‑size first value (≤90s) with analytics and reward preview.

**Tasks**

1. **Route** `apps/web/app/fvm/skill/[deckId]/page.tsx`
2. **Micro‑deck** component: 5 questions, progress, timer, keyboard nav, submit.
3. **Deep‑link params**: parse `deckId`, `inviter`, `loop`.
4. **Completion**: fire `invite.fvm` + `FVM_reached`; show reward preview (not grant yet).

**Deliverables**: New user lands, completes deck, events recorded.

**Acceptance Tests**

- Median completion < 90s in test cohort; events appear in Tinybird `events_raw`.

---

## 7) Phase 6 — Presence (Alive v1)

**Goal**: Real‑time presence counts per subject.

**Tasks**

1. **Ping** endpoint `POST /api/presence/ping` with `{ subject }` every 15s.
2. **SSE** stream `GET /api/presence/stream?subject=algebra` pushes count updates.
3. **Redis**: `SADD presence:subject:{id} userId` + TTL 30s; `SCARD` for counts.
4. **Hook** `usePresence(subject)` to wire UI.

**Deliverables**: Live count widget in header or results page.

**Acceptance Tests**

- Two browsers show count changes within 15s; disconnect drops after TTL.

---

## 8) Phase 7 — Leaderboards & Cohort Rooms

**Goal**: Competition & social rooms.

**Tasks**

1. **Leaderboard**: Redis ZSET `leaderboard:{subject}`; increment on FVM.
2. **Cohort Room**: route `/cohort/[id]`; show presence, mini feed (joined, completed), invite CTA.
3. **Rate limits**: throttle invites/day via Redis counter `rate:invite:{user}:{date}`.

**Deliverables**: Leaderboard widget + cohort page with live members.

**Acceptance Tests**

- Completing FVM bumps rank; invite beyond cap returns 429 with friendly UI.

---

## 9) Phase 8 — MCP Agents (Orchestrator + Personalization)

**Goal**: Decisioning APIs with sub‑150ms SLA.

**Tasks**

1. **Agents app**

   - `apps/agents/src/index.ts` Fastify with routes `/orchestrator/choose_loop`, `/personalize/compose`.

2. **Contracts** JSON Schema for inputs/outputs; include `rationale`, `features_used`, `ttl_ms`.
3. **Client** in web: fetch with AbortController 150ms timeout; fallback defaults on timeout.

**Deliverables**: Results page calls Orchestrator; gets loop + copy.

**Acceptance Tests**

- P95 latency < 150ms in staging; retries/backoff logged.

**Example Contract**

```json
{
  "input": {
    "event": "results_viewed",
    "persona": "student",
    "subject": "algebra",
    "cooldowns": { "buddy_challenge_hours": 24 }
  },
  "output": {
    "loop": "buddy_challenge",
    "eligibility_reason": "cooldown_ok",
    "rationale": "recent practice complete"
  }
}
```

---

## 10) Phase 9 — Wire 4 Viral Loops (Happy Paths)

**Goal**: Buddy Challenge, Results Rally, Proud Parent, Tutor Spotlight end‑to‑end.

**Tasks**

- Implement triggers and surfaces per loop; all lead to FVM landing; emit funnel events.
- Proud Parent uses email/Web Share; Tutor Spotlight generates OG tutor card + smart link.

**Deliverables**: 4 loops demonstrably working on staging.

**Acceptance Tests**

- For each loop: trigger→share→open→join→FVM metrics present in Tinybird dashboards.

---

## 11) Phase 10 — Incentives & Ledger (MVP)

**Goal**: Rewards with budget control and anti‑abuse checks.

**Tasks**

1. **Policy**: `student: streak_shield on send; +15 AI minutes on FVM within 48h`. Parent/tutor policies defined.
2. **Grant API**: `POST /api/rewards/grant` idempotent; checks Trust & Safety; writes `rewards` + `ledger_entries`.
3. **UI**: toast and badge; ledger view in `/settings/rewards`.

**Deliverables**: Reward appears post‑FVM; cost captured.

**Acceptance Tests**

- Duplicate grant ignored; ledger row includes `unit_cost_cents`.

---

## 12) Phase 11 — Trust & Safety (MVP)

**Goal**: Early fraud reduction.

**Tasks**

- Hash email/device; maintain `risk_score` (velocity, duplicate household, emulator heuristics).
- Enforce invite caps; minors external-share gate; school domain throttle.
- `safety.check` agent stub returning `block|cooldown|ok`.

**Deliverables**: Block/cooldown flows with clear UI.

**Acceptance Tests**

- Exceeding caps returns `429` with retry-after; minors blocked without consent.

---

## 13) Phase 12 — Web Push (PWA)

**Goal**: Push on Android/desktop; iOS fallback.

**Tasks**

- Generate **VAPID** keys; `web-push` backend sender.
- SW push handler in `public/sw.js`; topic subscriptions; permission UX.
- iOS Safari fallback to SMS/email prompt.

**Deliverables**: Admin can send test push to a subscribed browser.

**Acceptance Tests**

- Chrome/Edge/Android receive push; iOS shows fallback path.

---

## 14) Phase 13 — Session Hooks → Agentic Actions

**Goal**: ≥4 actions sourced from summaries (≥2 student, ≥2 tutor).

**Tasks**

- `POST /api/summaries` ingest; derive actions: Beat‑My‑Skill, Study Buddy, Parent Progress Reel (card stub), Tutor Prep Pack link.
- Each action emits invite with deep link; logs events.

**Deliverables**: Posting a sample summary creates correct invites.

**Acceptance Tests**

- 4 actions visible in UI; events match schemas.

---

## 15) Phase 14 — Experimentation & Guardrails

**Goal**: Variant allocation + live guardrails.

**Tasks**

- Hash‑bucket assign variants; store `exposures` on first eligible event.
- Guardrail compute in Tinybird Pipe (complaints, opt‑outs, latency to FVM, fraud %).
- Feature flags toggle loops.

**Deliverables**: Variant dashboards and guardrail time series.

**Acceptance Tests**

- Variant exposure parity within 2% on large N; guardrails render within 2 min.

---

## 16) Phase 15 — Dashboards (Tinybird‑backed)

**Goal**: Ops view for K, funnels, cohort curves, costs.

**Tasks**

- Pipes: `k_by_loop`, `funnel_open_join_fvm`, `invites_per_user`, `retention_d1_d7`, `cost_per_rewarded_fvm`.
- Admin UI `/admin/metrics` using Tinybird endpoints; CSV export.

**Deliverables**: Single page with filters (persona, subject, loop, cohort date).

**Acceptance Tests**

- K shows ≥1.20 for at least one loop in seeded data; filters instantly update.

---

## 17) Phase 16 — Compliance & Controls

**Goal**: COPPA/FERPA‑safe defaults + memo.

**Tasks**

- Redaction util (no names/emails on share cards); consent toggles; comms opt‑out with `List-Unsubscribe`.
- One‑pager memo `/docs/compliance.md` covering data flows & gating.

**Deliverables**: Memo + settings UI.

**Acceptance Tests**

- Minor accounts cannot trigger external shares; memo reviewed.

---

## 18) Phase 17 — Demo Polish & Seed Cohort

**Goal**: 3‑minute run‑through.

**Tasks**

- Seed: results, cohorts, tutor profiles; pre‑mint smart links; prepared OG cards.
- Script: results → share → join (guest window) → FVM → reward → dashboard snapshot.

**Deliverables**: Demo script + seed script; one‑take recording feasible.

**Acceptance Tests**

- All steps succeed without console errors; metrics update live.

---

## Appendix A — Redis Keys & TTLs

- `presence:subject:{id}` (SET; TTL 30s)
- `leaderboard:{subject}` (ZSET; no TTL)
- `rate:invite:{userId}:{yyyy-mm-dd}` (INCR; expire 24h)

## Appendix B — Env Template (`.env.example`)

```
DATABASE_URL=postgres://user:pass@host/db
REDIS_URL=...
TINYBIRD_TOKEN=...
TB_EVENTS_ENDPOINT=https://api.tinybird.co/v0/events?name=events_raw
SMARTLINK_HMAC_SECRET=supersecret
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
NEXT_PUBLIC_APP_URL=https://your.app
```

## Appendix C — Smoke Test Scripts

- Create smart link: `node scripts/smartlink.mjs` → outputs code; open `/sl/{code}`.
- Fire events: `curl -X POST /api/events -H 'content-type: application/json' -d '{...}'`.
- Presence: open two tabs `/cohort/alg-101` and watch counts.

---

## Definition of Done (Bootcamp)

- 4 loops fully wired; 4 agentic actions; presence + leaderboards; smart links + attribution; Tinybird dashboards (K, funnels); compliance memo; one‑take demo.
