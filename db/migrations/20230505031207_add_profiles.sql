-- migrate:up
CREATE TABLE `profiles` (
  `id` varchar(32) NOT NULL,
  `user_id` varchar(32) NOT NULL,
  `name` varchar(32) NOT NULL,
  `handle` varchar(16) NOT NULL COLLATE utf8mb4_0900_ai_ci,
  `state` enum('PRIMARY', 'SECONDARY', 'INACTIVE') NOT NULL,
  `created_at` datetime NOT NULL,

  PRIMARY KEY (`id`),
  INDEX `ix_user_id_state` (`user_id`, `state`),
  UNIQUE INDEX `ux_handle` (`handle`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;


-- migrate:down
DROP TABLE `profiles`;
