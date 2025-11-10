"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.challenges = exports.tutorSessions = exports.results = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
// ============================================================================
// Learning & Results Tables
// ============================================================================
exports.results = (0, pg_core_1.pgTable)("results", {
    id: (0, pg_core_1.varchar)("id", { length: 36 }).primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id", { length: 36 }).notNull(),
    subject: (0, pg_core_1.varchar)("subject", { length: 64 }),
    score: (0, pg_core_1.integer)("score"),
    metadata: (0, pg_core_1.jsonb)("metadata").$type(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow(),
});
// ============================================================================
// Learning & Challenges Tables
// ============================================================================
exports.tutorSessions = (0, pg_core_1.pgTable)("tutor_sessions", {
    id: (0, pg_core_1.varchar)("id", { length: 36 }).primaryKey(),
    studentId: (0, pg_core_1.varchar)("student_id", { length: 36 }).notNull(),
    tutorId: (0, pg_core_1.varchar)("tutor_id", { length: 36 }), // nullable for simulated sessions
    subject: (0, pg_core_1.varchar)("subject", { length: 64 }).notNull(),
    transcript: (0, pg_core_1.text)("transcript").notNull(), // full tutor session transcript
    summary: (0, pg_core_1.text)("summary").notNull(), // LLM-generated summary
    tutorNotes: (0, pg_core_1.text)("tutor_notes"), // tutor can add notes later
    studentNotes: (0, pg_core_1.text)("student_notes"), // student can reflect on session
    duration: (0, pg_core_1.integer)("duration"), // session duration in minutes
    metadata: (0, pg_core_1.jsonb)("metadata").$type(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow(),
}, function (table) { return ({
    studentIdIdx: (0, pg_core_1.index)("idx_tutor_sessions_student_id").on(table.studentId),
    tutorIdIdx: (0, pg_core_1.index)("idx_tutor_sessions_tutor_id").on(table.tutorId),
    subjectIdx: (0, pg_core_1.index)("idx_tutor_sessions_subject").on(table.subject),
    createdAtIdx: (0, pg_core_1.index)("idx_tutor_sessions_created_at").on(table.createdAt),
}); });
exports.challenges = (0, pg_core_1.pgTable)("challenges", {
    id: (0, pg_core_1.varchar)("id", { length: 36 }).primaryKey(),
    sessionId: (0, pg_core_1.varchar)("session_id", { length: 36 }), // nullable, links to tutor_sessions
    userId: (0, pg_core_1.varchar)("user_id", { length: 36 }).notNull(), // student who should complete this
    invitedUserId: (0, pg_core_1.varchar)("invited_user_id", { length: 36 }), // nullable, if this challenge was shared, who was challenged?
    subject: (0, pg_core_1.varchar)("subject", { length: 64 }).notNull(),
    questions: (0, pg_core_1.jsonb)("questions").$type().notNull(),
    difficulty: (0, pg_core_1.varchar)("difficulty", { length: 12 })
        .notNull()
        .default("medium")
        .$type(),
    status: (0, pg_core_1.varchar)("status", { length: 12 })
        .notNull()
        .default("pending")
        .$type(),
    score: (0, pg_core_1.integer)("score"), // 0-100, nullable until completed
    completedAt: (0, pg_core_1.timestamp)("completed_at", { withTimezone: true }),
    expiresAt: (0, pg_core_1.timestamp)("expires_at", { withTimezone: true }),
    loop: (0, pg_core_1.varchar)("loop", { length: 24 }), // viral loop that triggered this
    metadata: (0, pg_core_1.jsonb)("metadata").$type(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow(),
}, function (table) { return ({
    sessionIdIdx: (0, pg_core_1.index)("idx_challenges_session_id").on(table.sessionId),
    userIdIdx: (0, pg_core_1.index)("idx_challenges_user_id").on(table.userId),
    invitedUserIdIdx: (0, pg_core_1.index)("idx_challenges_invited_user_id").on(table.invitedUserId),
    statusIdx: (0, pg_core_1.index)("idx_challenges_status").on(table.status),
    subjectIdx: (0, pg_core_1.index)("idx_challenges_subject").on(table.subject),
}); });
