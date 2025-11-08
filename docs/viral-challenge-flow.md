# Viral Challenge Flow Architecture

## Overview

Complete viral loop implementation where users share challenges, invitees complete them as guests or signed-in users, and both parties earn rewards upon conversion.

## User Flows

### Flow 1: Share Challenge
```
User A completes challenge
  ↓
Clicks "Challenge a Friend"
  ↓
Creates smart link with challengeId
  ↓
Smart link points to /challenge/[id]
  ↓
Shares via WhatsApp/Email/Copy
```

### Flow 2A: Guest Accepts Challenge
```
User B clicks smart link
  ↓
Lands on /challenge/[id] page
  ↓
Sees OG card + prompt: "Sign in" or "Continue as Guest"
  ↓
Clicks "Continue as Guest"
  ↓
Completes challenge (modal/page)
  ↓
Sees results + "Create account to save progress & earn rewards"
  ↓
Clicks "Create Account"
  ↓
Registration flow with stored guest data
  ↓
On successful registration:
  - Guest completion → Real challenge completion
  - XP event created for new user
  - Referral record created (User A → User B)
  - User A gets referral XP/rewards
  - User B gets signup bonus
  - Challenge updated with invitedUserId = User B
```

### Flow 2B: Signed-In User Accepts Challenge
```
User B clicks smart link (already signed in)
  ↓
Lands on /challenge/[id] page
  ↓
Auto-redirects to challenge completion
  ↓
Completes challenge
  ↓
XP event created immediately
  ↓
Referral record created
  ↓
Shows results with peer comparison
```

## Database Schema

### New Tables

#### `referrals`
Tracks all viral invitations and conversions.

| Field | Type | Description |
|-------|------|-------------|
| id | varchar(36) | PK |
| inviterId | varchar(36) | User who sent invite |
| inviteeId | varchar(36) | User who accepted |
| smartLinkCode | varchar(12) | Which smart link was used |
| loop | varchar(24) | Viral loop type (buddy_challenge, etc) |
| inviteeCompletedAction | boolean | Did invitee complete the action? |
| inviterRewarded | boolean | Has inviter been rewarded? |
| inviteeRewarded | boolean | Has invitee been rewarded? |
| metadata | jsonb | Challenge ID, score, subject, etc |
| createdAt | timestamp | When referral was created |
| completedAt | timestamp | When action was completed |
| rewardedAt | timestamp | When rewards were granted |

**Indexes:** inviterId, inviteeId, loop, smartLinkCode, createdAt

#### `guest_challenge_completions`
Temporary storage for guest completions before signup.

| Field | Type | Description |
|-------|------|-------------|
| id | varchar(36) | PK |
| challengeId | varchar(36) | Which challenge |
| guestSessionId | varchar(64) | Browser fingerprint/session |
| score | integer | Challenge score (0-100) |
| answers | jsonb | Question answers |
| smartLinkCode | varchar(12) | Attribution |
| inviterId | varchar(36) | Who invited them |
| converted | boolean | Has guest signed up? |
| convertedUserId | varchar(36) | If converted, which user? |
| createdAt | timestamp | When completed |
| convertedAt | timestamp | When converted |
| expiresAt | timestamp | Auto-cleanup (7 days) |

**Indexes:** challengeId, guestSessionId, inviterId, converted, createdAt

### Updated Tables

#### `challenges`
Added `invitedUserId` field to track who was challenged.

```typescript
invitedUserId: varchar("invited_user_id", { length: 36 })
```

This enables:
- Challenge history showing "You challenged X - they scored Y%"
- Leaderboard comparisons
- Social proof ("Your friend beat your score!")

## Implementation Components

### 1. Challenge Landing Page
**File:** `/app/challenge/[id]/page.tsx`

Features:
- Beautiful OG card preview
- Auth check
- If signed in: redirect to challenge
- If guest: show modal with two buttons:
  - "Sign In" → redirect to /login?next=/challenge/[id]
  - "Continue as Guest" → start challenge flow

