-- CreateEnum
CREATE TYPE "_revenue_withdrawal_kind" AS ENUM ('INSTANT', 'MONTHLY');

-- AlterTable
ALTER TABLE "posts" ALTER COLUMN "age_rating" SET DEFAULT 'ALL',
ALTER COLUMN "category" SET DEFAULT 'OTHER',
ALTER COLUMN "comment_qualification" SET DEFAULT 'ANY';

-- AlterTable
ALTER TABLE "revenue_withdrawals" ADD COLUMN     "kind" "_revenue_withdrawal_kind" NOT NULL,
ADD COLUMN     "revenue_amount" INTEGER NOT NULL,
ALTER COLUMN "state" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "user_personal_identities" ALTER COLUMN "kind" SET DEFAULT 'PHONE';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';
