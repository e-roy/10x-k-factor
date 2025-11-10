"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.guestChallengeCompletions = exports.referrals = exports.cohorts = exports.smartLinks = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
// ============================================================================
// Viral Mechanics Tables
// ============================================================================
exports.smartLinks = (0, pg_core_1.pgTable)("smart_links", {
    code: (0, pg_core_1.varchar)("code", { length: 12 }).primaryKey(),
    inviterId: (0, pg_core_1.varchar)("inviter_id", { length: 36 }).notNull(),
    loop: (0, pg_core_1.varchar)("loop", { length: 24 }).notNull(),
    params: (0, pg_core_1.jsonb)("params").$type(),
    sig: (0, pg_core_1.varchar)("sig", { length: 128 }).notNull(),
    expiresAt: (0, pg_core_1.timestamp)("expires_at", { withTimezone: true }).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow(),
});
exports.cohorts = (0, pg_core_1.pgTable)("cohorts", {
    id: (0, pg_core_1.varchar)("id", { length: 36 }).primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 128 }).notNull(),
    subject: (0, pg_core_1.varchar)("subject", { length: 64 }),
    createdBy: (0, pg_core_1.varchar)("created_by", { length: 36 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow(),
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
exports.referrals = (0, pg_core_1.pgTable)("referrals", {
    id: (0, pg_core_1.varchar)("id", { length: 36 }).primaryKey(),
    inviterId: (0, pg_core_1.varchar)("inviter_id", { length: 36 }).notNull(), // User who sent the invite
    inviteeId: (0, pg_core_1.varchar)("invitee_id", { length: 36 }).notNull(), // User who accepted/signed up
    smartLinkCode: (0, pg_core_1.varchar)("smart_link_code", { length: 12 }), // Optional: which smart link was used
    loop: (0, pg_core_1.varchar)("loop", { length: 24 }).notNull(), // Which viral loop triggered this
    // Referral metadata
    inviteeCompletedAction: (0, pg_core_1.boolean)("invitee_completed_action").default(false).notNull(), // Did invitee complete the action (challenge, FVM, etc)?
    inviterRewarded: (0, pg_core_1.boolean)("inviter_rewarded").default(false).notNull(), // Has inviter received their referral reward?
    inviteeRewarded: (0, pg_core_1.boolean)("invitee_rewarded").default(false).notNull(), // Has invitee received their signup reward?
    // Tracking
    metadata: (0, pg_core_1.jsonb)("metadata").$type(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
    completedAt: (0, pg_core_1.timestamp)("completed_at", { withTimezone: true }), // When invitee completed the action
    rewardedAt: (0, pg_core_1.timestamp)("rewarded_at", { withTimezone: true }), // When rewards were granted
}, function (table) { return ({
    inviterIdx: (0, pg_core_1.index)("idx_referrals_inviter").on(table.inviterId),
    inviteeIdx: (0, pg_core_1.index)("idx_referrals_invitee").on(table.inviteeId),
    loopIdx: (0, pg_core_1.index)("idx_referrals_loop").on(table.loop),
    smartLinkIdx: (0, pg_core_1.index)("idx_referrals_smart_link").on(table.smartLinkCode),
    createdAtIdx: (0, pg_core_1.index)("idx_referrals_created_at").on(table.createdAt),
}); });
/**
 * Guest challenge completions
 * Temporary storage for guest users who complete challenges before signing up
 * After registration, these get converted to real challenge completions + XP events
 */
exports.guestChallengeCompletions = (0, pg_core_1.pgTable)("guest_challenge_completions", {
    id: (0, pg_core_1.varchar)("id", { length: 36 }).primaryKey(),
    challengeId: (0, pg_core_1.varchar)("challenge_id", { length: 36 }).notNull(),
    guestSessionId: (0, pg_core_1.varchar)("guest_session_id", { length: 64 }).notNull(), // Browser fingerprint or session token
    // Challenge completion data
    score: (0, pg_core_1.integer)("score").notNull(), // 0-100
    answers: (0, pg_core_1.jsonb)("answers").$type().notNull(), // Question index -> answer index
    // Attribution
    smartLinkCode: (0, pg_core_1.varchar)("smart_link_code", { length: 12 }), // Which link brought them here
    inviterId: (0, pg_core_1.varchar)("inviter_id", { length: 36 }), // Who invited them
    // Conversion tracking
    converted: (0, pg_core_1.boolean)("converted").default(false).notNull(), // Has this been converted to a real user?
    convertedUserId: (0, pg_core_1.varchar)("converted_user_id", { length: 36 }), // If converted, which user?
    metadata: (0, pg_core_1.jsonb)("metadata").$type(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
    convertedAt: (0, pg_core_1.timestamp)("converted_at", { withTimezone: true }), // When guest became real user
    expiresAt: (0, pg_core_1.timestamp)("expires_at", { withTimezone: true }).notNull(), // Auto-cleanup after 7 days
}, function (table) { return ({
    challengeIdx: (0, pg_core_1.index)("idx_guest_completions_challenge").on(table.challengeId),
    guestSessionIdx: (0, pg_core_1.index)("idx_guest_completions_session").on(table.guestSessionId),
    inviterIdx: (0, pg_core_1.index)("idx_guest_completions_inviter").on(table.inviterId),
    convertedIdx: (0, pg_core_1.index)("idx_guest_completions_converted").on(table.converted),
    createdAtIdx: (0, pg_core_1.index)("idx_guest_completions_created_at").on(table.createdAt),
}); });
