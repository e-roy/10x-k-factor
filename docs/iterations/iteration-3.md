# Agent Integration and Metrics Seeding Plan

## Step 1: Implement Experimentation Agent (Minimal Viable)

**File**: `packages/agents/src/experiment.agent.ts`

- Create `assignExperiment()` function that:
  - Takes `userId`, `experimentName`, `experimentConfig` (variants, traffic splits)
  - Uses hash-based bucketing (consistent assignment per user)
  - Returns `{ variant: string, exposure_id: string, rationale: string }`
  - Follows same pattern as orchestrator/personalize agents (synchronous, typed)

**File**: `packages/agents/src/types.ts`

- Add `ExperimentInput` and `ExperimentOutput` types
- Add Zod schemas: `experimentInputSchema`, `experimentOutputSchema`

**File**: `packages/agents/src/index.ts`

- Export `assignExperiment` and types

## Step 2: Create Experimentation API Route

**File**: `apps/web/app/api/experiment/assign/route.ts`

- POST handler that:
  - Validates input via `experimentInputSchema`
  - Calls `assignExperiment()` from agents package
  - Returns variant assignment with exposure_id
  - Handles timeouts/errors with fallback (default variant)

## Step 3: Integrate Orchestrator with Event Logging

**File**: `apps/web/app/api/orchestrator/choose_loop/route.ts`

- After orchestrator chooses loop:
  - Call experimentation agent to assign variant (if experiment enabled)
  - Log `exp.exposed` event to `/api/events` with:
    - `name: "exp.exposed"`
    - `payload: { user_id, experiment_name, variant, exposure_id }`
    - `loop: selectedLoop` (for filtering)
  - Include exposure_id in orchestrator response

**Note**: Keep event logging non-blocking (fire-and-forget or background)

## Step 4: Update Seed Script for Events

**File**: `apps/web/app/(app)/app/admin/seed/actions.ts`

- Add `createEvents` boolean option to `seedSchema`
- Add `eventsPerDay` numeric option (default 10)
- Create `seedEventsForKFactor()` function that:
  - Creates `invite.sent` events with proper loop, user_id, timestamps
  - Creates `invite.joined` events (70% of sent, within 2 hours)
  - Creates `invite.fvm` events (60% of joined, within 24 hours)
  - Spreads events across date range (from/to params)
  - Uses existing student user IDs
  - Includes proper props (inviter_id, smart_link_code, loop, etc.)

- After seeding events, refresh materialized view:
  ```typescript
  await db.execute(sql`REFRESH MATERIALIZED VIEW CONCURRENTLY mv_loop_daily;`);
  ```

## Step 5: Update Seed Form UI

**File**: `apps/web/app/(app)/app/admin/seed/form.tsx`

- Add checkbox for "Create Events for K-Factor Metrics"
- Add numeric input for "Events Per Day" (1-50, default 10)
- Wire up to `createEvents` and `eventsPerDay` form fields

## Step 6: Add Helper Function for Event Creation

**File**: `apps/web/app/(app)/app/admin/seed/actions.ts`

- Create `createEventRecord()` helper that formats events correctly:
  - Maps to `events` table schema (ts, userId, anonId, loop, name, props)
  - Handles date distribution across range
  - Generates realistic smart_link_codes and metadata

## Step 7: Test and Verify

- Run seed script with `createEvents: true`
- Verify events appear in `events` table
- Verify materialized view refreshes and shows data
- Check metrics page shows K-factor data
- Ensure events have proper loop distribution (buddy_challenge, tutor_spotlight, results_share, etc.)

## Implementation Notes

- Keep Experimentation Agent simple for MVP (hash-based assignment, no complex ML)
- Event logging from orchestrator should be async/non-blocking to maintain <150ms SLA
- Seed script should create realistic conversion funnels (not all invites convert)
- Materialized view refresh should happen after seeding, not during (to avoid locks)
