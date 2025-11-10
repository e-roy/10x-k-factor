"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificationTokens = exports.sessions = exports.accounts = exports.users = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
// ============================================================================
// Authentication Tables
// ============================================================================
// Auth-related user data only (used by NextAuth)
exports.users = (0, pg_core_1.pgTable)("auth_users", {
    id: (0, pg_core_1.varchar)("id", { length: 36 }).primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 255 }),
    email: (0, pg_core_1.varchar)("email", { length: 255 }),
    password: (0, pg_core_1.varchar)("password", { length: 255 }), // bcrypt hash for email/password auth
    role: (0, pg_core_1.varchar)("role", { length: 12 }), // 'admin' or null
    emailVerified: (0, pg_core_1.timestamp)("email_verified", { withTimezone: true }),
    image: (0, pg_core_1.varchar)("image", { length: 255 }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow(),
});
// Accounts table for OAuth providers
exports.accounts = (0, pg_core_1.pgTable)("auth_accounts", {
    userId: (0, pg_core_1.varchar)("user_id", { length: 36 })
        .notNull()
        .references(function () { return exports.users.id; }, { onDelete: "cascade" }),
    type: (0, pg_core_1.varchar)("type", { length: 255 })
        .$type()
        .notNull(),
    provider: (0, pg_core_1.varchar)("provider", { length: 255 }).notNull(),
    providerAccountId: (0, pg_core_1.varchar)("provider_account_id", {
        length: 255,
    }).notNull(),
    refresh_token: (0, pg_core_1.text)("refresh_token"),
    access_token: (0, pg_core_1.text)("access_token"),
    expires_at: (0, pg_core_1.integer)("expires_at"),
    token_type: (0, pg_core_1.varchar)("token_type", { length: 255 }),
    scope: (0, pg_core_1.varchar)("scope", { length: 255 }),
    id_token: (0, pg_core_1.text)("id_token"),
    session_state: (0, pg_core_1.varchar)("session_state", { length: 255 }),
}, function (account) { return ({
    compoundKey: (0, pg_core_1.primaryKey)({
        columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: (0, pg_core_1.index)("idx_auth_accounts_user_id").on(account.userId),
}); });
// Sessions table (for database sessions, optional with JWT)
exports.sessions = (0, pg_core_1.pgTable)("auth_sessions", {
    sessionToken: (0, pg_core_1.varchar)("session_token", { length: 255 }).primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id", { length: 36 })
        .notNull()
        .references(function () { return exports.users.id; }, { onDelete: "cascade" }),
    expires: (0, pg_core_1.timestamp)("expires", { withTimezone: true }).notNull(),
}, function (session) { return ({
    userIdIdx: (0, pg_core_1.index)("idx_auth_sessions_user_id").on(session.userId),
}); });
// Verification tokens for email verification
exports.verificationTokens = (0, pg_core_1.pgTable)("auth_verification_tokens", {
    identifier: (0, pg_core_1.varchar)("identifier", { length: 255 }).notNull(),
    token: (0, pg_core_1.varchar)("token", { length: 255 }).notNull(),
    expires: (0, pg_core_1.timestamp)("expires", { withTimezone: true }).notNull(),
}, function (vt) { return ({
    compoundKey: (0, pg_core_1.primaryKey)({ columns: [vt.identifier, vt.token] }),
}); });
