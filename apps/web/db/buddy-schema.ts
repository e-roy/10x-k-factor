import {
  pgTable,
  varchar,
  jsonb,
  timestamp,
  serial,
  integer,
  text,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";

// ============================================================================
// Agent Buddy System Tables (STUDENTS ONLY)
// ============================================================================
// NOTE: Agent buddies are a student-only feature (for now). All buddy-related
// functionality should validate that the user has persona="student".

/**
 * Buddy mood and energy states
 */
export type BuddyMood = "calm" | "fired_up" | "focused";

/**
 * Buddy appearance configuration
 */
export type BuddyAppearance = {
  skin: string;
  aura: string;
  spriteUrl?: string;
};

/**
 * Buddy state (mood, energy, etc.)
 */
export type BuddyState = {
  mood: BuddyMood;
  energy: number; // 0-100
};

/**
 * Main agent buddy record
 * Level is derived from user's XP (student persona)
 */
export const agentBuddies = pgTable("agent_buddies", {
  userId: varchar("user_id", { length: 36 })
    .primaryKey()
    .notNull(),
  archetype: varchar("archetype", { length: 32 })
    .notNull()
    .default("wayfinder"), // visual theme: wayfinder, guardian, explorer, etc.
  appearance: jsonb("appearance").$type<BuddyAppearance>(),
  state: jsonb("state").$type<BuddyState>(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * Inventory item kinds
 */
export const inventoryKindEnum = pgEnum("inv_kind", [
  "cosmetic",
  "resource",
  "artifact",
]);

/**
 * Buddy inventory items (cosmetics, resources, artifacts)
 * For future idle game mechanics and customization
 */
export const buddyInventories = pgTable(
  "buddy_inventories",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    kind: inventoryKindEnum("kind").notNull(),
    itemKey: varchar("item_key", { length: 64 }).notNull(), // e.g., 'skin.nebula', 'resource.stardust'
    label: varchar("label", { length: 128 }), // personalized display name
    qty: integer("qty").notNull().default(1),
    data: jsonb("data"), // e.g., { hexColor: '#FF00FF', frameId: 'gold', rarity: 'legendary' }
    acquiredFromEventId: varchar("acq_event_id", { length: 36 }), // tracks origin XP event
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdIdx: index("idx_buddy_inventories_user_id").on(table.userId),
    itemKeyIdx: index("idx_buddy_inventories_item_key").on(table.itemKey),
  })
);

/**
 * Buddy unlocks (features, slots, abilities)
 * Unlocked based on level, achievements, or other criteria
 */
export const buddyUnlocks = pgTable(
  "buddy_unlocks",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    unlockKey: varchar("unlock_key", { length: 64 }).notNull(), // e.g., 'garden.slot.3', 'ability.time_warp'
    criteria: jsonb("criteria"), // { level: 5, subject: 'algebra', badge: 'math_master' }
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdIdx: index("idx_buddy_unlocks_user_id").on(table.userId),
    unlockKeyIdx: index("idx_buddy_unlocks_unlock_key").on(table.unlockKey),
  })
);

/**
 * Buddy message history (chat/nudge log)
 * Stores conversation between user and buddy, plus system messages
 */
export const buddyMessages = pgTable(
  "buddy_messages",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    role: varchar("role", { length: 16 }).notNull(), // 'buddy' | 'system' | 'user'
    content: text("content").notNull(),
    meta: jsonb("meta"), // { nudgeIds: ['...'], loopSource: 'results_rally', emotionTags: ['encouraging'] }
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdIdx: index("idx_buddy_messages_user_id").on(table.userId),
    createdAtIdx: index("idx_buddy_messages_created_at").on(table.createdAt),
  })
);

