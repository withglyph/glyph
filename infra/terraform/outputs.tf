output "aws_rds_connection_url" {
  value     = module.aws.rds_connection_url
  sensitive = true
}
