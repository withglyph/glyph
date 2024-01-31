/*
  Warnings:

  - The `content_filters` column on the `posts` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "_post_age_rating" AS ENUM ('ALL', 'R15', 'R19');

-- CreateEnum
CREATE TYPE "_post_pair" AS ENUM ('BL', 'GL', 'HL', 'MULTIPLE', 'NONCP', 'OTHER');

-- CreateEnum
CREATE TYPE "_post_tag_kind" AS ENUM ('TITLE', 'COUPLING', 'CHARACTER', 'TRIGGER', 'EXTRA');

-- AlterTable
ALTER TABLE "post_revisions" ADD COLUMN     "paragraph_indent" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "paragraph_spacing" INTEGER NOT NULL DEFAULT 100;

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "age_rating" "_post_age_rating" NOT NULL DEFAULT 'ALL',
ADD COLUMN     "external_searchable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "pairs" "_post_pair"[] DEFAULT ARRAY[]::"_post_pair"[],
ADD COLUMN     "thumbnail_id" TEXT;

-- AlterTable
ALTER TABLE "user_personal_identities" ALTER COLUMN "kind" SET DEFAULT 'PHONE';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';

-- CreateTable
CREATE TABLE "post_tags" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,
    "kind" "_post_tag_kind" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "post_tags_post_id_tag_id_kind_key" ON "post_tags"("post_id", "tag_id", "kind");

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_thumbnail_id_fkey" FOREIGN KEY ("thumbnail_id") REFERENCES "images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
