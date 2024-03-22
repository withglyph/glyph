-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
DO $$ BEGIN
 CREATE TYPE "_user_role" AS ENUM('ADMIN', 'USER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "_post_age_rating" AS ENUM('ALL', 'R15', 'R19');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "_post_pair" AS ENUM('BL', 'GL', 'HL', 'MULTIPLE', 'NONCP', 'OTHER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "_post_tag_kind" AS ENUM('TITLE', 'COUPLING', 'CHARACTER', 'TRIGGER', 'EXTRA');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "_user_single_sign_on_provider" AS ENUM('TWITTER', 'GOOGLE', 'NAVER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "_post_comment_qualification" AS ENUM('NONE', 'IDENTIFIED', 'ANY');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "_user_notification_state" AS ENUM('UNREAD', 'READ');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "_content_filter_action" AS ENUM('WARN', 'EXPOSE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "_payment_method" AS ENUM('CREDIT_CARD', 'BANK_ACCOUNT', 'VIRTUAL_BANK_ACCOUNT', 'PHONE_BILL', 'GIFTCARD_CULTURELAND', 'GIFTCARD_SMARTCULTURE', 'GIFTCARD_BOOKNLIFE', 'PAYPAL');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "_point_kind" AS ENUM('PAID', 'FREE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "_point_purchase_state" AS ENUM('PENDING', 'COMPLETED', 'FAILED', 'UNDONE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "_point_transaction_cause" AS ENUM('INTERNAL', 'PURCHASE', 'UNDO_PURCHASE', 'REFUND', 'EXPIRE', 'UNLOCK_CONTENT', 'PATRONIZE', 'EVENT_REWARD');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "_post_revision_kind" AS ENUM('AUTO_SAVE', 'MANUAL_SAVE', 'PUBLISHED', 'ARCHIVED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "_post_revision_content_kind" AS ENUM('ARTICLE', 'GALLERY');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "_post_state" AS ENUM('DRAFT', 'PUBLISHED', 'DELETED', 'EPHEMERAL');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "_post_visibility" AS ENUM('PUBLIC', 'SPACE', 'UNLISTED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "_preference_type" AS ENUM('FAVORITE', 'MUTE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "_space_collection_state" AS ENUM('ACTIVE', 'INACTIVE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "_space_member_invitation_state" AS ENUM('PENDING', 'ACCEPTED', 'IGNORED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "_space_member_role" AS ENUM('ADMIN', 'MEMBER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "_space_member_state" AS ENUM('ACTIVE', 'INACTIVE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "_space_state" AS ENUM('ACTIVE', 'INACTIVE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "_space_visibility" AS ENUM('PUBLIC', 'PRIVATE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "_user_email_verification_kind" AS ENUM('USER_LOGIN', 'USER_EMAIL_UPDATE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "_post_category" AS ENUM('ORIGINAL', 'FANFICTION', 'NONFICTION', 'OTHER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "_revenue_withdrawal_state" AS ENUM('PENDING', 'SUCCESS', 'FAILED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "_user_notification_category" AS ENUM('COMMENT', 'REPLY', 'SUBSCRIBE', 'TAG_EDIT', 'TREND', 'PURCHASE', 'DONATE', 'TAG_WIKI_EDIT', 'ALL');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "_user_notification_method" AS ENUM('EMAIL', 'WEBSITE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "_user_state" AS ENUM('ACTIVE', 'INACTIVE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "_content_filter_category" AS ENUM('ADULT', 'VIOLENCE', 'CRUELTY', 'HORROR', 'GAMBLING', 'TRAUMA', 'CRIME', 'PHOBIA', 'INSULT', 'GROSSNESS', 'OTHER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "_revenue_kind" AS ENUM('POST_PURCHASE', 'POST_PATRONAGE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "_revenue_state" AS ENUM('PENDING', 'INVOICED', 'PAID');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "_user_personal_identity_kind" AS ENUM('PHONE', 'PASSPORT');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "_post_comment_state" AS ENUM('ACTIVE', 'INACTIVE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "_post_comment_visibility" AS ENUM('PUBLIC', 'PRIVATE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "_revenue_withdrawal_kind" AS ENUM('INSTANT', 'MONTHLY');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "post_comments" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"user_id" text NOT NULL,
	"profile_id" text NOT NULL,
	"parent_id" text,
	"state" "_post_comment_state" NOT NULL,
	"visibility" "_post_comment_visibility" NOT NULL,
	"content" text NOT NULL,
	"pinned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "post_comment_likes" (
	"id" text PRIMARY KEY NOT NULL,
	"comment_id" text NOT NULL,
	"user_id" text NOT NULL,
	"profile_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "revenue_withdrawals" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"state" "_revenue_withdrawal_state" DEFAULT 'PENDING' NOT NULL,
	"bank_code" text NOT NULL,
	"bank_account_number" text NOT NULL,
	"paid_amount" integer NOT NULL,
	"tax_amount" integer NOT NULL,
	"tx_id" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"kind" "_revenue_withdrawal_kind" NOT NULL,
	"revenue_amount" integer NOT NULL,
	"service_fee_amount" integer NOT NULL,
	"tax_base_amount" integer NOT NULL,
	"total_fee_amount" integer NOT NULL,
	"withdrawal_fee_amount" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_withdrawal_configs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"monthly_withdrawal_enabled" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_settlement_identities" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"resident_registration_number_hash" text NOT NULL,
	"encrypted_resident_registration_number" text NOT NULL,
	"encrypted_resident_registration_number_nonce" text NOT NULL,
	"bank_code" text NOT NULL,
	"bank_account_number" text NOT NULL,
	"bank_account_holder_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"actor_id" text,
	"category" "_user_notification_category" NOT NULL,
	"state" "_user_notification_state" NOT NULL,
	"data" jsonb,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"checksum" varchar(64) NOT NULL,
	"finished_at" timestamp with time zone,
	"migration_name" varchar(255) NOT NULL,
	"logs" text,
	"rolled_back_at" timestamp with time zone,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"applied_steps_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "embeds" (
	"id" text PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"title" text,
	"description" text,
	"html" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"thumbnail_url" text,
	"type" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "provisioned_users" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"email" text NOT NULL,
	"provider" "_user_single_sign_on_provider",
	"principal" text,
	"name" text,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "post_tags" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"tag_id" text NOT NULL,
	"kind" "_post_tag_kind" NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bookmarks" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bookmark_posts" (
	"id" text PRIMARY KEY NOT NULL,
	"bookmark_id" text NOT NULL,
	"post_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"profile_id" text NOT NULL,
	"state" "_user_state" NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"role" "_user_role" DEFAULT 'USER' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "files" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"format" text NOT NULL,
	"size" integer NOT NULL,
	"path" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "images" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"name" text NOT NULL,
	"format" text NOT NULL,
	"size" integer NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"path" text NOT NULL,
	"color" text NOT NULL,
	"placeholder" text NOT NULL,
	"hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "point_balances" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"purchase_id" text,
	"kind" "_point_kind" NOT NULL,
	"initial" integer NOT NULL,
	"leftover" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "point_purchases" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"point_amount" integer NOT NULL,
	"payment_amount" integer NOT NULL,
	"payment_method" "_payment_method" NOT NULL,
	"payment_key" text NOT NULL,
	"payment_data" jsonb NOT NULL,
	"payment_result" jsonb,
	"state" "_point_purchase_state" NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "point_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"cause" "_point_transaction_cause" NOT NULL,
	"amount" integer NOT NULL,
	"target_id" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "spaces" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon_id" text NOT NULL,
	"visibility" "_space_visibility" NOT NULL,
	"state" "_space_state" NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "space_members" (
	"id" text PRIMARY KEY NOT NULL,
	"space_id" text NOT NULL,
	"user_id" text NOT NULL,
	"profile_id" text NOT NULL,
	"state" "_space_member_state" NOT NULL,
	"role" "_space_member_role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "post_likes" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "post_reactions" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"user_id" text NOT NULL,
	"emoji" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "post_revision_contents" (
	"id" text PRIMARY KEY NOT NULL,
	"hash" text NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tags" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "post_views" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"user_id" text,
	"device_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"viewed_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"avatar_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "space_collections" (
	"id" text PRIMARY KEY NOT NULL,
	"space_id" text NOT NULL,
	"thumbnail_id" text,
	"name" text NOT NULL,
	"state" "_space_collection_state" NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "space_collection_posts" (
	"id" text PRIMARY KEY NOT NULL,
	"collection_id" text NOT NULL,
	"post_id" text NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "post_purchases" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"revision_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"point_amount" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "post_revisions" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"user_id" text NOT NULL,
	"free_content_id" text,
	"paid_content_id" text,
	"price" integer,
	"kind" "_post_revision_kind" NOT NULL,
	"title" text,
	"subtitle" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"paragraph_indent" integer DEFAULT 100 NOT NULL,
	"paragraph_spacing" integer DEFAULT 100 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "space_external_links" (
	"id" text PRIMARY KEY NOT NULL,
	"space_id" text NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "space_follows" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"space_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "space_user_blocks" (
	"id" text PRIMARY KEY NOT NULL,
	"space_id" text NOT NULL,
	"user_id" text NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "space_member_invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"space_id" text NOT NULL,
	"sent_user_id" text NOT NULL,
	"received_user_id" text,
	"received_email" text NOT NULL,
	"role" "_space_member_role" NOT NULL,
	"state" "_space_member_invitation_state" NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"responded_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tag_follows" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"tag_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tag_hierarchies" (
	"id" text PRIMARY KEY NOT NULL,
	"parent_tag_id" text NOT NULL,
	"child_tag_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tag_wikis" (
	"id" text PRIMARY KEY NOT NULL,
	"tag_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tag_wiki_revisions" (
	"id" text PRIMARY KEY NOT NULL,
	"tag_wiki_id" text NOT NULL,
	"user_id" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_email_verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"email" text NOT NULL,
	"token" text NOT NULL,
	"code" text,
	"kind" "_user_email_verification_kind" NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_marketing_consents" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_notification_preferences" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"category" "_user_notification_category" NOT NULL,
	"method" "_user_notification_method" NOT NULL,
	"opted" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_single_sign_ons" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"provider" "_user_single_sign_on_provider" NOT NULL,
	"principal" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_space_mutes" (
	"id" text PRIMARY KEY NOT NULL,
	"space_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_tag_mute" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"tag_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_event_enrollments" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"event_code" text NOT NULL,
	"eligible" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"rewarded_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "space_masquerades" (
	"id" text PRIMARY KEY NOT NULL,
	"space_id" text NOT NULL,
	"user_id" text NOT NULL,
	"profile_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"blocked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "posts" (
	"id" text PRIMARY KEY NOT NULL,
	"permalink" text NOT NULL,
	"space_id" text,
	"member_id" text,
	"user_id" text NOT NULL,
	"published_revision_id" text,
	"state" "_post_state" NOT NULL,
	"visibility" "_post_visibility" NOT NULL,
	"disclose_stats" boolean NOT NULL,
	"receive_feedback" boolean NOT NULL,
	"receive_patronage" boolean NOT NULL,
	"receive_tag_contribution" boolean NOT NULL,
	"password" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"published_at" timestamp with time zone,
	"protect_content" boolean DEFAULT true NOT NULL,
	"age_rating" "_post_age_rating" DEFAULT 'ALL' NOT NULL,
	"external_searchable" boolean DEFAULT true NOT NULL,
	"pairs" _post_pair[] DEFAULT 'RRAY[',
	"thumbnail_id" text,
	"category" "_post_category" DEFAULT 'OTHER' NOT NULL,
	"comment_qualification" "_post_comment_qualification" DEFAULT 'ANY' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_content_filter_preferences" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"action" "_content_filter_action" NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"category" "_content_filter_category" NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "revenues" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"target_id" text,
	"state" "_revenue_state" NOT NULL,
	"kind" "_revenue_kind" NOT NULL,
	"amount" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"withdrawal_id" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_personal_identities" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"birthday" timestamp with time zone NOT NULL,
	"phone_number" text,
	"ci" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"kind" "_user_personal_identity_kind" DEFAULT 'PHONE' NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "post_comments_post_id_created_at_idx" ON "post_comments" ("post_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "post_comment_likes_comment_id_user_id_key" ON "post_comment_likes" ("comment_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_withdrawal_configs_user_id_key" ON "user_withdrawal_configs" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_settlement_identities_user_id_key" ON "user_settlement_identities" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_settlement_identities_resident_registration_number_has_key" ON "user_settlement_identities" ("resident_registration_number_hash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_notifications_created_at_idx" ON "user_notifications" ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "embeds_url_key" ON "embeds" ("url");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "provisioned_users_token_key" ON "provisioned_users" ("token");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "post_tags_post_id_tag_id_kind_key" ON "post_tags" ("post_id","tag_id","kind");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "bookmark_posts_bookmark_id_post_id_key" ON "bookmark_posts" ("bookmark_id","post_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_profile_id_key" ON "users" ("profile_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_email_state_idx" ON "users" ("email","state");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "point_balances_user_id_kind_created_at_idx" ON "point_balances" ("user_id","kind","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "point_purchases_payment_key_key" ON "point_purchases" ("payment_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "spaces_slug_state_idx" ON "spaces" ("slug","state");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "space_members_space_id_user_id_key" ON "space_members" ("space_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "post_likes_post_id_user_id_key" ON "post_likes" ("post_id","user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "post_reactions_created_at_idx" ON "post_reactions" ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "post_reactions_post_id_user_id_emoji_key" ON "post_reactions" ("post_id","user_id","emoji");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "post_revision_contents_hash_key" ON "post_revision_contents" ("hash");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "tags_name_key" ON "tags" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tags_created_at_idx" ON "tags" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "post_views_viewed_at_idx" ON "post_views" ("viewed_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "post_views_user_id_post_id_key" ON "post_views" ("post_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "space_collection_posts_post_id_key" ON "space_collection_posts" ("post_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "space_collection_posts_collection_id_order_key" ON "space_collection_posts" ("collection_id","order");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "post_purchases_post_id_user_id_key" ON "post_purchases" ("post_id","user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "post_revisions_created_at_idx" ON "post_revisions" ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "space_follows_user_id_space_id_key" ON "space_follows" ("user_id","space_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "tag_follows_user_id_tag_id_key" ON "tag_follows" ("user_id","tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "tag_hierarchies_parent_tag_id_key" ON "tag_hierarchies" ("parent_tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "tag_hierarchies_child_tag_id_key" ON "tag_hierarchies" ("child_tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "tag_wikis_tag_id_key" ON "tag_wikis" ("tag_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tag_wiki_revisions_created_at_idx" ON "tag_wiki_revisions" ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_email_verifications_token_key" ON "user_email_verifications" ("token");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_marketing_consents_user_id_key" ON "user_marketing_consents" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_notification_preferences_user_id_category_method_key" ON "user_notification_preferences" ("user_id","category","method");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_single_sign_ons_user_id_provider_key" ON "user_single_sign_ons" ("user_id","provider");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_single_sign_ons_provider_principal_key" ON "user_single_sign_ons" ("provider","principal");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_space_mutes_user_id_space_id_key" ON "user_space_mutes" ("space_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_tag_mute_user_id_tag_id_key" ON "user_tag_mute" ("user_id","tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_event_enrollments_user_id_event_code_key" ON "user_event_enrollments" ("user_id","event_code");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "space_masquerades_space_id_user_id_key" ON "space_masquerades" ("space_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "space_masquerades_profile_id_key" ON "space_masquerades" ("profile_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "posts_permalink_key" ON "posts" ("permalink");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "posts_published_at_idx" ON "posts" ("published_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_content_filter_preferences_user_id_category_key" ON "user_content_filter_preferences" ("user_id","category");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_personal_identities_user_id_key" ON "user_personal_identities" ("user_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."post_comments"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_comment_likes" ADD CONSTRAINT "post_comment_likes_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "public"."post_comments"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_comment_likes" ADD CONSTRAINT "post_comment_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_comment_likes" ADD CONSTRAINT "post_comment_likes_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "revenue_withdrawals" ADD CONSTRAINT "revenue_withdrawals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_withdrawal_configs" ADD CONSTRAINT "user_withdrawal_configs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_settlement_identities" ADD CONSTRAINT "user_settlement_identities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bookmark_posts" ADD CONSTRAINT "bookmark_posts_bookmark_id_fkey" FOREIGN KEY ("bookmark_id") REFERENCES "public"."bookmarks"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bookmark_posts" ADD CONSTRAINT "bookmark_posts_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "files" ADD CONSTRAINT "files_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "images" ADD CONSTRAINT "images_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "point_balances" ADD CONSTRAINT "point_balances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "point_balances" ADD CONSTRAINT "point_balances_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "public"."point_purchases"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "point_purchases" ADD CONSTRAINT "point_purchases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "spaces" ADD CONSTRAINT "spaces_icon_id_fkey" FOREIGN KEY ("icon_id") REFERENCES "public"."images"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "space_members" ADD CONSTRAINT "space_members_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "space_members" ADD CONSTRAINT "space_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "space_members" ADD CONSTRAINT "space_members_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_views" ADD CONSTRAINT "post_views_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_views" ADD CONSTRAINT "post_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profiles" ADD CONSTRAINT "profiles_avatar_id_fkey" FOREIGN KEY ("avatar_id") REFERENCES "public"."images"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "space_collections" ADD CONSTRAINT "space_collections_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "space_collections" ADD CONSTRAINT "space_collections_thumbnail_id_fkey" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "space_collection_posts" ADD CONSTRAINT "space_collection_posts_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "public"."space_collections"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "space_collection_posts" ADD CONSTRAINT "space_collection_posts_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_purchases" ADD CONSTRAINT "post_purchases_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_purchases" ADD CONSTRAINT "post_purchases_revision_id_fkey" FOREIGN KEY ("revision_id") REFERENCES "public"."post_revisions"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_purchases" ADD CONSTRAINT "post_purchases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_revisions" ADD CONSTRAINT "post_revisions_paid_content_id_fkey" FOREIGN KEY ("paid_content_id") REFERENCES "public"."post_revision_contents"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_revisions" ADD CONSTRAINT "post_revisions_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_revisions" ADD CONSTRAINT "post_revisions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_revisions" ADD CONSTRAINT "post_revisions_free_content_id_fkey" FOREIGN KEY ("free_content_id") REFERENCES "public"."post_revision_contents"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "space_external_links" ADD CONSTRAINT "space_external_links_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "space_follows" ADD CONSTRAINT "space_follows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "space_follows" ADD CONSTRAINT "space_follows_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "space_user_blocks" ADD CONSTRAINT "space_user_blocks_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "space_user_blocks" ADD CONSTRAINT "space_user_blocks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "space_member_invitations" ADD CONSTRAINT "space_member_invitations_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "space_member_invitations" ADD CONSTRAINT "space_member_invitations_sent_user_id_fkey" FOREIGN KEY ("sent_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "space_member_invitations" ADD CONSTRAINT "space_member_invitations_received_user_id_fkey" FOREIGN KEY ("received_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tag_follows" ADD CONSTRAINT "tag_follows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tag_follows" ADD CONSTRAINT "tag_follows_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tag_hierarchies" ADD CONSTRAINT "tag_hierarchies_parent_tag_id_fkey" FOREIGN KEY ("parent_tag_id") REFERENCES "public"."tags"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tag_hierarchies" ADD CONSTRAINT "tag_hierarchies_child_tag_id_fkey" FOREIGN KEY ("child_tag_id") REFERENCES "public"."tags"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tag_wikis" ADD CONSTRAINT "tag_wikis_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tag_wiki_revisions" ADD CONSTRAINT "tag_wiki_revisions_tag_wiki_id_fkey" FOREIGN KEY ("tag_wiki_id") REFERENCES "public"."tag_wikis"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tag_wiki_revisions" ADD CONSTRAINT "tag_wiki_revisions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_email_verifications" ADD CONSTRAINT "user_email_verifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_marketing_consents" ADD CONSTRAINT "user_marketing_consents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_notification_preferences" ADD CONSTRAINT "user_notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_single_sign_ons" ADD CONSTRAINT "user_single_sign_ons_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_space_mutes" ADD CONSTRAINT "user_space_mutes_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_space_mutes" ADD CONSTRAINT "user_space_mutes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_tag_mute" ADD CONSTRAINT "user_tag_mute_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_tag_mute" ADD CONSTRAINT "user_tag_mute_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_event_enrollments" ADD CONSTRAINT "user_event_enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "space_masquerades" ADD CONSTRAINT "space_masquerades_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "space_masquerades" ADD CONSTRAINT "space_masquerades_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "space_masquerades" ADD CONSTRAINT "space_masquerades_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "posts" ADD CONSTRAINT "posts_thumbnail_id_fkey" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "posts" ADD CONSTRAINT "posts_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "posts" ADD CONSTRAINT "posts_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."space_members"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "posts" ADD CONSTRAINT "posts_published_revision_id_fkey" FOREIGN KEY ("published_revision_id") REFERENCES "public"."post_revisions"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_content_filter_preferences" ADD CONSTRAINT "user_content_filter_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "revenues" ADD CONSTRAINT "revenues_withdrawal_id_fkey" FOREIGN KEY ("withdrawal_id") REFERENCES "public"."revenue_withdrawals"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "revenues" ADD CONSTRAINT "revenues_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_personal_identities" ADD CONSTRAINT "user_personal_identities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

*/