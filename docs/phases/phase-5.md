Phase 5 — FVM Micro‑Task Landing

**Goal**: Bite‑size first value (≤90s) with analytics and reward preview.

**Tasks**

1. **Route** `apps/web/app/fvm/skill/[deckId]/page.tsx`
2. **Micro‑deck** component: 5 questions, progress, timer, keyboard nav, submit.
3. **Deep‑link params**: parse `deckId`, `inviter`, `loop`.
4. **Completion**: fire `invite.fvm` + `FVM_reached`; show reward preview (not grant yet).

**Deliverables**: New user lands, completes deck, events recorded.

**Acceptance Tests**

- Median completion < 90s in test cohort; events appear in Postgres rollups `events_raw`.
