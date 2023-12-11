/*
  Warnings:

  - The `content_filters` column on the `posts` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "posts" DROP COLUMN "content_filters",
ADD COLUMN     "content_filters" "_content_filter_category"[];
