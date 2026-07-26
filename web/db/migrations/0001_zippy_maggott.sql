ALTER TABLE "users" ADD COLUMN "password_algo" varchar(20) DEFAULT 'legacy-sha256' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_argon2" text;