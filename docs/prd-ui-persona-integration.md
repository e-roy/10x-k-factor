# PRD: Persona-Based UI Integration with Agent System

## Document Overview

**Version:** 1.0  
**Author:** UI/UX Engineering Team  
**Last Updated:** November 7, 2025  
**Status:** Active Development  

**Purpose:** This PRD outlines the integration plan for persona-specific UI experiences with the existing backend agent system, focusing on creating differentiated, delightful experiences for students, parents, and tutors while maintaining the viral loop mechanics already in place.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current System Architecture](#current-system-architecture)
3. [Persona Experience Goals](#persona-experience-goals)
4. [MVP Phase: Enhanced Dashboard & Agent Buddy](#mvp-phase-enhanced-dashboard--agent-buddy)
5. [Technical Integration Points](#technical-integration-points)
6. [Component Architecture](#component-architecture)
7. [Implementation Phases](#implementation-phases)
8. [Design System Requirements](#design-system-requirements)
9. [Privacy & Safety Considerations](#privacy--safety-considerations)
10. [Success Metrics](#success-metrics)

---

## Executive Summary

### The Opportunity

The existing backend provides a robust foundation with:
- ✅ 4 viral loops implemented (buddy_challenge, results_rally, proud_parent, tutor_spotlight)
- ✅ Agent orchestration system via MCP
- ✅ Smart link generation with HMAC signatures
- ✅ Presence tracking and leaderboards
- ✅ Rewards and ledger system
- ✅ Event tracking pipeline

### The Gap

Current UI is generic across all personas:
- Same left sidebar navigation for all users
- Basic top-right user info with hardcoded presence
- No visual differentiation between student/parent/tutor experiences
- No "agent buddy" or gamified visual layer
- Limited emotional engagement and delight

### The Vision

Create three distinct yet cohesive experiences:

**Students**: Playful, gamified, emotionally rewarding with agent buddy companion  
**Parents**: Professional yet warm, progress-focused, shareable highlights  
**Tutors**: Efficient, professional, analytics-driven with viral sharing tools

---

## Current System Architecture

### Database Schema Overview

```typescript
// Key tables from apps/web/db/schema.ts
users {
  id: string (36)
  name, email, image
  persona: 'student' | 'parent' | 'tutor'  // ← Key differentiator
  role: 'admin' | null
  minor: boolean
  guardianId: string
  onboardingCompleted: boolean
}

events {
  id: bigserial
  ts: timestamp
  userId: text
  anonId: text
  loop: text  // buddy_challenge, results_rally, etc.
  name: text  // invite.sent, invite.opened, reward.granted
  props: jsonb
}

rewards {
  id, userId
  type: 'streak_shield' | 'ai_minutes' | 'badge' | 'credits'
  amount: integer
  loop: string
  status: 'pending' | 'granted' | 'denied'
}

smartLinks {
  code: string(12)
  inviterId, loop
  params: jsonb
  sig: string(128)  // HMAC signature
  expiresAt: timestamp
}
```

### Agent System Architecture

**Existing Agents** (in `packages/agents/src/`):

1. **Loop Orchestrator Agent** (`orchestrator.agent.ts`)
   - Input: event, persona, subject, cooldowns
   - Output: selected loop, eligibility_reason, rationale
   - Cooldowns: buddy_challenge (24h), results_rally (12h), proud_parent (48h), tutor_spotlight (72h)
   - API: `POST /api/orchestrator/choose_loop`

2. **Personalization Agent** (`personalize.agent.ts`)
   - Input: intent, persona, subject, loop
   - Output: personalized copy, deep_link_params, reward_preview, rationale
   - Templates per persona × loop combination
   - API: `POST /api/personalize/compose`

**Agent Communication Flow:**

```
User Action (session complete, results viewed, badge earned)
    ↓
POST /api/events (tracks event)
    ↓
Orchestrator Agent (chooses loop based on persona + cooldowns)
    ↓
Personalization Agent (generates copy + reward preview)
    ↓
UI renders CTA with agent buddy speech bubble
    ↓
User clicks → creates smart link → shares → attribution tracked
```

### Existing Viral Loops

1. **buddy_challenge** (Student focus)
   - Triggered after session_complete or results_viewed
   - 24h cooldown
   - Reward: streak_shield when friend completes

2. **results_rally** (All personas)
   - Triggered after results_viewed or badge_earned
   - 12h cooldown
   - Reward: 10 ai_minutes when someone joins

3. **proud_parent** (Parent focus)
   - Triggered after results_viewed
   - 48h cooldown
   - Reward: special parent badge

4. **tutor_spotlight** (Tutor focus)
   - Triggered after session_complete or results_viewed
   - 72h cooldown
   - Reward: 50 credits per referral

### Current Layout Structure

```
apps/web/app/(app)/layout.tsx
├── Sidebar (260px fixed)
│   ├── Logo/Brand
│   ├── SidebarNav (shared across personas)
│   │   └── Dashboard, Cohorts, Results, Leaderboard, Rewards, Settings
│   └── InviteButton (bottom)
├── Header (14px height)
│   ├── CohortSwitcher
│   ├── Command Palette trigger
│   ├── PresencePill
│   └── UserMenu
└── Main Content Area
    └── {children}
```

---

## Persona Experience Goals

### Student Experience: Playful & Emotionally Rewarding

**Core Principles:**
- Learning should feel like play, not work
- Social connection reduces anxiety and increases motivation
- Visual progress creates dopamine loops
- Agent buddy provides companionship and guidance

**Key Features:**
- **Agent Buddy**: Persistent companion (below top-right profile) with speech bubbles
- **Dashboard**: Multi-layered radial progress widgets showing subject mastery
- **Gamification**: XP bars, streaks with fire animations, level-up celebrations
- **Social Presence**: "28 students studying Algebra right now"
- **Challenge System**: Modal-based flashcard challenges with invite CTAs
- **Visual Delight**: Colorful gradients, smooth animations, playful illustrations

**Example User Flow:**
1. Login → agent buddy greets: "Hey! Ready to crush some Algebra? 🎯"
2. Dashboard shows radial progress for each subject with glowing edges
3. Speech bubble appears: "3 friends are online! Want to challenge Emma to beat your score?"
4. Click → tall rounded modal with challenge preview + share options
5. After sharing → XP animation +50 XP, progress bar fills

### Parent Experience: Professional Yet Warm

**Core Principles:**
- Quick check-ins should show meaningful progress
- Pride in child's achievements drives engagement
- Privacy-safe sharing builds trust
- Clear communication reduces anxiety

**Key Features:**
- **Progress Overview**: Clean cards showing child's recent sessions and scores
- **Proud Parent Moments**: Curated highlight reels (20-30s) auto-generated
- **Guardian Dashboard**: Multiple children supported, toggle between profiles
- **Safe Sharing**: Privacy controls built-in, no PII in share cards
- **Professional Tone**: Less gamified, more data-driven but warm

**Example User Flow:**
1. Login → see overview of all children's progress this week
2. Notification badge: "Sarah completed 3 sessions this week! 🎉"
3. Click → see detailed progress with skills practiced
4. CTA: "Share Sarah's amazing progress" → generates privacy-safe reel
5. One-tap share to WhatsApp with referral link for other parents

### Tutor Experience: Efficient & Analytics-Driven

**Core Principles:**
- Time is precious, show most important info first
- Student success is tutor success
- Professional sharing builds reputation
- Viral sharing should feel authentic, not salesy

**Key Features:**
- **Tutor Dashboard**: Student roster, upcoming sessions, recent results
- **Spotlight Cards**: Auto-generated teaching highlights with anonymized results
- **Referral Tracking**: Clear metrics on invites sent, conversions, rewards earned
- **Professional Tools**: Session prep packs, challenge creation, cohort management
- **Clean Design**: Minimal distractions, data-rich tables and charts

**Example User Flow:**
1. Login → see today's session schedule + pending student challenges
2. After session → agent suggests: "Great session! Want to share a prep pack?"
3. Click → generates professional spotlight card with key teaching moments
4. Share options: Email to parents, post to social, send to tutor network
5. Track conversions: "3 parents viewed, 1 booked trial session"

---

## MVP Phase: Enhanced Dashboard & Agent Buddy

### Scope (Phase 1)

**DO in Phase 1:**
✅ Keep existing left sidebar navigation (no per-persona nav changes)  
✅ Greatly enhance top-right profile area with persona-specific styling  
✅ Add agent buddy component (below profile, unpersonalized image/gif)  
✅ Redesign content area for each persona's dashboard  
✅ Implement modal system for CTAs (tall, rounded, colorful drop-shadows, blur background)  
✅ Add speech bubble system with interactive links  
✅ Student: radial progress widgets + agentic CTAs  
✅ Parent: clean progress overview + proud parent share  
✅ Tutor: session schedule + spotlight card creation  

**DON'T in Phase 1:**
❌ Personalized agent buddy (gardens, spaceships, RPG items - Phase 2)  
❌ Idle game / agent buddy exploration map (Phase 3+)  
❌ Radical layout changes per persona (Phase 2+)  
❌ Email/push notification system (Phase 2)  
❌ Video reel generation (Phase 2)  
❌ Advanced A/B testing UI (Phase 2)  

### Component Hierarchy (MVP)

```
Enhanced Layout
├── Sidebar (unchanged)
│   └── SidebarNav (same for all personas)
├── Header (enhanced)
│   ├── CohortSwitcher (if applicable)
│   ├── PresencePill (persona-styled)
│   └── UserProfileArea (new!)
│       ├── UserMenu (enhanced with persona flair)
│       └── AgentBuddy (new!)
│           └── SpeechBubble (interactive CTAs)
└── Main Content
    ├── StudentDashboard (if persona === 'student')
    │   ├── RadialProgressWidget[]
    │   ├── AgenticCTACard[]
    │   └── QuickActions (streaks, challenges, study buddies)
    ├── ParentDashboard (if persona === 'parent')
    │   ├── ChildProgressOverview
    │   ├── ProudParentMoments
    │   └── SafeShareControls
    └── TutorDashboard (if persona === 'tutor')
        ├── SessionSchedule
        ├── StudentRoster
        └── SpotlightCardCreator

Modal System (overlay)
├── ChallengeModal (tall, rounded, colorful)
│   ├── Challenge preview
│   ├── Invite friends section
│   └── Start challenge button
├── ShareModal (share cards, smart links)
└── ProudParentModal (progress highlights)
```

---

## Technical Integration Points

### 1. Event Tracking → Agent Triggers

**Current Flow:**
```typescript
// Client-side tracking (apps/web/lib/track.ts)
track("results.viewed", { 
  subject: "Algebra", 
  score: 85,
  loop: "buddy_challenge" // optional
});
  ↓
POST /api/events { name: "results.viewed", payload: {...} }
  ↓
Events table insert
```

**New UI Integration:**
```typescript
// After user views their results page
await track("results.viewed", { 
  subject, 
  score, 
  resultId 
});

// Then fetch orchestrator decision
const response = await fetch("/api/orchestrator/choose_loop", {
  method: "POST",
  body: JSON.stringify({
    event: "results_viewed",
    persona: session.user.persona,
    subject: subject,
    cooldowns: await fetchUserCooldowns(userId)
  })
});

const { loop, rationale } = await response.json();
// loop = "buddy_challenge" or "results_rally"

// Then personalize the CTA
const personalizedResponse = await fetch("/api/personalize/compose", {
  method: "POST",
  body: JSON.stringify({
    intent: "challenge_friend",
    persona: session.user.persona,
    subject: subject,
    loop: loop
  })
});

const { copy, reward_preview } = await personalizedResponse.json();
// copy = "I just completed an Algebra session! Challenge me? 🎯"
// reward_preview = { type: "streak_shield", amount: 1, description: "..." }

// Render speech bubble with copy + reward preview
setAgentBuddySpeechBubble({ copy, reward_preview, action: "create_challenge" });
```

### 2. Smart Link Generation

**Current System:**
```typescript
// apps/web/lib/smart-links/create.ts
const { code, url } = await createSmartLink({
  inviterId: userId,
  loop: "buddy_challenge",
  params: { 
    subject: "Algebra",
    resultId: "abc123",
    challengeType: "beat_my_score"
  }
});
// Returns: { code: "a1b2c3d4e5f6", url: "https://app.com/sl/a1b2c3d4e5f6" }
```

**UI Integration:**
```typescript
// When user clicks "Challenge Friend" CTA in speech bubble
async function handleCreateChallenge() {
  // 1. Create smart link
  const { code, url } = await createSmartLink({
    inviterId: session.user.id,
    loop: loop, // from orchestrator
    params: {
      subject,
      resultId,
      challengeType: "beat_my_score"
    }
  });

  // 2. Show modal with share options
  openModal("ChallengeModal", {
    shareUrl: url,
    copy: personalizedCopy,
    rewardPreview: reward_preview,
    shareTargets: ["whatsapp", "copy", "email"]
  });

  // 3. Track invite.sent event
  await track("invite.sent", {
    loop,
    smartLinkCode: code,
    channel: "in_app"
  });
}
```

### 3. Attribution & Tracking

**Smart Link Resolution:**
```typescript
// apps/web/app/sl/[code]/route.ts
// When new user clicks smart link → GET /sl/{code}
// 1. Validates signature
// 2. Checks expiry
// 3. Sets attribution cookie
// 4. Redirects to FVM (First Value Moment)

// Example FVM: /fvm/skill/deck-1?inviter={id}&loop=buddy_challenge
```

**UI Tracking on FVM:**
```typescript
// In FVM component (e.g., /fvm/skill/[deckId]/page.tsx)
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const inviterId = params.get("inviter");
  const loop = params.get("loop");
  
  if (inviterId && loop) {
    // Track that invited user reached FVM
    track("invite.fvm", { inviterId, loop });
  }
}, []);

// After completing challenge
async function handleChallengeComplete(score: number) {
  await track("invite.joined", { 
    inviterId, 
    loop, 
    score,
    challengeCompleted: true 
  });
  
  // Show reward notification to BOTH users
  // (backend handles reward grant via /api/rewards/grant)
}
```

### 4. Presence Integration

**Current System:**
```typescript
// apps/web/lib/presence.ts + /api/presence/ping + /api/presence/stream
// SSE (Server-Sent Events) for real-time presence
```

**UI Integration in Agent Buddy:**
```typescript
// usePresence hook (apps/web/hooks/usePresence.ts)
const { count, users } = usePresence(subject);
// count = 28, users = [{id, name, status}]

// In Agent Buddy speech bubble
if (count > 5) {
  setSpeechBubble({
    copy: `${count} students are practicing ${subject} right now! Want to join a study session?`,
    action: "join_cohort",
    actionUrl: `/app/cohorts?subject=${subject}`
  });
}
```

### 5. Rewards System Integration

**Backend Flow:**
```typescript
// When friend completes challenge → POST /api/rewards/grant
{
  userId: inviterId,
  type: "streak_shield",
  amount: 1,
  loop: "buddy_challenge",
  dedupeKey: `${inviterId}-buddy_challenge-${challengeId}`
}
```

**UI Integration:**
```typescript
// Poll or SSE for reward notifications
const { rewards } = useRealtimeRewards(userId);

// When new reward arrives
useEffect(() => {
  if (rewards.length > 0) {
    const latestReward = rewards[0];
    
    // Show celebration animation
    showRewardCelebration({
      type: latestReward.type,
      amount: latestReward.amount,
      reason: `${friendName} completed your challenge!`
    });
    
    // Update agent buddy
    setAgentBuddySpeechBubble({
      copy: `Awesome! You earned a streak shield because Emma completed your challenge! 🛡️`,
      celebrationEmoji: "🎉"
    });
  }
}, [rewards]);
```

---

## Component Architecture

### New Components to Build

#### 1. `AgentBuddy.tsx`

**Location:** `apps/web/components/AgentBuddy.tsx`

**Props:**
```typescript
interface AgentBuddyProps {
  userId: string;
  persona: "student" | "parent" | "tutor";
  currentPage?: string; // for context-aware messages
}
```

**Features:**
- Persistent position below top-right profile
- Animated GIF or image (unpersonalized in MVP)
- Speech bubble system with queue
- Interactive links in speech bubbles
- Context-aware messages based on:
  - Recent events (just completed session, earned badge, etc.)
  - Agent orchestrator decisions
  - Time of day / streak status
  - Presence data

**State Management:**
```typescript
interface SpeechBubble {
  id: string;
  copy: string;
  action?: {
    type: "navigate" | "modal" | "external";
    target: string;
    label: string;
  };
  priority: "high" | "normal" | "low";
  expiresAt?: Date;
  celebrationEmoji?: string;
  rewardPreview?: RewardPreview;
}

const [speechBubbles, setSpeechBubbles] = useState<SpeechBubble[]>([]);
const [currentBubble, setCurrentBubble] = useState<SpeechBubble | null>(null);
```

**Integration Points:**
- Listen to agent orchestrator responses
- Poll for pending rewards
- Subscribe to presence updates
- Track user interactions with speech bubble CTAs

#### 2. `EnhancedUserProfileArea.tsx`

**Location:** `apps/web/components/app-layout/EnhancedUserProfileArea.tsx`

**Features:**
- Persona-specific styling (colors, icons, layout)
- XP bar for students (animated progress)
- Reward badge counter for all personas
- Dropdown menu with persona-specific quick actions
- Integration with AgentBuddy component

**Persona Variants:**

```typescript
const PERSONA_STYLES = {
  student: {
    bgGradient: "from-purple-500/10 to-pink-500/10",
    textColor: "text-purple-700",
    iconColor: "text-purple-500",
    badgeStyle: "playful" // rounded, colorful
  },
  parent: {
    bgGradient: "from-blue-500/10 to-cyan-500/10",
    textColor: "text-blue-700",
    iconColor: "text-blue-500",
    badgeStyle: "professional" // subtle, clean
  },
  tutor: {
    bgGradient: "from-green-500/10 to-emerald-500/10",
    textColor: "text-green-700",
    iconColor: "text-green-500",
    badgeStyle: "professional"
  }
};
```

#### 3. `RadialProgressWidget.tsx`

**Location:** `apps/web/components/RadialProgressWidget.tsx`

**Props:**
```typescript
interface RadialProgressWidgetProps {
  subject: string;
  progress: number; // 0-100
  level: number;
  xp: number;
  xpToNextLevel: number;
  recentActivity?: {
    date: Date;
    score: number;
    topic: string;
  }[];
  onClick?: () => void;
}
```

**Visual Design:**
- Multi-layered concentric circles
- Outer ring: overall subject progress (0-100%)
- Inner ring: XP progress to next level
- Center: subject icon + current level
- Glow effect when hovering
- Subtle animation on mount and updates

**Implementation:**
- Use SVG for circles (smooth animations)
- Canvas for complex effects (optional)
- Framer Motion for entrance animations

#### 4. `TallModal.tsx` (Modal System)

**Location:** `apps/web/components/TallModal.tsx`

**Features:**
- Tall, rounded container (max-height: 85vh)
- Colorful drop-shadows (persona-specific)
- Backdrop blur effect
- Smooth enter/exit animations
- Scrollable content area
- Sticky header and footer
- Keyboard navigation (ESC to close)

**Variants:**
```typescript
interface TallModalProps {
  open: boolean;
  onClose: () => void;
  variant: "student" | "parent" | "tutor" | "neutral";
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

const MODAL_VARIANTS = {
  student: {
    shadowColor: "shadow-purple-500/50",
    borderGradient: "from-purple-500 to-pink-500",
    blurAmount: "backdrop-blur-md"
  },
  parent: {
    shadowColor: "shadow-blue-500/50",
    borderGradient: "from-blue-500 to-cyan-500",
    blurAmount: "backdrop-blur-sm"
  },
  tutor: {
    shadowColor: "shadow-green-500/50",
    borderGradient: "from-green-500 to-emerald-500",
    blurAmount: "backdrop-blur-sm"
  }
};
```

#### 5. `ChallengeModal.tsx`

**Location:** `apps/web/components/ChallengeModal.tsx`

**Features:**
- Preview of challenge (subject, difficulty, questions count)
- Friend invite section with avatar placeholders
- Share options (WhatsApp, copy link, email)
- Reward preview ("You'll earn X if friend completes!")
- Start challenge button (if playing solo)
- Recent attempts / leaderboard preview

**Integration:**
```typescript
interface ChallengeModalProps {
  open: boolean;
  onClose: () => void;
  challenge: {
    id: string;
    subject: string;
    difficulty: "easy" | "medium" | "hard";
    questionCount: number;
    estimatedTime: number; // minutes
  };
  shareUrl: string;
  personalizedCopy: string;
  rewardPreview: RewardPreview;
}
```

#### 6. `ProudParentModal.tsx`

**Location:** `apps/web/components/ProudParentModal.tsx`

**Features:**
- Privacy-safe progress highlights
- Preview of what will be shared (no PII)
- Customizable message
- Share options with one-tap WhatsApp
- Attribution link embedded in share
- Toggle to include/exclude specific metrics

**Safety Features:**
```typescript
interface ProudParentModalProps {
  childName: string; // Only first name or "my child"
  highlights: {
    sessionsCompleted: number;
    subjectsImproved: string[];
    averageScore: number;
    streakDays: number;
  };
  privacySettings: {
    showName: boolean;
    showScores: boolean;
    showSubjects: boolean;
  };
  onShare: (settings: PrivacySettings) => Promise<ShareResult>;
}
```

### Persona-Specific Dashboard Components

#### Student Dashboard

**Components:**
- `StudentDashboard.tsx` (main container)
- `RadialProgressWidget.tsx` × subjects
- `StreakCard.tsx` (with fire animation)
- `AgenticCTACard.tsx` (agent-suggested actions)
- `QuickChallengeList.tsx` (pending/recent challenges)
- `StudyBuddyWidget.tsx` (friends online)

**Layout:**
```tsx
<div className="grid gap-6">
  {/* Hero Section: Progress Overview */}
  <section className="grid grid-cols-3 gap-4">
    {subjects.map(s => <RadialProgressWidget key={s.id} {...s} />)}
  </section>

  {/* Agentic CTAs */}
  <section>
    <h2>Suggested for You</h2>
    <AgenticCTACard loop={currentLoop} copy={personalizedCopy} />
  </section>

  {/* Quick Actions */}
  <section className="grid grid-cols-3 gap-4">
    <StreakCard streak={streak} />
    <StudyBuddyWidget friends={onlineFriends} />
    <QuickChallengeList challenges={challenges} />
  </section>
</div>
```

#### Parent Dashboard

**Components:**
- `ParentDashboard.tsx`
- `ChildSelector.tsx` (if multiple children)
- `ProgressOverviewCard.tsx`
- `SessionHistoryTimeline.tsx`
- `ProudParentMomentsCarousel.tsx`
- `SafeShareControls.tsx`

**Layout:**
```tsx
<div className="space-y-6">
  {/* Child Selector */}
  {children.length > 1 && <ChildSelector />}

  {/* Weekly Overview */}
  <ProgressOverviewCard child={selectedChild} />

  {/* Recent Sessions Timeline */}
  <SessionHistoryTimeline sessions={recentSessions} />

  {/* Proud Parent Moments */}
  <ProudParentMomentsCarousel highlights={highlights} />

  {/* Share CTA */}
  <SafeShareControls onShare={handleShare} />
</div>
```

#### Tutor Dashboard

**Components:**
- `TutorDashboard.tsx`
- `UpcomingSessionsCard.tsx`
- `StudentRosterTable.tsx`
- `SpotlightCardCreator.tsx`
- `ReferralMetricsCard.tsx`
- `PrepPackGenerator.tsx`

**Layout:**
```tsx
<div className="grid grid-cols-[2fr_1fr] gap-6">
  {/* Main Column */}
  <div className="space-y-6">
    <UpcomingSessionsCard sessions={upcomingSessions} />
    <StudentRosterTable students={students} />
  </div>

  {/* Sidebar */}
  <div className="space-y-6">
    <ReferralMetricsCard metrics={metrics} />
    <SpotlightCardCreator />
    <PrepPackGenerator />
  </div>
</div>
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)

**Goal:** Replace generic dashboard with persona-aware components

**Tasks:**
1. ✅ Create persona utility functions (styling, copy, behavior)
2. ✅ Build `EnhancedUserProfileArea.tsx` with persona variants
3. ✅ Build `AgentBuddy.tsx` component (static GIF + speech bubble system)
4. ✅ Build `TallModal.tsx` base component
5. ✅ Create student-specific components:
   - `RadialProgressWidget.tsx`
   - `StreakCard.tsx`
   - `AgenticCTACard.tsx`
6. ✅ Update `apps/web/app/(app)/app/page.tsx` to conditionally render persona dashboards
7. ✅ Wire up orchestrator API calls on key events (results viewed, session complete)
8. ✅ Wire up personalization API calls for CTA copy

**Acceptance Criteria:**
- [ ] Three distinct dashboard layouts render based on user.persona
- [ ] Agent buddy appears in top-right with speech bubbles
- [ ] Speech bubbles contain personalized copy from agent
- [ ] Clicking speech bubble CTAs opens TallModal
- [ ] Student dashboard shows radial progress widgets
- [ ] All personas see persona-specific styling (colors, icons, tone)

### Phase 2: Viral Loops Integration (Week 3-4)

**Goal:** Connect UI to existing viral loop backend

**Tasks:**
1. ✅ Build `ChallengeModal.tsx` (buddy_challenge + results_rally)
2. ✅ Build `ProudParentModal.tsx` (proud_parent loop)
3. ✅ Build `TutorSpotlightModal.tsx` (tutor_spotlight loop)
4. ✅ Integrate smart link generation in modals
5. ✅ Add share options (WhatsApp, copy, email) with tracking
6. ✅ Wire up attribution tracking (invite.sent → invite.opened → invite.joined)
7. ✅ Build reward notification system
8. ✅ Add celebration animations when rewards are granted
9. ✅ Implement cooldown UI (show when loop is in cooldown)
10. ✅ Add presence integration in agent buddy speech bubbles

**Acceptance Criteria:**
- [ ] Users can create challenges via agent buddy → modal → share
- [ ] Smart links are generated and tracked end-to-end
- [ ] Parents can generate proud parent shares with privacy controls
- [ ] Tutors can create spotlight cards and track referrals
- [ ] Reward notifications appear in real-time
- [ ] Agent buddy updates when friend completes challenge
- [ ] Cooldown periods are respected and communicated clearly

### Phase 3: Polish & Delight (Week 5-6)

**Goal:** Add animations, micro-interactions, and emotional hooks

**Tasks:**
1. ✅ Add entrance animations to all dashboard components
2. ✅ Implement smooth transitions between persona dashboards
3. ✅ Add confetti/celebration effects for rewards
4. ✅ Improve agent buddy animations (blinking, bounce, reactions)
5. ✅ Add sound effects (optional, muted by default)
6. ✅ Implement skeleton loaders for async data
7. ✅ Add empty states with encouraging copy
8. ✅ Improve mobile responsiveness
9. ✅ Add dark mode support (respect system preference)
10. ✅ Performance optimization (lazy loading, code splitting)

**Acceptance Criteria:**
- [ ] All animations are smooth (60fps)
- [ ] Loading states are pleasant, not jarring
- [ ] Empty states guide users to next action
- [ ] Mobile experience is delightful
- [ ] Dark mode looks cohesive
- [ ] Page load time < 2s on average connection

### Phase 4: Advanced Features (Week 7-8+)

**Goal:** Future enhancements (not in MVP)

**Tasks:**
- Personalized agent buddy (gardens, spaceships, RPG themes)
- Idle game layer with agent buddy exploration
- Email/push notification system
- Video reel generation for parents
- Advanced A/B testing UI
- Per-persona navigation menus
- Cohort-specific experiences
- Advanced analytics dashboards

---

## Design System Requirements

### Color Palette (Persona-Specific)

```scss
// Student: Playful, energetic
$student-primary: #8B5CF6; // purple-500
$student-secondary: #EC4899; // pink-500
$student-accent: #F59E0B; // amber-500
$student-gradient: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);

// Parent: Professional, trustworthy
$parent-primary: #3B82F6; // blue-500
$parent-secondary: #06B6D4; // cyan-500
$parent-accent: #10B981; // green-500
$parent-gradient: linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%);

// Tutor: Efficient, growth-focused
$tutor-primary: #10B981; // green-500
$tutor-secondary: #059669; // green-600
$tutor-accent: #6366F1; // indigo-500
$tutor-gradient: linear-gradient(135deg, #10B981 0%, #059669 100%);
```

### Typography

```scss
// Student: Rounded, friendly
$student-font-family: 'Nunito', 'Inter', sans-serif;
$student-heading-weight: 700;

// Parent: Clean, readable
$parent-font-family: 'Inter', sans-serif;
$parent-heading-weight: 600;

// Tutor: Professional, efficient
$tutor-font-family: 'Inter', sans-serif;
$tutor-heading-weight: 600;
```

### Component Variants

```typescript
// Button variants per persona
interface ButtonProps {
  variant: "primary" | "secondary" | "outline" | "ghost";
  persona?: "student" | "parent" | "tutor";
  size?: "sm" | "md" | "lg";
}

// Student buttons: Rounded, playful
// Parent buttons: Subtle, professional
// Tutor buttons: Clean, efficient
```

### Animation Guidelines

```typescript
const ANIMATION_DURATIONS = {
  fast: 150, // micro-interactions
  normal: 300, // default
  slow: 500, // page transitions
  celebration: 1500, // rewards, achievements
};

const ANIMATION_EASINGS = {
  smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
  bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  spring: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
};
```

---

## Privacy & Safety Considerations

### Data Minimization

**Share Cards (OG Images):**
- ✅ NO student names (only first name or "my child")
- ✅ NO school names or identifiable locations
- ✅ NO exact scores (only ranges like "80-90%")
- ✅ NO timestamps more specific than "this week"
- ✅ NO profile photos without explicit consent

**Smart Links:**
- ✅ Signed with HMAC to prevent tampering
- ✅ 7-day expiry by default
- ✅ Rate limited (configurable per user)
- ✅ No PII in URL parameters

### COPPA/FERPA Compliance

**Minor Detection:**
```typescript
if (user.minor && !user.guardianId) {
  // Block external sharing
  // Only allow guardian to manage shares
  showWarning("Parent permission required for sharing");
}
```

**Guardian Consent:**
```typescript
if (user.minor && isExternalShare) {
  // Require guardian approval
  const consent = await requestGuardianConsent({
    childId: user.id,
    guardianId: user.guardianId,
    shareType: "proud_parent",
    content: sanitizedHighlights
  });
  
  if (!consent.approved) {
    throw new Error("Guardian consent required");
  }
}
```

### Trust & Safety

**Rate Limiting:**
- Students: 10 invites/day
- Parents: 5 invites/day  
- Tutors: 20 invites/day
- Admins: unlimited

**Abuse Prevention:**
```typescript
// Backend validation (apps/web/lib/safety.ts)
- Duplicate device detection
- Email verification required
- Report/flag system for inappropriate shares
- Automatic cooldowns on suspicious activity
```

---

## Success Metrics

### Primary KPIs (MVP)

**Engagement:**
- [ ] Time spent on dashboard (target: +40% vs baseline)
- [ ] Daily active users per persona (track separately)
- [ ] Speech bubble interaction rate (target: >15%)
- [ ] Modal open rate (target: >20% of speech bubble clicks)

**Viral Loops:**
- [ ] Invite.sent per user (target: ≥0.5/day for students)
- [ ] Invite.opened rate (target: ≥30%)
- [ ] Invite.joined rate (target: ≥10%)
- [ ] K-factor = invites/user × conversion rate (target: ≥1.20)

**Persona-Specific:**
- **Students**: Challenge completion rate, streak retention
- **Parents**: Share rate, re-engagement after 7+ days
- **Tutors**: Referral conversion rate, spotlight card shares

### Secondary Metrics

**Delight:**
- Net Promoter Score (NPS) per persona
- "Helpful" rating on agent buddy suggestions
- Feature adoption rate (radial widgets, challenges, etc.)

**Technical:**
- Page load time (target: <2s)
- Error rate (target: <0.5%)
- API latency: orchestrator (target: <150ms), personalization (target: <200ms)

### Analytics Events to Track

```typescript
// Agent interactions
track("agent_buddy.speech_bubble_shown", { loop, copy });
track("agent_buddy.speech_bubble_clicked", { loop, action });
track("agent_buddy.speech_bubble_dismissed", { loop });

// Modal interactions
track("modal.opened", { type: "challenge" | "proud_parent" | "spotlight" });
track("modal.share_clicked", { channel: "whatsapp" | "copy" | "email" });
track("modal.share_completed", { channel, success: boolean });

// Dashboard interactions
track("dashboard.widget_clicked", { widget: "radial_progress" | "streak" | "cta" });
track("dashboard.persona_rendered", { persona, loadTime });

// Viral loop completions
track("loop.triggered", { loop, eligibility_reason });
track("loop.completed", { loop, rewardType, rewardAmount });
track("loop.cooldown_active", { loop, remainingHours });
```

---

## Appendix: Code Examples

### Example: Agent Buddy Hook

```typescript
// apps/web/hooks/useAgentBuddy.ts
import { useEffect, useState } from "react";
import type { OrchestratorOutput, PersonalizeOutput } from "@10x-k-factor/agents";

interface SpeechBubble {
  id: string;
  copy: string;
  action?: {
    type: "navigate" | "modal";
    target: string;
    label: string;
  };
  rewardPreview?: RewardPreview;
}

export function useAgentBuddy(
  userId: string,
  persona: "student" | "parent" | "tutor",
  currentContext?: {
    page: string;
    subject?: string;
    recentEvent?: string;
  }
) {
  const [speechBubbles, setSpeechBubbles] = useState<SpeechBubble[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch agent decision when context changes
  useEffect(() => {
    if (!currentContext?.recentEvent) return;

    const fetchAgentDecision = async () => {
      setIsLoading(true);
      try {
        // 1. Ask orchestrator which loop to trigger
        const orchResponse = await fetch("/api/orchestrator/choose_loop", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: currentContext.recentEvent,
            persona,
            subject: currentContext.subject,
            cooldowns: {}, // TODO: fetch from user state
          }),
        });
        const orchData: OrchestratorOutput = await orchResponse.json();

        // 2. Get personalized copy
        const persResponse = await fetch("/api/personalize/compose", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            intent: "share_invite",
            persona,
            subject: currentContext.subject,
            loop: orchData.loop,
          }),
        });
        const persData: PersonalizeOutput = await persResponse.json();

        // 3. Create speech bubble
        const newBubble: SpeechBubble = {
          id: `bubble-${Date.now()}`,
          copy: persData.copy,
          action: {
            type: "modal",
            target: "ChallengeModal",
            label: "Create Challenge",
          },
          rewardPreview: persData.reward_preview,
        };

        setSpeechBubbles((prev) => [newBubble, ...prev]);
      } catch (error) {
        console.error("[useAgentBuddy] Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgentDecision();
  }, [currentContext?.recentEvent, persona, userId]);

  const dismissBubble = (id: string) => {
    setSpeechBubbles((prev) => prev.filter((b) => b.id !== id));
  };

  return {
    currentBubble: speechBubbles[0] || null,
    bubbleQueue: speechBubbles,
    isLoading,
    dismissBubble,
  };
}
```

### Example: Persona-Aware Dashboard Wrapper

```typescript
// apps/web/app/(app)/app/page.tsx (updated)
import { auth } from "@/lib/auth";
import { StudentDashboard } from "@/components/dashboards/StudentDashboard";
import { ParentDashboard } from "@/components/dashboards/ParentDashboard";
import { TutorDashboard } from "@/components/dashboards/TutorDashboard";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const persona = session.user.persona || "student";

  // Fetch persona-specific data
  const dashboardData = await fetchDashboardData(session.user.id, persona);

  // Render persona-specific dashboard
  switch (persona) {
    case "student":
      return <StudentDashboard user={session.user} data={dashboardData} />;
    case "parent":
      return <ParentDashboard user={session.user} data={dashboardData} />;
    case "tutor":
      return <TutorDashboard user={session.user} data={dashboardData} />;
    default:
      return <StudentDashboard user={session.user} data={dashboardData} />;
  }
}
```

---

## Next Steps

1. **Review this PRD** with backend engineer to validate assumptions
2. **Create design mockups** in Figma for each persona dashboard
3. **Set up component library** with persona variants (buttons, cards, modals)
4. **Start Phase 1 implementation** (foundation components)
5. **Weekly sync** to review progress and adjust priorities

---

**Questions? Feedback?**

Please add comments directly to this document or create issues in the repo with the `ui-persona` label.

**Maintained by:** UI/UX Engineering Team  
**Last Updated:** November 7, 2025

