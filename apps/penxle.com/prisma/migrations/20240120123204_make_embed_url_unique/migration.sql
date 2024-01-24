/*
  Warnings:

  - A unique constraint covering the columns `[url]` on the table `embeds` will be added. If there are existing duplicate values, this will fail.

*/

-- CreateIndex
CREATE UNIQUE INDEX "embeds_url_key" ON "embeds"("url");
