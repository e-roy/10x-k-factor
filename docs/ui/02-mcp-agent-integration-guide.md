# MCP Agent Integration Guide

## Quick Reference for UI Engineers

This guide explains how to integrate UI components with the MCP (Model Context Protocol) agent system.

---

## Current Agent Architecture

### ✅ Implemented Agents

1. **Loop Orchestrator Agent** (`packages/agents/src/orchestrator.agent.ts`)
2. **Personalization Agent** (`packages/agents/src/personalize.agent.ts`)

### 🚧 To Be Implemented (per spec)

3. **Incentives & Economy Agent** - Manages rewards, prevents abuse
4. **Social Presence Agent** - Publishes presence, recommends cohorts
5. **Advocacy Agent** - Generates share-packs, tracks referrals
6. **Trust & Safety Agent** - Fraud detection, COPPA compliance
7. **Experimentation Agent** - A/B testing, traffic allocation

---

## How Agents Communicate

### Current Implementation (NOT true MCP yet)

```typescript
// Agents are currently imported as TypeScript functions
import { chooseLoop } from "@10x-k-factor/agents";

const output = chooseLoop(input);
// Returns synchronously
```

### Future MCP Implementation

```typescript
// Agents will communicate via MCP protocol
const mcpClient = new MCPClient("http://agent-orchestrator:8080");

const output = await mcpClient.call("orchestrator/choose_loop", {
  event: "results_viewed",
  persona: "student",
  subject: "Algebra",
  cooldowns: {}
});
```

**For MVP:** You can treat agents as function calls. The MCP layer will be abstracted by the backend team.

---

## UI Integration Patterns

### Pattern 1: Event → Orchestrator → Personalization → UI

**Use Case:** User completes a session, trigger viral loop CTA

```typescript
// 1. Track the event
await track("session.complete", {
  subject: "Algebra",
  score: 85,
  duration: 1200, // seconds
});

// 2. Ask orchestrator which loop to trigger
const orchResponse = await fetch("/api/orchestrator/choose_loop", {
  method: "POST",
  body: JSON.stringify({
    event: "session_complete",
    persona: session.user.persona,
    subject: "Algebra",
    cooldowns: await getUserCooldowns(session.user.id),
  }),
});
const { loop, rationale } = await orchResponse.json();
// Example: { loop: "buddy_challenge", rationale: "Selected buddy_challenge..." }

// 3. Get personalized copy
const persResponse = await fetch("/api/personalize/compose", {
  method: "POST",
  body: JSON.stringify({
    intent: "challenge_friend",
    persona: session.user.persona,
    subject: "Algebra",
    loop: loop,
  }),
});
const { copy, reward_preview } = await persResponse.json();
// Example: { copy: "I just completed Algebra! Challenge me? 🎯", reward_preview: {...} }

// 4. Show in agent buddy speech bubble
setAgentBuddySpeechBubble({
  copy,
  action: {
    type: "modal",
    target: "ChallengeModal",
    data: { loop, subject: "Algebra", rewardPreview: reward_preview },
  },
});
```

**Key Point:** Orchestrator decides WHAT loop, Personalization decides HOW to present it.

---

### Pattern 2: Presence Agent → Social Nudges

**Use Case:** Show "X students practicing right now" in agent buddy

```typescript
// 1. Subscribe to presence updates
const { count, users } = usePresence("Algebra");

// 2. When count threshold reached, show social nudge
useEffect(() => {
  if (count >= 5) {
    // In future MCP architecture, this would call Social Presence Agent
    // For now, just show the speech bubble
    setAgentBuddySpeechBubble({
      copy: `${count} students are practicing Algebra right now! Want to join a study session?`,
      action: {
        type: "navigate",
        target: "/app/cohorts?subject=Algebra",
      },
    });
  }
}, [count]);
```

**Future MCP Implementation:**
```typescript
// Social Presence Agent would decide when/how to show these nudges
const socialAgent = await mcpClient.call("social-presence/get_nudge", {
  userId: session.user.id,
  currentSubject: "Algebra",
  onlineCount: count,
  recentActivity: userActivity,
});

if (socialAgent.shouldNudge) {
  setAgentBuddySpeechBubble({
    copy: socialAgent.copy,
    action: socialAgent.action,
  });
}
```

---

### Pattern 3: Incentives Agent → Reward Grants

**Use Case:** Friend completes challenge, grant reward to inviter

```typescript
// Backend flow (you don't call this directly from UI)
// 1. Friend completes challenge → event tracked
await track("invite.joined", {
  inviterId: "user-123",
  loop: "buddy_challenge",
  challengeId: "challenge-456",
});

// 2. Incentives Agent validates and grants reward
const rewardResponse = await fetch("/api/rewards/grant", {
  method: "POST",
  body: JSON.stringify({
    userId: "user-123", // inviter
    type: "streak_shield",
    amount: 1,
    loop: "buddy_challenge",
    dedupeKey: "user-123-buddy_challenge-challenge-456",
  }),
});

// 3. UI polls or receives SSE notification
// You implement this in the UI:
const { rewards } = useRealtimeRewards(session.user.id);

useEffect(() => {
  if (rewards.length > 0) {
    showRewardCelebration(rewards[0]);
    updateAgentBuddy({
      copy: "Awesome! You earned a streak shield! 🛡️",
    });
  }
}, [rewards]);
```

