resource "aws_ecr_repository" "media" {
  name = "penxle/media"
}

data "aws_ecr_image" "media" {
  repository_name = "penxle/media"
  image_tag       = "latest"
}
