-- AlterEnum
ALTER TYPE "_point_transaction_cause" ADD VALUE 'EVENT_REWARD';

-- AlterTable
ALTER TABLE "posts" ALTER COLUMN "age_rating" SET DEFAULT 'ALL',
ALTER COLUMN "category" SET DEFAULT 'OTHER';

-- AlterTable
ALTER TABLE "user_personal_identities" ALTER COLUMN "kind" SET DEFAULT 'PHONE';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';
