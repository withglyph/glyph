/*
  Warnings:

  - The `pairs` column on the `posts` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterEnum
ALTER TYPE "_post_state" ADD VALUE 'EPHEMERAL';

-- DropForeignKey
ALTER TABLE "post_revisions" DROP CONSTRAINT "post_revisions_paid_content_id_fkey";

-- AlterTable
ALTER TABLE "post_revisions" ALTER COLUMN "free_content_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "post_revisions" ADD CONSTRAINT "post_revisions_paid_content_id_fkey" FOREIGN KEY ("paid_content_id") REFERENCES "post_revision_contents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
