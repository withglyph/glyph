/*
  Warnings:

  - You are about to drop the column `auto_indent` on the `post_revisions` table. All the data in the column will be lost.
  - You are about to drop the column `contentKind` on the `post_revisions` table. All the data in the column will be lost.
  - You are about to drop the column `cropped_thumbnail_id` on the `post_revisions` table. All the data in the column will be lost.
  - You are about to drop the column `original_thumbnail_id` on the `post_revisions` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnailBounds` on the `post_revisions` table. All the data in the column will be lost.
  - You are about to drop the column `content_filters` on the `posts` table. All the data in the column will be lost.
  - The `pairs` column on the `posts` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `post_revision_tags` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "post_revision_tags" DROP CONSTRAINT "post_revision_tags_revision_id_fkey";

-- DropForeignKey
ALTER TABLE "post_revision_tags" DROP CONSTRAINT "post_revision_tags_tag_id_fkey";

-- DropForeignKey
ALTER TABLE "post_revisions" DROP CONSTRAINT "post_revisions_cropped_thumbnail_id_fkey";

-- DropForeignKey
ALTER TABLE "post_revisions" DROP CONSTRAINT "post_revisions_original_thumbnail_id_fkey";

-- AlterTable
ALTER TABLE "post_revisions" DROP COLUMN "auto_indent",
DROP COLUMN "contentKind",
DROP COLUMN "cropped_thumbnail_id",
DROP COLUMN "original_thumbnail_id",
DROP COLUMN "thumbnailBounds";

-- AlterTable
ALTER TABLE "posts" DROP COLUMN "content_filters",
ALTER COLUMN "age_rating" SET DEFAULT 'ALL',
ALTER COLUMN "category" SET DEFAULT 'OTHER';

-- AlterTable
ALTER TABLE "user_personal_identities" ALTER COLUMN "kind" SET DEFAULT 'PHONE';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';

-- DropTable
DROP TABLE "post_revision_tags";
