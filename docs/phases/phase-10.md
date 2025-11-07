Phase 10 — Incentives & Ledger (MVP) ✅

**Goal**: Rewards with budget control and anti‑abuse checks.

**Tasks**

1. **Policy**: `student: streak_shield on send; +15 AI minutes on FVM within 48h`. Parent/tutor policies defined.
2. **Grant API**: `POST /api/rewards/grant` idempotent; checks Trust & Safety; writes `rewards` + `ledger_entries`.
3. **UI**: toast and badge; ledger view in `/settings/rewards`.

**Deliverables**: Reward appears post‑FVM; cost captured.

**Acceptance Tests**

- Duplicate grant ignored; ledger row includes `unit_cost_cents`.
