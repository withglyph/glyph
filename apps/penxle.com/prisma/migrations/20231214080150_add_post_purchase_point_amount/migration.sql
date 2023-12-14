/*
  Warnings:

  - The `content_filters` column on the `posts` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "post_purchases" ADD COLUMN     "point_amount" INTEGER NOT NULL DEFAULT 0;