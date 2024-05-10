DROP INDEX IF EXISTS "post_content_updates_post_id_created_at_index";
CREATE INDEX IF NOT EXISTS "post_content_updates_post_id_seq_index" ON "post_content_updates" ("post_id","seq");