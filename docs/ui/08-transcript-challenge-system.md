# Transcript & Challenge Generation System

## Overview

This document describes the implementation of the test/admin functionality for generating simulated tutor session transcripts and challenges, which integrates with the Loop Orchestrator and Agent Buddy notification system.

## Architecture

### Database Schema

Two new tables were added:

1. **`tutor_sessions`** - Stores tutor session data
   - `id`: Unique session identifier
   - `studentId`: Student user reference
   - `tutorId`: Tutor user reference (nullable for simulated sessions)
   - `subject`: Subject of the session
   - `transcript`: Full session transcript
   - `summary`: LLM-generated summary
   - `tutorNotes`: Optional notes from tutor
   - `studentNotes`: Optional reflection notes from student
   - `duration`: Session duration in minutes
   - `metadata`: Additional JSON metadata
   - `createdAt`: Timestamp

2. **`challenges`** - Stores generated challenges
   - `id`: Unique challenge identifier
   - `sessionId`: Links to `tutor_sessions` (nullable)
   - `userId`: Student who should complete the challenge
   - `subject`: Challenge subject
   - `questions`: JSON array of questions with options, correct answers, and explanations
   - `difficulty`: 'easy', 'medium', or 'hard'
   - `status`: 'pending', 'active', 'completed', or 'expired'
   - `score`: 0-100 score (nullable until completed)
   - `completedAt`: Completion timestamp
   - `expiresAt`: Challenge expiration (7 days)
   - `loop`: Viral loop identifier
   - `metadata`: Additional JSON metadata
   - `createdAt`: Timestamp

### API Endpoints

#### 1. Generate Transcript & Summary
`POST /api/challenges/generate-transcript`

Generates a simulated tutor session transcript and summary using either Ollama or OpenAI.

**Request:**
```json
{
  "subject": "Algebra",
  "studentLevel": "intermediate"
}
```

**Response:**
```json
{
  "transcript": "Tutor: Hi! Today we're going to work on...",
  "summary": "This tutoring session covered...",
  "subject": "Algebra",
  "studentLevel": "intermediate",
  "generatedAt": "2025-11-07T..."
}
```

**Configuration:**
- Uses `LLM_PROVIDER` environment variable (`"ollama"` or default to OpenAI)
- Ollama: `OLLAMA_BASE_URL` (default: `http://localhost:11434`)
- OpenAI: `OPENAI_API_KEY`
- Falls back to mock data if LLM fails

#### 2. Create Session & Generate Challenge
`POST /api/tutor-sessions/create`

Creates a tutor session record and triggers challenge generation.

**Request:**
```json
{
  "transcript": "...",
  "summary": "...",
  "subject": "Algebra",
  "tutorId": "optional-tutor-id",
  "duration": 30
}
```

**Response:**
```json
{
  "sessionId": "uuid",
  "challengeId": "uuid",
  "message": "Tutor session created and challenge generated"
}
```

**Process:**
1. Inserts tutor session into database
2. Generates 5 multiple-choice questions from summary using LLM
3. Creates challenge record with 7-day expiration
4. Returns both session and challenge IDs

#### 3. Get Challenge
`GET /api/challenges/[id]`

Fetches a specific challenge by ID (verifies user authorization).

#### 4. Update Challenge
`PATCH /api/challenges/[id]`

Updates challenge status and score.

**Request:**
```json
{
  "status": "completed",
  "score": 85
}
```

### User Flow

```
1. User visits /app/demos/transcript-challenge
   ↓
2. Selects enrolled subject from dropdown
   ↓
3. Clicks "Generate Transcript"
   → API calls LLM to generate realistic tutor session
   → Displays transcript and summary
   ↓
4. Clicks "Create Session & Generate Challenge"
   → Saves tutor_sessions record
   → Generates 5 questions from summary
   → Creates challenges record
   → Dispatches "challengeGenerated" custom event
   ↓
5. Agent Buddy (useAgentBuddy hook) hears event
   → Fetches challenge details
   → Creates speech bubble with:
     - Personalized copy about the challenge
     - "Take Challenge" button (opens modal)
     - XP reward preview
     - Notification badge shows count
   ↓
6. Student clicks Agent Buddy
   → Speech bubble toggles visibility
   → Shows notification badge with challenge count
   ↓
7. Student clicks "Take Challenge" button
   → Opens ChallengeModal via ModalManager
   → Displays questions one at a time
   → Student selects answers
   → Progress bar shows completion
   ↓
8. Student submits challenge
   → Calculates score
   → Updates challenge status to "completed"
   → Shows results with review
   → Dispatches "challengeCompleted" event
   ↓
9. Agent Buddy hears completion event
   → Removes the speech bubble for that challenge
   → Notification badge count decrements
```

