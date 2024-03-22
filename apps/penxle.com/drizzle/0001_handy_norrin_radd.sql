DROP TABLE "_prisma_migrations";
ALTER TABLE "post_comments" DROP CONSTRAINT "post_comments_user_id_fkey";

ALTER TABLE "post_comments" DROP CONSTRAINT "post_comments_profile_id_fkey";

ALTER TABLE "post_comments" DROP CONSTRAINT "post_comments_parent_id_fkey";

ALTER TABLE "post_comments" DROP CONSTRAINT "post_comments_post_id_fkey";

ALTER TABLE "post_comment_likes" DROP CONSTRAINT "post_comment_likes_comment_id_fkey";

ALTER TABLE "post_comment_likes" DROP CONSTRAINT "post_comment_likes_user_id_fkey";

ALTER TABLE "post_comment_likes" DROP CONSTRAINT "post_comment_likes_profile_id_fkey";

ALTER TABLE "revenue_withdrawals" DROP CONSTRAINT "revenue_withdrawals_user_id_fkey";

ALTER TABLE "user_withdrawal_configs" DROP CONSTRAINT "user_withdrawal_configs_user_id_fkey";

ALTER TABLE "user_settlement_identities" DROP CONSTRAINT "user_settlement_identities_user_id_fkey";

ALTER TABLE "user_notifications" DROP CONSTRAINT "user_notifications_user_id_fkey";

ALTER TABLE "user_notifications" DROP CONSTRAINT "user_notifications_actor_id_fkey";

ALTER TABLE "post_tags" DROP CONSTRAINT "post_tags_post_id_fkey";

ALTER TABLE "post_tags" DROP CONSTRAINT "post_tags_tag_id_fkey";

ALTER TABLE "bookmarks" DROP CONSTRAINT "bookmarks_user_id_fkey";

ALTER TABLE "bookmark_posts" DROP CONSTRAINT "bookmark_posts_bookmark_id_fkey";

ALTER TABLE "bookmark_posts" DROP CONSTRAINT "bookmark_posts_post_id_fkey";

ALTER TABLE "users" DROP CONSTRAINT "users_profile_id_fkey";

ALTER TABLE "files" DROP CONSTRAINT "files_user_id_fkey";

ALTER TABLE "images" DROP CONSTRAINT "images_user_id_fkey";

ALTER TABLE "point_balances" DROP CONSTRAINT "point_balances_user_id_fkey";

ALTER TABLE "point_balances" DROP CONSTRAINT "point_balances_purchase_id_fkey";

ALTER TABLE "point_purchases" DROP CONSTRAINT "point_purchases_user_id_fkey";

ALTER TABLE "point_transactions" DROP CONSTRAINT "point_transactions_user_id_fkey";

ALTER TABLE "spaces" DROP CONSTRAINT "spaces_icon_id_fkey";

ALTER TABLE "space_members" DROP CONSTRAINT "space_members_space_id_fkey";

ALTER TABLE "space_members" DROP CONSTRAINT "space_members_user_id_fkey";

ALTER TABLE "space_members" DROP CONSTRAINT "space_members_profile_id_fkey";

ALTER TABLE "post_likes" DROP CONSTRAINT "post_likes_post_id_fkey";

ALTER TABLE "post_likes" DROP CONSTRAINT "post_likes_user_id_fkey";

ALTER TABLE "post_reactions" DROP CONSTRAINT "post_reactions_post_id_fkey";

ALTER TABLE "post_reactions" DROP CONSTRAINT "post_reactions_user_id_fkey";

ALTER TABLE "post_views" DROP CONSTRAINT "post_views_post_id_fkey";

ALTER TABLE "post_views" DROP CONSTRAINT "post_views_user_id_fkey";

ALTER TABLE "profiles" DROP CONSTRAINT "profiles_avatar_id_fkey";

ALTER TABLE "space_collections" DROP CONSTRAINT "space_collections_space_id_fkey";

ALTER TABLE "space_collections" DROP CONSTRAINT "space_collections_thumbnail_id_fkey";

ALTER TABLE "space_collection_posts" DROP CONSTRAINT "space_collection_posts_collection_id_fkey";

ALTER TABLE "space_collection_posts" DROP CONSTRAINT "space_collection_posts_post_id_fkey";

ALTER TABLE "post_purchases" DROP CONSTRAINT "post_purchases_post_id_fkey";

ALTER TABLE "post_purchases" DROP CONSTRAINT "post_purchases_revision_id_fkey";

