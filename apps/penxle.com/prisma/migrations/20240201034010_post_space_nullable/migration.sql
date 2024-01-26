/*
  Warnings:

  - The `content_filters` column on the `posts` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `pairs` column on the `posts` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "_post_category" AS ENUM ('ORIGINAL', 'FANFICTION', 'NONFICTION', 'OTHER');

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "category" "_post_category" NOT NULL DEFAULT 'OTHER',
ALTER COLUMN "space_id" DROP NOT NULL,
ALTER COLUMN "member_id" DROP NOT NULL,
ALTER COLUMN "age_rating" SET DEFAULT 'ALL';
