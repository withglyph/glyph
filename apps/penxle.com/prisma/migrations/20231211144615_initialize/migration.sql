-- CreateEnum
CREATE TYPE "_content_filter_category" AS ENUM ('ADULT', 'VIOLENCE', 'CRUELTY', 'HORROR', 'GAMBLING', 'TRAUMA', 'CRIME', 'PHOBIA', 'INSULT', 'GROSSNESS', 'OTHER');

-- CreateEnum
CREATE TYPE "_content_filter_action" AS ENUM ('WARN', 'EXPOSE');

-- CreateEnum
CREATE TYPE "_payment_method" AS ENUM ('CREDIT_CARD', 'BANK_ACCOUNT', 'VIRTUAL_BANK_ACCOUNT', 'PHONE_BILL', 'GIFTCARD_CULTURELAND', 'GIFTCARD_SMARTCULTURE', 'GIFTCARD_BOOKNLIFE', 'PAYPAL');

-- CreateEnum
CREATE TYPE "_point_kind" AS ENUM ('PAID', 'FREE');

-- CreateEnum
CREATE TYPE "_point_purchase_state" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'UNDONE');

-- CreateEnum
CREATE TYPE "_point_transaction_cause" AS ENUM ('INTERNAL', 'PURCHASE', 'UNDO_PURCHASE', 'REFUND', 'EXPIRE', 'UNLOCK_CONTENT', 'PATRONIZE');

