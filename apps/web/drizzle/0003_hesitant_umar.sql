CREATE TYPE "public"."inv_kind" AS ENUM('cosmetic', 'resource', 'artifact');--> statement-breakpoint
CREATE TABLE "agent_buddies" (
	"user_id" varchar(36) PRIMARY KEY NOT NULL,
	"archetype" varchar(32) DEFAULT 'wayfinder' NOT NULL,
	"appearance" jsonb,
	"state" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "buddy_inventories" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"kind" "inv_kind" NOT NULL,
	"item_key" varchar(64) NOT NULL,
	"label" varchar(128),
	"qty" integer DEFAULT 1 NOT NULL,
	"data" jsonb,
	"acq_event_id" varchar(36),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "buddy_messages" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"role" varchar(16) NOT NULL,
	"content" text NOT NULL,
	"meta" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "buddy_unlocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"unlock_key" varchar(64) NOT NULL,
	"criteria" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users_profiles" ADD COLUMN "personalization_theme" varchar(64);--> statement-breakpoint
CREATE INDEX "idx_buddy_inventories_user_id" ON "buddy_inventories" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_buddy_inventories_item_key" ON "buddy_inventories" USING btree ("item_key");--> statement-breakpoint
CREATE INDEX "idx_buddy_messages_user_id" ON "buddy_messages" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_buddy_messages_created_at" ON "buddy_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_buddy_unlocks_user_id" ON "buddy_unlocks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_buddy_unlocks_unlock_key" ON "buddy_unlocks" USING btree ("unlock_key");--> statement-breakpoint
ALTER TABLE "users_profiles" DROP COLUMN "image";