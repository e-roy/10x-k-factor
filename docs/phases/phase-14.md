Phase 14 — Experimentation & Guardrails

**Goal**: Variant allocation + live guardrails.

**Tasks**

- Hash‑bucket assign variants; store `exposures` on first eligible event.
- Guardrail compute in Tinybird Pipe (complaints, opt‑outs, latency to FVM, fraud %).
- Feature flags toggle loops.

**Deliverables**: Variant dashboards and guardrail time series.

**Acceptance Tests**

- Variant exposure parity within 2% on large N; guardrails render within 2 min.
