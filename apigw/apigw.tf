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

resource "aws_apigatewayv2_route" "cors" {
    api_id = aws_apigatewayv2_api.apigw.id
    route_key = "OPTIONS /{proxy+}"
    target = "integrations/${aws_apigatewayv2_integration.cors.id}"
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

resource "aws_apigatewayv2_integration" "cors" {
    api_id = aws_apigatewayv2_api.apigw.id
    integration_type = "AWS_PROXY"
    integration_uri = aws_lambda_function.cors.arn
    payload_format_version = "2.0"
}

resource "aws_lambda_permission" "cors" {
    function_name = aws_lambda_function.cors.arn
    principal = "apigateway.amazonaws.com"
    action = "lambda:InvokeFunction"

    source_arn = "${aws_apigatewayv2_api.apigw.execution_arn}/*/*"
}