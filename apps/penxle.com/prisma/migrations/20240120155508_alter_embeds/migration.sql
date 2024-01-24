/*
  Warnings:

  - You are about to drop the column `image_url` on the `embeds` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `embeds` table. All the data in the column will be lost.
  - The `content_filters` column on the `posts` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `site` to the `embeds` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `embeds` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "embeds" DROP CONSTRAINT "embeds_user_id_fkey";

-- AlterTable
ALTER TABLE "embeds" DROP COLUMN "image_url",
DROP COLUMN "user_id",
ADD COLUMN     "site" TEXT NOT NULL,
ADD COLUMN     "thumbnail_url" TEXT,
ADD COLUMN     "type" TEXT NOT NULL;
