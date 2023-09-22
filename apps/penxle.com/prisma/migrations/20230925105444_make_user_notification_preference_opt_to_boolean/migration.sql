ALTER TABLE "user_notification_preferences" ALTER COLUMN "opted" TYPE BOOLEAN USING (
  CASE "opted"
    WHEN 'OPT_IN'  THEN TRUE
    WHEN 'OPT_OUT' THEN FALSE
  END
);

DROP TYPE "_user_notification_opt";
