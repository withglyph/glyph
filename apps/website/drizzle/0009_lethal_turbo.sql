DO $$ BEGIN
 CREATE TYPE "_feature_flag" AS ENUM('SHOW_AD');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "feature_flags" (
	"id" text PRIMARY KEY NOT NULL,
	"flag" "_feature_flag" NOT NULL,
	"ratio" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feature_flags_flag_unique" UNIQUE("flag")
);
