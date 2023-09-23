-- CreateEnum
CREATE TYPE "_content_filter_category" AS ENUM ('ADULT', 'ALL_BUT_ADULT', 'VIOLENCE', 'CRUELTY', 'HORROR', 'GAMBLING', 'TRAUMA', 'CRIME', 'PHOBIA', 'INSULT', 'GROSSNESS', 'OTHER');

-- CreateEnum
CREATE TYPE "_content_filter_action" AS ENUM ('HIDE', 'WARN', 'EXPOSE');

-- CreateEnum
CREATE TYPE "_preference_type" AS ENUM ('FAVORITE', 'MUTE');

-- CreateEnum
CREATE TYPE "_space_member_role" AS ENUM ('OWNER', 'MEMBER');

-- CreateEnum
CREATE TYPE "_space_state" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "_user_email_verification_kind" AS ENUM ('USER_ACTIVATION', 'USER_EMAIL_UPDATE', 'USER_PASSWORD_RESET');

-- CreateEnum
CREATE TYPE "_user_notification_category" AS ENUM ('COMMENT', 'REPLY', 'SUBSCRIBE', 'TAG_EDIT', 'TREND', 'PURCHASE', 'DONATE', 'TAG_WIKI_EDIT', 'ALL');

-- CreateEnum
CREATE TYPE "_user_notification_method" AS ENUM ('EMAIL', 'WEBSITE');

-- CreateEnum
CREATE TYPE "_user_notification_opt" AS ENUM ('OPT_IN', 'OPT_OUT');

-- CreateEnum
CREATE TYPE "_user_single_sign_on_provider" AS ENUM ('GOOGLE', 'NAVER');

-- CreateEnum
CREATE TYPE "_user_state" AS ENUM ('PROVISIONAL', 'ACTIVE', 'INACTIVE');

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
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spaces" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" "_space_state" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "spaces_pkey" PRIMARY KEY ("id")
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
    "user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "_user_email_verification_kind" NOT NULL,
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
    "opted" "_user_notification_opt" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_passwords" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_passwords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_single_sign_ons" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" "_user_single_sign_on_provider" NOT NULL,
    "provider_email" TEXT NOT NULL,
    "provider_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_single_sign_ons_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "profiles_avatar_id_key" ON "profiles"("avatar_id");

-- CreateIndex
CREATE INDEX "spaces_slug_state_idx" ON "spaces"("slug", "state");

-- CreateIndex
CREATE UNIQUE INDEX "space_members_space_id_user_id_key" ON "space_members"("space_id", "user_id");

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
CREATE UNIQUE INDEX "user_email_verifications_code_key" ON "user_email_verifications"("code");

-- CreateIndex
CREATE UNIQUE INDEX "user_marketing_consents_user_id_key" ON "user_marketing_consents"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_notification_preferences_user_id_category_method_key" ON "user_notification_preferences"("user_id", "category", "method");

-- CreateIndex
CREATE UNIQUE INDEX "user_passwords_user_id_key" ON "user_passwords"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_single_sign_ons_user_id_provider_key" ON "user_single_sign_ons"("user_id", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "user_single_sign_ons_provider_provider_user_id_key" ON "user_single_sign_ons"("provider", "provider_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_tag_preferences_user_id_key" ON "user_tag_preferences"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_tag_preferences_tag_id_key" ON "user_tag_preferences"("tag_id");

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_avatar_id_fkey" FOREIGN KEY ("avatar_id") REFERENCES "images"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_members" ADD CONSTRAINT "space_members_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_members" ADD CONSTRAINT "space_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_members" ADD CONSTRAINT "space_members_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "user_email_verifications" ADD CONSTRAINT "user_email_verifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_marketing_consents" ADD CONSTRAINT "user_marketing_consents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notification_preferences" ADD CONSTRAINT "user_notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_passwords" ADD CONSTRAINT "user_passwords_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_single_sign_ons" ADD CONSTRAINT "user_single_sign_ons_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tag_preferences" ADD CONSTRAINT "user_tag_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tag_preferences" ADD CONSTRAINT "user_tag_preferences_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
