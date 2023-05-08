-- migrate:up
CREATE TABLE `sessions` (
  `id` varchar(32) NOT NULL,
  `profile_id` varchar(32) NOT NULL,
  `created_at` datetime NOT NULL,

  PRIMARY KEY (`id`),
  INDEX `ix_profile_id` (`profile_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;


-- migrate:down
DROP TABLE `sessions`;
