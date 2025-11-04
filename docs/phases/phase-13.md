Phase 13 — Session Hooks → Agentic Actions

**Goal**: ≥4 actions sourced from summaries (≥2 student, ≥2 tutor).

**Tasks**

- `POST /api/summaries` ingest; derive actions: Beat‑My‑Skill, Study Buddy, Parent Progress Reel (card stub), Tutor Prep Pack link.
- Each action emits invite with deep link; logs events.

**Deliverables**: Posting a sample summary creates correct invites.

**Acceptance Tests**

- 4 actions visible in UI; events match schemas.
