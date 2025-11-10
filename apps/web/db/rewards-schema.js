"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ledgerEntries = exports.rewards = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
// ============================================================================
// Rewards & Ledger Tables
// ============================================================================
exports.rewards = (0, pg_core_1.pgTable)("rewards", {
    id: (0, pg_core_1.varchar)("id", { length: 36 }).primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id", { length: 36 }).notNull(),
    type: (0, pg_core_1.varchar)("type", { length: 24 }).notNull().$type(),
    amount: (0, pg_core_1.integer)("amount"), // nullable for badges
    loop: (0, pg_core_1.varchar)("loop", { length: 24 }), // nullable
    dedupeKey: (0, pg_core_1.varchar)("dedupe_key", { length: 255 }).notNull().unique(),
    status: (0, pg_core_1.varchar)("status", { length: 12 })
        .notNull()
        .default("pending")
        .$type(),
    deniedReason: (0, pg_core_1.text)("denied_reason"), // nullable
    grantedAt: (0, pg_core_1.timestamp)("granted_at", { withTimezone: true }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow(),
}, function (table) { return ({
    dedupeKeyIdx: (0, pg_core_1.index)("idx_rewards_dedupe_key").on(table.dedupeKey),
    userIdIdx: (0, pg_core_1.index)("idx_rewards_user_id").on(table.userId),
    statusIdx: (0, pg_core_1.index)("idx_rewards_status").on(table.status),
}); });
exports.ledgerEntries = (0, pg_core_1.pgTable)("ledger_entries", {
    id: (0, pg_core_1.bigserial)("id", { mode: "number" }).primaryKey(),
    rewardId: (0, pg_core_1.varchar)("reward_id", { length: 36 }), // nullable, FK to rewards
    userId: (0, pg_core_1.varchar)("user_id", { length: 36 }).notNull(),
    type: (0, pg_core_1.varchar)("type", { length: 24 }).notNull(), // 'reward_grant', 'reward_denied'
    unitCostCents: (0, pg_core_1.integer)("unit_cost_cents").notNull(),
    quantity: (0, pg_core_1.integer)("quantity").notNull(),
    totalCostCents: (0, pg_core_1.integer)("total_cost_cents").notNull(),
    loop: (0, pg_core_1.varchar)("loop", { length: 24 }), // nullable
    metadata: (0, pg_core_1.jsonb)("metadata").$type(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow(),
}, function (table) { return ({
    userIdIdx: (0, pg_core_1.index)("idx_ledger_entries_user_id").on(table.userId),
    rewardIdIdx: (0, pg_core_1.index)("idx_ledger_entries_reward_id").on(table.rewardId),
    typeIdx: (0, pg_core_1.index)("idx_ledger_entries_type").on(table.type),
    createdAtIdx: (0, pg_core_1.index)("idx_ledger_entries_created_at").on(table.createdAt),
}); });
