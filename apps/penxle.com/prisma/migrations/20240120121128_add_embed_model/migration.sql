-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';

-- CreateTable
CREATE TABLE "embeds" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "image_url" TEXT,
    "html" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "embeds_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "embeds" ADD CONSTRAINT "embeds_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
