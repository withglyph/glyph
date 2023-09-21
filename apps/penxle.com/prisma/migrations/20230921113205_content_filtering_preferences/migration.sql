-- CreateEnum
CREATE TYPE "_content_filtering_category" AS ENUM ('ADULT', 'ALL_BUT_ADULT', 'VIOLENCE', 'CRUELTY', 'HORROR', 'GAMBLING', 'TRAUMA', 'CRIME', 'PHOBIA', 'INSULT', 'GROSSNESS', 'OTHER');

-- CreateEnum
CREATE TYPE "_content_filtering_action" AS ENUM ('HIDE', 'WARN', 'EXPOSE');

-- CreateTable
CREATE TABLE "user_content_filtering_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category" "_content_filtering_category" NOT NULL,
    "action" "_content_filtering_action" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_content_filtering_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_content_filtering_preferences_user_id_category_key" ON "user_content_filtering_preferences"("user_id", "category");

-- AddForeignKey
ALTER TABLE "user_content_filtering_preferences" ADD CONSTRAINT "user_content_filtering_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
