/*
  Warnings:

  - You are about to drop the column `size` on the `images` table. All the data in the column will be lost.
  - Added the required column `file_size` to the `images` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "images" DROP COLUMN "size",
ADD COLUMN     "file_size" INTEGER NOT NULL;
