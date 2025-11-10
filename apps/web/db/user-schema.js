"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersProfiles = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
var auth_schema_1 = require("./auth-schema");
// ============================================================================
// User & Profile Tables
// ============================================================================
// User profile data (non-auth)
exports.usersProfiles = (0, pg_core_1.pgTable)("users_profiles", {
    userId: (0, pg_core_1.varchar)("user_id", { length: 36 })
        .primaryKey()
        .references(function () { return auth_schema_1.users.id; }, { onDelete: "cascade" }),
    persona: (0, pg_core_1.varchar)("persona", { length: 12 })
        .notNull()
        .default("student")
        .$type(),
    minor: (0, pg_core_1.boolean)("minor").default(false),
    guardianId: (0, pg_core_1.varchar)("guardian_id", { length: 36 }),
    onboardingCompleted: (0, pg_core_1.boolean)("onboarding_completed").default(false),
    primaryColor: (0, pg_core_1.varchar)("primary_color", { length: 7 }), // #8B5CF6 (hex color)
    secondaryColor: (0, pg_core_1.varchar)("secondary_color", { length: 7 }), // #EC4899 (hex color)
    personalizationTheme: (0, pg_core_1.varchar)("personalization_theme", { length: 64 }), // reward/gameplay/message flavor
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }).defaultNow(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow(),
});
