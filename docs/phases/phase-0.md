Phase 0 — Project Scaffold & PWA Baseline (Expanded)

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
