resource "aws_lambda_function" "media_transform" {
  function_name = "media-transform"

  role = aws_iam_role.lambda_media.arn

  package_type  = "Image"
  image_uri     = "${aws_ecr_repository.media.repository_url}:latest"
  architectures = ["arm64"]

  memory_size = 10240
  timeout     = 900

  source_code_hash = trimprefix(data.aws_ecr_image.media.id, "sha256:")

  image_config {
    command = ["transform.handler"]
  }
}

resource "aws_lambda_function_url" "media_transform" {
  function_name = aws_lambda_function.media_transform.function_name

  authorization_type = "NONE"
}
