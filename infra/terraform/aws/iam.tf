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

resource "aws_iam_role" "doppler" {
  name = "doppler"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = ["sts:AssumeRole"]
        Principal = {
          AWS = "299900769157"
        }
        Condition = {
          StringEquals = {
            "sts:ExternalId" = "904c42d3cbd4d54e50d5"
          }
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "doppler" {
  role = aws_iam_role.doppler.id

  name = "doppler"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssm:PutParameter",
          "ssm:LabelParameterVersion",
          "ssm:DeleteParameter",
          "ssm:RemoveTagsFromResource",
          "ssm:GetParameterHistory",
          "ssm:AddTagsToResource",
          "ssm:GetParametersByPath",
          "ssm:GetParameters",
          "ssm:GetParameter",
          "ssm:DeleteParameters"
        ]
        Resource = ["*"]
      },
    ]
  })
}

resource "aws_iam_role" "lambda_literoom_finalize" {
  name = "literoom-finalize@lambda"

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

resource "aws_iam_role_policy" "lambda_literoom_finalize" {
  role = aws_iam_role.lambda_literoom_finalize.id

  name = "literoom-finalize@lambda"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:DeleteObject"]
        Resource = ["${aws_s3_bucket.penxle_uploads.arn}/*"]
      },
      {
        Effect   = "Allow"
        Action   = ["s3:PutObject"]
        Resource = ["${aws_s3_bucket.penxle_data.arn}/*"]
      },
      {
        Effect   = "Allow"
        Action   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = ["arn:aws:logs:*:*:*"]
      }
    ]
  })
}

resource "aws_iam_role" "lambda_literoom_transform" {
  name = "literoom-transform@lambda"

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

resource "aws_iam_role_policy" "lambda_literoom_transform" {
  role = aws_iam_role.lambda_literoom_transform.id

  name = "literoom-transform@lambda"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3-object-lambda:WriteGetObjectResponse"]
        Resource = [aws_s3control_object_lambda_access_point.penxle_images.arn]
      },
      {
        Effect   = "Allow"
        Action   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = ["arn:aws:logs:*:*:*"]
      }
    ]
  })
}

resource "aws_iam_role" "lambda_penxle" {
  name = "penxle@lambda"

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

resource "aws_iam_role_policy" "lambda_penxle" {
  role = aws_iam_role.lambda_penxle.id

  name = "penxle@lambda"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = ["arn:aws:logs:*:*:*"]
      }
    ]
  })
}

resource "aws_iam_role" "lambda_gh_app" {
  name = "gh-app@lambda"

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

resource "aws_iam_role_policy" "lambda_gh_app" {
  role = aws_iam_role.lambda_gh_app.id

  name = "gh-app@lambda"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["lambda:InvokeFunction"]
        Resource = [aws_lambda_function.actions_runner.arn]
      },
      {
        Effect   = "Allow"
        Action   = ["ssm:Get*"]
        Resource = ["*"]
      },
      {
        Effect   = "Allow"
        Action   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = ["arn:aws:logs:*:*:*"]
      }
    ]
  })
}

resource "aws_iam_role" "lambda_actions_runner" {
  name = "actions-runner@lambda"

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

resource "aws_iam_role_policy" "lambda_actions_runner" {
  role = aws_iam_role.lambda_actions_runner.id

  name = "actions-runner@lambda"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = ["arn:aws:logs:*:*:*"]
      }
    ]
  })
}
