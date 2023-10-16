/*
  Warnings:

  - You are about to drop the column `slug` on the `posts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[permalink]` on the table `posts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `permalink` to the `posts` table without a default value. This is not possible if the table is not empty.
  - Made the column `space_id` on table `posts` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "posts" DROP CONSTRAINT "posts_space_id_fkey";

-- DropIndex
DROP INDEX "posts_slug_space_id_key";

-- AlterTable
ALTER TABLE "posts" ALTER COLUMN "space_id" SET NOT NULL;
ALTER TABLE "posts" RENAME COLUMN "slug" TO "permalink";

-- CreateIndex
CREATE UNIQUE INDEX "posts_permalink_key" ON "posts"("permalink");

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
