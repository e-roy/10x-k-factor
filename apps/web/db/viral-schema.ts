import {
  pgTable,
  varchar,
  jsonb,
  timestamp,
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

