# Viral Challenge System - Visual Flow Diagram

## 🎯 Complete User Journey

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER A (Inviter)                              │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │  Completes Challenge    │
                    │  Score: 90%             │
                    └─────────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │  Sees Results + Share   │
                    │  Card in Modal          │
                    └─────────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │  Clicks "Copy Link"     │
                    │  or Share Button        │
                    └─────────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │  createSmartLink()      │
                    │  loop: buddy_challenge  │
                    │  params: { challengeId }│
                    └─────────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │  Link Generated:        │
                    │  /challenge/abc123      │
                    │  ?sl=xyz789             │
                    └─────────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │  Shares via WhatsApp,   │
                    │  Email, or Copy/Paste   │
                    └─────────────────────────┘
                                 │
                                 │
┌────────────────────────────────┴────────────────────────────────────┐
│                                                                      │
│                        LINK SHARED TO USER B                         │
│                                                                      │
└──────────────────────────────┬──────────────────────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                │                               │
                ▼                               ▼
    ┌───────────────────┐           ┌───────────────────┐
    │  USER B           │           │  USER B           │
    │  (Guest)          │           │  (Authenticated)  │
    └───────────────────┘           └───────────────────┘
                │                               │
                ▼                               ▼
    ┌───────────────────────┐       ┌───────────────────────┐
    │  Clicks Link          │       │  Clicks Link          │
    │  /challenge/abc123    │       │  /challenge/abc123    │
    │  ?sl=xyz789           │       │  ?sl=xyz789           │
    └───────────────────────┘       └───────────────────────┘
                │                               │
                ▼                               ▼
    ┌───────────────────────┐       ┌───────────────────────┐
    │  Landing Page         │       │  Detects Session      │
    │  (ChallengeGate)      │       │  → Redirect to        │
    │  - Beautiful UI       │       │  /app?openChallenge   │
    │  - Shows OG Card      │       └───────────────────────┘
    │  - 2 CTAs             │                   │
    └───────────────────────┘                   ▼
                │                   ┌───────────────────────┐
                ▼                   │  ChallengeModalOpener │
    ┌───────────────────────┐       │  Detects URL Param    │
    │  Clicks "Continue     │       │  Opens Modal          │
    │  as Guest"            │       └───────────────────────┘
    └───────────────────────┘                   │
                │                               ▼
                ▼                   ┌───────────────────────┐
    ┌───────────────────────┐       │  ChallengeModal       │
    │  /challenge/abc123    │       │  (Existing Flow)      │
    │  /guest               │       │  - Complete           │
    └───────────────────────┘       │  - Get XP             │
                │                   │  - See Results        │
                ▼                   └───────────────────────┘
    ┌───────────────────────┐                   │
    │  GuestChallengeFlow   │                   ▼
    │  - Generate session   │       ┌───────────────────────┐
    │  - Store attribution  │       │  ✅ DONE!             │
    │  - Show questions     │       │  Authenticated users  │
    │  - Navigate Q by Q    │       │  complete instantly   │
    └───────────────────────┘       └───────────────────────┘
                │
                ▼
    ┌───────────────────────┐
    │  Submit Answers       │
    │  POST /api/challenges │
    │  /guest/complete      │
    └───────────────────────┘
                │
                ▼
    ┌───────────────────────┐
    │  Calculate Score      │
    │  Store in:            │
    │  guest_challenge_     │
    │  completions table    │
    └───────────────────────┘
                │
                ▼
    ┌───────────────────────┐
    │  Results Screen       │
    │  - Show Score (90%)   │
    │  - "You got 9/10!"    │
    │  - Review Answers     │
    │  ┌─────────────────┐  │
    │  │  🎉 CREATE      │  │
    │  │  ACCOUNT CTA    │  │
    │  │  - Get 9 XP     │  │
    │  │  - Get 25 XP    │  │
    │  │    signup bonus │  │
    │  │  - Compete      │  │
    │  │  - Track        │  │
    │  └─────────────────┘  │
    └───────────────────────┘
                │
                ▼
    ┌───────────────────────┐
    │  Clicks "Create       │
    │  Account"             │
    └───────────────────────┘
                │
                ▼
    ┌───────────────────────┐
    │  /register            │
    │  - Fill form          │
    │  - Submit             │
    │  - Auto login         │
    └───────────────────────┘
                │
                ▼
    ┌───────────────────────┐
    │  RegisterForm.tsx     │
    │  - Detect guest       │
    │    session ID         │
    │  - Call convert API   │
    └───────────────────────┘
                │
                ▼
    ┌───────────────────────┐
    │  POST /api/auth/      │
    │  convert-guest        │
    └───────────────────────┘
                │
                ▼
    ┌───────────────────────────────────────┐
    │  Backend Processing:                   │
    │                                        │
    │  1. Fetch guest completions by         │
    │     session ID                         │
    │                                        │
    │  2. For each completion:               │
    │     ┌────────────────────────────┐    │
    │     │ Update challenges          │    │
    │     │ .invited_user_id = User B  │    │
    │     └────────────────────────────┘    │
    │                                        │
    │     ┌────────────────────────────┐    │
    │     │ Create XP Event            │    │
    │     │ - User B                   │    │
    │     │ - challenge.completed      │    │
    │     │ - 10-50 XP (based on score)│    │
    │     └────────────────────────────┘    │
    │                                        │
    │     ┌────────────────────────────┐    │
    │     │ Create Referral Record     │    │
    │     │ - inviter: User A          │    │
    │     │ - invitee: User B          │    │
    │     │ - smart_link_code          │    │
    │     │ - loop: buddy_challenge    │    │
    │     └────────────────────────────┘    │
    │                                        │
    │     ┌────────────────────────────┐    │
    │     │ Award Inviter XP           │    │
    │     │ - User A                   │    │
    │     │ - invite.accepted          │    │
    │     │ - 25 XP                    │    │
    │     └────────────────────────────┘    │
    │                                        │
    │     ┌────────────────────────────┐    │
    │     │ Mark Guest Completion      │    │
    │     │ - converted = true         │    │
    │     │ - converted_user_id = B    │    │
    │     └────────────────────────────┘    │
    │                                        │
    │  3. Return total XP earned             │
    └───────────────────────────────────────┘
                │
                ▼
    ┌───────────────────────┐
    │  Clear localStorage   │
    │  - guest_session_id   │
    │  - attribution data   │
    │  - completion context │
    └───────────────────────┘
                │
                ▼
    ┌───────────────────────┐
    │  Dispatch xpEarned    │
    │  Event                │
    └───────────────────────┘
                │
                ▼
    ┌───────────────────────┐
    │  StudentSidebar       │
    │  Auto-Refreshes       │
    │  - Shows new XP       │
    │  - Shows new level    │
    └───────────────────────┘
                │
                ▼
    ┌───────────────────────┐
    │  Redirect to /app     │
    │  ✅ COMPLETE!         │
    └───────────────────────┘
                │
                │
                ▼