## Components

### 1. Demo Page
**File:** `apps/web/app/(app)/app/demos/transcript-challenge/page.tsx`

Features:
- Subject dropdown (common enrolled subjects)
- "Generate Transcript" button
- Displays generated transcript and summary
- "Create Session & Generate Challenge" button
- Success feedback with session/challenge IDs
- Instructions for how the system works

### 2. Enhanced Agent Buddy
**File:** `apps/web/components/AgentBuddy.tsx`

New Features:
- **Notification badge** showing count of pending challenges
- **Toggle visibility** by clicking the avatar
- **Pulse animation** on avatar when active
- **Speech bubble management** with dismiss and action buttons
- **Modal integration** via ModalManager context

Visual States:
- Idle: Gray border, idle SVG
- Active: Persona-colored border, active SVG, pulse animation, notification badge
- Bubble visible/hidden: Click avatar to toggle

### 3. Enhanced useAgentBuddy Hook
**File:** `apps/web/hooks/useAgentBuddy.ts`

New Capabilities:
- Listens for `challengeGenerated` custom event
- Fetches challenge details when event fires
- Creates speech bubble with challenge info
- Listens for `challengeCompleted` custom event
- Removes bubble when challenge is completed
- Returns `bubbleCount`, `isVisible`, `toggleVisibility`

### 4. ChallengeModal
**File:** `apps/web/components/modals/ChallengeModal.tsx`

Features:
- Fetches challenge data on open
- Question-by-question navigation
- Radio button answer selection
- Progress bar showing answered/total
- Previous/Next navigation
- Submit button (enabled when all answered)
- Results screen with score and question review
- Color-coded correct/incorrect answers
- Explanations for each question

### 5. ModalManager (Context)
**File:** `apps/web/components/ModalManager.tsx`

Provides:
- Centralized modal state management
- `openModal(type, data)` function
- `closeModal()` function
- Handles challenge completion callback
- Dispatches `challengeCompleted` event

Wrapped at layout level to provide modal context to all components.

## Event System

### Custom Events

1. **`challengeGenerated`**
   - **Dispatched by:** Demo page after session creation
   - **Payload:** `{ challengeId, subject }`
   - **Listened by:** useAgentBuddy hook
   - **Purpose:** Notifies Agent Buddy to show challenge bubble

2. **`challengeCompleted`**
   - **Dispatched by:** ModalManager after challenge submission
   - **Payload:** `{ challengeId, score }`
   - **Listened by:** useAgentBuddy hook
   - **Purpose:** Removes challenge bubble from queue

## LLM Integration

### Provider Selection

Hard-coded flag via environment variable:
```bash
LLM_PROVIDER=ollama  # or omit for OpenAI (default)
```

### Ollama Configuration

```bash
OLLAMA_BASE_URL=http://localhost:11434  # default
# Uses llama3.2 model (configurable in code)
```

### OpenAI Configuration

```bash
OPENAI_API_KEY=sk-...
# Uses gpt-4o-mini model
```

### Fallback Strategy

If LLM provider fails:
1. Transcript generation → Returns mock algebra session
2. Summary generation → Returns mock summary
3. Question generation → Returns 5 generic questions

This ensures the demo always works even without LLM configured.

## Loop Orchestrator Integration

### Current State

The Loop Orchestrator is **not modified** in this implementation. It exists as a TypeScript function that:
- Takes event context (event type, persona, subject, cooldowns)
- Returns the selected viral loop
- Provides rationale for the decision

### Integration Point

In `apps/web/app/api/tutor-sessions/create/route.ts`, the challenge generation calls:

```typescript
async function generateChallengeFromSession(params) {
  // This simulates what Loop Orchestrator would trigger
  const questions = await generateQuestions(summary, subject);
  
  await db.insert(challenges).values({
    // ... challenge data
    loop: "buddy_challenge", // Currently hardcoded
    // In future, this would come from Loop Orchestrator decision
  });
}
```

### Future Enhancement

To fully integrate with Loop Orchestrator:

