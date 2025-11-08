CREATE TABLE "xp_events" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"persona_type" varchar(12) NOT NULL,
	"event_type" text NOT NULL,
	"reference_id" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"raw_xp" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "xp_weights" (
	"event_type" text PRIMARY KEY NOT NULL,
	"multiplier" real DEFAULT 1 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_xp_events_user_created" ON "xp_events" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_xp_events_event_type_created" ON "xp_events" USING btree ("event_type","created_at");--> statement-breakpoint
CREATE INDEX "idx_xp_events_persona_type" ON "xp_events" USING btree ("persona_type");--> statement-breakpoint
CREATE INDEX "idx_xp_events_reference_id" ON "xp_events" USING btree ("reference_id");--> statement-breakpoint
CREATE INDEX "idx_xp_weights_updated_at" ON "xp_weights" USING btree ("updated_at");--> statement-breakpoint
CREATE VIEW "public"."derived_user_persona_xp" AS (select "xp_events"."user_id", "xp_events"."persona_type", CAST(SUM("xp_events"."raw_xp" * COALESCE("xp_weights"."multiplier", 1)) AS INTEGER) as "xp" from "xp_events" left join "xp_weights" on "xp_weights"."event_type" = "xp_events"."event_type" group by "xp_events"."user_id", "xp_events"."persona_type");--> statement-breakpoint
CREATE VIEW "public"."derived_user_xp" AS (select "xp_events"."user_id", CAST(SUM("xp_events"."raw_xp" * COALESCE("xp_weights"."multiplier", 1)) AS INTEGER) as "xp" from "xp_events" left join "xp_weights" on "xp_weights"."event_type" = "xp_events"."event_type" group by "xp_events"."user_id");