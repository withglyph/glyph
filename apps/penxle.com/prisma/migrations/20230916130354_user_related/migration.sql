-- CreateEnum
CREATE TYPE "_preference_type" AS ENUM ('FAVORITE', 'MUTE');

-- CreateEnum
CREATE TYPE "_user_email_verification_type" AS ENUM ('USER_ACTIVATION', 'EMAIL_UPDATE', 'PASSWORD_RESET');

-- AlterEnum
ALTER TYPE "_user_state" ADD VALUE 'PROVISIONAL';

-- DropIndex
DROP INDEX "users_email_key";

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
CREATE TABLE "user_email_verifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "_user_email_verification_type" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "user_email_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_marketing_agreements" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_marketing_agreements_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "user_email_verifications_code_key" ON "user_email_verifications"("code");

-- CreateIndex
CREATE UNIQUE INDEX "user_marketing_agreements_user_id_key" ON "user_marketing_agreements"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_tag_preferences_user_id_key" ON "user_tag_preferences"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_tag_preferences_tag_id_key" ON "user_tag_preferences"("tag_id");

-- CreateIndex
CREATE INDEX "users_email_state_idx" ON "users"("email", "state");

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
ALTER TABLE "user_email_verifications" ADD CONSTRAINT "user_email_verifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_marketing_agreements" ADD CONSTRAINT "user_marketing_agreements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tag_preferences" ADD CONSTRAINT "user_tag_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tag_preferences" ADD CONSTRAINT "user_tag_preferences_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
