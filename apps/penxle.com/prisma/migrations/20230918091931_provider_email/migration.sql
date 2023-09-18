/*
  Warnings:

  - Added the required column `provider_email` to the `user_ssos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user_ssos" ADD COLUMN     "provider_email" TEXT NOT NULL;
