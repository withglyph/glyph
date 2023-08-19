output "aws_iam_access_key_bunny_net" {
  value     = module.aws.iam_access_key_bunny_net
  sensitive = true
}

output "aws_iam_access_key_penxle_com" {
  value     = module.aws.iam_access_key_penxle_com
  sensitive = true
}

output "aws_rds_cluster_penxle_connection_url" {
  value     = module.aws.rds_cluster_penxle_connection_url
  sensitive = true
}
