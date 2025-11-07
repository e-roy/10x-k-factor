import {
  pgTable,
  varchar,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

import { users } from "./auth-schema";
import type { Persona } from "./types";

// ============================================================================
// User & Profile Tables
// ============================================================================

// User profile data (non-auth)
export const usersProfiles = pgTable("users_profiles", {
  userId: varchar("user_id", { length: 36 })
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  image: varchar("image", { length: 255 }), // profile image URL
  persona: varchar("persona", { length: 12 })
    .notNull()
    .default("student")
    .$type<Persona>(),
  role: varchar("role", { length: 12 }), // 'admin' or null
  minor: boolean("minor").default(false),
  guardianId: varchar("guardian_id", { length: 36 }),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  primaryColor: varchar("primary_color", { length: 7 }), // #8B5CF6 (hex color)
  secondaryColor: varchar("secondary_color", { length: 7 }), // #EC4899 (hex color)
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

