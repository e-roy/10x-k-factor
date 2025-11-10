import {
  pgTable,
  bigserial,
  varchar,
  text,
  integer,
  jsonb,
  timestamp,
  index,
  real,
  pgView,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import type { Persona } from "@/db/types";

// ============================================================================
// XP System Tables
// ============================================================================

/**
 * Immutable XP event log
 * Each row represents a discrete action that earned XP
 * Never update or delete - only insert
 */
export const xpEvents = pgTable(
  "xp_events",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    personaType: varchar("persona_type", { length: 12 })
      .notNull()
      .$type<Persona>(),
    eventType: text("event_type").notNull(), // e.g., 'challenge.completed'
    referenceId: text("reference_id"), // nullable - refers to challenge_id, smartlink_id, etc.
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    rawXp: integer("raw_xp").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userCreatedIdx: index("idx_xp_events_user_created").on(
      table.userId,
      table.createdAt
    ),
    eventTypeCreatedIdx: index("idx_xp_events_event_type_created").on(
      table.eventType,
      table.createdAt
    ),
    personaTypeIdx: index("idx_xp_events_persona_type").on(table.personaType),
    referenceIdIdx: index("idx_xp_events_reference_id").on(table.referenceId),
  })
);

/**
 * Dynamic XP weight multipliers
 * Update these to retroactively rebalance the XP economy
 * The view will recalculate all XP totals based on current weights
 */
export const xpWeights = pgTable(
  "xp_weights",
  {
    eventType: text("event_type").primaryKey(),
    multiplier: real("multiplier").notNull().default(1.0),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    updatedAtIdx: index("idx_xp_weights_updated_at").on(table.updatedAt),
  })
);

/**
 * Materialized view for efficient XP lookups
 * Calculates total XP per user using current weight multipliers
 * Recalculates on every query (regular view, not materialized)
 */
export const derivedUserXp = pgView("derived_user_xp").as((qb) =>
  qb
    .select({
      userId: xpEvents.userId,
      xp: sql<number>`CAST(SUM(${xpEvents.rawXp} * COALESCE(${xpWeights.multiplier}, 1)) AS INTEGER)`.as(
        "xp"
      ),
    })
    .from(xpEvents)
    .leftJoin(xpWeights, sql`${xpWeights.eventType} = ${xpEvents.eventType}`)
    .groupBy(xpEvents.userId)
);

/**
 * Per-persona XP view for agent buddy progression tracking
 */
export const derivedUserPersonaXp = pgView("derived_user_persona_xp").as(
  (qb) =>
    qb
      .select({
        userId: xpEvents.userId,
        personaType: xpEvents.personaType,
        xp: sql<number>`CAST(SUM(${xpEvents.rawXp} * COALESCE(${xpWeights.multiplier}, 1)) AS INTEGER)`.as(
          "xp"
        ),
      })
      .from(xpEvents)
      .leftJoin(
        xpWeights,
        sql`${xpWeights.eventType} = ${xpEvents.eventType}`
      )
      .groupBy(xpEvents.userId, xpEvents.personaType)
);

