/*
  Warnings:

  - The `pairs` column on the `posts` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterEnum
ALTER TYPE "_user_single_sign_on_provider" ADD VALUE 'TWITTER';