1. Trigger orchestrator when session is created:
```typescript
const orchResponse = await fetch("/api/orchestrator/choose_loop", {
  method: "POST",
  body: JSON.stringify({
    event: "session_complete",
    persona: "student",
    subject,
    cooldowns: await getUserCooldowns(studentId),
  }),
});
const { loop } = await orchResponse.json();
```

2. Use the returned loop in challenge creation
3. Potentially trigger different actions based on loop type

## Student Sidebar Integration

The Agent Buddy appears in the StudentSidebar with:
- Centered display with scale-125 for prominence
- XP & Level card below it
- Streak card with "at risk" indicator
- Recent badges grid
- Subjects list with active users
- Cohorts list

The notification badge on Agent Buddy makes pending challenges highly visible in the sidebar.

## Security & Validation

- All API endpoints require authentication
- Challenge access is user-scoped (can only access own challenges)
- Smart link HMAC signing prevents tampering
- Questions are validated server-side
- Score calculation happens server-side (not trusting client)

## Testing

To test the system:

1. **Start dev server** (assumed already running per project conventions)

2. **Configure LLM provider** (optional, uses fallback otherwise):
```bash
# For Ollama
export LLM_PROVIDER=ollama
export OLLAMA_BASE_URL=http://localhost:11434

# For OpenAI
export OPENAI_API_KEY=sk-...
```

3. **Visit demo page:**
```
http://localhost:3000/app/demos/transcript-challenge
```

4. **Test flow:**
   - Select "Algebra" from subject dropdown
   - Click "Generate Transcript"
   - Wait for transcript and summary to appear
   - Click "Create Session & Generate Challenge"
   - Observe Agent Buddy notification badge appear
   - Click Agent Buddy avatar to see speech bubble
   - Click "Take Challenge" in speech bubble
   - Answer questions and submit
   - Observe bubble dismissal after completion

5. **Verify database:**
```sql
SELECT * FROM tutor_sessions ORDER BY created_at DESC LIMIT 1;
SELECT * FROM challenges ORDER BY created_at DESC LIMIT 1;
```

## Next Steps

1. **Integrate with actual Loop Orchestrator**
   - Call orchestrator API when session is created
   - Use returned loop type for challenge generation
   - Support multiple loop types (buddy_challenge, results_rally, etc.)

2. **Add challenge sharing**
   - Generate smart links for challenges
   - Allow students to share challenges with friends
   - Track invite.sent → invite.opened → invite.joined funnel

3. **Implement rewards**
   - Grant XP/badges when challenge is completed
   - Show reward celebration animation
   - Update student XP/level in sidebar

4. **Add persistence**
   - Store pending challenges in localStorage
   - Restore bubble state on page refresh
   - Add "view all challenges" page

5. **Enhance question generation**
   - Better prompts for LLM to generate domain-specific questions
   - Difficulty calibration based on student level
   - Support for different question types (multiple choice, true/false, short answer)

6. **Add tutor/student notes UI**
   - Allow tutors to add notes post-session
   - Allow students to reflect on sessions
   - Display notes in session review page

## Files Modified/Created

### New Files
- `apps/web/app/api/challenges/generate-transcript/route.ts`
- `apps/web/app/api/tutor-sessions/create/route.ts`
- `apps/web/app/api/challenges/[id]/route.ts`
- `apps/web/app/(app)/app/demos/transcript-challenge/page.tsx`
- `apps/web/components/ModalManager.tsx`
- `docs/ui/08-transcript-challenge-system.md`

### Modified Files
- `apps/web/db/schema.ts` - Added tutor_sessions and challenges tables
- `apps/web/hooks/useAgentBuddy.ts` - Added event listeners and bubble management
- `apps/web/components/AgentBuddy.tsx` - Added notification badge and toggle
- `apps/web/components/app-layout/StudentSidebar.tsx` - Removed onOpenModal prop
- `apps/web/components/modals/ChallengeModal.tsx` - Complete rewrite for quiz functionality
- `apps/web/app/(app)/layout.tsx` - Added ModalProvider wrapper

## Dependencies

No new dependencies were added. The implementation uses:
- Existing Next.js/React infrastructure
- Native `crypto.randomUUID()` for ID generation
- Existing UI components from shadcn/ui
- Existing database connection via Drizzle ORM

---

**Last Updated:** November 7, 2025  
**Status:** Complete and ready for testing

