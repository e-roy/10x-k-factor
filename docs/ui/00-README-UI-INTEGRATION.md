# UI/UX Integration Documentation

## Welcome! 👋

This documentation suite will help you integrate your persona-based UI designs with the existing backend infrastructure.

---

## 📚 Documentation Overview

### 1. **Product Requirements Document (PRD)**
**File:** [`prd-ui-persona-integration.md`](./prd-ui-persona-integration.md)

**What's inside:**
- Executive summary of current system vs. your vision
- Detailed persona experience goals (Student, Parent, Tutor)
- MVP scope and phasing
- Component architecture
- Design system requirements
- Privacy & safety considerations
- Success metrics

**Start here if:** You want the complete picture of what we're building

---

### 2. **MCP Agent Integration Guide**
**File:** [`mcp-agent-integration-guide.md`](./mcp-agent-integration-guide.md)

**What's inside:**
- How agents currently work (Loop Orchestrator, Personalization)
- UI integration patterns for each agent
- Cooldown management
- Testing agents from UI
- Common pitfalls and solutions
- Roadmap for true MCP implementation

**Start here if:** You need to understand how to call agents from your UI components

---

### 3. **Visual Architecture & Data Flow**
**File:** [`architecture-visual-flow.md`](./architecture-visual-flow.md)

**What's inside:**
- ASCII diagrams of system architecture
- End-to-end data flow examples
- Database schema relationships
- Component hierarchy
- API routes map
- Security & privacy patterns

**Start here if:** You're a visual learner and want to see how everything connects

---

### 4. **Quick Start Implementation Guide**
**File:** [`quickstart-ui-implementation.md`](./quickstart-ui-implementation.md)

**What's inside:**
- Step-by-step implementation guide
- Code snippets ready to copy/paste
- Testing instructions
- Troubleshooting common issues
- Next steps roadmap

**Start here if:** You want to start coding immediately

---

## 🎯 Quick Start (5-Minute Version)

### What You Have (Backend)

✅ **4 Viral Loops**: buddy_challenge, results_rally, proud_parent, tutor_spotlight  
✅ **2 Agents**: Loop Orchestrator, Personalization  
✅ **Smart Links**: HMAC-signed with 7-day expiry  
✅ **Events Pipeline**: All actions tracked in `events` table  
✅ **Rewards System**: XP, streak shields, AI minutes, badges  
✅ **Presence & Leaderboards**: Redis-backed real-time features  

### What You're Building (Frontend)

🎨 **Student Experience**: Playful, gamified with agent buddy companion  
👨‍👩‍👧 **Parent Experience**: Professional, progress-focused, safe sharing  
📚 **Tutor Experience**: Efficient, analytics-driven, spotlight cards  

### Key Integration Points

```typescript
// 1. User completes session
await track("session.complete", { subject: "Algebra", score: 85 });

// 2. Ask orchestrator which viral loop to trigger
const { loop } = await fetch("/api/orchestrator/choose_loop", {
  method: "POST",
  body: JSON.stringify({
    event: "session_complete",
    persona: "student",
    subject: "Algebra",
    cooldowns: {}
  })
}).then(r => r.json());

// 3. Get personalized copy
const { copy, reward_preview } = await fetch("/api/personalize/compose", {
  method: "POST",
  body: JSON.stringify({
    intent: "challenge_friend",
    persona: "student",
    loop: loop
  })
}).then(r => r.json());

// 4. Show in agent buddy speech bubble
setAgentBuddySpeechBubble({ copy, reward_preview });
```

---

## 🗺️ Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Create persona utility functions
- [ ] Build agent buddy component
- [ ] Build radial progress widgets (student)
- [ ] Implement tall modal system
- [ ] Wire up orchestrator API
- [ ] Create student dashboard

**Goal:** Students see personalized dashboard with agent buddy

### Phase 2: Viral Loops (Week 3-4)
- [ ] Build challenge modal with share functionality
- [ ] Integrate smart link generation
- [ ] Add reward notifications
- [ ] Build proud parent modal
- [ ] Build tutor spotlight modal
- [ ] Wire up attribution tracking

**Goal:** All 4 viral loops functional with share features

### Phase 3: Polish (Week 5-6)
- [ ] Add animations and micro-interactions
- [ ] Implement celebration effects
- [ ] Improve mobile responsiveness
- [ ] Add dark mode support
- [ ] Performance optimization

**Goal:** Delightful experience across all devices

---

## 🏗️ Architecture at a Glance

