Phase 3 — Smart Links & Attribution

**Goal**: Short codes with HMAC signature, expiry, UTM capture, last‑touch attribution.

**Tasks**

1. **Signer**

   - `apps/web/lib/signing.ts` HMAC SHA256 of canonical query; 7‑day expiry.

2. **Create link**

   - Server action `createSmartLink({ inviterId, loop, params })` → insert `smart_links` row.

3. **Resolver**

   - `apps/web/app/sl/[code]/route.ts`: lookup → verify `sig` and `expires_at` → set `vt_attrib` cookie (UTM + inviter + loop) → redirect to deep route.

4. **Attribution**

   - `apps/web/lib/attrib.ts` parse cookie in middleware; write `invite.opened` event.

**Deliverables**: Working `vt.to/xyz` equivalent and attribution cookie.

**Acceptance Tests**

- Invalid/expired links 302 to safe page; valid links 302 to deep route and log `invite.opened`.
