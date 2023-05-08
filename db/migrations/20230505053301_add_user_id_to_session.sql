-- migrate:up
ALTER TABLE sessions ADD COLUMN `user_id` varchar(32) NOT NULL AFTER `id`;


-- migrate:down
ALTER TABLE sessions DROP COLUMN `user_id`;
