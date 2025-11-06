Phase 7 — Leaderboards & Cohort Rooms ✅

**Goal**: Competition & social rooms.

**Tasks**

1. **Leaderboard**: Redis ZSET `leaderboard:{subject}`; increment on FVM.
2. **Cohort Room**: route `/cohort/[id]`; show presence, mini feed (joined, completed), invite CTA.
3. **Rate limits**: throttle invites/day via Redis counter `rate:invite:{user}:{date}`.

**Deliverables**: Leaderboard widget + cohort page with live members.

**Acceptance Tests**

- Completing FVM bumps rank; invite beyond cap returns 429 with friendly UI.
