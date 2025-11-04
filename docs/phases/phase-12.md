Phase 12 — Web Push (PWA)

**Goal**: Push on Android/desktop; iOS fallback.

**Tasks**

- Generate **VAPID** keys; `web-push` backend sender.
- SW push handler in `public/sw.js`; topic subscriptions; permission UX.
- iOS Safari fallback to SMS/email prompt.

**Deliverables**: Admin can send test push to a subscribed browser.

**Acceptance Tests**

- Chrome/Edge/Android receive push; iOS shows fallback path.
