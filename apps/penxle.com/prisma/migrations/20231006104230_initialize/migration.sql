-- CreateEnum
CREATE TYPE "_content_filter_category" AS ENUM ('ADULT', 'TRIGGER', 'VIOLENCE', 'CRUELTY', 'HORROR', 'GAMBLING', 'TRAUMA', 'CRIME', 'PHOBIA', 'INSULT', 'GROSSNESS', 'OTHER');

-- CreateEnum
CREATE TYPE "_content_filter_action" AS ENUM ('HIDE', 'WARN', 'EXPOSE');

-- CreateEnum
CREATE TYPE "_preference_type" AS ENUM ('FAVORITE', 'MUTE');

-- CreateEnum
CREATE TYPE "_space_member_invite_state" AS ENUM ('PENDING', 'ACCEPTED', 'IGNORED');

-- CreateEnum
CREATE TYPE "_space_member_role" AS ENUM ('ADMIN', 'MEMBER');

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
    "icon_id" TEXT,
    "visibility" "_space_visibility" NOT NULL,
    "state" "_space_state" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "spaces_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "space_members" (
    "id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
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
    "state" "_space_member_invite_state" NOT NULL,
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
CREATE TABLE "user_space_followings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_space_followings_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "user_single_sign_ons" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" "_user_single_sign_on_provider" NOT NULL,
    "external_id" TEXT NOT NULL,
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
CREATE TABLE "user_tag_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,
    "type" "_preference_type" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_tag_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "images_id_path_color_idx" ON "images"("id", "path", "color");

-- CreateIndex
CREATE UNIQUE INDEX "provisioned_users_token_key" ON "provisioned_users"("token");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_avatar_id_key" ON "profiles"("avatar_id");

-- CreateIndex
CREATE UNIQUE INDEX "spaces_icon_id_key" ON "spaces"("icon_id");

-- CreateIndex
CREATE INDEX "spaces_slug_state_idx" ON "spaces"("slug", "state");

-- CreateIndex
CREATE UNIQUE INDEX "space_members_space_id_user_id_key" ON "space_members"("space_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "space_member_invitations_received_email_space_id_key" ON "space_member_invitations"("received_email", "space_id");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tag_hierarchies_parent_tag_id_key" ON "tag_hierarchies"("parent_tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "tag_hierarchies_child_tag_id_key" ON "tag_hierarchies"("child_tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "tag_wikis_tag_id_key" ON "tag_wikis"("tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "tag_wiki_revisions_tag_wiki_id_key" ON "tag_wiki_revisions"("tag_wiki_id");

-- CreateIndex
CREATE UNIQUE INDEX "tag_wiki_revisions_user_id_key" ON "tag_wiki_revisions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_profile_id_key" ON "users"("profile_id");

-- CreateIndex
CREATE INDEX "users_email_state_idx" ON "users"("email", "state");

-- CreateIndex
CREATE UNIQUE INDEX "user_content_filter_preferences_user_id_category_key" ON "user_content_filter_preferences"("user_id", "category");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_verifications_token_key" ON "user_email_verifications"("token");

-- CreateIndex
CREATE UNIQUE INDEX "user_space_followings_user_id_space_id_key" ON "user_space_followings"("user_id", "space_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_marketing_consents_user_id_key" ON "user_marketing_consents"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_notification_preferences_user_id_category_method_key" ON "user_notification_preferences"("user_id", "category", "method");

-- CreateIndex
CREATE UNIQUE INDEX "user_single_sign_ons_user_id_provider_key" ON "user_single_sign_ons"("user_id", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "user_single_sign_ons_provider_external_id_key" ON "user_single_sign_ons"("provider", "external_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_tag_preferences_user_id_key" ON "user_tag_preferences"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_tag_preferences_tag_id_key" ON "user_tag_preferences"("tag_id");

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_avatar_id_fkey" FOREIGN KEY ("avatar_id") REFERENCES "images"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_icon_id_fkey" FOREIGN KEY ("icon_id") REFERENCES "images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_external_links" ADD CONSTRAINT "space_external_links_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "user_space_followings" ADD CONSTRAINT "user_space_followings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_space_followings" ADD CONSTRAINT "user_space_followings_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_marketing_consents" ADD CONSTRAINT "user_marketing_consents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notification_preferences" ADD CONSTRAINT "user_notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_single_sign_ons" ADD CONSTRAINT "user_single_sign_ons_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tag_preferences" ADD CONSTRAINT "user_tag_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tag_preferences" ADD CONSTRAINT "user_tag_preferences_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
