data "aws_s3_object" "literoom_transform" {
  bucket = "penxle-artifacts"
  key    = "literoom/transform.hash"
}

data "aws_s3_object" "literoom_finalize" {
  bucket = "penxle-artifacts"
  key    = "literoom/finalize.hash"
}

data "aws_s3_object" "literoom_layer" {
  bucket = "penxle-artifacts"
  key    = "literoom/layer.hash"
}

data "aws_s3_object" "penxle" {
  bucket = "penxle-artifacts"
  key    = "penxle/function.hash"
}

data "aws_s3_object" "actions_runner_orchestrator" {
  bucket = "penxle-artifacts"
  key    = "actions-runner/orchestrator.hash"
}

resource "aws_lambda_layer_version" "literoom_layer" {
  layer_name = "literoom"

  s3_bucket = aws_s3_bucket.penxle_artifacts.id
  s3_key    = "literoom/layer.zip"

  compatible_runtimes      = ["nodejs18.x"]
  compatible_architectures = ["arm64"]

  source_code_hash = data.aws_s3_object.literoom_layer.body
}

resource "aws_lambda_function" "literoom_finalize" {
  function_name = "literoom-finalize"

  role = aws_iam_role.lambda_literoom_finalize.arn

  runtime       = "nodejs18.x"
  architectures = ["arm64"]

  memory_size = 10240
  timeout     = 900

  s3_bucket = aws_s3_bucket.penxle_artifacts.id
  s3_key    = "literoom/finalize.zip"
  handler   = "index.handler"

  layers = [aws_lambda_layer_version.literoom_layer.id]

  source_code_hash = data.aws_s3_object.literoom_finalize.body
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
  architectures = ["arm64"]

  memory_size = 10240
  timeout     = 900

  s3_bucket = aws_s3_bucket.penxle_artifacts.id
  s3_key    = "literoom/transform.zip"
  handler   = "index.handler"

  layers = [aws_lambda_layer_version.literoom_layer.id]

  source_code_hash = data.aws_s3_object.literoom_transform.body
}

resource "aws_lambda_function" "penxle" {
  function_name = "penxle"

  role = aws_iam_role.lambda_penxle.arn

  runtime       = "nodejs18.x"
  architectures = ["arm64"]

  memory_size = 2048
  timeout     = 29

  s3_bucket = aws_s3_bucket.penxle_artifacts.id
  s3_key    = "penxle/function.zip"
  handler   = "index.handler"

  source_code_hash = data.aws_s3_object.penxle.body
}

resource "aws_lambda_permission" "penxle" {
  function_name = aws_lambda_function.penxle.function_name

  statement_id = "penxle"
  action       = "lambda:InvokeFunction"
  principal    = "apigateway.amazonaws.com"
}

resource "aws_lambda_function" "actions_runner" {
  function_name = "actions-runner"

  role = aws_iam_role.lambda_actions_runner.arn

  package_type  = "Image"
  image_uri     = "721144421085.dkr.ecr.ap-northeast-2.amazonaws.com/actions-runner:latest"
  architectures = ["arm64"]

  memory_size = 10240
  timeout     = 900

  # source_code_hash = data.aws_s3_object.actions_runner_orchestrator.body
}

resource "aws_lambda_function" "actions_runner_orchestrator" {
  function_name = "actions-runner-orchestrator"

  role = aws_iam_role.lambda_actions_runner_orchestrator.arn

  runtime       = "nodejs18.x"
  architectures = ["arm64"]

  memory_size = 512
  timeout     = 60

  s3_bucket = aws_s3_bucket.penxle_artifacts.id
  s3_key    = "actions-runner/orchestrator.zip"
  handler   = "index.handler"

  source_code_hash = data.aws_s3_object.actions_runner_orchestrator.body
}

resource "aws_lambda_function_url" "actions_runner_orchestrator" {
  function_name      = aws_lambda_function.actions_runner_orchestrator.function_name
  authorization_type = "NONE"
}
