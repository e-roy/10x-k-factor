You’re right—the PRD wants a “feels alive” viral system, but the current app tree doesn’t yet give users a clear way to get in, pick a path, and move fluidly between results, cohorts, leaderboards, and rewards. Let’s lock a clean IA + shell and then ship it in small Cursor-friendly phases.

# Proposed app IA & shell

**Public (unauthenticated)**

* `/` — Marketing + “Continue with X” (Auth.js), minimal value prop + demo GIF + “See how sharing works”.
* `/login` — Auth wall (email + OAuth). After login, route to **FVM-first** path (see “first-run”).
* `/sl/[code]` — Smart-link resolver → stores attribution, persona/intent, and deep-links to the correct FVM or join flow (already have API route; add UI handoff).
* `/~offline` — PWA offline page (you already have this).

**App shell (authenticated) → `app/(app)/layout.tsx`**

* **Left sidebar** (sticky):

  * **Dashboard** `/app` (home feed: presence, “friends online”, your cohorts, your streaks, your next micro-deck, recent results, quick “Invite”)
  * **Cohorts** `/app/cohorts` (list) + `/app/cohorts/new` + `cohort/[id]` (room: presence, feed, mini-leaderboard, invite)
  * **Results** `/app/results` (list) + `/results/[id]` (full results page with share cards, “Challenge a friend”)
  * **Leaderboards** `/app/leaderboards/[subject]` (add page route to match your existing API route)
  * **Rewards** `/app/rewards` (balances + “claim” + `ledger` embed)
  * **Settings** `/app/settings/rewards` (existing) + profile/persona
  * **Admin** (role-gated) `/app/admin/metrics`, `/app/admin/test-data`
* **Top bar**:

  * Cohort switcher (shows current cohort context)
  * Global search / command palette (⌘K) for “Go to cohort”, “Open result”, “Create invite”, etc.
  * Presence pill (“28 peers practicing Algebra now”)
  * **Invite** CTA (primary), opens smart-link composer modal
  * User menu (profile, rewards, logout)

Why this maps to the PRD:

* Results pages as viral surfaces with share cards & challenge CTAs (your `app/api/og` + `/results/[id]`, `/app/results`)
* “Alive” layer: presence & mini-leaderboards shown on Dashboard + Cohort rooms; `/api/presence/*`, `/api/leaderboard/[subject]` already exist
* Signed smart links & attribution: `/api/sl/[code]` + `lib/smart-links/*` surfaced via Invite modal + `/sl/[code]` handoff
* Rewards: `/api/rewards/*`, `components/RewardBadge.tsx`, `components/RewardsLedger.tsx` surfaced in `/app/rewards`
* Orchestrator & Personalization agents wire into post-session and results views to trigger loops (“Buddy Challenge”, “Results Rally”, “Proud Parent”, etc.)

# First-run & repeat journeys

**A) First-run after login**

1. `/login` → Auth success → server-side redirect:

   * If **sl cookie** exists (came from a smart link): go to `/session/complete` (existing) to finalize attribution + persona gate, then deep-link:

     * If link is a **micro-deck**: `/app/fvm/skill/[deckId]` → on submit → `/results/[id]?from=invite` with share card open.
     * If link is **cohort join**: `/cohort/[id]` → see presence + “Start a 5-Q challenge with the cohort”.
   * Else (organic): show **onboarding sheet** in `/app` to pick persona (student/parent/tutor), subjects, and a cohort to join/create → autogenerate a micro-deck → `/app/fvm/skill/[deckId]` → `/results/[id]` with share open.

**B) Returning user**

* `/` or `/login` → `/app` (Dashboard) with:

  * “Resume” chip (unfinished deck), next recommended deck, latest results, your cohorts, invites sent & converting.
  * Global nav lets them pivot to Results, Leaderboards, Rewards, Cohorts quickly.

**C) Deep-link guest**

* `/sl/[code]` (no session) → attribute + stash context → `/login` → back to `/session/complete` → deep-link to FVM/room as above.

# Route map vs your current tree (diffs to add)

