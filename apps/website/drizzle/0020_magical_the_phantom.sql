CREATE TABLE IF NOT EXISTS "user_arbitrary_key_values" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

DO $$ BEGIN
 ALTER TABLE "user_arbitrary_key_values" ADD CONSTRAINT "user_arbitrary_key_values_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "user_arbitrary_key_values_user_id_key_index" ON "user_arbitrary_key_values" USING btree ("user_id","key");