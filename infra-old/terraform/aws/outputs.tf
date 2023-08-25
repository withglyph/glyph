output "iam_access_key_bunny_net" {
  value = {
    id     = aws_iam_access_key.bunny_net.id
    secret = aws_iam_access_key.bunny_net.secret
  }
}

output "iam_access_key_penxle_com" {
  value = {
    id     = aws_iam_access_key.penxle_com.id
    secret = aws_iam_access_key.penxle_com.secret
  }
}

output "rds_cluster_penxle_connection_url" {
  value = "postgres://${aws_rds_cluster.penxle.master_username}:${aws_rds_cluster.penxle.master_password}@${aws_rds_cluster.penxle.endpoint}:${aws_rds_cluster.penxle.port}"
}

output "sesv2_email_identity_penxle_com_dkim_tokens" {
  value = aws_sesv2_email_identity.penxle_com.dkim_signing_attributes[0].tokens
}
