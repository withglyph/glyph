/*
  Warnings:

  - The values [UNPUBLISHED,PRIVATE] on the enum `_post_visibility` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "_post_visibility_new" AS ENUM ('PUBLIC', 'UNLISTED', 'MEMBER_ONLY', 'DRAFT');
ALTER TABLE "posts" ALTER COLUMN "visibility" TYPE "_post_visibility_new" USING ("visibility"::text::"_post_visibility_new");
ALTER TYPE "_post_visibility" RENAME TO "_post_visibility_old";
ALTER TYPE "_post_visibility_new" RENAME TO "_post_visibility";
DROP TYPE "_post_visibility_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "posts" DROP CONSTRAINT "posts_author_id_fkey";

-- DropForeignKey
ALTER TABLE "posts" DROP CONSTRAINT "posts_space_id_fkey";

-- AlterTable
ALTER TABLE "posts" ALTER COLUMN "permalink" DROP NOT NULL,
ALTER COLUMN "space_id" DROP NOT NULL,
ALTER COLUMN "author_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "space_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
