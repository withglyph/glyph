/*
  Warnings:

  - A unique constraint covering the columns `[handle]` on the table `profiles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `handle` to the `profiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "profiles" ADD COLUMN "handle" TEXT;
UPDATE "profiles" SET "handle" = "id";
ALTER TABLE "profiles" ALTER COLUMN "handle" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "profiles_handle_key" ON "profiles"("handle");
