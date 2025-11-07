import {
  pgTable,
  bigserial,
  timestamp,
  text,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

// ============================================================================
// Events & Tracking Tables
// ============================================================================

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

