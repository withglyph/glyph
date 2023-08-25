
resource "aws_lambda_function" "gh_app" {
  function_name = "gh-app"

  role = aws_iam_role.lambda_gh_app.arn

  runtime       = "nodejs18.x"
  architectures = ["x86_64"]

  memory_size = 512
  timeout     = 60

  s3_bucket = aws_s3_bucket.penxle_artifacts.id
  s3_key    = "lambda/gh-app/function.zip"
  handler   = "index.handler"

}

resource "aws_lambda_function_url" "gh_app" {
  function_name      = aws_lambda_function.gh_app.function_name
  authorization_type = "NONE"
}



resource "aws_lambda_function" "literoom_finalize" {
  function_name = "literoom-finalize"

  role = aws_iam_role.lambda_literoom_finalize.arn

  runtime       = "nodejs18.x"
  architectures = ["x86_64"]

  memory_size = 10240
  timeout     = 900

  s3_bucket = aws_s3_bucket.penxle_artifacts.id
  s3_key    = "lambda/literoom-finalize/function.zip"
  handler   = "index.handler"

}

resource "aws_lambda_permission" "literoom_finalize" {
  function_name = aws_lambda_function.literoom_finalize.function_name

  statement_id = "literoom-finalize"
  action       = "lambda:InvokeFunction"
  principal    = "s3.amazonaws.com"
}

resource "aws_lambda_function" "literoom_transform" {
  function_name = "literoom-transform"

  role = aws_iam_role.lambda_literoom_transform.arn

  runtime       = "nodejs18.x"
  architectures = ["x86_64"]

  memory_size = 10240
  timeout     = 900

  s3_bucket = aws_s3_bucket.penxle_artifacts.id
  s3_key    = "lambda/literoom-transform/function.zip"
  handler   = "index.handler"

}
resource "aws_lambda_function" "penxle_com" {
  function_name = "penxle_com"

  role = aws_iam_role.lambda_penxle_com.arn

  runtime       = "nodejs18.x"
  architectures = ["x86_64"]

  memory_size = 2048
  timeout     = 29

  s3_bucket = aws_s3_bucket.penxle_artifacts.id
  s3_key    = "lambda/penxle_com/function.zip"
  handler   = "index.handler"

}

resource "aws_lambda_permission" "penxle_com" {
  function_name = aws_lambda_function.penxle_com.function_name

  statement_id = "penxle_com"
  action       = "lambda:InvokeFunction"
  principal    = "apigateway.amazonaws.com"
}
