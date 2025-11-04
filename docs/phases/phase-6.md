Phase 6 — Presence (Alive v1)

**Goal**: Real‑time presence counts per subject.

**Tasks**

1. **Ping** endpoint `POST /api/presence/ping` with `{ subject }` every 15s.
2. **SSE** stream `GET /api/presence/stream?subject=algebra` pushes count updates.
3. **Redis**: `SADD presence:subject:{id} userId` + TTL 30s; `SCARD` for counts.
4. **Hook** `usePresence(subject)` to wire UI.

**Deliverables**: Live count widget in header or results page.

**Acceptance Tests**

- Two browsers show count changes within 15s; disconnect drops after TTL.
