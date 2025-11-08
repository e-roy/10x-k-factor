import {
  pgTable,
  varchar,
  jsonb,
  timestamp,
  index,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

// ============================================================================
// Viral Mechanics Tables
// ============================================================================

export const smartLinks = pgTable("smart_links", {
  code: varchar("code", { length: 12 }).primaryKey(),
  inviterId: varchar("inviter_id", { length: 36 }).notNull(),
  loop: varchar("loop", { length: 24 }).notNull(),
  params: jsonb("params").$type<Record<string, unknown>>(),
  sig: varchar("sig", { length: 128 }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const cohorts = pgTable("cohorts", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  subject: varchar("subject", { length: 64 }),
  createdBy: varchar("created_by", { length: 36 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

/**
 * Referrals tracking table
 * Tracks viral invitations and referrals between users
 * 
 * Flow:
 * 1. User A shares a smart link
 * 2. User B clicks link and completes action (e.g., challenge, FVM)
 * 3. User B signs up
 * 4. Referral record created linking A -> B
 * 5. Both users can earn rewards based on referral
 */
export const referrals = pgTable(
  "referrals",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    inviterId: varchar("inviter_id", { length: 36 }).notNull(), // User who sent the invite
    inviteeId: varchar("invitee_id", { length: 36 }).notNull(), // User who accepted/signed up
    smartLinkCode: varchar("smart_link_code", { length: 12 }), // Optional: which smart link was used
    loop: varchar("loop", { length: 24 }).notNull(), // Which viral loop triggered this
    
    // Referral metadata
    inviteeCompletedAction: boolean("invitee_completed_action").default(false).notNull(), // Did invitee complete the action (challenge, FVM, etc)?
    inviterRewarded: boolean("inviter_rewarded").default(false).notNull(), // Has inviter received their referral reward?
    inviteeRewarded: boolean("invitee_rewarded").default(false).notNull(), // Has invitee received their signup reward?
    
    // Tracking
    metadata: jsonb("metadata").$type<{
      challengeId?: string;
      deckId?: string;
      subject?: string;
      inviteeScore?: number; // If challenge, what did they score?
      conversionTimeMs?: number; // Time from click to signup
      [key: string]: unknown;
    }>(),
    
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }), // When invitee completed the action
    rewardedAt: timestamp("rewarded_at", { withTimezone: true }), // When rewards were granted
  },
  (table) => ({
    inviterIdx: index("idx_referrals_inviter").on(table.inviterId),
    inviteeIdx: index("idx_referrals_invitee").on(table.inviteeId),
    loopIdx: index("idx_referrals_loop").on(table.loop),
    smartLinkIdx: index("idx_referrals_smart_link").on(table.smartLinkCode),
    createdAtIdx: index("idx_referrals_created_at").on(table.createdAt),
  })
);

/**
 * Guest challenge completions
 * Temporary storage for guest users who complete challenges before signing up
 * After registration, these get converted to real challenge completions + XP events
 */
export const guestChallengeCompletions = pgTable(
  "guest_challenge_completions",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    challengeId: varchar("challenge_id", { length: 36 }).notNull(),
    guestSessionId: varchar("guest_session_id", { length: 64 }).notNull(), // Browser fingerprint or session token
    
    // Challenge completion data
    score: integer("score").notNull(), // 0-100
    answers: jsonb("answers").$type<Record<number, number>>().notNull(), // Question index -> answer index
    
    // Attribution
    smartLinkCode: varchar("smart_link_code", { length: 12 }), // Which link brought them here
    inviterId: varchar("inviter_id", { length: 36 }), // Who invited them
    
    // Conversion tracking
    converted: boolean("converted").default(false).notNull(), // Has this been converted to a real user?
    convertedUserId: varchar("converted_user_id", { length: 36 }), // If converted, which user?
    
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    convertedAt: timestamp("converted_at", { withTimezone: true }), // When guest became real user
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(), // Auto-cleanup after 7 days
  },
  (table) => ({
    challengeIdx: index("idx_guest_completions_challenge").on(table.challengeId),
    guestSessionIdx: index("idx_guest_completions_session").on(table.guestSessionId),
    inviterIdx: index("idx_guest_completions_inviter").on(table.inviterId),
    convertedIdx: index("idx_guest_completions_converted").on(table.converted),
    createdAtIdx: index("idx_guest_completions_created_at").on(table.createdAt),
  })
);