### 2. OG Card for Challenges
**File:** `/app/api/og/route.tsx`

New handler for `?type=challenge&challengeId=X`:
```typescript
{
  title: "Challenge from [Inviter Name]!",
  subtitle: "[Subject] - Can you beat their score?",
  visual: Challenge icon + subject badge,
  gradient: Persona-aware colors
}
```

### 3. Guest Challenge Modal/Page
**Component:** `GuestChallengeModal` or dedicated page

Features:
- Same UX as regular challenge
- No auth required
- On completion:
  - Store in `guest_challenge_completions`
  - Set guestSessionId (localStorage + fingerprint)
  - Store inviter attribution
  - Show results with signup CTA

### 4. Guest Results with Signup CTA
Shows after guest completes:
```
🎉 You scored 85%!

[Buddy avatar] "Great job! Create an account to:"
- Save your progress
- Earn XP and rewards
- See how you rank
- Challenge friends back

[Create Account] [Sign In]
```

### 5. Registration Conversion Handler
**File:** `/app/api/auth/register/route.ts` (or middleware)

On successful registration:
1. Check for guest completions (by guestSessionId)
2. For each guest completion:
   - Create real challenge completion
   - Create XP event
   - Create referral record
   - Award signup bonus
   - Award referral bonus to inviter
   - Update guest completion as converted
3. Dispatch events for UI updates

### 6. Smart Link Updates
**File:** `/lib/smart-links/create.ts`

For `buddy_challenge` loop:
- Include challengeId in params
- Link format: `/challenge/[id]?sl=[code]`
- Track clicks and conversions

## XP & Rewards Flow

### For Invitee (User B)
```typescript
// On registration after guest completion
await trackXpEvent({
  userId: newUserId,
  personaType: "student",
  eventType: "challenge.completed",
  referenceId: challengeId,
  metadata: {
    subject,
    score,
    wasGuest: true,
  },
  rawXp: Math.floor(score / 10), // Score-based XP
});

// Signup bonus
await trackXpEvent({
  userId: newUserId,
  personaType: "student",
  eventType: "signup.referred",
  metadata: { inviterId },
  rawXp: 25, // Signup bonus
});
```

### For Inviter (User A)
```typescript
// When invitee completes and signs up
await trackXpEvent({
  userId: inviterId,
  personaType: "student",
  eventType: "invite.accepted",
  referenceId: referralId,
  metadata: {
    inviteeId: newUserId,
    challengeId,
    inviteeScore: score,
  },
  rawXp: 50, // Referral reward
});
```

## Analytics & Metrics

Track on admin dashboard:
- Total referrals created
- Referral conversion rate (clicked → completed → signed up)
- Average time to conversion
- Top referrers (leaderboard)
- Most viral challenges/subjects
- Guest completion rates
- Attribution by loop type

## Security Considerations

1. **Guest Session Security**
   - Generate cryptographically secure session ID
   - Store in httpOnly cookie + localStorage
   - Expire after 7 days
   - Rate limit guest completions per IP

2. **Referral Fraud Prevention**
   - Track IP addresses
   - Prevent self-referrals (same IP, same browser fingerprint)
   - Cooldown between referral rewards
   - Admin flag suspicious patterns

3. **Data Cleanup**
   - Auto-delete unconverted guest completions after 7 days
   - Cron job to clean expired sessions

## Future Enhancements

- [ ] Peer challenge leaderboards
- [ ] "Challenge accepted" notifications
- [ ] Streak bonuses for consistent referrals
- [ ] Social proof: "5 friends have completed this challenge"
- [ ] Challenge reminders via email/push
- [ ] Multi-challenge tournaments
- [ ] Team challenges (cohort-based)

## Migration Plan

1. Run Drizzle migrations for new tables
2. Update existing challenge shares to use new landing pages
3. Test guest flow end-to-end
4. Deploy with feature flag
5. Monitor conversion rates
6. Iterate on CTAs and UX