```
User Action (UI)
    ↓
Track Event (/api/events)
    ↓
Orchestrator Agent (chooses viral loop)
    ↓
Personalization Agent (generates copy)
    ↓
Agent Buddy Speech Bubble (shows CTA)
    ↓
User Clicks → Modal Opens
    ↓
Create Smart Link (/api/smart-links/create)
    ↓
User Shares → Friend Clicks
    ↓
Smart Link Resolver (/sl/{code})
    ↓
Redirect to FVM (First Value Moment)
    ↓
Friend Completes → Track "invite.joined"
    ↓
Grant Rewards (/api/rewards/grant)
    ↓
Notify Original User (real-time)
    ↓
Celebration Animation + Agent Buddy Update
```

---

## 📊 Current System Status

### ✅ Fully Implemented
- User authentication (next-auth)
- Database schema (Postgres + Drizzle)
- Loop Orchestrator Agent
- Personalization Agent
- Smart link generation & validation
- Event tracking pipeline
- Rewards & ledger system
- Presence (SSE)
- Leaderboards (Redis)
- Basic UI layout (sidebar + header)

### 🚧 Needs UI Integration
- Agent buddy component
- Speech bubble system
- Persona-specific dashboards
- Radial progress widgets
- Challenge modals
- Share functionality
- Reward notifications
- Celebration animations

### ⏳ Future Enhancements
- Personalized agent buddy (gardens, spaceships, RPG themes)
- Idle game layer
- Email/push notifications
- Video reel generation
- Advanced A/B testing
- Per-persona navigation

---

## 🎨 Design System Quick Reference

### Persona Colors

**Student** (Playful)
- Primary: `#8B5CF6` (purple-500)
- Secondary: `#EC4899` (pink-500)
- Gradient: `from-purple-500/10 to-pink-500/10`

**Parent** (Professional)
- Primary: `#3B82F6` (blue-500)
- Secondary: `#06B6D4` (cyan-500)
- Gradient: `from-blue-500/10 to-cyan-500/10`

**Tutor** (Efficient)
- Primary: `#10B981` (green-500)
- Secondary: `#059669` (green-600)
- Gradient: `from-green-500/10 to-emerald-500/10`

### Component Patterns

```typescript
// Persona-aware styling
import { getPersonaStyles } from "@/lib/persona-utils";

const styles = getPersonaStyles(persona);
// Returns: { bgGradient, textColor, iconColor, primary, secondary }

// Use in components:
<div className={styles.bgGradient}>
  <span className={styles.textColor}>Hello!</span>
</div>
```

---

## 🔐 Privacy & Safety Checklist

### Share Cards
- [ ] No last names (only first name or "my child")
- [ ] No school names or locations
- [ ] No exact scores (use ranges)
- [ ] No timestamps more specific than "this week"
- [ ] No photos without consent

### Smart Links
- [ ] HMAC signed (tamper-proof)
- [ ] 7-day expiry
- [ ] Rate limited (10/day for students)
- [ ] No PII in URL parameters

### COPPA Compliance
- [ ] Minor detection (`user.minor`)
- [ ] Guardian consent required for external shares
- [ ] Parental gating for sharing features

---

## 📈 Success Metrics (MVP)

### Engagement
- Time on dashboard: +40% vs baseline
- Speech bubble interaction rate: >15%
- Modal open rate: >20%

### Viral Loops
- Invites per user: ≥0.5/day for students
- Invite open rate: ≥30%
- Invite join rate: ≥10%
- **K-factor: ≥1.20** (PRIMARY GOAL)

### Persona-Specific
- **Students**: Challenge completion, streak retention
- **Parents**: Share rate, re-engagement
- **Tutors**: Referral conversion, spotlight shares

---

## 🛠️ Development Setup

### Prerequisites
```bash
# Already installed (assumed)
- Node.js 18+
- pnpm
- PostgreSQL (Neon)
- Redis (Upstash)
```

### Environment Variables
```bash
# Copy from .env.example
DATABASE_URL=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
AUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_APP_URL=
SMARTLINK_HMAC_SECRET=
```

### Start Development
```bash
# Install dependencies
pnpm install

# Generate Drizzle types
cd apps/web
pnpm drizzle:gen

# Start dev server
pnpm dev

# Visit: http://localhost:3000
```

---

## 🧪 Testing Your Work