```diff
 app/
   (app)/
+    dashboard/page.tsx            # alias to /app → home feed (or use /app/page.tsx)
     cohorts/
       new/page.tsx
       page.tsx
+  leaderboard/                    # add visible pages that read your /api/leaderboard/*
+    page.tsx                      # subject picker → links to [subject]
+    [subject]/page.tsx
-  results/new/page.tsx            # keep if used by internal testers; otherwise hide behind Admin
   results/
     page.tsx
   settings/
     rewards/page.tsx
+  rewards/page.tsx                # balances + <RewardsLedger/>
   admin/
     metrics/page.tsx
     test-data/page.tsx
   layout.tsx
 api/
   sl/[code]/route.ts              # keep; add /session/complete handoff use
+ invites/preview/route.ts         # returns signed OG for invite previews (optional)
 badge/[id]/page.tsx
 cohort/[id]/page.tsx
 fvm/skill/[deckId]/page.tsx
 login/page.tsx
 results/[id]/page.tsx
 session/complete/page.tsx         # set cookies, read sl resolver, route to target
 ~offline/page.tsx
 layout.tsx
```

# Minimal shell & routing glue (Cursor-ready snippets)

**1) Auth guard + deep-link handoff** — `apps/web/middleware.ts`

```ts
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const AUTHED_PREFIX = "/app";
const PUBLIC_PATHS = ["/", "/login", "/sl/", "/~offline", "/api"];

export default async function middleware(req: Request) {
  const { pathname, search } = new URL(req.url);
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p))) {
    return NextResponse.next();
  }
  if (pathname.startsWith(AUTHED_PREFIX)) {
    const token = await getToken({ req: req as any });
    if (!token) {
      // preserve deep-link intent
      const url = new URL("/login", req.url);
      url.searchParams.set("next", pathname + search);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next|.*\\..*).*)"] };
```

**2) App shell with sidebar config** — `apps/web/app/(app)/layout.tsx` (sketch)

```tsx
import { ReactNode } from "react";
import Link from "next/link";
import { auth } from "@/apps/web/lib/auth"; // your helper
import { cn } from "@/apps/web/lib/utils";

const NAV = (role?: string) => [
  { href: "/app", label: "Dashboard", icon: "Home" },
  { href: "/app/cohorts", label: "Cohorts", icon: "Users" },
  { href: "/app/results", label: "Results", icon: "BarChart" },
  { href: "/app/leaderboard", label: "Leaderboards", icon: "Trophy" },
  { href: "/app/rewards", label: "Rewards", icon: "Gift" },
  { href: "/app/settings/rewards", label: "Settings", icon: "Settings" },
  ...(role === "admin" ? [{ href: "/app/admin/metrics", label: "Admin", icon: "Shield" }] : []),
];

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  return (
    <div className="grid grid-cols-[260px_1fr] min-h-screen">
      <aside className="border-r bg-background p-4">
        <Link href="/app" className="font-semibold text-lg block mb-4">K-Factor</Link>
        <nav className="space-y-1">
          {NAV(session?.user?.role).map(item => (
            <Link key={item.href} href={item.href} className={cn("flex items-center gap-2 px-2 py-1 rounded hover:bg-accent")}>
              <span className="i-lucide-{item.icon} w-4 h-4" aria-hidden />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-4">
          {/* Sticky Invite CTA */}
          <button className="w-full rounded-2xl border px-3 py-2">Invite a friend</button>
        </div>
      </aside>
      <div className="flex flex-col">
        <header className="h-14 border-b flex items-center justify-between px-4">
          {/* Cohort switcher, ⌘K, presence pill, user menu */}
          <div className="text-sm">Cohort: <strong>Algebra A</strong></div>
          <div className="flex items-center gap-3">
            <button className="text-sm">⌘K</button>
            <div className="text-xs">28 online now</div>
            {/* <UserMenu/> */}
          </div>
        </header>
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}
```

**3) Session complete handoff** — `apps/web/app/session/complete/page.tsx` (logic outline)

```tsx
// Reads ?next & any attribution cookies set by /api/sl/[code].
// If first-time user, run minimal onboarding (persona/subjects/cohort).
// Then route to `next` or default to /app/fvm/skill/[deckId] created by orchestrator.
```

