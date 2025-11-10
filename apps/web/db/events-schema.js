"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.events = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
// ============================================================================
// Events & Tracking Tables
// ============================================================================
exports.events = (0, pg_core_1.pgTable)("events", {
    id: (0, pg_core_1.bigserial)("id", { mode: "number" }).primaryKey(),
    ts: (0, pg_core_1.timestamp)("ts", { withTimezone: true }).defaultNow().notNull(),
    userId: (0, pg_core_1.text)("user_id"),
    anonId: (0, pg_core_1.text)("anon_id"),
    loop: (0, pg_core_1.text)("loop"), // buddy_challenge, results_rally, etc.
    name: (0, pg_core_1.text)("name").notNull(), // invite.sent, invite.opened, invite.joined, invite.fvm, reward.granted
    props: (0, pg_core_1.jsonb)("props").$type().default({}),
}, function (table) { return ({
    nameTsIdx: (0, pg_core_1.index)("idx_events_name_ts").on(table.name, table.ts),
    loopTsIdx: (0, pg_core_1.index)("idx_events_loop_ts").on(table.loop, table.ts),
    userIdx: (0, pg_core_1.index)("idx_events_user").on(table.userId),
    propsGinIdx: (0, pg_core_1.index)("idx_events_props_gin").using("gin", table.props),
}); });
