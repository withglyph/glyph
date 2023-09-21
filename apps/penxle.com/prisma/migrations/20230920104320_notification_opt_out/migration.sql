-- CreateEnum
CREATE TYPE "_user_notification_category" AS ENUM ('COMMENT', 'REPLY', 'SUBSCRIBE', 'TAG_EDIT', 'TREND', 'PURCHASE', 'DONATE', 'TAG_WIKI_EDIT', 'ALL');

-- CreateEnum
CREATE TYPE "_user_notification_method" AS ENUM ('EMAIL', 'WEBSITE');

-- CreateTable
CREATE TABLE "user_notification_opt_outs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category" "_user_notification_category" NOT NULL,
    "method" "_user_notification_method" NOT NULL,

    CONSTRAINT "user_notification_opt_outs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_notification_opt_outs_user_id_category_method_key" ON "user_notification_opt_outs"("user_id", "category", "method");

-- AddForeignKey
ALTER TABLE "user_notification_opt_outs" ADD CONSTRAINT "user_notification_opt_outs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
