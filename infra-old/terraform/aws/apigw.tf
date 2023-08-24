resource "aws_apigatewayv2_api" "penxle_com" {
  name          = "penxle_com"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_integration" "penxle_com" {
  api_id = aws_apigatewayv2_api.penxle_com.id

  integration_type   = "AWS_PROXY"
  integration_method = "POST"
  integration_uri    = aws_lambda_function.penxle_com.invoke_arn

  payload_format_version = "2.0"

  passthrough_behavior = "WHEN_NO_MATCH"
}

resource "aws_apigatewayv2_route" "penxle_com" {
  api_id = aws_apigatewayv2_api.penxle_com.id

  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.penxle_com.id}"
}

resource "aws_apigatewayv2_stage" "penxle_com" {
  api_id = aws_apigatewayv2_api.penxle_com.id

  name        = "$default"
  auto_deploy = true
}
