CREATE TABLE IF NOT EXISTS "redeem_code_redemptions" (
	"id" text PRIMARY KEY NOT NULL,
	"code_id" text NOT NULL,
	"purchase_id" text NOT NULL,
	"used_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "redeem_codes" DROP CONSTRAINT "redeem_codes_purchase_id_post_purchases_id_fk";

ALTER TABLE "redeem_code_groups" ADD COLUMN "space_id" text NOT NULL;
ALTER TABLE "redeem_code_groups" ADD COLUMN "member_id" text NOT NULL;
DO $$ BEGIN
 ALTER TABLE "redeem_code_redemptions" ADD CONSTRAINT "redeem_code_redemptions_code_id_redeem_codes_id_fk" FOREIGN KEY ("code_id") REFERENCES "public"."redeem_codes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "redeem_code_redemptions" ADD CONSTRAINT "redeem_code_redemptions_purchase_id_post_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."post_purchases"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "redeem_code_groups" ADD CONSTRAINT "redeem_code_groups_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "redeem_code_groups" ADD CONSTRAINT "redeem_code_groups_member_id_space_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."space_members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "redeem_codes" DROP COLUMN IF EXISTS "purchase_id";
ALTER TABLE "redeem_codes" DROP COLUMN IF EXISTS "used_at";