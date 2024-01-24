/*
  Warnings:

  - You are about to drop the column `site` on the `embeds` table. All the data in the column will be lost.
  - The `content_filters` column on the `posts` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "embeds" DROP COLUMN "site";
