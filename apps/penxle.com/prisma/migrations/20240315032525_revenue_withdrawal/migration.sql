/*
  Warnings:

  - Added the required column `service_fee_amount` to the `revenue_withdrawals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tax_base_amount` to the `revenue_withdrawals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_fee_amount` to the `revenue_withdrawals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `withdrawal_fee_amount` to the `revenue_withdrawals` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "posts" ALTER COLUMN "age_rating" SET DEFAULT 'ALL',
ALTER COLUMN "category" SET DEFAULT 'OTHER',
ALTER COLUMN "comment_qualification" SET DEFAULT 'ANY';

-- AlterTable
ALTER TABLE "revenue_withdrawals" ADD COLUMN     "service_fee_amount" INTEGER NOT NULL,
ADD COLUMN     "tax_base_amount" INTEGER NOT NULL,
ADD COLUMN     "total_fee_amount" INTEGER NOT NULL,
ADD COLUMN     "withdrawal_fee_amount" INTEGER NOT NULL,
ALTER COLUMN "state" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "user_personal_identities" ALTER COLUMN "kind" SET DEFAULT 'PHONE';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';
