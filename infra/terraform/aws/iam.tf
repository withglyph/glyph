resource "aws_iam_user" "bunny_net" {
  name = "bunny.net"
}

resource "aws_iam_user_policy" "bunny_net" {
  user = aws_iam_user.bunny_net.id

  name = "bunny.net"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:GetObject"]
        Resource = ["${aws_s3_bucket.penxle_data.arn}/*"]
      }
    ]
  })
}

resource "aws_iam_access_key" "bunny_net" {
  user = aws_iam_user.bunny_net.id
}

resource "aws_iam_user" "penxle_com" {
  name = "penxle.com"
}

resource "aws_iam_user_policy" "penxle_com" {
  user = aws_iam_user.penxle_com.id

  name = "penxle_com"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:PutObject"]
        Resource = ["${aws_s3_bucket.penxle_uploads.arn}/*"]
      }
    ]
  })
}

resource "aws_iam_access_key" "penxle_com" {
  user = aws_iam_user.penxle_com.id
}

resource "aws_iam_role" "lambda_media" {
  name = "media@lambda"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = ["sts:AssumeRole"]
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "lambda_media" {
  role = aws_iam_role.lambda_media.id

  name = "media@lambda"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:GetObject"]
        Resource = ["${aws_s3_bucket.penxle_data.arn}/*"]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_media" {
  role       = aws_iam_role.lambda_media.id
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}