**Key Point:** Incentives Agent runs on backend, UI just displays results.

---

### Pattern 4: Advocacy Agent → Share Card Generation

**Use Case:** Generate Tutor Spotlight Card with smart link

```typescript
// 1. Tutor clicks "Create Spotlight Card"
const handleCreateSpotlight = async () => {
  // Future: Advocacy Agent generates optimized share pack
  // For now, call smart link endpoint
  const { code, url } = await createSmartLink({
    inviterId: session.user.id,
    loop: "tutor_spotlight",
    params: {
      subject: "Algebra",
      tutorName: session.user.name,
      // Other context
    },
  });

  // Generate OG image (share card)
  const ogImageUrl = `/api/og?type=tutor_spotlight&code=${code}`;

  // Show share modal
  openModal("ShareModal", {
    title: "Share Your Spotlight",
    shareUrl: url,
    imageUrl: ogImageUrl,
    channels: ["whatsapp", "email", "twitter"],
  });
};
```

**Future MCP Implementation:**
```typescript
// Advocacy Agent orchestrates entire share pack
const advocacyAgent = await mcpClient.call("advocacy/create_share_pack", {
  userId: session.user.id,
  persona: "tutor",
  context: {
    recentSessions: [...],
    studentSuccesses: [...],
  },
});

// Returns optimized share pack with smart link, OG image, copy variations
const {
  smartLink,
  ogImageUrl,
  copyVariants, // A/B tested copy
  recommendedChannels, // WhatsApp, email, etc.
} = advocacyAgent;
```

---

## Agent Decision Rationales

**Every agent call includes a `rationale` field for auditability:**

```typescript
{
  "loop": "buddy_challenge",
  "eligibility_reason": "cooldown_ok",
  "rationale": "Selected buddy_challenge for student after session_complete in Algebra. Cooldown period satisfied.",
  "features_used": [
    "event:session_complete",
    "persona:student",
    "subject:Algebra",
    "loop:buddy_challenge",
    "reason:cooldown_ok"
  ]
}
```

**How to use this in UI:**
- Show in tooltips for admin users
- Log to analytics for debugging
- Display in admin dashboard for auditing

---

## Agent Cooldowns & Throttling

**Cooldowns prevent spamming users with viral CTAs:**

```typescript
// Cooldown periods (hours)
const LOOP_COOLDOWNS = {
  buddy_challenge: 24,    // Once per day
  results_rally: 12,      // Twice per day
  proud_parent: 48,       // Once per 2 days
  tutor_spotlight: 72,    // Once per 3 days
};
```

**How to check cooldowns:**

```typescript
async function getUserCooldowns(userId: string): Promise<Record<string, number>> {
  // Query events table for last trigger of each loop
  const lastTriggers = await db
    .select()
    .from(events)
    .where(eq(events.userId, userId))
    .where(eq(events.name, "loop.triggered"));
  
  const cooldowns: Record<string, number> = {};
  for (const trigger of lastTriggers) {
    const loop = trigger.props.loop;
    const hoursSince = (Date.now() - trigger.ts.getTime()) / (1000 * 60 * 60);
    cooldowns[`${loop}_hours`] = hoursSince;
  }
  
  return cooldowns;
}
```

**UI Implications:**
- If loop is in cooldown, agent buddy should NOT show that CTA
- Optionally show "Available in X hours" for transparency

---

## Testing Agents from UI

### Local Development

**Start dev server (if not already running):**
```bash
cd apps/web
pnpm dev
```

**Test orchestrator API:**
```bash
curl -X POST http://localhost:3000/api/orchestrator/choose_loop \
  -H "Content-Type: application/json" \
  -d '{
    "event": "results_viewed",
    "persona": "student",
    "subject": "Algebra",
    "cooldowns": {}
  }'
```

**Expected Response:**
```json
{
  "loop": "buddy_challenge",
  "eligibility_reason": "cooldown_ok",
  "rationale": "Selected buddy_challenge for student after results_viewed in Algebra. Cooldown period satisfied.",
  "features_used": ["event:results_viewed", "persona:student", "subject:Algebra", "loop:buddy_challenge"],
  "ttl_ms": 30000,
  "latency_ms": 8
}
```

### Integration Tests

