-- AlterTable
ALTER TABLE "posts" ALTER COLUMN "age_rating" SET DEFAULT 'ALL',
ALTER COLUMN "category" SET DEFAULT 'OTHER',
ALTER COLUMN "comment_qualification" SET DEFAULT 'ANY';

-- AlterTable
ALTER TABLE "revenue_withdrawals" ALTER COLUMN "state" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "user_personal_identities" ALTER COLUMN "kind" SET DEFAULT 'PHONE';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';

-- CreateTable
CREATE TABLE "user_withdrawal_configs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "monthly_withdrawal_enabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_withdrawal_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_withdrawal_configs_user_id_key" ON "user_withdrawal_configs"("user_id");

-- AddForeignKey
ALTER TABLE "user_withdrawal_configs" ADD CONSTRAINT "user_withdrawal_configs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
