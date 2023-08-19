resource "aws_elasticache_subnet_group" "public" {
  name        = "public"
  description = "Public subnets"

  subnet_ids = [aws_subnet.public_az1.id, aws_subnet.public_az2.id]
}

resource "aws_elasticache_replication_group" "penxle" {
  replication_group_id = "penxle"
  description          = "penxle"

  engine         = "redis"
  engine_version = "7.0"

  node_type          = "cache.t4g.micro"
  num_cache_clusters = 1

  subnet_group_name  = aws_elasticache_subnet_group.public.name
  security_group_ids = [aws_security_group.public.id]
  preferred_cache_cluster_azs = [
    aws_subnet.public_az1.availability_zone,
    aws_subnet.public_az2.availability_zone,
  ]

  multi_az_enabled           = false
  automatic_failover_enabled = false

  at_rest_encryption_enabled = true
  transit_encryption_enabled = true

  snapshot_retention_limit  = 7
  final_snapshot_identifier = "penxle-final-snapshot"

  snapshot_window    = "19:00-20:00"
  maintenance_window = "sun:20:00-sun:22:00"

  apply_immediately = true
}

resource "aws_elasticache_user" "default" {
  user_id   = "default-user"
  user_name = "default"

  engine        = "REDIS"
  access_string = "off"

  authentication_mode {
    type = "no-password-required"
  }
}

resource "aws_elasticache_user" "iam_user" {
  user_id   = "iam-user"
  user_name = "iam-user"

  engine        = "REDIS"
  access_string = "on ~* +@all"

  authentication_mode {
    type = "iam"
  }
}

resource "aws_elasticache_user_group" "iam" {
  user_group_id = "iam"

  engine = "REDIS"
  user_ids = [
    aws_elasticache_user.default.id,
    aws_elasticache_user.iam_user.id
  ]
}