**4) Leaderboard pages** — `apps/web/app/leaderboard/page.tsx` (subject index) and `[subject]/page.tsx` (reads `/api/leaderboard/[subject]`).

**5) Rewards page** — `apps/web/app/rewards/page.tsx` that embeds `<RewardBadge/>` + `<RewardsLedger/>` and calls `/api/rewards/*`.

# Small, Cursor-friendly phases (run one at a time)

**Phase N1 — Authenticated app shell + redirects**

* Create `app/(app)/layout.tsx` (sidebar + topbar as above).
* Update `middleware.ts` with auth guard & `next` param.
* Add `app/(app)/page.tsx` (Dashboard stub: presence, last result, invite CTA).
* **AC:** Unauthed → `/login`. Authed → `/app`. Sidebar renders active state. Links navigate.

**Phase N2 — First-run & deep-link handoff**

* Implement `app/session/complete/page.tsx` to read smart-link context (from `/api/sl/[code]`) and route to `/app/fvm/skill/[deckId]` or `/cohort/[id]`.
* Update `app/login/page.tsx`: on success, if `next` query → redirect, else → `/session/complete`.
* **AC:** Visiting a smart link logged-out → login → auto lands in target micro-deck or cohort.

**Phase N3 — Cohorts & presence**

* Flesh out `app/(app)/cohorts/page.tsx` (list + “New cohort” button) and `cohort/[id]/page.tsx` (presence map + feed via `components/CohortFeed` + `InviteJoinedTracker`).
* Hook `components/PresenceWidget` into Dashboard and Cohort pages using `/api/presence/stream`.
* **AC:** Can switch cohorts, see online peers, and post/test events via `/api/cohort/[id]/feed`.

**Phase N4 — Results as viral surface**

* Ensure `app/results/page.tsx` shows user’s result cards; `results/[id]/page.tsx` shows score, skills heatmap, `<ShareButton/>`, `<RewardBadge/>`, and “Challenge a friend” → uses `lib/smart-links/create`.
* Wire `/api/og/route.tsx` for share card previews (already present).
* **AC:** Completing `/app/fvm/skill/[deckId]` → redirects to `/results/[id]` with share modal open; smart link created & copied.

**Phase N5 — Leaderboards & Rewards**

* Add `app/(app)/leaderboard/page.tsx` + `[subject]/page.tsx` that consume `/api/leaderboard/[subject]`.
* Add `app/(app)/rewards/page.tsx` showing balances (`/api/rewards/balances`) + `<RewardsLedger/>` for `/api/rewards/ledger`.
* **AC:** Subject leaderboard loads and updates; rewards page shows claimable items.

**Phase N6 — Role-aware nav & Admin**

* Hide “Admin” unless `session.user.role === 'admin'`. Move `results/new` under Admin if it’s only for testing.
* Add `app/(app)/admin/metrics/page.tsx` with tiles fed by `/api/leaderboard/*`, `/api/rewards/*`, `/api/events`, `/api/cron/*`.
* **AC:** Admin can navigate to metrics; non-admins can’t access `/app/admin/*`.

**Phase N7 — Command palette & breadcrumbs**

* Add ⌘K global search across cohorts, results, subjects (client component reading lightweight `/api/*`).
* Add breadcrumb component for `/cohort/[id] → Results → [id]`.
* **AC:** Keyboard nav works; deep pages feel easy to orient.

# Notes on implementation details

* Use `(app)` segment for authenticated pages (you already do). Keep public routes outside.
* Keep each new file ≤350 LOC; extract `SidebarConfig` + `NavItem` to `apps/web/components/Nav.tsx`.
* Keep all role/persona checks via `next-auth` session helper in server components; never ship secrets to the client.
* Use your existing `lib/smart-links/*` and `api/sl/[code]` for invite creation & resolution; stash `next` target + persona in a cookie to survive login.
* Track journey events (`login_success`, `onboarding_completed`, `invite_created`, `invite_opened`, `account_created`, `fvm_reached`) to feed K-factor dashboards later.

If you want, I can turn **Phase N1** into a Cursor-ready patch (file list + code blocks) next.
