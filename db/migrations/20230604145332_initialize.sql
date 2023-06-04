-- migrate:up

CREATE TABLE `images` (
  `id` varchar(32) NOT NULL,
  `name` varchar(256) NOT NULL,
  `size` int NOT NULL,
  `format` varchar(32) NOT NULL,
  `width` int NOT NULL,
  `height` int NOT NULL,
  `path` varchar(256) NOT NULL,
  `sizes` json NOT NULL,
  `hash` varchar(256) NOT NULL,
  `color` varchar(32) NOT NULL,
  `placeholder` varchar(2048) NOT NULL,
  `created_at` datetime NOT NULL,

  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

CREATE TABLE `users` (
  `id` varchar(32) NOT NULL,
  `email` varchar(256) NOT NULL,
  `password` varchar(256),
  `state` enum('ACTIVE', 'INACTIVE') NOT NULL,
  `created_at` datetime NOT NULL,

  PRIMARY KEY (`id`),
  UNIQUE INDEX `ux_email` ((LOWER(`email`)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

CREATE TABLE `profiles` (
  `id` varchar(32) NOT NULL,
  `user_id` varchar(32) NOT NULL,
  `name` varchar(32) NOT NULL,
  `order` int NOT NULL,
  `avatar_id` varchar(32),
  `state` enum('ACTIVE', 'INACTIVE') NOT NULL,
  `created_at` datetime NOT NULL,

  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

CREATE TABLE `sessions` (
  `id` varchar(32) NOT NULL,
  `user_id` varchar(32) NOT NULL,
  `profile_id` varchar(32) NOT NULL,
  `created_at` datetime NOT NULL,

  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- migrate:down
