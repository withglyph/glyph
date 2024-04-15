CREATE INDEX IF NOT EXISTS "post_views_user_id_index" ON "post_views" ("user_id");
CREATE INDEX IF NOT EXISTS "posts_state_visibility_index" ON "posts" ("state","visibility");
CREATE INDEX IF NOT EXISTS "posts_space_id_state_visibility_index" ON "posts" ("space_id","state","visibility");
CREATE INDEX IF NOT EXISTS "posts_user_id_state_visibility_index" ON "posts" ("user_id","state","visibility");
CREATE INDEX IF NOT EXISTS "spaces_state_visibility_index" ON "spaces" ("state","visibility");