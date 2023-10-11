/*
  Warnings:

  - Added the required column `state` to the `space_members` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "_space_member_state" AS ENUM ('ACTIVE', 'INACTIVE');

-- DropIndex
DROP INDEX "space_member_invitations_received_email_space_id_key";

-- DropIndex
DROP INDEX "space_members_space_id_user_id_key";

-- AlterTable
ALTER TABLE "space_members" ADD COLUMN     "state" "_space_member_state" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "space_members" ALTER COLUMN "state" DROP DEFAULT;