┌───────────────────────────────────────────────────────────────┐
│                                                                │
│                    RESULTS FOR BOTH USERS                      │
│                                                                │
│  USER A (Inviter):                                             │
│  ✅ +25 XP (invite.accepted)                                   │
│  ✅ Referral record created                                    │
│  ✅ Can see User B in challenge history (future)               │
│                                                                │
│  USER B (Invitee):                                             │
│  ✅ +10-50 XP (challenge.completed based on score)             │
│  ✅ Account created                                            │
│  ✅ Past completion saved                                      │
│  ✅ Full access to app features                                │
│                                                                │
│  DATABASE:                                                     │
│  ✅ guest_challenge_completions.converted = true               │
│  ✅ challenges.invited_user_id = User B                        │
│  ✅ referrals record (A → B) created                           │
│  ✅ 2 xp_events created (one per user)                         │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

## 🗄️ Database State Changes

### Before Guest Completion
```
challenges:
  id: "abc123"
  user_id: "userA"
  invited_user_id: null ❌
  questions: [...]
  status: "completed"
```

### After Guest Completion
```
guest_challenge_completions:
  id: "def456"
  challenge_id: "abc123"
  guest_session_id: "guest_1234_xyz"
  score: 90
  smart_link_code: "xyz789"
  inviter_id: "userA"
  converted: false ❌
  converted_user_id: null
```

