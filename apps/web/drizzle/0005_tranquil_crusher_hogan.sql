CREATE TABLE "subjects" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"slug" varchar(128) NOT NULL,
	"description" text,
	"icon" varchar(64),
	"color" varchar(7),
	"category" varchar(64),
	"grade_level" varchar(32),
	"active" boolean DEFAULT true NOT NULL,
	"enrollment_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subjects_name_unique" UNIQUE("name"),
	CONSTRAINT "subjects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_subjects" (
	"user_id" varchar(36) NOT NULL,
	"subject_id" varchar(36) NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"sessions_completed" integer DEFAULT 0 NOT NULL,
	"total_xp" integer DEFAULT 0 NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"longest_streak" integer DEFAULT 0 NOT NULL,
	"last_activity_at" timestamp with time zone,
	"enrolled_at" timestamp with time zone DEFAULT now() NOT NULL,
	"favorite" boolean DEFAULT false NOT NULL,
	"notifications_enabled" boolean DEFAULT true NOT NULL,
	CONSTRAINT "user_subjects_user_id_subject_id_pk" PRIMARY KEY("user_id","subject_id")
);
--> statement-breakpoint
ALTER TABLE "user_subjects" ADD CONSTRAINT "user_subjects_user_id_auth_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subjects" ADD CONSTRAINT "user_subjects_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_subjects_name" ON "subjects" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_subjects_slug" ON "subjects" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_subjects_active" ON "subjects" USING btree ("active");--> statement-breakpoint
CREATE INDEX "idx_subjects_category" ON "subjects" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_user_subjects_user" ON "user_subjects" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_subjects_subject" ON "user_subjects" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "idx_user_subjects_progress" ON "user_subjects" USING btree ("progress");--> statement-breakpoint
CREATE INDEX "idx_user_subjects_last_activity" ON "user_subjects" USING btree ("last_activity_at");--> statement-breakpoint
CREATE INDEX "idx_user_subjects_favorite" ON "user_subjects" USING btree ("favorite");