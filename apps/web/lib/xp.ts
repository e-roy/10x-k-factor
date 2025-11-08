import { db } from "@/db";
import {
  xpEvents,
  xpWeights,
  derivedUserXp,
  derivedUserPersonaXp,
} from "@/db/schema";
import type { Persona, XpEventType, XpEventMetadata } from "@/db/types";
import { eq, and, desc } from "drizzle-orm";

// ============================================================================
// Level Curve Calculations
// ============================================================================

/**
 * Calculate XP required to reach a specific level
 * Uses quadratic formula: base * n^2 + step * n
 *
 * @param n - Target level number
 * @param base - Quadratic coefficient (default 40)
 * @param step - Linear coefficient (default 60)
 * @returns XP required to reach level n
 */
export function xpForLevel(
  n: number,
  base: number = 40,
  step: number = 60
): number {
  return Math.floor(base * n * n + step * n);
}

/**
 * Calculate level and progress from total XP
 *
 * @param xp - Total XP accumulated
 * @param base - Quadratic coefficient (default 40)
 * @param step - Linear coefficient (default 60)
 * @returns Object with level, progress (0-1), and XP needed for next level
 */
export function levelFromXp(
  xp: number,
  base: number = 40,
  step: number = 60
): {
  level: number;
  progress: number;
  nextNeeded: number;
  currentLevelXp: number;
  nextLevelXp: number;
} {
  let level = 0;
  let currentLevelXp = 0;

  // Find current level by iterating until XP requirement exceeds total
  while (xp >= xpForLevel(level + 1, base, step)) {
    level++;
  }

  currentLevelXp = xpForLevel(level, base, step);
  const nextLevelXp = xpForLevel(level + 1, base, step);
  const xpIntoCurrentLevel = xp - currentLevelXp;
  const xpNeededForNextLevel = nextLevelXp - currentLevelXp;

  const progress =
    xpNeededForNextLevel > 0
      ? Math.min(1, xpIntoCurrentLevel / xpNeededForNextLevel)
      : 1;

  return {
    level,
    progress,
    nextNeeded: xpNeededForNextLevel,
    currentLevelXp,
    nextLevelXp,
  };
}

// ============================================================================
// XP Event Tracking
// ============================================================================

/**
 * Track an XP event for a user
 * Inserts immutable event record into xp_events table
 *
 * @param params - Event parameters
 * @returns Created event record
 */
export async function trackXpEvent(params: {
  userId: string;
  personaType: Persona;
  eventType: XpEventType;
  referenceId?: string;
  metadata?: XpEventMetadata;
  rawXp?: number;
}) {
  const [event] = await db
    .insert(xpEvents)
    .values({
      userId: params.userId,
      personaType: params.personaType,
      eventType: params.eventType,
      referenceId: params.referenceId,
      metadata: params.metadata || {},
      rawXp: params.rawXp ?? 1,
    })
    .returning();

  return event;
}

// ============================================================================
// XP Queries
// ============================================================================

/**
 * Get total XP for a user across all personas
 * Uses derived_user_xp view which applies current multipliers
 *
 * @param userId - User ID
 * @returns Total XP or 0 if no events
 */
export async function getUserXp(userId: string): Promise<number> {
  const result = await db
    .select()
    .from(derivedUserXp)
    .where(eq(derivedUserXp.userId, userId))
    .limit(1);

  return result[0]?.xp ?? 0;
}

/**
 * Get XP for a specific persona
 * Uses derived_user_persona_xp view
 *
 * @param userId - User ID
 * @param personaType - Persona type filter
 * @returns XP for that persona or 0
 */
export async function getUserXpByPersona(
  userId: string,
  personaType: Persona
): Promise<number> {
  const result = await db
    .select()
    .from(derivedUserPersonaXp)
    .where(
      and(
        eq(derivedUserPersonaXp.userId, userId),
        eq(derivedUserPersonaXp.personaType, personaType)
      )
    )
    .limit(1);

  return result[0]?.xp ?? 0;
}

/**
 * Get XP and level information for a user
 *
 * @param userId - User ID
 * @param personaType - Optional persona filter
 * @returns XP total and calculated level info
 */
export async function getUserXpWithLevel(
  userId: string,
  personaType?: Persona
) {
  const xp = personaType
    ? await getUserXpByPersona(userId, personaType)
    : await getUserXp(userId);

  const levelInfo = levelFromXp(xp);

  return {
    xp,
    ...levelInfo,
  };
}

/**
 * Get recent XP events for a user
 *
 * @param userId - User ID
 * @param limit - Maximum events to return
 * @returns Array of recent events
 */
export async function getRecentXpEvents(userId: string, limit: number = 20) {
  return db
    .select()
    .from(xpEvents)
    .where(eq(xpEvents.userId, userId))
    .orderBy(desc(xpEvents.createdAt))
    .limit(limit);
}

// ============================================================================
// Weight Management
// ============================================================================

/**
 * Get current multiplier for an event type
 *
 * @param eventType - Event type to check
 * @returns Multiplier value or 1.0 if not set
 */
export async function getEventMultiplier(
  eventType: XpEventType
): Promise<number> {
  const result = await db
    .select()
    .from(xpWeights)
    .where(eq(xpWeights.eventType, eventType))
    .limit(1);

  return result[0]?.multiplier ?? 1.0;
}

/**
 * Update or insert weight multiplier for an event type
 * Admin function - triggers retroactive XP recalculation via view
 *
 * @param eventType - Event type to update
 * @param multiplier - New multiplier value
 */
export async function updateEventWeight(
  eventType: XpEventType,
  multiplier: number
) {
  await db
    .insert(xpWeights)
    .values({
      eventType,
      multiplier,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: xpWeights.eventType,
      set: {
        multiplier,
        updatedAt: new Date(),
      },
    });
}

