Phase 15 — Dashboards (Tinybird‑backed)

**Goal**: Ops view for K, funnels, cohort curves, costs.

**Tasks**

- Pipes: `k_by_loop`, `funnel_open_join_fvm`, `invites_per_user`, `retention_d1_d7`, `cost_per_rewarded_fvm`.
- Admin UI `/admin/metrics` using Tinybird endpoints; CSV export.

**Deliverables**: Single page with filters (persona, subject, loop, cohort date).

**Acceptance Tests**

- K shows ≥1.20 for at least one loop in seeded data; filters instantly update.