ALTER TABLE "post_purchases" DROP CONSTRAINT "post_purchases_user_id_fkey";

ALTER TABLE "post_revisions" DROP CONSTRAINT "post_revisions_paid_content_id_fkey";

ALTER TABLE "post_revisions" DROP CONSTRAINT "post_revisions_post_id_fkey";

ALTER TABLE "post_revisions" DROP CONSTRAINT "post_revisions_user_id_fkey";

ALTER TABLE "post_revisions" DROP CONSTRAINT "post_revisions_free_content_id_fkey";

ALTER TABLE "space_external_links" DROP CONSTRAINT "space_external_links_space_id_fkey";

ALTER TABLE "space_follows" DROP CONSTRAINT "space_follows_user_id_fkey";

ALTER TABLE "space_follows" DROP CONSTRAINT "space_follows_space_id_fkey";

ALTER TABLE "space_user_blocks" DROP CONSTRAINT "space_user_blocks_space_id_fkey";

ALTER TABLE "space_user_blocks" DROP CONSTRAINT "space_user_blocks_user_id_fkey";

ALTER TABLE "space_member_invitations" DROP CONSTRAINT "space_member_invitations_space_id_fkey";

ALTER TABLE "space_member_invitations" DROP CONSTRAINT "space_member_invitations_sent_user_id_fkey";

ALTER TABLE "space_member_invitations" DROP CONSTRAINT "space_member_invitations_received_user_id_fkey";

ALTER TABLE "tag_follows" DROP CONSTRAINT "tag_follows_user_id_fkey";

ALTER TABLE "tag_follows" DROP CONSTRAINT "tag_follows_tag_id_fkey";

ALTER TABLE "tag_hierarchies" DROP CONSTRAINT "tag_hierarchies_parent_tag_id_fkey";

ALTER TABLE "tag_hierarchies" DROP CONSTRAINT "tag_hierarchies_child_tag_id_fkey";

ALTER TABLE "tag_wikis" DROP CONSTRAINT "tag_wikis_tag_id_fkey";

ALTER TABLE "tag_wiki_revisions" DROP CONSTRAINT "tag_wiki_revisions_tag_wiki_id_fkey";

ALTER TABLE "tag_wiki_revisions" DROP CONSTRAINT "tag_wiki_revisions_user_id_fkey";

ALTER TABLE "user_email_verifications" DROP CONSTRAINT "user_email_verifications_user_id_fkey";

ALTER TABLE "user_marketing_consents" DROP CONSTRAINT "user_marketing_consents_user_id_fkey";

ALTER TABLE "user_notification_preferences" DROP CONSTRAINT "user_notification_preferences_user_id_fkey";

ALTER TABLE "user_single_sign_ons" DROP CONSTRAINT "user_single_sign_ons_user_id_fkey";

ALTER TABLE "user_sessions" DROP CONSTRAINT "user_sessions_user_id_fkey";

ALTER TABLE "user_space_mutes" DROP CONSTRAINT "user_space_mutes_space_id_fkey";

ALTER TABLE "user_space_mutes" DROP CONSTRAINT "user_space_mutes_user_id_fkey";

ALTER TABLE "user_tag_mute" DROP CONSTRAINT "user_tag_mute_user_id_fkey";

ALTER TABLE "user_tag_mute" DROP CONSTRAINT "user_tag_mute_tag_id_fkey";

ALTER TABLE "user_event_enrollments" DROP CONSTRAINT "user_event_enrollments_user_id_fkey";

ALTER TABLE "space_masquerades" DROP CONSTRAINT "space_masquerades_space_id_fkey";

ALTER TABLE "space_masquerades" DROP CONSTRAINT "space_masquerades_user_id_fkey";

ALTER TABLE "space_masquerades" DROP CONSTRAINT "space_masquerades_profile_id_fkey";

ALTER TABLE "posts" DROP CONSTRAINT "posts_thumbnail_id_fkey";

ALTER TABLE "posts" DROP CONSTRAINT "posts_space_id_fkey";

ALTER TABLE "posts" DROP CONSTRAINT "posts_member_id_fkey";

ALTER TABLE "posts" DROP CONSTRAINT "posts_user_id_fkey";

ALTER TABLE "posts" DROP CONSTRAINT "posts_published_revision_id_fkey";

ALTER TABLE "user_content_filter_preferences" DROP CONSTRAINT "user_content_filter_preferences_user_id_fkey";

ALTER TABLE "revenues" DROP CONSTRAINT "revenues_withdrawal_id_fkey";

