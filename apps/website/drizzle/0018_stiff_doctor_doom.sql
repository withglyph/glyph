DO $$ BEGIN
 CREATE TYPE "public"."_redeem_code_group_state" AS ENUM('ACTIVE', 'INACTIVE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."_redeem_code_state" AS ENUM('AVAILABLE', 'USED', 'EXPIRED', 'REVOKED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "redeem_code_groups" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"post_id" text NOT NULL,
	"state" "_redeem_code_group_state" NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);

CREATE TABLE IF NOT EXISTS "redeem_codes" (
	"id" text PRIMARY KEY NOT NULL,
	"group_id" text NOT NULL,
	"purchase_id" text,
	"state" "_redeem_code_state" NOT NULL,
	"code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"used_at" timestamp with time zone,
	CONSTRAINT "redeem_codes_code_unique" UNIQUE("code")
);

DO $$ BEGIN
 ALTER TABLE "redeem_code_groups" ADD CONSTRAINT "redeem_code_groups_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "redeem_code_groups" ADD CONSTRAINT "redeem_code_groups_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "redeem_codes" ADD CONSTRAINT "redeem_codes_group_id_redeem_code_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."redeem_code_groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "redeem_codes" ADD CONSTRAINT "redeem_codes_purchase_id_post_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."post_purchases"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
