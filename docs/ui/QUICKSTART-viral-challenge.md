# Quick Start: Viral Challenge System

## 🚀 Get Started in 3 Steps

### 1. Run Database Migrations

```bash
cd apps/web
pnpm drizzle-kit generate
pnpm drizzle-kit push
```

This creates:
- `referrals` table (tracks inviter → invitee)
- `guest_challenge_completions` table (temporary guest storage)
- Adds `invited_user_id` column to `challenges` table

### 2. Start Development Server

```bash
# From project root
pnpm dev
```

### 3. Test the Flow

#### As Inviter (User A):
1. Go to `/app/demos/transcript-challenge`
2. Generate a challenge or use cached transcript
3. Click "Create Challenge"
4. Complete the challenge
5. See results + "Challenge a Friend" share card
6. Click "Copy Link" → Get URL like `/challenge/abc123?sl=xyz789`

#### As Guest (User B):
1. Open the challenge link in incognito/new browser
2. See beautiful landing page with OG card
3. Click "Continue as Guest"
4. Complete the challenge
5. See results + signup CTA showing XP rewards
6. Click "Create Account"
7. Register → Auto-login → Guest data converted → XP awarded!

#### As Authenticated User:
1. Open challenge link while logged in
2. Automatically redirected to `/app?openChallenge=abc123`
3. Modal opens with challenge
4. Complete → See results
5. XP awarded immediately

## 📂 Key Files Reference

### User Flow
```
Guest clicks link
  ↓
/challenge/[id]/page.tsx (Landing + OG card)
  ↓ (guest)
/challenge/[id]/guest/page.tsx
  ↓
GuestChallengeFlow.tsx (Complete challenge)
  ↓
/api/challenges/guest/complete (Store results)
  ↓
RegisterForm.tsx (Create account)
  ↓
/api/auth/convert-guest (Award XP, create referral)
  ↓
/app (Dashboard with new XP)
```

### Share Flow
```
ChallengeModal.tsx (Results + Share Card)
  ↓
createSmartLink({ loop: "buddy_challenge", params: { challengeId } })
  ↓
/lib/smart-links/create.ts (Generate link)
  ↓
Returns: /challenge/[id]?sl=[code]
```

### Attribution Flow
```
Smart link includes ?sl=[code]
  ↓
Stored in localStorage (guest) or tracked via API (authenticated)
  ↓
Linked to guestChallengeCompletions.smartLinkCode
  ↓
Converted to referrals.smartLinkCode on signup
  ↓
Used for metrics and reward attribution
```

## 🧪 Testing Checklist

### Basic Flow ✅
- [ ] Challenge link shows OG card preview
- [ ] Guest can complete challenge
- [ ] Guest completion saves to DB
- [ ] Registration converts guest data
- [ ] Both users get XP
- [ ] Referral record created

### Edge Cases ✅
- [ ] Expired challenge shows error
- [ ] Invalid challenge ID shows 404
- [ ] Already-completed challenge can be viewed
- [ ] Guest data expires after 7 days
- [ ] Duplicate conversions prevented

### UI/UX ✅
- [ ] Landing page is beautiful and clear
- [ ] Share buttons all work (Copy, WhatsApp, Email)
- [ ] Progress indicators work in guest flow
- [ ] Results screen shows correct score
- [ ] Signup CTA is prominent and clear
- [ ] StudentSidebar refreshes after XP gain

## 🔍 Debugging

### Check Guest Completion
```sql
SELECT * FROM guest_challenge_completions 
WHERE guest_session_id = '[YOUR_SESSION_ID]' 
ORDER BY created_at DESC;
```

### Check Referrals
```sql
SELECT * FROM referrals 
WHERE inviter_id = '[USER_A_ID]' 
  OR invitee_id = '[USER_B_ID]'
ORDER BY created_at DESC;
```

### Check XP Events
```sql
SELECT * FROM xp_events 
WHERE user_id IN ('[USER_A_ID]', '[USER_B_ID]')
  AND event_type IN ('challenge.completed', 'invite.accepted')
ORDER BY created_at DESC;
```

