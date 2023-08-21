resource "aws_apigatewayv2_api" "penxle" {
  name          = "penxle"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_integration" "penxle" {
  api_id = aws_apigatewayv2_api.penxle.id

  integration_type   = "AWS_PROXY"
  integration_method = "POST"
  integration_uri    = aws_lambda_function.penxle.invoke_arn

  payload_format_version = "2.0"

  passthrough_behavior = "WHEN_NO_MATCH"
}

resource "aws_apigatewayv2_route" "penxle" {
  api_id = aws_apigatewayv2_api.penxle.id

  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.penxle.id}"
}

resource "aws_apigatewayv2_stage" "penxle" {
  api_id = aws_apigatewayv2_api.penxle.id

  name        = "$default"
  auto_deploy = true
}
