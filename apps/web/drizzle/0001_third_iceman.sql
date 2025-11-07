ALTER TABLE "auth_users" ADD COLUMN "role" varchar(12);--> statement-breakpoint
ALTER TABLE "users_profiles" DROP COLUMN "role";