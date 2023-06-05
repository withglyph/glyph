/*
  Warnings:

  - You are about to drop the column `profile_id` on the `images` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "images" DROP CONSTRAINT "images_profile_id_fkey";

-- AlterTable
ALTER TABLE "images" DROP COLUMN "profile_id";
