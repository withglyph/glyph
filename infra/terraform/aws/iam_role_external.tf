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
