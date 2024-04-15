DROP INDEX IF EXISTS "post_revisions_created_at_index";
CREATE INDEX IF NOT EXISTS "post_revisions_post_id_created_at_index" ON "post_revisions" ("post_id","created_at");