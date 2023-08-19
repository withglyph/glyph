resource "aws_iam_role" "lambda_media" {
  name = "lambda-media"

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
