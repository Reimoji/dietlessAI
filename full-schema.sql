-- Migration: 0000_soft_the_anarchist.sql
CREATE TABLE IF NOT EXISTS "activity_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"user_id" integer,
	"action" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"ip_address" varchar(45)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invitations" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" varchar(50) NOT NULL,
	"invited_by" integer NOT NULL,
	"invited_at" timestamp DEFAULT now() NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"team_id" integer NOT NULL,
	"role" varchar(50) NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"stripe_product_id" text,
	"plan_name" varchar(50),
	"subscription_status" varchar(20),
	CONSTRAINT "teams_stripe_customer_id_unique" UNIQUE("stripe_customer_id"),
	CONSTRAINT "teams_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100),
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"role" varchar(20) DEFAULT 'member' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invitations" ADD CONSTRAINT "invitations_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;


-- Migration: 0001_third_king_bedlam.sql
CREATE TABLE "chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"chat_id" integer NOT NULL,
	"content" text NOT NULL,
	"role" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chats" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

-- Migration: 0002_bored_donald_blake.sql
-- Modify the subscription_status column to accept the new values
ALTER TABLE teams 
ALTER COLUMN subscription_status 
TYPE VARCHAR(20);

-- If you're using PostgreSQL with enum types, you might need:
-- ALTER TYPE subscription_status_enum ADD VALUE IF NOT EXISTS 'incomplete';
-- ALTER TYPE subscription_status_enum ADD VALUE IF NOT EXISTS 'incomplete_expired';
-- ALTER TYPE subscription_status_enum ADD VALUE IF NOT EXISTS 'past_due';

-- Migration: 0003_update_subscription_status.sql
-- Modify the subscription_status column to accept the new values
ALTER TABLE teams 
ALTER COLUMN subscription_status 
TYPE VARCHAR(20);

-- No table creation, just column modification

-- Migration: 0004_natural_talkback.sql
CREATE TABLE "token_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"chat_id" integer NOT NULL,
	"message_id" integer NOT NULL,
	"input_tokens" integer NOT NULL,
	"output_tokens" integer NOT NULL,
	"total_tokens" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "token_usage" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"month" varchar(7) NOT NULL,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"total_tokens" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "teams" DROP CONSTRAINT "teams_stripe_customer_id_unique";--> statement-breakpoint
ALTER TABLE "teams" DROP CONSTRAINT "teams_stripe_subscription_id_unique";--> statement-breakpoint
ALTER TABLE "teams" ALTER COLUMN "stripe_customer_id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "teams" ALTER COLUMN "stripe_subscription_id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "teams" ALTER COLUMN "stripe_product_id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "teams" ALTER COLUMN "plan_name" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "token_logs" ADD CONSTRAINT "token_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "token_logs" ADD CONSTRAINT "token_logs_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "token_logs" ADD CONSTRAINT "token_logs_message_id_chat_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."chat_messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "token_usage" ADD CONSTRAINT "token_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

-- Migration: 0005_mature_hammerhead.sql
DROP TABLE "token_logs" CASCADE;

-- Migration: new_migration.sql
CREATE TABLE IF NOT EXISTS "chats" (
    "id" serial PRIMARY KEY NOT NULL,
    "user_id" integer NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "chats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id")
);

CREATE TABLE IF NOT EXISTS "chat_messages" (
    "id" serial PRIMARY KEY NOT NULL,
    "chat_id" integer NOT NULL,
    "content" text NOT NULL,
    "role" varchar(20) NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "chat_messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id")
);

CREATE INDEX IF NOT EXISTS "idx_chats_user_id" ON "chats"("user_id");
CREATE INDEX IF NOT EXISTS "idx_chat_messages_chat_id" ON "chat_messages"("chat_id");

