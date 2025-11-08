CREATE TABLE "guest_challenge_completions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"challenge_id" varchar(36) NOT NULL,
	"guest_session_id" varchar(64) NOT NULL,
	"score" integer NOT NULL,
	"answers" jsonb NOT NULL,
	"smart_link_code" varchar(12),
	"inviter_id" varchar(36),
	"converted" boolean DEFAULT false NOT NULL,
	"converted_user_id" varchar(36),
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"converted_at" timestamp with time zone,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"inviter_id" varchar(36) NOT NULL,
	"invitee_id" varchar(36) NOT NULL,
	"smart_link_code" varchar(12),
	"loop" varchar(24) NOT NULL,
	"invitee_completed_action" boolean DEFAULT false NOT NULL,
	"inviter_rewarded" boolean DEFAULT false NOT NULL,
	"invitee_rewarded" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"rewarded_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "invited_user_id" varchar(36);--> statement-breakpoint
CREATE INDEX "idx_guest_completions_challenge" ON "guest_challenge_completions" USING btree ("challenge_id");--> statement-breakpoint
CREATE INDEX "idx_guest_completions_session" ON "guest_challenge_completions" USING btree ("guest_session_id");--> statement-breakpoint
CREATE INDEX "idx_guest_completions_inviter" ON "guest_challenge_completions" USING btree ("inviter_id");--> statement-breakpoint
CREATE INDEX "idx_guest_completions_converted" ON "guest_challenge_completions" USING btree ("converted");--> statement-breakpoint
CREATE INDEX "idx_guest_completions_created_at" ON "guest_challenge_completions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_referrals_inviter" ON "referrals" USING btree ("inviter_id");--> statement-breakpoint
CREATE INDEX "idx_referrals_invitee" ON "referrals" USING btree ("invitee_id");--> statement-breakpoint
CREATE INDEX "idx_referrals_loop" ON "referrals" USING btree ("loop");--> statement-breakpoint
CREATE INDEX "idx_referrals_smart_link" ON "referrals" USING btree ("smart_link_code");--> statement-breakpoint
CREATE INDEX "idx_referrals_created_at" ON "referrals" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_challenges_invited_user_id" ON "challenges" USING btree ("invited_user_id");