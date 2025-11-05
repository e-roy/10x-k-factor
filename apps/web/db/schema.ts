import {
  pgTable,
  varchar,
  boolean,
  jsonb,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  image: varchar("image", { length: 255 }),
  persona: varchar("persona", { length: 12 }).notNull().default("student"), // 'student'|'parent'|'tutor'
  minor: boolean("minor").default(false),
  guardianId: varchar("guardian_id", { length: 36 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const smartLinks = pgTable("smart_links", {
  code: varchar("code", { length: 12 }).primaryKey(),
  inviterId: varchar("inviter_id", { length: 36 }).notNull(),
  loop: varchar("loop", { length: 24 }).notNull(),
  params: jsonb("params").$type<Record<string, unknown>>(),
  sig: varchar("sig", { length: 128 }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const results = pgTable("results", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  subject: varchar("subject", { length: 64 }),
  score: integer("score"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const cohorts = pgTable("cohorts", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  subject: varchar("subject", { length: 64 }),
  createdBy: varchar("created_by", { length: 36 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
