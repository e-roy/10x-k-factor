import {
  pgTable,
  varchar,
  timestamp,
  text,
  integer,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";

// ============================================================================
// Authentication Tables
// ============================================================================

// Auth-related user data only (used by NextAuth)
export const users = pgTable("auth_users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  password: varchar("password", { length: 255 }), // bcrypt hash for email/password auth
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  image: varchar("image", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Accounts table for OAuth providers
export const accounts = pgTable(
  "auth_accounts",
  {
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("idx_auth_accounts_user_id").on(account.userId),
  })
);

// Sessions table (for database sessions, optional with JWT)
export const sessions = pgTable(
  "auth_sessions",
  {
    sessionToken: varchar("session_token", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (session) => ({
    userIdIdx: index("idx_auth_sessions_user_id").on(session.userId),
  })
);

// Verification tokens for email verification
export const verificationTokens = pgTable(
  "auth_verification_tokens",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);
