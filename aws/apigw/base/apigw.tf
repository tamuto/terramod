resource "aws_apigatewayv2_api" "apigw" {
  name = "${var.name}-apigw"
  protocol_type = "HTTP"
  disable_execute_api_endpoint = var.disable_apigw_endpoint
}

resource "aws_apigatewayv2_stage" "apigw" {
  api_id = aws_apigatewayv2_api.apigw.id
  name   = "$default"
  auto_deploy = true
}

resource "aws_apigatewayv2_route" "apigw" {
  api_id    = aws_apigatewayv2_api.apigw.id
  route_key = "ANY /{proxy+}"
  target = "integrations/${aws_apigatewayv2_integration.apigw.id}"
}

resource "aws_apigatewayv2_integration" "apigw" {
  api_id           = aws_apigatewayv2_api.apigw.id
  integration_type = "HTTP_PROXY"
  integration_uri  = aws_service_discovery_service.ns.arn
  integration_method = "ANY"

  connection_type    = "VPC_LINK"
  connection_id      = var.vpclink_id
}
