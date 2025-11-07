CREATE TABLE "auth_accounts" (
	"user_id" varchar(36) NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "auth_accounts_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "auth_sessions" (
	"session_token" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_users" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255),
	"password" varchar(255),
	"email_verified" timestamp with time zone,
	"image" varchar(255),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "auth_verification_tokens" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "auth_verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "users_profiles" (
	"user_id" varchar(36) PRIMARY KEY NOT NULL,
	"image" varchar(255),
	"persona" varchar(12) DEFAULT 'student' NOT NULL,
	"role" varchar(12),
	"minor" boolean DEFAULT false,
	"guardian_id" varchar(36),
	"onboarding_completed" boolean DEFAULT false,
	"primary_color" varchar(7),
	"secondary_color" varchar(7),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cohorts" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"subject" varchar(64),
	"created_by" varchar(36) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "smart_links" (
	"code" varchar(12) PRIMARY KEY NOT NULL,
	"inviter_id" varchar(36) NOT NULL,
	"loop" varchar(24) NOT NULL,
	"params" jsonb,
	"sig" varchar(128) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "challenges" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"session_id" varchar(36),
	"user_id" varchar(36) NOT NULL,
	"subject" varchar(64) NOT NULL,
	"questions" jsonb NOT NULL,
	"difficulty" varchar(12) DEFAULT 'medium' NOT NULL,
	"status" varchar(12) DEFAULT 'pending' NOT NULL,
	"score" integer,
	"completed_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"loop" varchar(24),
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "results" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"subject" varchar(64),
	"score" integer,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tutor_sessions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"student_id" varchar(36) NOT NULL,
	"tutor_id" varchar(36),
	"subject" varchar(64) NOT NULL,
	"transcript" text NOT NULL,
	"summary" text NOT NULL,
	"tutor_notes" text,
	"student_notes" text,
	"duration" integer,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"ts" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" text,
	"anon_id" text,
	"loop" text,
	"name" text NOT NULL,
	"props" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "ledger_entries" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"reward_id" varchar(36),
	"user_id" varchar(36) NOT NULL,
	"type" varchar(24) NOT NULL,
	"unit_cost_cents" integer NOT NULL,
	"quantity" integer NOT NULL,
	"total_cost_cents" integer NOT NULL,
	"loop" varchar(24),
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rewards" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"type" varchar(24) NOT NULL,
	"amount" integer,
	"loop" varchar(24),
	"dedupe_key" varchar(255) NOT NULL,
	"status" varchar(12) DEFAULT 'pending' NOT NULL,
	"denied_reason" text,
	"granted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "rewards_dedupe_key_unique" UNIQUE("dedupe_key")
);
--> statement-breakpoint
ALTER TABLE "auth_accounts" ADD CONSTRAINT "auth_accounts_user_id_auth_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_auth_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_profiles" ADD CONSTRAINT "users_profiles_user_id_auth_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_auth_accounts_user_id" ON "auth_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_auth_sessions_user_id" ON "auth_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_challenges_session_id" ON "challenges" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_challenges_user_id" ON "challenges" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_challenges_status" ON "challenges" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_challenges_subject" ON "challenges" USING btree ("subject");--> statement-breakpoint
CREATE INDEX "idx_tutor_sessions_student_id" ON "tutor_sessions" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "idx_tutor_sessions_tutor_id" ON "tutor_sessions" USING btree ("tutor_id");--> statement-breakpoint
CREATE INDEX "idx_tutor_sessions_subject" ON "tutor_sessions" USING btree ("subject");--> statement-breakpoint
CREATE INDEX "idx_tutor_sessions_created_at" ON "tutor_sessions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_events_name_ts" ON "events" USING btree ("name","ts");--> statement-breakpoint
CREATE INDEX "idx_events_loop_ts" ON "events" USING btree ("loop","ts");--> statement-breakpoint
CREATE INDEX "idx_events_user" ON "events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_events_props_gin" ON "events" USING gin ("props");--> statement-breakpoint
CREATE INDEX "idx_ledger_entries_user_id" ON "ledger_entries" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_ledger_entries_reward_id" ON "ledger_entries" USING btree ("reward_id");--> statement-breakpoint
CREATE INDEX "idx_ledger_entries_type" ON "ledger_entries" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_ledger_entries_created_at" ON "ledger_entries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_rewards_dedupe_key" ON "rewards" USING btree ("dedupe_key");--> statement-breakpoint
CREATE INDEX "idx_rewards_user_id" ON "rewards" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_rewards_status" ON "rewards" USING btree ("status");