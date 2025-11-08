# Viral Challenge Implementation Status

## ✅ Completed

### 1. Database Schema ✓
- **`referrals` table** - Tracks viral invitations with reward flags
- **`guest_challenge_completions` table** - Temporary guest storage
- **`challenges.invitedUserId`** - Track who was challenged

### 2. Challenge Landing Page ✓
- **`/app/challenge/[id]/page.tsx`** - Main entry point
  - Generates OG metadata
  - Checks auth status
  - Redirects signed-in users to app
  - Shows `ChallengeGate` for guests

### 3. Challenge Gate Component ✓
- **`/components/ChallengeGate.tsx`** - Beautiful prompt
  - "Sign In" button → redirects to login
  - "Continue as Guest" button → starts guest flow
  - Shows challenge details (subject, difficulty, question count)
  - Lists benefits of signing in

### 4. OG Card Support ✓
- **`/app/api/og/route.tsx`** - Challenge cards
  - Beautiful gradient design (pink to orange)
  - Shows subject, difficulty, question count
  - 1200x630 social share format

### 5. Guest Challenge Page ✓
- **`/app/challenge/[id]/guest/page.tsx`** - Entry for guests
  - Generates/retrieves guestSessionId
  - Loads `GuestChallengeFlow` component

## 🚧 Remaining Work

### 6. Guest Challenge Flow Component
**File:** `/components/GuestChallengeFlow.tsx`

**Needs:**
```typescript
interface GuestChallengeFlowProps {
  challengeId: string;
  guestSessionId: string;
  smartLinkCode?: string;
}

// Features:
- Fetch challenge data via API
- Display ChallengeModal-like interface
- Store answers locally
- Submit via /api/challenges/guest/complete
- Show results with signup CTA
- Link to /register with stored data
```

### 7. Guest Challenge Completion API
**File:** `/app/api/challenges/guest/complete/route.ts`

**POST Handler:**
```typescript
// Input:
{
  challengeId,
  guestSessionId,
  answers: Record<number, number>,
  smartLinkCode?,
}

// Logic:
1. Fetch challenge from DB
2. Calculate score
3. Insert into guest_challenge_completions
4. Return { score, results, guestCompletionId }
```

### 8. Registration Conversion Handler
**File:** `/app/api/auth/register/complete/route.ts` or middleware

**On Successful Registration:**
```typescript
1. Check localStorage/cookie for guestSessionId
2. Query guest_challenge_completions by guestSessionId
3. For each completion:
   - Create real challenge record
   - Create XP event (challenge.completed)
   - Create XP event (signup.referred) 
   - Create referral record
   - Award inviter XP (invite.accepted)
   - Update guest completion as converted
   - Update challenge.invitedUserId
4. Clear localStorage
5. Return success with earned XP
```

### 9. Smart Link Updates
**File:** `/lib/smart-links/create.ts`

**For buddy_challenge loop:**
```typescript
// Current: Creates link like /sl/[code]
// Change to: Create link like /challenge/[challengeId]?sl=[code]

// In params, include:
params: {
  challengeId: string,
  subject: string,
}
```

### 10. App Challenge Modal Opener
**File:** `/app/(app)/app/page.tsx` or middleware

**Handle openChallenge query param:**
```typescript
// URL: /app?openChallenge=[id]&sl=[code]
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const challengeId = params.get('openChallenge');
  const smartLinkCode = params.get('sl');
  
  if (challengeId) {
    // Open ChallengeModal
    // Track attribution if smartLinkCode
    // Create referral if first time
  }
}, []);
```

### 11. Challenge History View
**File:** `/app/(app)/app/challenges/page.tsx`

**Show user's challenge history:**
```typescript
// Query challenges where:
- userId = currentUser (challenges they created)
- invitedUserId = currentUser (challenges they accepted)

// Display:
- "You challenged [Name] - Score: X% vs Y%"
- "You were challenged by [Name] - Score: X% vs Y%"
```

### 12. Admin Metrics Dashboard
**File:** `/app/(app)/app/admin/referrals/page.tsx`

**Show metrics:**
- Total referrals
- Conversion rate (guest → signup)
- Top referrers leaderboard
- Referrals by loop type
- Average score improvements
- Time to conversion

## Database Migrations

**Run:**
```bash
pnpm drizzle:gen
pnpm drizzle:push
```

This will create:
- `referrals` table
- `guest_challenge_completions` table
- Add `invited_user_id` column to `challenges`

## Testing Flow

1. **User A completes challenge**
   - Clicks "Challenge a Friend"
   - Gets smart link: `/challenge/[id]?sl=[code]`

2. **User B (guest) clicks link**
   - Lands on `/challenge/[id]`
   - Sees beautiful OG card
   - Clicks "Continue as Guest"
   - Completes challenge
   - Sees results + "Create Account" CTA
   - Clicks "Create Account"
   - Registers
   - Gets XP for challenge + signup bonus
   - User A gets referral XP

3. **Verify:**
   - Check `guest_challenge_completions` table
   - Check `referrals` table
   - Check `xp_events` for both users
   - Check `challenges.invited_user_id`
   - Verify StudentSidebar auto-refreshes

## Next Steps

1. ✅ Run database migrations
2. ⏳ Build GuestChallengeFlow component
3. ⏳ Build guest completion API
4. ⏳ Build registration conversion handler
5. ⏳ Update smart link creation
6. ⏳ Add challenge modal opener logic
7. ⏳ Test end-to-end flow
8. ⏳ Add admin metrics

## Files Summary

**Created:**
- `/db/viral-schema.ts` (updated with new tables)
- `/db/learning-schema.ts` (updated challenges)
- `/app/challenge/[id]/page.tsx`
- `/app/challenge/[id]/guest/page.tsx`
- `/components/ChallengeGate.tsx`
- `/app/api/og/route.tsx` (updated)
- `/docs/viral-challenge-flow.md`
- `/docs/viral-challenge-implementation-status.md`

**TODO:**
- `/components/GuestChallengeFlow.tsx`
- `/app/api/challenges/guest/complete/route.ts`
- `/app/api/auth/register/complete/route.ts`
- Update `/lib/smart-links/create.ts`
- Update `/app/(app)/app/page.tsx`
- Create `/app/(app)/app/challenges/page.tsx`
- Create `/app/(app)/app/admin/referrals/page.tsx`

