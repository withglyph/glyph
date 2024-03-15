/*
  Warnings:

  - Added the required column `bank_account_holder_name` to the `user_settlement_identities` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "posts" ALTER COLUMN "age_rating" SET DEFAULT 'ALL',
ALTER COLUMN "category" SET DEFAULT 'OTHER',
ALTER COLUMN "comment_qualification" SET DEFAULT 'ANY';

-- AlterTable
ALTER TABLE "revenue_withdrawals" ALTER COLUMN "state" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "user_personal_identities" ALTER COLUMN "kind" SET DEFAULT 'PHONE';

-- AlterTable
ALTER TABLE "user_settlement_identities" ADD COLUMN     "bank_account_holder_name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';
