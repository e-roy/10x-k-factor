import { db } from "@/db";
import {
  agentBuddies,
  buddyInventories,
  buddyUnlocks,
  buddyMessages,
  type BuddyAppearance,
  type BuddyState,
  type BuddyMood,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getUserXpWithLevel } from "./xp";
import { randomUUID } from "crypto";

// ============================================================================
// Agent Buddy Management (STUDENTS ONLY)
// ============================================================================

/**
 * Get or create agent buddy for a user
 * Buddy level is derived from user's XP (student persona)
 * 
 * NOTE: Agent buddies are only for students. Caller should validate persona.
 */
export async function getOrCreateBuddy(userId: string) {
  // Check if buddy exists
  const [existingBuddy] = await db
    .select()
    .from(agentBuddies)
    .where(eq(agentBuddies.userId, userId))
    .limit(1);

  if (existingBuddy) {
    // Get user's XP level
    const xpData = await getUserXpWithLevel(userId);
    
    return {
      ...existingBuddy,
      level: xpData.level,
      xp: xpData.xp,
      progress: xpData.progress,
    };
  }

  // Create new buddy with default values
  const defaultAppearance: BuddyAppearance = {
    skin: "default",
    aura: "blue",
  };

  const defaultState: BuddyState = {
    mood: "calm",
    energy: 100,
  };

  const [newBuddy] = await db
    .insert(agentBuddies)
    .values({
      userId,
      archetype: "wayfinder",
      appearance: defaultAppearance,
      state: defaultState,
    })
    .returning();

  // Get user's XP level
  const xpData = await getUserXpWithLevel(userId);

  return {
    ...newBuddy,
    level: xpData.level,
    xp: xpData.xp,
    progress: xpData.progress,
  };
}

/**
 * Update buddy appearance
 */
export async function updateBuddyAppearance(
  userId: string,
  appearance: Partial<BuddyAppearance>
) {
  const [buddy] = await db
    .select()
    .from(agentBuddies)
    .where(eq(agentBuddies.userId, userId))
    .limit(1);

  if (!buddy) {
    throw new Error("Buddy not found");
  }

  const updatedAppearance = {
    ...(buddy.appearance as BuddyAppearance),
    ...appearance,
  };

  await db
    .update(agentBuddies)
    .set({
      appearance: updatedAppearance,
      updatedAt: new Date(),
    })
    .where(eq(agentBuddies.userId, userId));

  return updatedAppearance;
}

/**
 * Update buddy state (mood, energy)
 */
export async function updateBuddyState(
  userId: string,
  state: Partial<BuddyState>
) {
  const [buddy] = await db
    .select()
    .from(agentBuddies)
    .where(eq(agentBuddies.userId, userId))
    .limit(1);

  if (!buddy) {
    throw new Error("Buddy not found");
  }

  const updatedState = {
    ...(buddy.state as BuddyState),
    ...state,
  };

  await db
    .update(agentBuddies)
    .set({
      state: updatedState,
      updatedAt: new Date(),
    })
    .where(eq(agentBuddies.userId, userId));

  return updatedState;
}

/**
 * Update buddy mood based on context
 */
export async function setBuddyMood(userId: string, mood: BuddyMood) {
  return updateBuddyState(userId, { mood });
}

// ============================================================================
// Buddy Inventory
// ============================================================================

/**
 * Add item to buddy inventory
 */
export async function addInventoryItem(params: {
  userId: string;
  kind: "cosmetic" | "resource" | "artifact";
  itemKey: string;
  label?: string;
  qty?: number;
  data?: Record<string, unknown>;
  acquiredFromEventId?: string;
}) {
  // Check if item already exists
  const [existing] = await db
    .select()
    .from(buddyInventories)
    .where(eq(buddyInventories.userId, params.userId))
    .limit(1);

  if (existing) {
    // Update quantity
    const newQty = existing.qty + (params.qty || 1);
    await db
      .update(buddyInventories)
      .set({ qty: newQty })
      .where(eq(buddyInventories.id, existing.id));

    return { ...existing, qty: newQty };
  }

  // Create new inventory item
  const [item] = await db
    .insert(buddyInventories)
    .values({
      userId: params.userId,
      kind: params.kind,
      itemKey: params.itemKey,
      label: params.label,
      qty: params.qty || 1,
      data: params.data,
      acquiredFromEventId: params.acquiredFromEventId,
    })
    .returning();

  return item;
}

/**
 * Get user's inventory items
 */
export async function getInventory(
  userId: string,
  kind?: "cosmetic" | "resource" | "artifact"
) {
  if (kind) {
    return db
      .select()
      .from(buddyInventories)
      .where(eq(buddyInventories.userId, userId))
      .orderBy(desc(buddyInventories.createdAt));
  }

  return db
    .select()
    .from(buddyInventories)
    .where(eq(buddyInventories.userId, userId))
    .orderBy(desc(buddyInventories.createdAt));
}

// ============================================================================
// Buddy Unlocks
// ============================================================================

/**
 * Check if user has unlocked a feature
 */
export async function hasUnlock(userId: string, unlockKey: string) {
  const [unlock] = await db
    .select()
    .from(buddyUnlocks)
    .where(eq(buddyUnlocks.userId, userId))
    .limit(1);

  return !!unlock;
}

/**
 * Grant an unlock to user
 */
export async function grantUnlock(params: {
  userId: string;
  unlockKey: string;
  criteria?: Record<string, unknown>;
}) {
  // Check if already unlocked
  const existing = await hasUnlock(params.userId, params.unlockKey);
  if (existing) {
    return null; // Already unlocked
  }

  const [unlock] = await db
    .insert(buddyUnlocks)
    .values({
      userId: params.userId,
      unlockKey: params.unlockKey,
      criteria: params.criteria,
    })
    .returning();

  return unlock;
}

/**
 * Get all unlocks for a user
 */
export async function getUserUnlocks(userId: string) {
  return db
    .select()
    .from(buddyUnlocks)
    .where(eq(buddyUnlocks.userId, userId))
    .orderBy(desc(buddyUnlocks.createdAt));
}

// ============================================================================
// Buddy Messages
// ============================================================================

/**
 * Add a message to buddy chat history
 */
export async function addBuddyMessage(params: {
  userId: string;
  role: "buddy" | "system" | "user";
  content: string;
  meta?: Record<string, unknown>;
}) {
  const [message] = await db
    .insert(buddyMessages)
    .values({
      id: randomUUID(),
      userId: params.userId,
      role: params.role,
      content: params.content,
      meta: params.meta,
    })
    .returning();

  return message;
}

/**
 * Get recent messages for a user
 */
export async function getBuddyMessages(userId: string, limit: number = 50) {
  return db
    .select()
    .from(buddyMessages)
    .where(eq(buddyMessages.userId, userId))
    .orderBy(desc(buddyMessages.createdAt))
    .limit(limit);
}

/**
 * Get latest buddy message
 */
export async function getLatestBuddyMessage(userId: string) {
  const [message] = await db
    .select()
    .from(buddyMessages)
    .where(eq(buddyMessages.userId, userId))
    .orderBy(desc(buddyMessages.createdAt))
    .limit(1);

  return message || null;
}

