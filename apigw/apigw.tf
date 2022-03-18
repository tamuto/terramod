resource "aws_apigatewayv2_api" "apigw" {
  name = var.apigw_name
  protocol_type = "HTTP"
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

resource "aws_apigatewayv2_vpc_link" "apigw" {
  name               = var.vpc_link
  security_group_ids = [data.aws_security_group.apigw.id]
  subnet_ids         = [data.aws_subnet.apigw.id]
}

resource "aws_apigatewayv2_integration" "apigw" {
  api_id           = aws_apigatewayv2_api.apigw.id
  integration_type = "HTTP_PROXY"
  integration_uri  = aws_service_discovery_service.ns.arn

  integration_method = var.integration_method
  connection_type    = "VPC_LINK"
  connection_id      = aws_apigatewayv2_vpc_link.apigw.id
}