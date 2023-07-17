/*
  Warnings:

  - You are about to drop the column `sizes` on the `images` table. All the data in the column will be lost.
  - Added the required column `blob_size` to the `images` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "images" DROP COLUMN "sizes",
ADD COLUMN     "blob_size" INTEGER NOT NULL;