### Check Challenge Updates
```sql
SELECT id, subject, invited_user_id, created_at 
FROM challenges 
WHERE id = '[CHALLENGE_ID]';
```

## 🎯 Expected Results

### Guest Completion
- Record in `guest_challenge_completions` with:
  - `challenge_id` = challenge ID
  - `guest_session_id` = random ID from localStorage
  - `score` = calculated percentage
  - `smart_link_code` = from URL param
  - `inviter_id` = challenge creator
  - `converted` = false

### After Registration
- `guest_challenge_completions.converted` = true
- `guest_challenge_completions.converted_user_id` = new user ID
- New record in `referrals`:
  - `inviter_id` = challenge creator
  - `invitee_id` = new user
  - `smart_link_code` = from guest completion
  - `loop` = "buddy_challenge"
  - `invitee_completed_action` = true
  - `inviter_rewarded` = true
  - `invitee_rewarded` = true
- Two new `xp_events`:
  - One for invitee (challenge.completed, 10-50 XP)
  - One for inviter (invite.accepted, 25 XP)
- `challenges.invited_user_id` = new user ID

## 🐛 Common Issues

### Issue: "Challenge not found"
**Fix:** Ensure challenge ID is valid and not expired
```typescript
// Check in DB
SELECT * FROM challenges WHERE id = '[CHALLENGE_ID]';
```

### Issue: Guest data not converting
**Fix:** Check localStorage has `guest_session_id`
```javascript
// In browser console
localStorage.getItem('guest_session_id')
```

### Issue: XP not showing
**Fix:** Verify XP events were created
```sql
SELECT * FROM xp_events WHERE user_id = '[USER_ID]' ORDER BY created_at DESC LIMIT 5;
```

### Issue: Inviter not getting XP
**Fix:** Check referral was created and marked rewarded
```sql
SELECT * FROM referrals WHERE inviter_id = '[INVITER_ID]' AND inviter_rewarded = false;
```

## 📊 Metrics Queries

### Total Referrals
```sql
SELECT COUNT(*) as total_referrals 
FROM referrals 
WHERE loop = 'buddy_challenge';
```

### Conversion Rate
```sql
SELECT 
  COUNT(*) as total_guests,
  SUM(CASE WHEN converted THEN 1 ELSE 0 END) as converted,
  ROUND(100.0 * SUM(CASE WHEN converted THEN 1 ELSE 0 END) / COUNT(*), 2) as conversion_rate
FROM guest_challenge_completions;
```

### Top Referrers
```sql
SELECT 
  inviter_id,
  COUNT(*) as referral_count,
  SUM(CASE WHEN invitee_completed_action THEN 1 ELSE 0 END) as successful_referrals
FROM referrals
WHERE loop = 'buddy_challenge'
GROUP BY inviter_id
ORDER BY successful_referrals DESC
LIMIT 10;
```

### Average Conversion Time
```sql
SELECT 
  AVG((metadata->>'conversionTimeMs')::int / 1000 / 60) as avg_minutes
FROM referrals
WHERE metadata->>'conversionTimeMs' IS NOT NULL;
```

## 🎉 Success!

If you see all of the following, the system is working:
1. ✅ Guest can access challenge link
2. ✅ Beautiful OG card appears in link preview
3. ✅ Guest can complete challenge without signing up
4. ✅ Results show with signup incentive
5. ✅ Registration converts guest data
6. ✅ Both users receive XP
7. ✅ Referral is tracked in database
8. ✅ Challenge shows `invited_user_id`
9. ✅ Sidebar auto-refreshes with new XP

**Your viral loop is live! 🚀**

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check server logs for API errors
3. Query database tables to verify data flow
4. Review the full architecture doc: `/docs/viral-challenge-flow.md`
5. Check implementation details: `/docs/ui/10-viral-challenge-implementation-complete.md`

