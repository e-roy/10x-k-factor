import {
  pgTable,
  varchar,
  boolean,
  jsonb,
  integer,
  timestamp,
  index,
  bigserial,
  text,
} from "drizzle-orm/pg-core";

// Auth-related user data only (used by NextAuth)
export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  image: varchar("image", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// User profile data (non-auth)
export const usersProfiles = pgTable("users_profiles", {
  userId: varchar("user_id", { length: 36 })
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  image: varchar("image", { length: 255 }), // profile image URL
  persona: varchar("persona", { length: 12 }).notNull().default("student"), // 'student'|'parent'|'tutor'
  role: varchar("role", { length: 12 }), // 'admin' or null
  minor: boolean("minor").default(false),
  guardianId: varchar("guardian_id", { length: 36 }),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  primaryColor: varchar("primary_color", { length: 7 }), // #8B5CF6 (hex color)
  secondaryColor: varchar("secondary_color", { length: 7 }), // #EC4899 (hex color)
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
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

export const events = pgTable(
  "events",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    ts: timestamp("ts", { withTimezone: true }).defaultNow().notNull(),
    userId: text("user_id"),
    anonId: text("anon_id"),
    loop: text("loop"), // buddy_challenge, results_rally, etc.
    name: text("name").notNull(), // invite.sent, invite.opened, invite.joined, invite.fvm, reward.granted
    props: jsonb("props").$type<Record<string, unknown>>().default({}),
  },
  (table) => ({
    nameTsIdx: index("idx_events_name_ts").on(table.name, table.ts),
    loopTsIdx: index("idx_events_loop_ts").on(table.loop, table.ts),
    userIdx: index("idx_events_user").on(table.userId),
    propsGinIdx: index("idx_events_props_gin").using("gin", table.props),
  })
);

export const rewards = pgTable(
  "rewards",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    type: varchar("type", { length: 24 }).notNull(), // 'streak_shield', 'ai_minutes', 'badge', 'credits'
    amount: integer("amount"), // nullable for badges
    loop: varchar("loop", { length: 24 }), // nullable
    dedupeKey: varchar("dedupe_key", { length: 255 }).notNull().unique(),
    status: varchar("status", { length: 12 }).notNull().default("pending"), // 'granted', 'denied', 'pending'
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

export const tutorSessions = pgTable(
  "tutor_sessions",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    studentId: varchar("student_id", { length: 36 }).notNull(),
    tutorId: varchar("tutor_id", { length: 36 }), // nullable for simulated sessions
    subject: varchar("subject", { length: 64 }).notNull(),
    transcript: text("transcript").notNull(), // full tutor session transcript
    summary: text("summary").notNull(), // LLM-generated summary
    tutorNotes: text("tutor_notes"), // tutor can add notes later
    studentNotes: text("student_notes"), // student can reflect on session
    duration: integer("duration"), // session duration in minutes
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    studentIdIdx: index("idx_tutor_sessions_student_id").on(table.studentId),
    tutorIdIdx: index("idx_tutor_sessions_tutor_id").on(table.tutorId),
    subjectIdx: index("idx_tutor_sessions_subject").on(table.subject),
    createdAtIdx: index("idx_tutor_sessions_created_at").on(table.createdAt),
  })
);

export const challenges = pgTable(
  "challenges",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    sessionId: varchar("session_id", { length: 36 }), // nullable, links to tutor_sessions
    userId: varchar("user_id", { length: 36 }).notNull(), // student who should complete this
    subject: varchar("subject", { length: 64 }).notNull(),
    questions: jsonb("questions").$type<Array<{
      question: string;
      options: string[];
      correctAnswer: number;
      explanation?: string;
    }>>().notNull(),
    difficulty: varchar("difficulty", { length: 12 }).notNull().default("medium"), // 'easy', 'medium', 'hard'
    status: varchar("status", { length: 12 }).notNull().default("pending"), // 'pending', 'active', 'completed', 'expired'
    score: integer("score"), // 0-100, nullable until completed
    completedAt: timestamp("completed_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    loop: varchar("loop", { length: 24 }), // viral loop that triggered this
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    sessionIdIdx: index("idx_challenges_session_id").on(table.sessionId),
    userIdIdx: index("idx_challenges_user_id").on(table.userId),
    statusIdx: index("idx_challenges_status").on(table.status),
    subjectIdx: index("idx_challenges_subject").on(table.subject),
  })
);
