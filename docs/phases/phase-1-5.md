### Phase 1.5 — Auth.js Minimal Sign‑in Flow (NextAuth + Drizzle + Neon)

**Goal:** Replace the auth stub with a real sign‑in that (a) shows a **Login** button on the landing page, (b) routes to a provider login, and (c) **redirects into the app** after success.

**Assumptions:** Using **Auth.js (NextAuth)** with **Drizzle Adapter** on **Neon Postgres**. Provider: **Google OAuth** for simplicity (swap later as needed).

**Tasks**

1. **Packages**
   - `pnpm add next-auth @auth/drizzle-adapter`

2. **Auth tables (Drizzle)**
   - Add Auth.js tables to `apps/web/db/auth-schema.ts` (users, accounts, sessions, verificationTokens). If you already have `users`, extend it to include NextAuth fields or map via adapter.
   - Export combined schema in `db/index.ts`.
   - Run `pnpm drizzle:gen && pnpm drizzle:push`.

3. **NextAuth config**
   - File: `apps/web/app/api/auth/[...nextauth]/route.ts`
   - Configure `providers: [GoogleProvider({ clientId, clientSecret })]`
   - `adapter: DrizzleAdapter(db)`; `session: { strategy: 'database' | 'jwt' }` (either is fine).
   - Add `NEXTAUTH_URL` and `NEXTAUTH_SECRET` to `.env.local`.

4. **Session helpers**
   - `apps/web/lib/auth.ts`: export `auth()`/`getServerSession()` wrapper; `signIn`, `signOut` client actions.

5. **Login UI**
   - Landing page (`apps/web/app/page.tsx`): add a **Login** button: `onClick={() => signIn('Google', { callbackUrl: '/app' })}`.
   - Create `apps/web/app/login/page.tsx` (optional) with provider buttons.

6. **Redirect after login**
   - Create **inside-app** home at `apps/web/app/(app)/page.tsx` or reuse `/results` as first screen.
   - Set `callbackUrl: '/results'` (or `/app`).

7. **Protect authed routes**
   - Add `middleware.ts` with `matcher: ['/results/:path*','/cohort/:path*','/fvm/:path*','/admin/:path*']`; redirect to `/login` if no session.
   - Alternatively, check server-side in `(app)/layout.tsx` using `getServerSession()` and redirect.

8. **Navbar state**
   - If `session`, show avatar + **Logout**; else show **Login**.

**Acceptance Criteria**

- Clicking **Login** on `/` opens the provider consent and, on success, the user is **redirected to `/results` (or `/app`)**.
- Visiting a protected route while signed out redirects to `/login`.
- `getServerSession()` returns a valid session on protected pages; `session.user.id` is available to server actions.
- Events created after sign‑in include `user_id`.

**Notes**

- Keep the **persona** (`student|parent|tutor`) on the `users` table; default to `student` and surface a selector in settings later.
- For local/dev on Windows, Google OAuth avoids SMTP setup; add others later.
