-- CreateEnum
CREATE TYPE "_revenue_withdrawal_state" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- AlterTable
ALTER TABLE "posts" ALTER COLUMN "age_rating" SET DEFAULT 'ALL',
ALTER COLUMN "category" SET DEFAULT 'OTHER',
ALTER COLUMN "comment_qualification" SET DEFAULT 'ANY';

-- AlterTable
ALTER TABLE "revenues" ADD COLUMN     "withdrawal_id" TEXT;

-- AlterTable
ALTER TABLE "user_personal_identities" ALTER COLUMN "kind" SET DEFAULT 'PHONE';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';

-- CreateTable
CREATE TABLE "revenue_withdrawals" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "state" "_revenue_withdrawal_state" NOT NULL DEFAULT 'PENDING',
    "bank_code" TEXT NOT NULL,
    "bank_account_number" TEXT NOT NULL,
    "paid_amount" INTEGER NOT NULL,
    "tax_amount" INTEGER NOT NULL,
    "tx_id" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "revenue_withdrawals_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "revenues" ADD CONSTRAINT "revenues_withdrawal_id_fkey" FOREIGN KEY ("withdrawal_id") REFERENCES "revenue_withdrawals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue_withdrawals" ADD CONSTRAINT "revenue_withdrawals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
