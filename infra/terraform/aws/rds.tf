data "aws_rds_engine_version" "latest" {
  engine  = "aurora-postgresql"
  version = "15"

  default_only = true

  filter {
    name   = "engine-mode"
    values = ["provisioned"]
  }
}

resource "random_password" "rds" {
  length  = 20
  special = false
}

resource "aws_db_subnet_group" "public" {
  name       = "public"
  subnet_ids = [aws_subnet.public_az1.id, aws_subnet.public_az2.id]

  tags = { Name = "public" }
}

resource "aws_rds_cluster" "penxle" {
  cluster_identifier = "penxle"

  engine         = "aurora-postgresql"
  engine_mode    = "provisioned"
  engine_version = data.aws_rds_engine_version.latest.version

  port                   = 65432
  db_subnet_group_name   = aws_db_subnet_group.public.name
  vpc_security_group_ids = [aws_security_group.public.id]

  deletion_protection = true
  storage_encrypted   = true

  backup_retention_period   = 7
  final_snapshot_identifier = "penxle-final-snapshot"

  preferred_backup_window      = "19:00-20:00"
  preferred_maintenance_window = "sun:20:00-sun:22:00"

  master_username = "postgres"
  master_password = random_password.rds.result

  apply_immediately = true

  serverlessv2_scaling_configuration {
    min_capacity = 0.5
    max_capacity = 1.0
  }
}

resource "aws_rds_cluster_instance" "penxle" {
  count = 1

  cluster_identifier = aws_rds_cluster.penxle.id
  identifier         = "penxle-${count.index + 1}"

  engine         = aws_rds_cluster.penxle.engine
  engine_version = aws_rds_cluster.penxle.engine_version

  instance_class = "db.serverless"

  promotion_tier = count.index + 2

  publicly_accessible  = true
  db_subnet_group_name = aws_rds_cluster.penxle.db_subnet_group_name
  availability_zone = (
    count.index % 2 == 0 ?
    aws_subnet.public_az1.availability_zone :
    aws_subnet.public_az2.availability_zone
  )

  performance_insights_enabled = true

  preferred_maintenance_window = aws_rds_cluster.penxle.preferred_maintenance_window

  apply_immediately = true
}
