/*
  Warnings:

  - The `content_filters` column on the `posts` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `user_revenues` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "_revenue_kind" AS ENUM ('POST_PURCHASE', 'POST_PATRONAGE');

-- CreateEnum
CREATE TYPE "_revenue_state" AS ENUM ('PENDING', 'INVOICED', 'PAID');

-- DropForeignKey
ALTER TABLE "user_revenues" DROP CONSTRAINT "user_revenues_user_id_fkey";

-- DropTable
DROP TABLE "user_revenues";

-- DropEnum
DROP TYPE "_user_revenue_kind";

-- DropEnum
DROP TYPE "_user_revenue_state";

-- CreateTable
CREATE TABLE "revenues" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "target_id" TEXT,
    "state" "_revenue_state" NOT NULL,
    "kind" "_revenue_kind" NOT NULL,
    "amount" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "revenues_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "revenues" ADD CONSTRAINT "revenues_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
