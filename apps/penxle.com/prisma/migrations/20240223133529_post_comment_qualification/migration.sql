/*
  Warnings:

  - You are about to drop the column `receive_comment` on the `posts` table. All the data in the column will be lost.
  - The `pairs` column on the `posts` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "_post_comment_qualification" AS ENUM ('NONE', 'IDENTIFIED', 'ANY');

-- AlterTable
ALTER TABLE "posts" DROP COLUMN "receive_comment",
ADD COLUMN     "comment_qualification" "_post_comment_qualification" NOT NULL DEFAULT 'ANY',
ALTER COLUMN "age_rating" SET DEFAULT 'ALL',
ALTER COLUMN "category" SET DEFAULT 'OTHER';

-- AlterTable
ALTER TABLE "user_personal_identities" ALTER COLUMN "kind" SET DEFAULT 'PHONE';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';
