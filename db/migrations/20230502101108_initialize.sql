-- migrate:up
CREATE TABLE `users` (
  `id` varchar(32) NOT NULL,
  `email` varchar(256) NOT NULL COLLATE utf8mb4_0900_ai_ci,
  `password` varchar(256) NOT NULL,
  `state` enum('ACTIVE', 'INACTIVE') NOT NULL,
  `created_at` datetime NOT NULL,

  PRIMARY KEY (`id`),
  UNIQUE INDEX `ux_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;


-- migrate:down
DROP TABLE `users`;
