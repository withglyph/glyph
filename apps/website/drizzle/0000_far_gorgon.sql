DO $$ BEGIN
 CREATE TYPE "_content_filter_action" AS ENUM('EXPOSE', 'WARN');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "_content_filter_category" AS ENUM('ADULT', 'CRIME', 'CRUELTY', 'GAMBLING', 'GROSSNESS', 'HORROR', 'INSULT', 'OTHER', 'PHOBIA', 'TRAUMA', 'VIOLENCE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "_payment_method" AS ENUM('BANK_ACCOUNT', 'CREDIT_CARD', 'GIFTCARD_BOOKNLIFE', 'GIFTCARD_CULTURELAND', 'GIFTCARD_SMARTCULTURE', 'PAYPAL', 'PHONE_BILL', 'VIRTUAL_BANK_ACCOUNT');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "_point_kind" AS ENUM('FREE', 'PAID');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "_point_purchase_state" AS ENUM('COMPLETED', 'FAILED', 'PENDING', 'UNDONE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "_point_transaction_cause" AS ENUM('EVENT_REWARD', 'EXPIRE', 'INTERNAL', 'PATRONIZE', 'PURCHASE', 'REFUND', 'UNDO_PURCHASE', 'UNLOCK_CONTENT');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "_post_age_rating" AS ENUM('ALL', 'R15', 'R19');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "_post_category" AS ENUM('FANFICTION', 'NONFICTION', 'ORIGINAL', 'OTHER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "_post_comment_qualification" AS ENUM('ANY', 'IDENTIFIED', 'NONE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "_post_comment_state" AS ENUM('ACTIVE', 'INACTIVE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "_post_comment_visibility" AS ENUM('PRIVATE', 'PUBLIC');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "_post_pair" AS ENUM('BL', 'GL', 'HL', 'MULTIPLE', 'NONCP', 'OTHER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "_post_revision_content_kind" AS ENUM('ARTICLE', 'GALLERY');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "_post_revision_kind" AS ENUM('ARCHIVED', 'AUTO_SAVE', 'MANUAL_SAVE', 'PUBLISHED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "_post_state" AS ENUM('DELETED', 'DRAFT', 'EPHEMERAL', 'PUBLISHED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "_post_tag_kind" AS ENUM('CHARACTER', 'COUPLING', 'EXTRA', 'TITLE', 'TRIGGER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "_post_visibility" AS ENUM('PUBLIC', 'SPACE', 'UNLISTED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "_preference_type" AS ENUM('FAVORITE', 'MUTE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "_revenue_kind" AS ENUM('POST_PATRONAGE', 'POST_PURCHASE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "_revenue_state" AS ENUM('INVOICED', 'PAID', 'PENDING');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "_revenue_withdrawal_kind" AS ENUM('INSTANT', 'MONTHLY');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "_revenue_withdrawal_state" AS ENUM('FAILED', 'PENDING', 'SUCCESS');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "_space_collection_state" AS ENUM('ACTIVE', 'INACTIVE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "_space_member_invitation_state" AS ENUM('ACCEPTED', 'IGNORED', 'PENDING');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "_space_member_role" AS ENUM('ADMIN', 'MEMBER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "_space_member_state" AS ENUM('ACTIVE', 'INACTIVE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "_space_state" AS ENUM('ACTIVE', 'INACTIVE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "_space_visibility" AS ENUM('PRIVATE', 'PUBLIC');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "_user_email_verification_kind" AS ENUM('USER_EMAIL_UPDATE', 'USER_LOGIN');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "_user_notification_category" AS ENUM('ALL', 'COMMENT', 'DONATE', 'PURCHASE', 'REPLY', 'SUBSCRIBE', 'TAG_EDIT', 'TAG_WIKI_EDIT', 'TREND');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "_user_notification_method" AS ENUM('EMAIL', 'WEBSITE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "_user_notification_state" AS ENUM('READ', 'UNREAD');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "_user_personal_identity_kind" AS ENUM('PASSPORT', 'PHONE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "_user_role" AS ENUM('ADMIN', 'USER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "_user_single_sign_on_provider" AS ENUM('GOOGLE', 'NAVER', 'TWITTER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "_user_state" AS ENUM('ACTIVE', 'INACTIVE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "bookmark_posts" (
	"id" text PRIMARY KEY NOT NULL,
	"bookmark_id" text NOT NULL,
	"post_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "bookmarks" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "curation_posts" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "embeds" (
	"id" text PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"type" text NOT NULL,
	"title" text,
	"description" text,
	"html" text,
	"thumbnail_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "embeds_url_unique" UNIQUE("url")
);

CREATE TABLE IF NOT EXISTS "files" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"format" text NOT NULL,
	"size" integer NOT NULL,
	"path" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

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
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "point_balances" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"purchase_id" text,
	"kind" "_point_kind" NOT NULL,
	"initial" integer NOT NULL,
	"leftover" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);

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
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "point_purchases_payment_key_unique" UNIQUE("payment_key")
);

CREATE TABLE IF NOT EXISTS "point_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"cause" "_point_transaction_cause" NOT NULL,
	"amount" integer NOT NULL,
	"target_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "post_comment_likes" (
	"id" text PRIMARY KEY NOT NULL,
	"comment_id" text NOT NULL,
	"user_id" text NOT NULL,
	"profile_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

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
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "post_likes" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "post_purchases" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"revision_id" text NOT NULL,
	"user_id" text NOT NULL,
	"point_amount" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "post_reactions" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"user_id" text NOT NULL,
	"emoji" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "post_revision_contents" (
	"id" text PRIMARY KEY NOT NULL,
	"hash" text NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "post_revision_contents_hash_unique" UNIQUE("hash")
);

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
	"paragraph_indent" integer DEFAULT 100 NOT NULL,
	"paragraph_spacing" integer DEFAULT 100 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "post_tags" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"tag_id" text NOT NULL,
	"kind" "_post_tag_kind" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "post_views" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"user_id" text,
	"device_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"viewed_at" timestamp with time zone DEFAULT now() NOT NULL
);

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
	"protect_content" boolean DEFAULT true NOT NULL,
	"age_rating" "_post_age_rating" DEFAULT 'ALL' NOT NULL,
	"external_searchable" boolean DEFAULT true NOT NULL,
	"pairs" _post_pair[] DEFAULT '{}' NOT NULL,
	"category" "_post_category" DEFAULT 'OTHER' NOT NULL,
	"comment_qualification" "_post_comment_qualification" DEFAULT 'ANY' NOT NULL,
	"thumbnail_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone,
	CONSTRAINT "posts_permalink_unique" UNIQUE("permalink")
);

CREATE TABLE IF NOT EXISTS "profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"avatar_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "provisioned_users" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"email" text NOT NULL,
	"provider" "_user_single_sign_on_provider",
	"principal" text,
	"name" text,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "provisioned_users_token_unique" UNIQUE("token")
);

CREATE TABLE IF NOT EXISTS "revenue_withdrawals" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"bank_code" text NOT NULL,
	"bank_account_number" text NOT NULL,
	"revenue_amount" integer NOT NULL,
	"tax_base_amount" integer NOT NULL,
	"tax_amount" integer NOT NULL,
	"service_fee_amount" integer NOT NULL,
	"withdrawal_fee_amount" integer NOT NULL,
	"total_fee_amount" integer NOT NULL,
	"paid_amount" integer NOT NULL,
	"tx_id" text,
	"kind" "_revenue_withdrawal_kind" NOT NULL,
	"state" "_revenue_withdrawal_state" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "revenues" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"target_id" text,
	"state" "_revenue_state" NOT NULL,
	"kind" "_revenue_kind" NOT NULL,
	"amount" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"withdrawal_id" text
);

CREATE TABLE IF NOT EXISTS "space_collection_posts" (
	"id" text PRIMARY KEY NOT NULL,
	"collection_id" text NOT NULL,
	"post_id" text NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "space_collection_posts_post_id_unique" UNIQUE("post_id")
);

CREATE TABLE IF NOT EXISTS "space_collections" (
	"id" text PRIMARY KEY NOT NULL,
	"space_id" text NOT NULL,
	"thumbnail_id" text,
	"name" text NOT NULL,
	"state" "_space_collection_state" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "space_external_links" (
	"id" text PRIMARY KEY NOT NULL,
	"space_id" text NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "space_follows" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"space_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "space_masquerades" (
	"id" text PRIMARY KEY NOT NULL,
	"space_id" text NOT NULL,
	"user_id" text NOT NULL,
	"profile_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"blocked_at" timestamp with time zone,
	CONSTRAINT "space_masquerades_profile_id_unique" UNIQUE("profile_id")
);

CREATE TABLE IF NOT EXISTS "space_member_invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"space_id" text NOT NULL,
	"sent_user_id" text NOT NULL,
	"received_user_id" text,
	"received_email" text NOT NULL,
	"role" "_space_member_role" NOT NULL,
	"state" "_space_member_invitation_state" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"responded_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "space_members" (
	"id" text PRIMARY KEY NOT NULL,
	"space_id" text NOT NULL,
	"user_id" text NOT NULL,
	"profile_id" text NOT NULL,
	"state" "_space_member_state" NOT NULL,
	"role" "_space_member_role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "space_user_blocks" (
	"id" text PRIMARY KEY NOT NULL,
	"space_id" text NOT NULL,
	"user_id" text NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "spaces" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon_id" text NOT NULL,
	"visibility" "_space_visibility" NOT NULL,
	"state" "_space_state" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "tag_follows" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"tag_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "tag_hierarchies" (
	"id" text PRIMARY KEY NOT NULL,
	"parent_tag_id" text NOT NULL,
	"child_tag_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tag_hierarchies_parent_tag_id_unique" UNIQUE("parent_tag_id"),
	CONSTRAINT "tag_hierarchies_child_tag_id_unique" UNIQUE("child_tag_id")
);

CREATE TABLE IF NOT EXISTS "tag_wiki_revisions" (
	"id" text PRIMARY KEY NOT NULL,
	"tag_wiki_id" text NOT NULL,
	"user_id" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "tag_wikis" (
	"id" text PRIMARY KEY NOT NULL,
	"tag_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tag_wikis_tag_id_unique" UNIQUE("tag_id")
);

CREATE TABLE IF NOT EXISTS "tags" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name")
);

CREATE TABLE IF NOT EXISTS "user_content_filter_preferences" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"category" "_content_filter_category" NOT NULL,
	"action" "_content_filter_action" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "user_email_verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"email" text NOT NULL,
	"token" text NOT NULL,
	"code" text,
	"kind" "_user_email_verification_kind" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "user_email_verifications_token_unique" UNIQUE("token")
);

CREATE TABLE IF NOT EXISTS "user_event_enrollments" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"event_code" text NOT NULL,
	"eligible" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"rewarded_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "user_marketing_consents" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_marketing_consents_user_id_unique" UNIQUE("user_id")
);

CREATE TABLE IF NOT EXISTS "user_notification_preferences" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"category" "_user_notification_category" NOT NULL,
	"method" "_user_notification_method" NOT NULL,
	"opted" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "user_notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"actor_id" text,
	"category" "_user_notification_category" NOT NULL,
	"state" "_user_notification_state" NOT NULL,
	"data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "user_personal_identities" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"birthday" timestamp with time zone NOT NULL,
	"phone_number" text,
	"ci" text NOT NULL,
	"kind" "_user_personal_identity_kind" DEFAULT 'PHONE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_personal_identities_user_id_unique" UNIQUE("user_id")
);

CREATE TABLE IF NOT EXISTS "user_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "user_settlement_identities" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"resident_registration_number_hash" text NOT NULL,
	"encrypted_resident_registration_number" text NOT NULL,
	"encrypted_resident_registration_number_nonce" text NOT NULL,
	"bank_code" text NOT NULL,
	"bank_account_number" text NOT NULL,
	"bank_account_holder_name" text NOT NULL,
	CONSTRAINT "user_settlement_identities_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "user_settlement_identities_rrn_hash_unique" UNIQUE("resident_registration_number_hash")
);