**Create test utils:**
```typescript
// tests/utils/mockAgents.ts
export function mockOrchestratorResponse(loop: string) {
  return {
    loop,
    eligibility_reason: "cooldown_ok",
    rationale: `Mock: Selected ${loop}`,
    features_used: [],
    ttl_ms: 30000,
  };
}

export function mockPersonalizeResponse(copy: string) {
  return {
    copy,
    deep_link_params: {},
    reward_preview: {
      type: "streak_shield",
      amount: 1,
      description: "Mock reward",
    },
    rationale: "Mock: Generated copy",
    features_used: [],
    ttl_ms: 60000,
  };
}
```

**Use in tests:**
```typescript
import { render, screen } from "@testing-library/react";
import { AgentBuddy } from "@/components/AgentBuddy";
import { mockOrchestratorResponse } from "@/tests/utils/mockAgents";

test("shows speech bubble with personalized copy", async () => {
  // Mock fetch
  global.fetch = jest.fn()
    .mockResolvedValueOnce({ // orchestrator
      json: async () => mockOrchestratorResponse("buddy_challenge"),
    })
    .mockResolvedValueOnce({ // personalize
      json: async () => mockPersonalizeResponse("Challenge a friend! 🎯"),
    });

  render(<AgentBuddy userId="user-123" persona="student" />);

  const speechBubble = await screen.findByText(/Challenge a friend/);
  expect(speechBubble).toBeInTheDocument();
});
```

---

## Common Pitfalls & Solutions

### ❌ Pitfall 1: Calling agents on every render

```typescript
// BAD: This will spam the agent API
function AgentBuddy({ userId }) {
  const orchResponse = await fetch("/api/orchestrator/choose_loop", {...});
  // This runs on EVERY render!
}
```

```typescript
// GOOD: Use useEffect with dependencies
function AgentBuddy({ userId }) {
  const [bubble, setBubble] = useState(null);
  
  useEffect(() => {
    const fetchAgentDecision = async () => {
      const orchResponse = await fetch("/api/orchestrator/choose_loop", {...});
      setBubble(orchResponse);
    };
    fetchAgentDecision();
  }, [userId, /* only re-run when userId changes */]);
}
```

### ❌ Pitfall 2: Not respecting cooldowns

```typescript
// BAD: Always show challenge CTA
function Dashboard() {
  return <AgenticCTACard loop="buddy_challenge" />;
  // User might have triggered this 1 hour ago (cooldown = 24h)
}
```

```typescript
// GOOD: Check cooldowns before showing CTA
function Dashboard() {
  const cooldowns = useUserCooldowns(userId);
  const canShowChallenge = cooldowns["buddy_challenge_hours"] >= 24;
  
  return canShowChallenge ? (
    <AgenticCTACard loop="buddy_challenge" />
  ) : (
    <NextAvailableIn hours={24 - cooldowns["buddy_challenge_hours"]} />
  );
}
```

### ❌ Pitfall 3: Ignoring persona context

```typescript
// BAD: Same agent call for all personas
const orchResponse = await fetch("/api/orchestrator/choose_loop", {
  body: JSON.stringify({
    event: "results_viewed",
    persona: "student", // HARDCODED!
  }),
});
```

```typescript
// GOOD: Use actual user persona
const orchResponse = await fetch("/api/orchestrator/choose_loop", {
  body: JSON.stringify({
    event: "results_viewed",
    persona: session.user.persona, // Dynamic!
  }),
});
```

---

## Roadmap: Future MCP Integration

**Phase 1 (Current):** Agents as TypeScript functions
- ✅ Direct imports
- ✅ Synchronous calls
- ✅ Type safety

**Phase 2 (Next Quarter):** Agents as API endpoints
- 🚧 HTTP API for each agent
- 🚧 Timeout handling
- 🚧 Fallback logic

**Phase 3 (Future):** True MCP Protocol
- ⏳ MCP client/server architecture
- ⏳ Agent discovery
- ⏳ Protocol-level retries and caching
- ⏳ Multi-agent orchestration (agents calling other agents)

**For UI Engineers:** You only need to worry about Phase 1 for now. The backend team will handle the MCP migration transparently.

---

## Quick Checklist for UI Integration

Before pushing your feature:

- [ ] Agent calls are wrapped in `useEffect` or server-side only
- [ ] Cooldowns are checked before showing CTAs
- [ ] Persona is dynamically passed to agents
- [ ] Rationales are logged (at least in dev mode)
- [ ] Loading states are shown during agent calls
- [ ] Error states handle agent timeouts gracefully
- [ ] Events are tracked before/after agent decisions
- [ ] Agent responses are typed (use TypeScript interfaces from `packages/agents/src/types.ts`)

---

## Questions?

**Backend Team Contacts:**
- Agent architecture: [Backend Engineer Name]
- MCP integration: [Backend Engineer Name]

**Resources:**
- MCP Specification: https://modelcontextprotocol.io/
- Agent source code: `packages/agents/src/`
- API routes: `apps/web/app/api/orchestrator/`, `apps/web/app/api/personalize/`

---

**Last Updated:** November 7, 2025  
**Maintained by:** Backend + UI Engineering Teams

