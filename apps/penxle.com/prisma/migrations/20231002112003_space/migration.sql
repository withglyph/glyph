/*
  Warnings:

  - A unique constraint covering the columns `[icon_id]` on the table `spaces` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `visibility` to the `spaces` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "_space_member_invite_state" AS ENUM ('PENDING', 'ACCEPTED', 'IGNORED');

-- CreateEnum
CREATE TYPE "_space_visibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- AlterEnum
ALTER TYPE "_space_member_role" ADD VALUE 'ADMIN';

-- AlterTable
ALTER TABLE "spaces" ADD COLUMN     "description" TEXT,
ADD COLUMN     "icon_id" TEXT,
ADD COLUMN     "visibility" "_space_visibility" NOT NULL;

-- CreateTable
CREATE TABLE "space_external_links" (
    "id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "space_external_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "space_user_blocks" (
    "id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "space_user_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "space_member_invitations" (
    "id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL,
    "sent_user_id" TEXT NOT NULL,
    "received_user_id" TEXT,
    "received_email" TEXT NOT NULL,
    "state" "_space_member_invite_state" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responded_at" TIMESTAMPTZ,

    CONSTRAINT "space_member_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_space_followings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_space_followings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "space_user_blocks_space_id_user_id_key" ON "space_user_blocks"("space_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "space_member_invitations_received_email_space_id_key" ON "space_member_invitations"("received_email", "space_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_space_followings_user_id_space_id_key" ON "user_space_followings"("user_id", "space_id");

-- CreateIndex
CREATE UNIQUE INDEX "spaces_icon_id_key" ON "spaces"("icon_id");

-- AddForeignKey
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_icon_id_fkey" FOREIGN KEY ("icon_id") REFERENCES "images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_external_links" ADD CONSTRAINT "space_external_links_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_user_blocks" ADD CONSTRAINT "space_user_blocks_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_user_blocks" ADD CONSTRAINT "space_user_blocks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_member_invitations" ADD CONSTRAINT "space_member_invitations_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_member_invitations" ADD CONSTRAINT "space_member_invitations_sent_user_id_fkey" FOREIGN KEY ("sent_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_member_invitations" ADD CONSTRAINT "space_member_invitations_received_user_id_fkey" FOREIGN KEY ("received_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_space_followings" ADD CONSTRAINT "user_space_followings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_space_followings" ADD CONSTRAINT "user_space_followings_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