CREATE TABLE IF NOT EXISTS "user_single_sign_ons" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"provider" "_user_single_sign_on_provider" NOT NULL,
	"principal" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "user_space_mutes" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"space_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "user_tag_mute" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"tag_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "user_withdrawal_configs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"monthly_withdrawal_enabled" boolean DEFAULT false NOT NULL,
	CONSTRAINT "user_withdrawal_configs_user_id_unique" UNIQUE("user_id")
);

CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"profile_id" text NOT NULL,
	"state" "_user_state" NOT NULL,
	"role" "_user_role" DEFAULT 'USER' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_profile_id_unique" UNIQUE("profile_id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "bookmark_posts_bookmark_id_post_id_index" ON "bookmark_posts" ("bookmark_id","post_id");
CREATE INDEX IF NOT EXISTS "point_balances_user_id_kind_created_at_index" ON "point_balances" ("user_id","kind","created_at");
CREATE UNIQUE INDEX IF NOT EXISTS "post_comment_likes_comment_id_user_id_index" ON "post_comment_likes" ("comment_id","user_id");
CREATE INDEX IF NOT EXISTS "post_comments_post_id_created_at_index" ON "post_comments" ("post_id","created_at");
CREATE UNIQUE INDEX IF NOT EXISTS "post_likes_post_id_user_id_index" ON "post_likes" ("post_id","user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "post_purchases_post_id_user_id_index" ON "post_purchases" ("post_id","user_id");
CREATE INDEX IF NOT EXISTS "post_reactions_created_at_index" ON "post_reactions" ("created_at");
CREATE UNIQUE INDEX IF NOT EXISTS "post_reactions_post_id_user_id_emoji_index" ON "post_reactions" ("post_id","user_id","emoji");
CREATE INDEX IF NOT EXISTS "post_revisions_created_at_index" ON "post_revisions" ("created_at");
CREATE UNIQUE INDEX IF NOT EXISTS "post_tags_post_id_tag_id_kind_index" ON "post_tags" ("post_id","tag_id","kind");
CREATE INDEX IF NOT EXISTS "post_views_viewed_at_index" ON "post_views" ("viewed_at");
CREATE UNIQUE INDEX IF NOT EXISTS "post_views_post_id_user_id_index" ON "post_views" ("post_id","user_id");
CREATE INDEX IF NOT EXISTS "posts_published_at_index" ON "posts" ("published_at");
CREATE UNIQUE INDEX IF NOT EXISTS "space_collection_posts_collection_id_order_index" ON "space_collection_posts" ("collection_id","order");
CREATE UNIQUE INDEX IF NOT EXISTS "space_follows_user_id_space_id_index" ON "space_follows" ("user_id","space_id");
CREATE UNIQUE INDEX IF NOT EXISTS "space_masquerades_space_id_user_id_index" ON "space_masquerades" ("space_id","user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "space_members_space_id_user_id_index" ON "space_members" ("space_id","user_id");
CREATE INDEX IF NOT EXISTS "spaces_slug_state_index" ON "spaces" ("slug","state");
CREATE UNIQUE INDEX IF NOT EXISTS "tag_follows_user_id_tag_id_index" ON "tag_follows" ("user_id","tag_id");
CREATE INDEX IF NOT EXISTS "tag_wiki_revisions_created_at_index" ON "tag_wiki_revisions" ("created_at");
CREATE INDEX IF NOT EXISTS "tags_created_at_idx" ON "tags" ("created_at");
CREATE UNIQUE INDEX IF NOT EXISTS "user_content_filter_preferences_user_id_category_index" ON "user_content_filter_preferences" ("user_id","category");
CREATE UNIQUE INDEX IF NOT EXISTS "user_event_enrollments_user_id_event_code_index" ON "user_event_enrollments" ("user_id","event_code");
CREATE UNIQUE INDEX IF NOT EXISTS "user_notification_preferences_user_id_category_method_index" ON "user_notification_preferences" ("user_id","category","method");
CREATE INDEX IF NOT EXISTS "user_notifications_created_at_index" ON "user_notifications" ("created_at");
CREATE UNIQUE INDEX IF NOT EXISTS "user_single_sign_ons_user_id_provider_index" ON "user_single_sign_ons" ("user_id","provider");
CREATE UNIQUE INDEX IF NOT EXISTS "user_single_sign_ons_provider_principal_index" ON "user_single_sign_ons" ("provider","principal");
CREATE UNIQUE INDEX IF NOT EXISTS "user_space_mutes_user_id_space_id_index" ON "user_space_mutes" ("user_id","space_id");
CREATE UNIQUE INDEX IF NOT EXISTS "user_tag_mute_user_id_tag_id_index" ON "user_tag_mute" ("user_id","tag_id");
CREATE INDEX IF NOT EXISTS "users_email_state_index" ON "users" ("email","state");
DO $$ BEGIN
 ALTER TABLE "bookmark_posts" ADD CONSTRAINT "bookmark_posts_bookmark_id_bookmarks_id_fk" FOREIGN KEY ("bookmark_id") REFERENCES "bookmarks"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "bookmark_posts" ADD CONSTRAINT "bookmark_posts_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "curation_posts" ADD CONSTRAINT "curation_posts_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "files" ADD CONSTRAINT "files_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "images" ADD CONSTRAINT "images_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "point_balances" ADD CONSTRAINT "point_balances_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "point_balances" ADD CONSTRAINT "point_balances_purchase_id_point_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "point_purchases"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "point_purchases" ADD CONSTRAINT "point_purchases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_comment_likes" ADD CONSTRAINT "post_comment_likes_comment_id_post_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "post_comments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_comment_likes" ADD CONSTRAINT "post_comment_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_comment_likes" ADD CONSTRAINT "post_comment_likes_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_parent_id_post_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "post_comments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_purchases" ADD CONSTRAINT "post_purchases_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_purchases" ADD CONSTRAINT "post_purchases_revision_id_post_revisions_id_fk" FOREIGN KEY ("revision_id") REFERENCES "post_revisions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_purchases" ADD CONSTRAINT "post_purchases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_revisions" ADD CONSTRAINT "post_revisions_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_revisions" ADD CONSTRAINT "post_revisions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_revisions" ADD CONSTRAINT "post_revisions_free_content_id_post_revision_contents_id_fk" FOREIGN KEY ("free_content_id") REFERENCES "post_revision_contents"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_revisions" ADD CONSTRAINT "post_revisions_paid_content_id_post_revision_contents_id_fk" FOREIGN KEY ("paid_content_id") REFERENCES "post_revision_contents"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_views" ADD CONSTRAINT "post_views_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_views" ADD CONSTRAINT "post_views_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "posts" ADD CONSTRAINT "posts_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "posts" ADD CONSTRAINT "posts_member_id_space_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "space_members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "posts" ADD CONSTRAINT "posts_published_revision_id_post_revisions_id_fk" FOREIGN KEY ("published_revision_id") REFERENCES "post_revisions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "posts" ADD CONSTRAINT "posts_thumbnail_id_images_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "images"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "profiles" ADD CONSTRAINT "profiles_avatar_id_images_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "images"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "revenue_withdrawals" ADD CONSTRAINT "revenue_withdrawals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "revenues" ADD CONSTRAINT "revenues_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "revenues" ADD CONSTRAINT "revenues_withdrawal_id_revenue_withdrawals_id_fk" FOREIGN KEY ("withdrawal_id") REFERENCES "revenue_withdrawals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "space_collection_posts" ADD CONSTRAINT "space_collection_posts_collection_id_space_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "space_collections"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "space_collection_posts" ADD CONSTRAINT "space_collection_posts_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "space_collections" ADD CONSTRAINT "space_collections_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "space_collections" ADD CONSTRAINT "space_collections_thumbnail_id_images_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "images"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "space_external_links" ADD CONSTRAINT "space_external_links_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "space_follows" ADD CONSTRAINT "space_follows_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "space_follows" ADD CONSTRAINT "space_follows_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "space_masquerades" ADD CONSTRAINT "space_masquerades_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "space_masquerades" ADD CONSTRAINT "space_masquerades_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "space_masquerades" ADD CONSTRAINT "space_masquerades_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "space_member_invitations" ADD CONSTRAINT "space_member_invitations_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "space_member_invitations" ADD CONSTRAINT "space_member_invitations_sent_user_id_users_id_fk" FOREIGN KEY ("sent_user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "space_member_invitations" ADD CONSTRAINT "space_member_invitations_received_user_id_users_id_fk" FOREIGN KEY ("received_user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "space_members" ADD CONSTRAINT "space_members_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "space_members" ADD CONSTRAINT "space_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "space_members" ADD CONSTRAINT "space_members_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "space_user_blocks" ADD CONSTRAINT "space_user_blocks_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "space_user_blocks" ADD CONSTRAINT "space_user_blocks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "spaces" ADD CONSTRAINT "spaces_icon_id_images_id_fk" FOREIGN KEY ("icon_id") REFERENCES "images"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "tag_follows" ADD CONSTRAINT "tag_follows_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "tag_follows" ADD CONSTRAINT "tag_follows_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "tag_hierarchies" ADD CONSTRAINT "tag_hierarchies_parent_tag_id_tags_id_fk" FOREIGN KEY ("parent_tag_id") REFERENCES "tags"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "tag_hierarchies" ADD CONSTRAINT "tag_hierarchies_child_tag_id_tags_id_fk" FOREIGN KEY ("child_tag_id") REFERENCES "tags"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "tag_wiki_revisions" ADD CONSTRAINT "tag_wiki_revisions_tag_wiki_id_tag_wikis_id_fk" FOREIGN KEY ("tag_wiki_id") REFERENCES "tag_wikis"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "tag_wiki_revisions" ADD CONSTRAINT "tag_wiki_revisions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "tag_wikis" ADD CONSTRAINT "tag_wikis_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_content_filter_preferences" ADD CONSTRAINT "user_content_filter_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_email_verifications" ADD CONSTRAINT "user_email_verifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_event_enrollments" ADD CONSTRAINT "user_event_enrollments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_marketing_consents" ADD CONSTRAINT "user_marketing_consents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_notification_preferences" ADD CONSTRAINT "user_notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_actor_id_profiles_id_fk" FOREIGN KEY ("actor_id") REFERENCES "profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_personal_identities" ADD CONSTRAINT "user_personal_identities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_settlement_identities" ADD CONSTRAINT "user_settlement_identities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_single_sign_ons" ADD CONSTRAINT "user_single_sign_ons_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_space_mutes" ADD CONSTRAINT "user_space_mutes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_space_mutes" ADD CONSTRAINT "user_space_mutes_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_tag_mute" ADD CONSTRAINT "user_tag_mute_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_tag_mute" ADD CONSTRAINT "user_tag_mute_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_withdrawal_configs" ADD CONSTRAINT "user_withdrawal_configs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
