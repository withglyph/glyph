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
        Effect = "Allow"
        Action = ["s3:GetObject"]
        Resource = [
          "${aws_s3_bucket.penxle_data.arn}/*",
          "${aws_s3_access_point.penxle_data.arn}/*",
        ]
      },
      {
        Effect   = "Allow"
        Action   = ["s3-object-lambda:GetObject"]
        Resource = [aws_s3control_object_lambda_access_point.penxle_images.arn]
      },
      {
        Effect   = "Allow"
        Action   = ["lambda:InvokeFunction"]
        Resource = [aws_lambda_function.literoom_transform.arn]
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
