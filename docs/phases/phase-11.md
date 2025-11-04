Phase 11 — Trust & Safety (MVP)

**Goal**: Early fraud reduction.

**Tasks**

- Hash email/device; maintain `risk_score` (velocity, duplicate household, emulator heuristics).
- Enforce invite caps; minors external-share gate; school domain throttle.
- `safety.check` agent stub returning `block|cooldown|ok`.

**Deliverables**: Block/cooldown flows with clear UI.

**Acceptance Tests**

- Exceeding caps returns `429` with retry-after; minors blocked without consent.
