Phase 4 — Results Pages → Share Cards (Safe by Persona)

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
