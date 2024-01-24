-- CreateEnum
CREATE TYPE "_user_personal_identity_kind" AS ENUM ('PHONE', 'PASSPORT');

-- AlterTable
ALTER TABLE "user_personal_identities" ADD COLUMN     "kind" "_user_personal_identity_kind" NOT NULL DEFAULT 'PHONE',
ALTER COLUMN "phone_number" DROP NOT NULL;
