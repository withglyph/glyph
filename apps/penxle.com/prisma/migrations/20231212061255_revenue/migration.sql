/*
  Warnings:

  - The `content_filters` column on the `posts` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "_user_revenue_kind" AS ENUM ('POST_PURCHASE', 'POST_PATRONAGE');

-- CreateEnum
CREATE TYPE "_user_revenue_state" AS ENUM ('PENDING', 'INVOICED', 'PAID');

-- CreateTable
CREATE TABLE "user_revenues" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "target_id" TEXT,
    "state" "_user_revenue_state" NOT NULL,
    "kind" "_user_revenue_kind" NOT NULL,
    "amount" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_revenues_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_revenues" ADD CONSTRAINT "user_revenues_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
