-- CreateEnum
CREATE TYPE "_space_state" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "_space_member_role" AS ENUM ('OWNER', 'MEMBER');

-- CreateEnum
CREATE TYPE "_user_sso_provider" AS ENUM ('GOOGLE', 'NAVER');

-- CreateEnum
CREATE TYPE "_user_state" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "images" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "name" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "placeholder" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spaces" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" "_space_state" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "spaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "space_members" (
    "id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "role" "_space_member_role" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "space_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "state" "_user_state" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_ssos" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" "_user_sso_provider" NOT NULL,
    "provider_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_ssos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_passwords" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_passwords_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "images_id_path_color_idx" ON "images"("id", "path", "color");

-- CreateIndex
CREATE INDEX "spaces_slug_state_idx" ON "spaces"("slug", "state");

-- CreateIndex
CREATE UNIQUE INDEX "space_members_space_id_user_id_key" ON "space_members"("space_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_avatar_id_key" ON "profiles"("avatar_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_profile_id_key" ON "users"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_ssos_user_id_provider_key" ON "user_ssos"("user_id", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "user_ssos_provider_provider_user_id_key" ON "user_ssos"("provider", "provider_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_passwords_user_id_key" ON "user_passwords"("user_id");

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_members" ADD CONSTRAINT "space_members_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_members" ADD CONSTRAINT "space_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_members" ADD CONSTRAINT "space_members_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_avatar_id_fkey" FOREIGN KEY ("avatar_id") REFERENCES "images"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_ssos" ADD CONSTRAINT "user_ssos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_passwords" ADD CONSTRAINT "user_passwords_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
