Phase 8 — MCP Agents (Orchestrator + Personalization)

**Goal**: Decisioning APIs with sub‑150ms SLA.

**Tasks**

1. **Agents app**

   - `apps/agents/src/index.ts` Fastify with routes `/orchestrator/choose_loop`, `/personalize/compose`.

2. **Contracts** JSON Schema for inputs/outputs; include `rationale`, `features_used`, `ttl_ms`.
3. **Client** in web: fetch with AbortController 150ms timeout; fallback defaults on timeout.

**Deliverables**: Results page calls Orchestrator; gets loop + copy.

**Acceptance Tests**

- P95 latency < 150ms in staging; retries/backoff logged.

**Example Contract**

```json
{
  "input": {
    "event": "results_viewed",
    "persona": "student",
    "subject": "algebra",
    "cooldowns": { "buddy_challenge_hours": 24 }
  },
  "output": {
    "loop": "buddy_challenge",
    "eligibility_reason": "cooldown_ok",
    "rationale": "recent practice complete"
  }
}
```