### Manual Testing
```bash
# Test orchestrator
curl -X POST http://localhost:3000/api/orchestrator/choose_loop \
  -H "Content-Type: application/json" \
  -d '{"event":"session_complete","persona":"student","cooldowns":{}}'

# Test personalization
curl -X POST http://localhost:3000/api/personalize/compose \
  -H "Content-Type: application/json" \
  -d '{"intent":"challenge_friend","persona":"student","loop":"buddy_challenge"}'
```

### Browser Console
```javascript
// Track an event
fetch("/api/events", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "session.complete",
    payload: { subject: "Algebra", score: 85 }
  })
});
```

---

## 📖 Recommended Reading Order

**If you're new to the project:**
1. Read this README (you are here!)
2. Skim the [PRD](./prd-ui-persona-integration.md) (focus on "Current System" and "MVP Phase")
3. Review the [Visual Architecture](./architecture-visual-flow.md) (focus on diagrams)
4. Follow the [Quick Start Guide](./quickstart-ui-implementation.md) step-by-step

**If you need to integrate agents:**
1. Read the [MCP Agent Guide](./mcp-agent-integration-guide.md)
2. Look at existing agent calls in `apps/web/lib/agents/`
3. Test the APIs manually (curl or browser console)

**If you're designing components:**
1. Review "Persona Experience Goals" in the [PRD](./prd-ui-persona-integration.md)
2. Check "Design System Requirements" in the [PRD](./prd-ui-persona-integration.md)
3. Look at existing shadcn/ui components in `apps/web/components/ui/`

---

## 🤝 Collaboration Points with Backend

### You Own:
- All UI components in `apps/web/components/`
- Client-side state management
- Animation and visual design
- Modal system
- Dashboard layouts per persona

### Backend Owns:
- Agent logic in `packages/agents/`
- API routes in `apps/web/app/api/`
- Database schema in `apps/web/db/`
- Smart link signing/validation
- Reward grant logic

### Shared:
- Type definitions (keep in sync!)
- Event tracking schema
- API contracts (document changes!)
- Testing (both unit and integration)

---

## 🐛 Troubleshooting

### Common Issues

**Agent buddy not appearing**
- Check: Is persona set in session?
- Check: Is component imported in header?
- Fix: Add console.logs to track state

**Orchestrator returning default loop**
- Check: Are cooldowns passed correctly?
- Check: Is event name spelled correctly?
- Fix: Test API directly with curl

**Radial widgets not rendering**
- Check: Are progress values 0-100?
- Check: Are SVG attributes correct?
- Fix: Inspect element and check computed styles

**Smart links not working**
- Check: Is SMARTLINK_HMAC_SECRET set?
- Check: Is link expired (7 days)?
- Fix: Verify signature in DB matches computed

---

## 📞 Getting Help

### Resources
- **Existing codebase**: `apps/web/` (explore!)
- **Agent types**: `packages/agents/src/types.ts`
- **DB schema**: `apps/web/db/schema.ts`
- **shadcn/ui docs**: https://ui.shadcn.com
- **Tailwind docs**: https://tailwindcss.com/docs
- **Next.js docs**: https://nextjs.org/docs

### Ask Questions
- **Backend integration**: Check with backend engineer
- **Agent behavior**: Review agent source code
- **UI components**: Check existing components first
- **Database queries**: Review Drizzle ORM docs

---

## 🎯 Definition of Done (MVP)

### Features
- [x] 4 viral loops working end-to-end
- [x] Backend agent system functional
- [ ] Persona-specific dashboards (student, parent, tutor)
- [ ] Agent buddy with speech bubbles
- [ ] Challenge modal with sharing
- [ ] Smart link attribution tracking
- [ ] Reward notifications
- [ ] Celebration animations

### Quality
- [ ] All personas render correctly
- [ ] Agent APIs respond <200ms
- [ ] Mobile responsive
- [ ] Dark mode support
- [ ] No console errors
- [ ] Privacy-safe share cards

### Metrics
- [ ] K-factor ≥1.20 on 14-day cohort
- [ ] Invite conversion ≥10%
- [ ] Dashboard engagement +40%
- [ ] Speech bubble interaction ≥15%

---

## 🚀 Let's Build Something Amazing!

You have:
- ✅ Comprehensive PRD
- ✅ Technical architecture docs
- ✅ Agent integration guide
- ✅ Step-by-step implementation guide
- ✅ Code examples ready to use

**Next step:** Open [`quickstart-ui-implementation.md`](./quickstart-ui-implementation.md) and start with Step 1!

Questions? Feedback? Create an issue with the `ui-persona` label.

---

**Good luck! 🎨✨**

_Last Updated: November 7, 2025_  
_Maintained by: UI/UX Engineering Team_

