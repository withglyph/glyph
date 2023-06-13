/*
  Warnings:

  - Added the required column `role` to the `space_members` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SpaceMemberRole" AS ENUM ('OWNER', 'MEMBER');

-- AlterTable
ALTER TABLE "space_members" ADD COLUMN     "role" "SpaceMemberRole" NOT NULL DEFAULT 'OWNER';
ALTER TABLE "space_members" ALTER COLUMN "role" DROP DEFAULT;