ALTER TABLE "revenues" DROP CONSTRAINT "revenues_user_id_fkey";

ALTER TABLE "user_personal_identities" DROP CONSTRAINT "user_personal_identities_user_id_fkey";

DROP INDEX IF EXISTS "post_comments_post_id_created_at_idx";
DROP INDEX IF EXISTS "post_comment_likes_comment_id_user_id_key";
DROP INDEX IF EXISTS "user_withdrawal_configs_user_id_key";
DROP INDEX IF EXISTS "user_settlement_identities_user_id_key";
DROP INDEX IF EXISTS "user_settlement_identities_resident_registration_number_has_key";
DROP INDEX IF EXISTS "user_notifications_created_at_idx";
DROP INDEX IF EXISTS "embeds_url_key";
DROP INDEX IF EXISTS "provisioned_users_token_key";
DROP INDEX IF EXISTS "post_tags_post_id_tag_id_kind_key";
DROP INDEX IF EXISTS "bookmark_posts_bookmark_id_post_id_key";
DROP INDEX IF EXISTS "users_profile_id_key";
DROP INDEX IF EXISTS "users_email_state_idx";
DROP INDEX IF EXISTS "point_balances_user_id_kind_created_at_idx";
DROP INDEX IF EXISTS "point_purchases_payment_key_key";
DROP INDEX IF EXISTS "spaces_slug_state_idx";
DROP INDEX IF EXISTS "space_members_space_id_user_id_key";
DROP INDEX IF EXISTS "post_likes_post_id_user_id_key";
DROP INDEX IF EXISTS "post_reactions_created_at_idx";
DROP INDEX IF EXISTS "post_reactions_post_id_user_id_emoji_key";
DROP INDEX IF EXISTS "post_revision_contents_hash_key";
DROP INDEX IF EXISTS "tags_name_key";
DROP INDEX IF EXISTS "post_views_viewed_at_idx";
DROP INDEX IF EXISTS "post_views_user_id_post_id_key";
DROP INDEX IF EXISTS "space_collection_posts_post_id_key";
DROP INDEX IF EXISTS "space_collection_posts_collection_id_order_key";
DROP INDEX IF EXISTS "post_purchases_post_id_user_id_key";
DROP INDEX IF EXISTS "post_revisions_created_at_idx";
DROP INDEX IF EXISTS "space_follows_user_id_space_id_key";
DROP INDEX IF EXISTS "tag_follows_user_id_tag_id_key";
DROP INDEX IF EXISTS "tag_hierarchies_parent_tag_id_key";
DROP INDEX IF EXISTS "tag_hierarchies_child_tag_id_key";
DROP INDEX IF EXISTS "tag_wikis_tag_id_key";
DROP INDEX IF EXISTS "tag_wiki_revisions_created_at_idx";
DROP INDEX IF EXISTS "user_email_verifications_token_key";
DROP INDEX IF EXISTS "user_marketing_consents_user_id_key";
DROP INDEX IF EXISTS "user_notification_preferences_user_id_category_method_key";
DROP INDEX IF EXISTS "user_single_sign_ons_user_id_provider_key";
DROP INDEX IF EXISTS "user_single_sign_ons_provider_principal_key";
DROP INDEX IF EXISTS "user_space_mutes_user_id_space_id_key";
DROP INDEX IF EXISTS "user_tag_mute_user_id_tag_id_key";
DROP INDEX IF EXISTS "user_event_enrollments_user_id_event_code_key";
DROP INDEX IF EXISTS "space_masquerades_space_id_user_id_key";
DROP INDEX IF EXISTS "space_masquerades_profile_id_key";
DROP INDEX IF EXISTS "posts_permalink_key";
DROP INDEX IF EXISTS "posts_published_at_idx";
DROP INDEX IF EXISTS "user_content_filter_preferences_user_id_category_key";
DROP INDEX IF EXISTS "user_personal_identities_user_id_key";
ALTER TABLE "post_comments" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "post_comment_likes" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "revenue_withdrawals" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "user_notifications" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "embeds" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "provisioned_users" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "post_tags" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "bookmarks" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "bookmark_posts" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "files" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "images" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "point_balances" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "point_purchases" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "point_transactions" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "spaces" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "space_members" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "post_likes" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "post_reactions" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "post_revision_contents" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "tags" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "post_views" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "post_views" ALTER COLUMN "viewed_at" SET DEFAULT now();
ALTER TABLE "profiles" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "space_collections" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "space_collection_posts" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "post_purchases" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "post_revisions" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "post_revisions" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE "space_external_links" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "space_follows" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "space_user_blocks" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "space_member_invitations" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "tag_follows" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "tag_hierarchies" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "tag_wikis" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "tag_wiki_revisions" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "user_email_verifications" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "user_marketing_consents" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "user_notification_preferences" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "user_single_sign_ons" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "user_sessions" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "user_space_mutes" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "user_tag_mute" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "user_event_enrollments" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "space_masquerades" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "posts" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "posts" ALTER COLUMN "pairs" SET DEFAULT '{}';
ALTER TABLE "user_content_filter_preferences" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "revenues" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "user_personal_identities" ALTER COLUMN "created_at" SET DEFAULT now();
CREATE INDEX IF NOT EXISTS "post_comments_post_id_created_at_index" ON "post_comments" ("post_id","created_at");
CREATE UNIQUE INDEX IF NOT EXISTS "post_comment_likes_comment_id_user_id_index" ON "post_comment_likes" ("comment_id","user_id");
CREATE INDEX IF NOT EXISTS "user_notifications_created_at_index" ON "user_notifications" ("created_at");
CREATE UNIQUE INDEX IF NOT EXISTS "post_tags_post_id_tag_id_kind_index" ON "post_tags" ("post_id","tag_id","kind");
CREATE UNIQUE INDEX IF NOT EXISTS "bookmark_posts_bookmark_id_post_id_index" ON "bookmark_posts" ("bookmark_id","post_id");
CREATE INDEX IF NOT EXISTS "users_email_state_index" ON "users" ("email","state");
CREATE INDEX IF NOT EXISTS "point_balances_user_id_kind_created_at_index" ON "point_balances" ("user_id","kind","created_at");
CREATE INDEX IF NOT EXISTS "spaces_slug_state_index" ON "spaces" ("slug","state");
CREATE UNIQUE INDEX IF NOT EXISTS "space_members_space_id_user_id_index" ON "space_members" ("space_id","user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "post_likes_post_id_user_id_index" ON "post_likes" ("post_id","user_id");
CREATE INDEX IF NOT EXISTS "post_reactions_created_at_index" ON "post_reactions" ("created_at");
CREATE UNIQUE INDEX IF NOT EXISTS "post_reactions_post_id_user_id_emoji_index" ON "post_reactions" ("post_id","user_id","emoji");
CREATE INDEX IF NOT EXISTS "post_views_viewed_at_index" ON "post_views" ("viewed_at");
CREATE UNIQUE INDEX IF NOT EXISTS "post_views_post_id_user_id_index" ON "post_views" ("post_id","user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "space_collection_posts_collection_id_order_index" ON "space_collection_posts" ("collection_id","order");
CREATE UNIQUE INDEX IF NOT EXISTS "post_purchases_post_id_user_id_index" ON "post_purchases" ("post_id","user_id");
CREATE INDEX IF NOT EXISTS "post_revisions_created_at_index" ON "post_revisions" ("created_at");
CREATE UNIQUE INDEX IF NOT EXISTS "space_follows_user_id_space_id_index" ON "space_follows" ("user_id","space_id");
CREATE UNIQUE INDEX IF NOT EXISTS "tag_follows_user_id_tag_id_index" ON "tag_follows" ("user_id","tag_id");
CREATE INDEX IF NOT EXISTS "tag_wiki_revisions_created_at_index" ON "tag_wiki_revisions" ("created_at");
CREATE UNIQUE INDEX IF NOT EXISTS "user_notification_preferences_user_id_category_method_index" ON "user_notification_preferences" ("user_id","category","method");
CREATE UNIQUE INDEX IF NOT EXISTS "user_single_sign_ons_user_id_provider_index" ON "user_single_sign_ons" ("user_id","provider");
CREATE UNIQUE INDEX IF NOT EXISTS "user_single_sign_ons_provider_principal_index" ON "user_single_sign_ons" ("provider","principal");
CREATE UNIQUE INDEX IF NOT EXISTS "user_space_mutes_user_id_space_id_index" ON "user_space_mutes" ("user_id","space_id");
CREATE UNIQUE INDEX IF NOT EXISTS "user_tag_mute_user_id_tag_id_index" ON "user_tag_mute" ("user_id","tag_id");
CREATE UNIQUE INDEX IF NOT EXISTS "user_event_enrollments_user_id_event_code_index" ON "user_event_enrollments" ("user_id","event_code");
CREATE UNIQUE INDEX IF NOT EXISTS "space_masquerades_space_id_user_id_index" ON "space_masquerades" ("space_id","user_id");
CREATE INDEX IF NOT EXISTS "posts_published_at_index" ON "posts" ("published_at");
CREATE UNIQUE INDEX IF NOT EXISTS "user_content_filter_preferences_user_id_category_index" ON "user_content_filter_preferences" ("user_id","category");
DO $$ BEGIN
 ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_parent_id_post_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "post_comments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_comment_likes" ADD CONSTRAINT "post_comment_likes_comment_id_post_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "post_comments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_comment_likes" ADD CONSTRAINT "post_comment_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_comment_likes" ADD CONSTRAINT "post_comment_likes_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "revenue_withdrawals" ADD CONSTRAINT "revenue_withdrawals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_withdrawal_configs" ADD CONSTRAINT "user_withdrawal_configs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_settlement_identities" ADD CONSTRAINT "user_settlement_identities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_actor_id_profiles_id_fk" FOREIGN KEY ("actor_id") REFERENCES "profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "bookmark_posts" ADD CONSTRAINT "bookmark_posts_bookmark_id_bookmarks_id_fk" FOREIGN KEY ("bookmark_id") REFERENCES "bookmarks"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "bookmark_posts" ADD CONSTRAINT "bookmark_posts_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "files" ADD CONSTRAINT "files_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "images" ADD CONSTRAINT "images_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "point_balances" ADD CONSTRAINT "point_balances_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "point_balances" ADD CONSTRAINT "point_balances_purchase_id_point_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "point_purchases"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "point_purchases" ADD CONSTRAINT "point_purchases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "spaces" ADD CONSTRAINT "spaces_icon_id_images_id_fk" FOREIGN KEY ("icon_id") REFERENCES "images"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "space_members" ADD CONSTRAINT "space_members_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "space_members" ADD CONSTRAINT "space_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "space_members" ADD CONSTRAINT "space_members_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_views" ADD CONSTRAINT "post_views_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_views" ADD CONSTRAINT "post_views_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "profiles" ADD CONSTRAINT "profiles_avatar_id_images_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "images"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "space_collections" ADD CONSTRAINT "space_collections_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "space_collections" ADD CONSTRAINT "space_collections_thumbnail_id_images_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "images"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "space_collection_posts" ADD CONSTRAINT "space_collection_posts_collection_id_space_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "space_collections"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "space_collection_posts" ADD CONSTRAINT "space_collection_posts_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_purchases" ADD CONSTRAINT "post_purchases_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_purchases" ADD CONSTRAINT "post_purchases_revision_id_post_revisions_id_fk" FOREIGN KEY ("revision_id") REFERENCES "post_revisions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_purchases" ADD CONSTRAINT "post_purchases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_revisions" ADD CONSTRAINT "post_revisions_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_revisions" ADD CONSTRAINT "post_revisions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_revisions" ADD CONSTRAINT "post_revisions_free_content_id_post_revision_contents_id_fk" FOREIGN KEY ("free_content_id") REFERENCES "post_revision_contents"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_revisions" ADD CONSTRAINT "post_revisions_paid_content_id_post_revision_contents_id_fk" FOREIGN KEY ("paid_content_id") REFERENCES "post_revision_contents"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "space_external_links" ADD CONSTRAINT "space_external_links_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "space_follows" ADD CONSTRAINT "space_follows_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "space_follows" ADD CONSTRAINT "space_follows_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "space_user_blocks" ADD CONSTRAINT "space_user_blocks_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "space_user_blocks" ADD CONSTRAINT "space_user_blocks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "space_member_invitations" ADD CONSTRAINT "space_member_invitations_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "space_member_invitations" ADD CONSTRAINT "space_member_invitations_sent_user_id_users_id_fk" FOREIGN KEY ("sent_user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "space_member_invitations" ADD CONSTRAINT "space_member_invitations_received_user_id_users_id_fk" FOREIGN KEY ("received_user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "tag_follows" ADD CONSTRAINT "tag_follows_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "tag_follows" ADD CONSTRAINT "tag_follows_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "tag_hierarchies" ADD CONSTRAINT "tag_hierarchies_parent_tag_id_tags_id_fk" FOREIGN KEY ("parent_tag_id") REFERENCES "tags"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "tag_hierarchies" ADD CONSTRAINT "tag_hierarchies_child_tag_id_tags_id_fk" FOREIGN KEY ("child_tag_id") REFERENCES "tags"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "tag_wikis" ADD CONSTRAINT "tag_wikis_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "tag_wiki_revisions" ADD CONSTRAINT "tag_wiki_revisions_tag_wiki_id_tag_wikis_id_fk" FOREIGN KEY ("tag_wiki_id") REFERENCES "tag_wikis"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "tag_wiki_revisions" ADD CONSTRAINT "tag_wiki_revisions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_email_verifications" ADD CONSTRAINT "user_email_verifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_marketing_consents" ADD CONSTRAINT "user_marketing_consents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_notification_preferences" ADD CONSTRAINT "user_notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_single_sign_ons" ADD CONSTRAINT "user_single_sign_ons_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_space_mutes" ADD CONSTRAINT "user_space_mutes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_space_mutes" ADD CONSTRAINT "user_space_mutes_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_tag_mute" ADD CONSTRAINT "user_tag_mute_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_tag_mute" ADD CONSTRAINT "user_tag_mute_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_event_enrollments" ADD CONSTRAINT "user_event_enrollments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "space_masquerades" ADD CONSTRAINT "space_masquerades_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "space_masquerades" ADD CONSTRAINT "space_masquerades_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "space_masquerades" ADD CONSTRAINT "space_masquerades_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "posts" ADD CONSTRAINT "posts_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "posts" ADD CONSTRAINT "posts_member_id_space_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "space_members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "posts" ADD CONSTRAINT "posts_published_revision_id_post_revisions_id_fk" FOREIGN KEY ("published_revision_id") REFERENCES "post_revisions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "posts" ADD CONSTRAINT "posts_thumbnail_id_images_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "images"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_content_filter_preferences" ADD CONSTRAINT "user_content_filter_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "revenues" ADD CONSTRAINT "revenues_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "revenues" ADD CONSTRAINT "revenues_withdrawal_id_revenue_withdrawals_id_fk" FOREIGN KEY ("withdrawal_id") REFERENCES "revenue_withdrawals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_personal_identities" ADD CONSTRAINT "user_personal_identities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "user_withdrawal_configs" ADD CONSTRAINT "user_withdrawal_configs_user_id_unique" UNIQUE("user_id");
ALTER TABLE "user_settlement_identities" ADD CONSTRAINT "user_settlement_identities_user_id_unique" UNIQUE("user_id");
ALTER TABLE "user_settlement_identities" ADD CONSTRAINT "user_settlement_identities_rrn_hash_unique" UNIQUE("resident_registration_number_hash");
ALTER TABLE "embeds" ADD CONSTRAINT "embeds_url_unique" UNIQUE("url");
ALTER TABLE "provisioned_users" ADD CONSTRAINT "provisioned_users_token_unique" UNIQUE("token");
ALTER TABLE "users" ADD CONSTRAINT "users_profile_id_unique" UNIQUE("profile_id");
ALTER TABLE "point_purchases" ADD CONSTRAINT "point_purchases_payment_key_unique" UNIQUE("payment_key");
ALTER TABLE "post_revision_contents" ADD CONSTRAINT "post_revision_contents_hash_unique" UNIQUE("hash");
ALTER TABLE "tags" ADD CONSTRAINT "tags_name_unique" UNIQUE("name");
ALTER TABLE "space_collection_posts" ADD CONSTRAINT "space_collection_posts_post_id_unique" UNIQUE("post_id");
ALTER TABLE "tag_hierarchies" ADD CONSTRAINT "tag_hierarchies_parent_tag_id_unique" UNIQUE("parent_tag_id");
ALTER TABLE "tag_hierarchies" ADD CONSTRAINT "tag_hierarchies_child_tag_id_unique" UNIQUE("child_tag_id");
ALTER TABLE "tag_wikis" ADD CONSTRAINT "tag_wikis_tag_id_unique" UNIQUE("tag_id");
ALTER TABLE "user_email_verifications" ADD CONSTRAINT "user_email_verifications_token_unique" UNIQUE("token");
ALTER TABLE "user_marketing_consents" ADD CONSTRAINT "user_marketing_consents_user_id_unique" UNIQUE("user_id");
ALTER TABLE "space_masquerades" ADD CONSTRAINT "space_masquerades_profile_id_unique" UNIQUE("profile_id");
ALTER TABLE "posts" ADD CONSTRAINT "posts_permalink_unique" UNIQUE("permalink");
ALTER TABLE "user_personal_identities" ADD CONSTRAINT "user_personal_identities_user_id_unique" UNIQUE("user_id");