-- CreateEnum
CREATE TYPE "_post_revision_kind" AS ENUM ('AUTO_SAVE', 'MANUAL_SAVE', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "_post_revision_content_kind" AS ENUM ('ARTICLE', 'GALLERY');

-- CreateEnum
CREATE TYPE "_post_state" AS ENUM ('DRAFT', 'PUBLISHED', 'DELETED');

-- CreateEnum
CREATE TYPE "_post_visibility" AS ENUM ('PUBLIC', 'SPACE', 'UNLISTED');

-- CreateEnum
CREATE TYPE "_preference_type" AS ENUM ('FAVORITE', 'MUTE');

-- CreateEnum
CREATE TYPE "_space_collection_state" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "_space_member_invitation_state" AS ENUM ('PENDING', 'ACCEPTED', 'IGNORED');

-- CreateEnum
CREATE TYPE "_space_member_role" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "_space_member_state" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "_space_state" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "_space_visibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "_user_email_verification_kind" AS ENUM ('USER_LOGIN', 'USER_EMAIL_UPDATE');

-- CreateEnum
CREATE TYPE "_user_notification_category" AS ENUM ('COMMENT', 'REPLY', 'SUBSCRIBE', 'TAG_EDIT', 'TREND', 'PURCHASE', 'DONATE', 'TAG_WIKI_EDIT', 'ALL');

-- CreateEnum
CREATE TYPE "_user_notification_method" AS ENUM ('EMAIL', 'WEBSITE');

-- CreateEnum
CREATE TYPE "_user_single_sign_on_provider" AS ENUM ('GOOGLE', 'NAVER');

-- CreateEnum
CREATE TYPE "_user_state" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "bookmarks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookmark_posts" (
    "id" TEXT NOT NULL,
    "bookmark_id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookmark_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "images" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "name" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "placeholder" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "point_balances" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "purchase_id" TEXT,
    "kind" "_point_kind" NOT NULL,
    "initial" INTEGER NOT NULL,
    "leftover" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "point_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "point_purchases" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "point_amount" INTEGER NOT NULL,
    "payment_amount" INTEGER NOT NULL,
    "payment_method" "_payment_method" NOT NULL,
    "payment_key" TEXT NOT NULL,
    "payment_data" JSONB NOT NULL,
    "payment_result" JSONB,
    "state" "_point_purchase_state" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "completed_at" TIMESTAMPTZ,

    CONSTRAINT "point_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "point_transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "cause" "_point_transaction_cause" NOT NULL,
    "amount" INTEGER NOT NULL,
    "target_id" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "point_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "permalink" TEXT NOT NULL,
    "space_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "published_revision_id" TEXT,
    "state" "_post_state" NOT NULL,
    "content_filters" "_content_filter_category"[],
    "visibility" "_post_visibility" NOT NULL,
    "disclose_stats" BOOLEAN NOT NULL,
    "receive_feedback" BOOLEAN NOT NULL,
    "receive_patronage" BOOLEAN NOT NULL,
    "receive_tag_contribution" BOOLEAN NOT NULL,
    "password" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMPTZ,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_likes" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_purchases" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "revision_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_reactions" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_revisions" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "free_content_id" TEXT NOT NULL,
    "paid_content_id" TEXT,
    "contentKind" "_post_revision_content_kind" NOT NULL,
    "price" INTEGER,
    "cropped_thumbnail_id" TEXT,
    "original_thumbnail_id" TEXT,
    "thumbnailBounds" JSONB,
    "kind" "_post_revision_kind" NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_revision_contents" (
    "id" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_revision_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_revision_tags" (
    "id" TEXT NOT NULL,
    "revision_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_revision_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_views" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT,
    "device_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "viewed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provisioned_users" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "provider" "_user_single_sign_on_provider",
    "principal" TEXT,
    "name" TEXT,
    "avatar_url" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provisioned_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spaces" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon_id" TEXT NOT NULL,
    "visibility" "_space_visibility" NOT NULL,
    "state" "_space_state" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "spaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "space_collections" (
    "id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL,
    "thumbnail_id" TEXT,
    "name" TEXT NOT NULL,
    "state" "_space_collection_state" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "space_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "space_collection_posts" (
    "id" TEXT NOT NULL,
    "collection_id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "space_collection_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "space_external_links" (
    "id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "space_external_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "space_follows" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "space_follows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "space_user_blocks" (
    "id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "space_user_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "space_masquerades" (
    "id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "space_masquerades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "space_members" (
    "id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "state" "_space_member_state" NOT NULL,
    "role" "_space_member_role" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "space_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "space_member_invitations" (
    "id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL,
    "sent_user_id" TEXT NOT NULL,
    "received_user_id" TEXT,
    "received_email" TEXT NOT NULL,
    "role" "_space_member_role" NOT NULL,
    "state" "_space_member_invitation_state" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responded_at" TIMESTAMPTZ,

    CONSTRAINT "space_member_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag_follows" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tag_follows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag_hierarchies" (
    "id" TEXT NOT NULL,
    "parent_tag_id" TEXT NOT NULL,
    "child_tag_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tag_hierarchies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag_wikis" (
    "id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tag_wikis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag_wiki_revisions" (
    "id" TEXT NOT NULL,
    "tag_wiki_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tag_wiki_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "state" "_user_state" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_content_filter_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category" "_content_filter_category" NOT NULL,
    "action" "_content_filter_action" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_content_filter_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_email_verifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "code" TEXT,
    "kind" "_user_email_verification_kind" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "user_email_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_marketing_consents" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_marketing_consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_notification_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category" "_user_notification_category" NOT NULL,
    "method" "_user_notification_method" NOT NULL,
    "opted" BOOLEAN NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_personal_identities" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birthday" TIMESTAMPTZ NOT NULL,
    "phone_number" TEXT NOT NULL,
    "ci" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_personal_identities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_single_sign_ons" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" "_user_single_sign_on_provider" NOT NULL,
    "principal" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_single_sign_ons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_space_mutes" (
    "id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_space_mutes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_tag_mute" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_tag_mute_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bookmark_posts_bookmark_id_post_id_key" ON "bookmark_posts"("bookmark_id", "post_id");

-- CreateIndex
CREATE INDEX "point_balances_user_id_kind_created_at_idx" ON "point_balances"("user_id", "kind", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "point_purchases_payment_key_key" ON "point_purchases"("payment_key");

-- CreateIndex
CREATE UNIQUE INDEX "posts_permalink_key" ON "posts"("permalink");

-- CreateIndex
CREATE INDEX "posts_published_at_idx" ON "posts"("published_at");

-- CreateIndex
CREATE UNIQUE INDEX "post_likes_post_id_user_id_key" ON "post_likes"("post_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "post_purchases_post_id_user_id_key" ON "post_purchases"("post_id", "user_id");

-- CreateIndex
CREATE INDEX "post_reactions_created_at_idx" ON "post_reactions"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "post_reactions_post_id_user_id_emoji_key" ON "post_reactions"("post_id", "user_id", "emoji");

-- CreateIndex
CREATE INDEX "post_revisions_created_at_idx" ON "post_revisions"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "post_revision_contents_hash_key" ON "post_revision_contents"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "post_revision_tags_revision_id_tag_id_key" ON "post_revision_tags"("revision_id", "tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "post_views_user_id_post_id_key" ON "post_views"("user_id", "post_id");

-- CreateIndex
CREATE UNIQUE INDEX "provisioned_users_token_key" ON "provisioned_users"("token");

-- CreateIndex
CREATE INDEX "spaces_slug_state_idx" ON "spaces"("slug", "state");

-- CreateIndex
CREATE UNIQUE INDEX "space_collection_posts_post_id_key" ON "space_collection_posts"("post_id");

-- CreateIndex
CREATE UNIQUE INDEX "space_collection_posts_collection_id_order_key" ON "space_collection_posts"("collection_id", "order");

-- CreateIndex
CREATE UNIQUE INDEX "space_follows_user_id_space_id_key" ON "space_follows"("user_id", "space_id");

-- CreateIndex
CREATE UNIQUE INDEX "space_masquerades_profile_id_key" ON "space_masquerades"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "space_masquerades_space_id_user_id_key" ON "space_masquerades"("space_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "space_members_space_id_user_id_key" ON "space_members"("space_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE INDEX "tags_created_at_idx" ON "tags"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "tag_follows_user_id_tag_id_key" ON "tag_follows"("user_id", "tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "tag_hierarchies_parent_tag_id_key" ON "tag_hierarchies"("parent_tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "tag_hierarchies_child_tag_id_key" ON "tag_hierarchies"("child_tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "tag_wikis_tag_id_key" ON "tag_wikis"("tag_id");

-- CreateIndex
CREATE INDEX "tag_wiki_revisions_created_at_idx" ON "tag_wiki_revisions"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "users_profile_id_key" ON "users"("profile_id");

-- CreateIndex
CREATE INDEX "users_email_state_idx" ON "users"("email", "state");

-- CreateIndex
CREATE UNIQUE INDEX "user_content_filter_preferences_user_id_category_key" ON "user_content_filter_preferences"("user_id", "category");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_verifications_token_key" ON "user_email_verifications"("token");

-- CreateIndex
CREATE UNIQUE INDEX "user_marketing_consents_user_id_key" ON "user_marketing_consents"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_notification_preferences_user_id_category_method_key" ON "user_notification_preferences"("user_id", "category", "method");

-- CreateIndex
CREATE UNIQUE INDEX "user_personal_identities_user_id_key" ON "user_personal_identities"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_single_sign_ons_user_id_provider_key" ON "user_single_sign_ons"("user_id", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "user_single_sign_ons_provider_principal_key" ON "user_single_sign_ons"("provider", "principal");

-- CreateIndex
CREATE UNIQUE INDEX "user_space_mutes_user_id_space_id_key" ON "user_space_mutes"("user_id", "space_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_tag_mute_user_id_tag_id_key" ON "user_tag_mute"("user_id", "tag_id");

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmark_posts" ADD CONSTRAINT "bookmark_posts_bookmark_id_fkey" FOREIGN KEY ("bookmark_id") REFERENCES "bookmarks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmark_posts" ADD CONSTRAINT "bookmark_posts_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_balances" ADD CONSTRAINT "point_balances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_balances" ADD CONSTRAINT "point_balances_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "point_purchases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_purchases" ADD CONSTRAINT "point_purchases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "space_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_published_revision_id_fkey" FOREIGN KEY ("published_revision_id") REFERENCES "post_revisions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_purchases" ADD CONSTRAINT "post_purchases_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_purchases" ADD CONSTRAINT "post_purchases_revision_id_fkey" FOREIGN KEY ("revision_id") REFERENCES "post_revisions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_purchases" ADD CONSTRAINT "post_purchases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_revisions" ADD CONSTRAINT "post_revisions_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_revisions" ADD CONSTRAINT "post_revisions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_revisions" ADD CONSTRAINT "post_revisions_free_content_id_fkey" FOREIGN KEY ("free_content_id") REFERENCES "post_revision_contents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_revisions" ADD CONSTRAINT "post_revisions_paid_content_id_fkey" FOREIGN KEY ("paid_content_id") REFERENCES "post_revision_contents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_revisions" ADD CONSTRAINT "post_revisions_cropped_thumbnail_id_fkey" FOREIGN KEY ("cropped_thumbnail_id") REFERENCES "images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_revisions" ADD CONSTRAINT "post_revisions_original_thumbnail_id_fkey" FOREIGN KEY ("original_thumbnail_id") REFERENCES "images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_revision_tags" ADD CONSTRAINT "post_revision_tags_revision_id_fkey" FOREIGN KEY ("revision_id") REFERENCES "post_revisions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_revision_tags" ADD CONSTRAINT "post_revision_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_views" ADD CONSTRAINT "post_views_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_views" ADD CONSTRAINT "post_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_avatar_id_fkey" FOREIGN KEY ("avatar_id") REFERENCES "images"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_icon_id_fkey" FOREIGN KEY ("icon_id") REFERENCES "images"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_collections" ADD CONSTRAINT "space_collections_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_collections" ADD CONSTRAINT "space_collections_thumbnail_id_fkey" FOREIGN KEY ("thumbnail_id") REFERENCES "images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_collection_posts" ADD CONSTRAINT "space_collection_posts_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "space_collections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_collection_posts" ADD CONSTRAINT "space_collection_posts_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_external_links" ADD CONSTRAINT "space_external_links_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_follows" ADD CONSTRAINT "space_follows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_follows" ADD CONSTRAINT "space_follows_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_user_blocks" ADD CONSTRAINT "space_user_blocks_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_user_blocks" ADD CONSTRAINT "space_user_blocks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_masquerades" ADD CONSTRAINT "space_masquerades_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_masquerades" ADD CONSTRAINT "space_masquerades_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_masquerades" ADD CONSTRAINT "space_masquerades_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_members" ADD CONSTRAINT "space_members_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_members" ADD CONSTRAINT "space_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_members" ADD CONSTRAINT "space_members_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_member_invitations" ADD CONSTRAINT "space_member_invitations_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_member_invitations" ADD CONSTRAINT "space_member_invitations_sent_user_id_fkey" FOREIGN KEY ("sent_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_member_invitations" ADD CONSTRAINT "space_member_invitations_received_user_id_fkey" FOREIGN KEY ("received_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_follows" ADD CONSTRAINT "tag_follows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_follows" ADD CONSTRAINT "tag_follows_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_hierarchies" ADD CONSTRAINT "tag_hierarchies_parent_tag_id_fkey" FOREIGN KEY ("parent_tag_id") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_hierarchies" ADD CONSTRAINT "tag_hierarchies_child_tag_id_fkey" FOREIGN KEY ("child_tag_id") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_wikis" ADD CONSTRAINT "tag_wikis_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_wiki_revisions" ADD CONSTRAINT "tag_wiki_revisions_tag_wiki_id_fkey" FOREIGN KEY ("tag_wiki_id") REFERENCES "tag_wikis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_wiki_revisions" ADD CONSTRAINT "tag_wiki_revisions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_content_filter_preferences" ADD CONSTRAINT "user_content_filter_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_email_verifications" ADD CONSTRAINT "user_email_verifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_marketing_consents" ADD CONSTRAINT "user_marketing_consents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notification_preferences" ADD CONSTRAINT "user_notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_personal_identities" ADD CONSTRAINT "user_personal_identities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_single_sign_ons" ADD CONSTRAINT "user_single_sign_ons_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_space_mutes" ADD CONSTRAINT "user_space_mutes_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_space_mutes" ADD CONSTRAINT "user_space_mutes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tag_mute" ADD CONSTRAINT "user_tag_mute_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tag_mute" ADD CONSTRAINT "user_tag_mute_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
