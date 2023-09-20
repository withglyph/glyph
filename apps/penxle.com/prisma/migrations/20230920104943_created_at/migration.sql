-- AlterTable
ALTER TABLE "user_notification_opt_outs" ADD COLUMN     "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
