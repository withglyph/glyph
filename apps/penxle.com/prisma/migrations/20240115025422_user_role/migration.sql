-- CreateEnum
CREATE TYPE "_user_role" AS ENUM ('ADMIN', 'USER');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "_user_role" NOT NULL DEFAULT 'USER';
