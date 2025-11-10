import {
  pgTable,
  varchar,
  integer,
  text,
  timestamp,
  jsonb,
  bigserial,
  index,
} from "drizzle-orm/pg-core";

import type { RewardType, RewardStatus } from "@/db/types";

// ============================================================================
// Rewards & Ledger Tables
// ============================================================================

export const rewards = pgTable(
  "rewards",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    type: varchar("type", { length: 24 }).notNull().$type<RewardType>(),
    amount: integer("amount"), // nullable for badges
    loop: varchar("loop", { length: 24 }), // nullable
    dedupeKey: varchar("dedupe_key", { length: 255 }).notNull().unique(),
    status: varchar("status", { length: 12 })
      .notNull()
      .default("pending")
      .$type<RewardStatus>(),
    deniedReason: text("denied_reason"), // nullable
    grantedAt: timestamp("granted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    dedupeKeyIdx: index("idx_rewards_dedupe_key").on(table.dedupeKey),
    userIdIdx: index("idx_rewards_user_id").on(table.userId),
    statusIdx: index("idx_rewards_status").on(table.status),
  })
);

export const ledgerEntries = pgTable(
  "ledger_entries",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    rewardId: varchar("reward_id", { length: 36 }), // nullable, FK to rewards
    userId: varchar("user_id", { length: 36 }).notNull(),
    type: varchar("type", { length: 24 }).notNull(), // 'reward_grant', 'reward_denied'
    unitCostCents: integer("unit_cost_cents").notNull(),
    quantity: integer("quantity").notNull(),
    totalCostCents: integer("total_cost_cents").notNull(),
    loop: varchar("loop", { length: 24 }), // nullable
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    userIdIdx: index("idx_ledger_entries_user_id").on(table.userId),
    rewardIdIdx: index("idx_ledger_entries_reward_id").on(table.rewardId),
    typeIdx: index("idx_ledger_entries_type").on(table.type),
    createdAtIdx: index("idx_ledger_entries_created_at").on(table.createdAt),
  })
);

