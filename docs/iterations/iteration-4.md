# Add Tutoring Sessions and Challenges Seed Functions

## Step 1: Update Seed Schema

**File**: `apps/web/app/(app)/app/admin/seed/actions.ts`

- Add to `seedSchema`:
- `createTutoringSessions: z.boolean().default(false)`
- `createChallenges: z.boolean().default(false)`
- `tutoringSessionsPerUser: z.number().int().min(1).max(20).default(3)`
- `challengesPerUser: z.number().int().min(1).max(20).default(5)`

- Update `SeedResult` interface to include:
- `tutoringSessionsCreated: number`
- `challengesCreated: number`

## Step 2: Create Seed Function for Tutoring Sessions

**File**: `apps/web/app/(app)/app/admin/seed/actions.ts`

- Create `seedTutoringSessions()` function that:
- Takes `studentUserIds`, `subjectList`, `sessionsPerUser`, and date range
- Creates realistic tutor session records with:
  - Random subjects from subjectList
  - Sample transcript text (e.g., "Student asked about quadratic equations...")
  - Sample summary text (e.g., "Focused on solving quadratic equations using factoring method")
  - Random duration (15-60 minutes)
  - Optional tutorId (can be null for simulated sessions)
  - Random createdAt dates within the date range
  - Metadata with `seeded: true` flag
- Returns count of sessions created

## Step 3: Create Seed Function for Challenges

**File**: `apps/web/app/(app)/app/admin/seed/actions.ts`

- Create `seedChallenges()` function that:
- Takes `studentUserIds`, `subjectList`, `challengesPerUser`, and date range
- Creates realistic challenge records with:
  - Random subjects from subjectList
  - Sample questions array (3-5 questions per challenge) with:
  - Question text (e.g., "What is 2x + 3 = 7?")
  - 4 options (A, B, C, D)
  - Correct answer index (0-3)
  - Optional explanation
  - Random difficulty ("easy", "medium", "hard")
  - Random status ("pending", "active", "completed", "expired")
  - For completed challenges: random score (60-100) and completedAt date
  - Optional sessionId (link to tutor_sessions if created)
  - Optional loop (viral loop name)
  - Random createdAt dates within the date range
  - Optional expiresAt (for pending/active challenges)
  - Metadata with `seeded: true` flag
- Returns count of challenges created

## Step 4: Integrate Seed Functions

**File**: `apps/web/app/(app)/app/admin/seed/actions.ts`

- In `seedUsersAndResults()`:
- Add `tutoringSessionsCreated` and `challengesCreated` tracking variables
- After creating subject enrollments, call `seedTutoringSessions()` if enabled
- After creating tutoring sessions (or independently), call `seedChallenges()` if enabled
- Optionally link challenges to tutor sessions (if both are created)
- Include counts in return statement

## Step 5: Import Required Schema Tables

**File**: `apps/web/app/(app)/app/admin/seed/actions.ts`

- Add imports:
- `tutorSessions` from `@/db/learning-schema` or `@/db/schema`
- `challenges` from `@/db/learning-schema` or `@/db/schema`
- Types: `ChallengeQuestion`, `Difficulty`, `ChallengeStatus` from `@/db/types`

## Step 6: Update Seed Form UI

**File**: `apps/web/app/(app)/app/admin/seed/form.tsx`

- Add to `createFormData` and `addDataFormData` state:
- `createTutoringSessions: false`
- `createChallenges: false`
- `tutoringSessionsPerUser: 3`
- `challengesPerUser: 5`

- Add checkboxes and inputs in both "Create New Users" and "Add Data to Existing Users" sections:
- "Create Tutoring Sessions" checkbox with "per user" input
- "Create Challenges" checkbox with "per user" input

- Update form handlers to pass new fields to `seedUsersAndResults()`

- Update result display to show `tutoringSessionsCreated` and `challengesCreated` counts

## Step 7: Update Quick Seed Function

**File**: `apps/web/app/(app)/app/admin/seed/actions.ts`

- Update `quickSeed()` to include:
- `createTutoringSessions: true`
- `createChallenges: true`
- `tutoringSessionsPerUser: 3`
- `challengesPerUser: 5`
