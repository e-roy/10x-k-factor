import {
  pgTable,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";
import { users } from "@/db/auth-schema";

// ============================================================================
// Subjects & Enrollment Tables
// ============================================================================

/**
 * Subjects table - defines available subjects/classes
 * Subject-wide features: cohorts, presence, group challenges
 */
export const subjects = pgTable("subjects", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 128 }).notNull().unique(), // "Algebra", "Physics", etc.
  slug: varchar("slug", { length: 128 }).notNull().unique(), // "algebra", "physics" for URLs
  description: text("description"),
  
  // Display
  icon: varchar("icon", { length: 64 }), // lucide icon name
  color: varchar("color", { length: 7 }), // hex color for theming
  
  // Metadata
  category: varchar("category", { length: 64 }), // "Math", "Science", "Language", etc.
  gradeLevel: varchar("grade_level", { length: 32 }), // "high-school", "middle-school", "college"
  
  // Status
  active: boolean("active").default(true).notNull(),
  
  // Stats (denormalized for performance)
  enrollmentCount: integer("enrollment_count").default(0).notNull(),
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  nameIdx: index("idx_subjects_name").on(table.name),
  slugIdx: index("idx_subjects_slug").on(table.slug),
  activeIdx: index("idx_subjects_active").on(table.active),
  categoryIdx: index("idx_subjects_category").on(table.category),
}));

/**
 * User-Subject enrollment junction table
 * Tracks which students are enrolled in which subjects and their progress
 */
export const userSubjects = pgTable("user_subjects", {
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  subjectId: varchar("subject_id", { length: 36 })
    .notNull()
    .references(() => subjects.id, { onDelete: "cascade" }),
  
  // Class progress (from external service)
  classesTaken: integer("classes_taken").default(0).notNull(), // Number of classes taken
  totalClasses: integer("total_classes").default(0).notNull(), // Total classes for semester/year
  
  // Tutoring sessions (incremented when transcript is generated)
  tutoringSessions: integer("tutoring_sessions").default(0).notNull(), // Number of tutoring sessions
  
  // Challenges completed (incremented when challenge is completed)
  challengesCompleted: integer("challenges_completed").default(0).notNull(), // Number of challenges completed
  
  // Activity tracking
  totalXp: integer("total_xp").default(0).notNull(),
  currentStreak: integer("current_streak").default(0).notNull(), // Current streak count (based on challenges completed)
  longestStreak: integer("longest_streak").default(0).notNull(), // Longest streak achieved (based on challenges completed)
  lastActivityAt: timestamp("last_activity_at", { withTimezone: true }),
  
  // Enrollment metadata
  enrolledAt: timestamp("enrolled_at", { withTimezone: true }).defaultNow().notNull(),
  
  // Flags
  favorite: boolean("favorite").default(false).notNull(), // User can star subjects
  notificationsEnabled: boolean("notifications_enabled").default(true).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.subjectId] }),
  userIdx: index("idx_user_subjects_user").on(table.userId),
  subjectIdx: index("idx_user_subjects_subject").on(table.subjectId),
  lastActivityIdx: index("idx_user_subjects_last_activity").on(table.lastActivityAt),
  favoriteIdx: index("idx_user_subjects_favorite").on(table.favorite),
}));

