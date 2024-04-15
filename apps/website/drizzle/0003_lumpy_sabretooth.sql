DROP INDEX IF EXISTS "post_views_user_id_index";
DROP INDEX IF EXISTS "post_views_viewed_at_index";
CREATE INDEX IF NOT EXISTS "post_views_user_id_viewed_at_index" ON "post_views" ("user_id","viewed_at");