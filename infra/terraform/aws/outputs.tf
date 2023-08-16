output "rds_connection_url" {
  value = "postgres://${aws_rds_cluster.penxle.master_username}:${aws_rds_cluster.penxle.master_password}@${aws_rds_cluster.penxle.endpoint}:${aws_rds_cluster.penxle.port}"
}
