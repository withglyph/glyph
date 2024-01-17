-- DropForeignKey
ALTER TABLE "user_notifications" DROP CONSTRAINT "user_notifications_profile_id_fkey";

-- AlterTable
ALTER TABLE "user_notifications" RENAME COLUMN "profile_id" to "actor_id";

-- AddForeignKey
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
