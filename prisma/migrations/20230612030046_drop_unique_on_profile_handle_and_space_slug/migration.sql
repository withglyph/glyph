-- DropIndex
DROP INDEX "profiles_handle_key";

-- DropIndex
DROP INDEX "profiles_user_id_state_idx";

-- DropIndex
DROP INDEX "spaces_slug_key";

-- DropIndex
DROP INDEX "users_id_state_idx";

-- CreateIndex
CREATE INDEX "profiles_handle_idx" ON "profiles"("handle");

-- CreateIndex
CREATE INDEX "spaces_slug_idx" ON "spaces"("slug");
