CREATE TABLE IF NOT EXISTS "post_content_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"data" "bytea" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "post_content_states" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"update" "bytea" NOT NULL,
	"vector" "bytea" NOT NULL,
	"up_to_seq" bigserial NOT NULL,
	"title" text,
	"subtitle" text,
	"content" jsonb NOT NULL,
	"text" text NOT NULL,
	"characters" integer NOT NULL,
	"images" integer NOT NULL,
	"files" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "post_content_states_post_id_unique" UNIQUE("post_id")
);

CREATE TABLE IF NOT EXISTS "post_content_updates" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"user_id" text NOT NULL,
	"client_id" text NOT NULL,
	"data" "bytea" NOT NULL,
	"seq" bigserial NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "post_revision_contents" ADD COLUMN "text" text DEFAULT '' NOT NULL;
ALTER TABLE "post_revision_contents" ADD COLUMN "characters" integer DEFAULT 0 NOT NULL;
ALTER TABLE "post_revision_contents" ADD COLUMN "images" integer DEFAULT 0 NOT NULL;
ALTER TABLE "post_revision_contents" ADD COLUMN "files" integer DEFAULT 0 NOT NULL;
ALTER TABLE "post_revisions" ADD COLUMN "attributes" jsonb DEFAULT '{}' NOT NULL;
CREATE INDEX IF NOT EXISTS "post_content_snapshots_post_id_created_at_index" ON "post_content_snapshots" ("post_id","created_at");
CREATE INDEX IF NOT EXISTS "post_content_updates_post_id_created_at_index" ON "post_content_updates" ("post_id","created_at");
DO $$ BEGIN
 ALTER TABLE "post_content_snapshots" ADD CONSTRAINT "post_content_snapshots_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_content_states" ADD CONSTRAINT "post_content_states_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_content_updates" ADD CONSTRAINT "post_content_updates_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_content_updates" ADD CONSTRAINT "post_content_updates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