### After Registration & Conversion
```
users:
  id: "userB" ✅ NEW
  email: "userb@example.com"
  name: "User B"

challenges:
  id: "abc123"
  invited_user_id: "userB" ✅ UPDATED

guest_challenge_completions:
  id: "def456"
  converted: true ✅ UPDATED
  converted_user_id: "userB" ✅ UPDATED
  converted_at: "2025-11-08T10:30:00Z"

referrals:
  id: "ref123" ✅ NEW
  inviter_id: "userA"
  invitee_id: "userB"
  smart_link_code: "xyz789"
  loop: "buddy_challenge"
  invitee_completed_action: true
  inviter_rewarded: true
  invitee_rewarded: true
  metadata: {
    challengeId: "abc123",
    inviteeScore: 90,
    conversionTimeMs: 300000
  }

xp_events:
  # Event 1: Invitee completion
  id: "xp1" ✅ NEW
  user_id: "userB"
  persona_type: "student"
  event_type: "challenge.completed"
  reference_id: "abc123"
  raw_xp: 45 (based on 90% score)
  
  # Event 2: Inviter reward
  id: "xp2" ✅ NEW
  user_id: "userA"
  persona_type: "student"
  event_type: "invite.accepted"
  reference_id: "ref123"
  raw_xp: 25
```

## 🎯 XP Calculation

### Invitee (Challenge Completer)
```typescript
if (score === 100) {
  eventType = "challenge.perfect";
  rawXp = 50;
} else {
  eventType = "challenge.completed";
  rawXp = Math.max(10, Math.floor(score / 10));
  // Examples:
  // 90% → 45 XP
  // 80% → 40 XP
  // 50% → 25 XP
  // 20% → 10 XP (minimum)
}
```

### Inviter (Referrer)
```typescript
eventType = "invite.accepted";
rawXp = 25; // Fixed bonus for successful referral
```

## 📊 Metrics Flow

```
Smart Link Created
  ↓
Link Clicked (tracked by smart link code)
  ↓
Challenge Viewed (guest landed on page)
  ↓
Challenge Started (guest began answering)
  ↓
Challenge Completed (guest submitted)
  ↓ [CONVERSION FUNNEL STARTS]
Signup Form Viewed
  ↓
Account Created
  ↓
Guest Data Converted
  ↓
Both Users Rewarded
  ↓
[VIRAL LOOP COMPLETE] ✅
```

### Queryable Metrics

1. **Click-through Rate**: `smart_links.clicks / smart_links.created`
2. **Completion Rate**: `guest_completions / link_clicks`
3. **Conversion Rate**: `converted_guests / total_guests`
4. **Time to Convert**: `referrals.metadata.conversionTimeMs`
5. **Top Performers**: `referrals GROUP BY inviter_id`
6. **Subject Performance**: `challenges.subject` × conversion rate
7. **K-Factor**: `(successful_referrals / total_users) × conversion_rate`

## 🔄 Viral Loop Mechanics

```
1 User A completes challenge
  ↓
  Shares with 3 friends (B, C, D)
  ↓
  2 friends convert (B, C)
  ↓
  K = 2 invites sent = 2/1 = 2.0 🎉
  
  Each converted friend (B, C) can now:
  - Complete their own challenges
  - Share with their friends
  - Generate more referrals
  
  Exponential growth potential!
```

## 🎨 UI States

### Landing Page (ChallengeGate)
- Gradient background (purple → pink → orange)
- Large target icon in circle
- Challenge details cards
- Benefits list
- Two prominent CTAs

### Guest Flow (GuestChallengeFlow)
- Progress bar (questions answered / total)
- Question cards with radio buttons
- Navigation dots at bottom
- Previous/Next buttons
- Submit button (only when all answered)

### Results Screen (Guest)
- Large circular score display
- Confetti/celebration emoji
- Prominent signup CTA with XP preview
- Expandable "Review Answers" section
- Sign In alternative button

### Results Screen (Modal - Authenticated)
- Score display
- Buddy message
- Share card with 4 buttons
- Challenge history link (future)

## ✅ System is Production Ready!

All components working together to create a seamless viral loop from invitation → completion → conversion → rewards!

