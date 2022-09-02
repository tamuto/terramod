resource "aws_apigatewayv2_api" "apigw" {
  name = "${var.name}-apigw"
  protocol_type = "HTTP"

  cors_configuration {
    allow_headers = var.allow_headers
    allow_methods = var.allow_methods
    allow_origins = var.allow_origins
  }
}

resource "aws_apigatewayv2_stage" "apigw" {
  api_id = aws_apigatewayv2_api.apigw.id
  name   = "$default"
  auto_deploy = true
}

data "aws_cognito_user_pools" "user_selected" {
  name = var.user_poolname
}

data "aws_cognito_user_pool_clients" "user_main" {
  user_pool_id = data.aws_cognito_user_pools.user_selected.ids[0]
}

data "aws_cognito_user_pools" "manager_selected" {
  name = var.manager_poolname
}

data "aws_cognito_user_pool_clients" "manager_main" {
  user_pool_id = data.aws_cognito_user_pools.manager_selected.ids[0]
}

resource "aws_apigatewayv2_authorizer" "apigw_userAuth" {
    api_id = aws_apigatewayv2_api.apigw.id
    authorizer_type = "JWT"
    identity_sources = ["$request.header.Authorization"]
    name = "cognito-user"
    jwt_configuration {
        audience = ["${data.aws_cognito_user_pool_clients.user_main.client_ids[0]}"]
        issuer = "https://cognito-idp.ap-northeast-1.amazonaws.com/${data.aws_cognito_user_pool_clients.user_main.user_pool_id}"
    }
}

resource "aws_apigatewayv2_authorizer" "apigw_managerAuth" {
    api_id = aws_apigatewayv2_api.apigw.id
    authorizer_type = "JWT"
    identity_sources = ["$request.header.Authorization"]
    name = "cognito-manager"
    jwt_configuration {
        audience = ["${data.aws_cognito_user_pool_clients.manager_main.client_ids[0]}"]
        issuer = "https://cognito-idp.ap-northeast-1.amazonaws.com/${data.aws_cognito_user_pool_clients.manager_main.user_pool_id}"
    }
}

resource "aws_apigatewayv2_integration" "apigw" {
  api_id           = aws_apigatewayv2_api.apigw.id
  integration_type = "HTTP_PROXY"
  integration_uri  = aws_service_discovery_service.ns.arn
  integration_method = "ANY"

  connection_type    = "VPC_LINK"
  connection_id      = aws_apigatewayv2_vpc_link.apigw.id
}

resource "aws_apigatewayv2_integration" "cors" {
  api_id = aws_apigatewayv2_api.apigw.id
  integration_type = "AWS_PROXY"
  integration_uri = aws_lambda_function.cors.arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "apigw" {
  api_id    = aws_apigatewayv2_api.apigw.id
  route_key = "ANY /{proxy+}"
  target = "integrations/${aws_apigatewayv2_integration.apigw.id}"
}

resource "aws_apigatewayv2_route" "apigw_userAuth" {
  api_id    = aws_apigatewayv2_api.apigw.id
  route_key = "ANY /user_auth/{proxy+}"
  target = "integrations/${aws_apigatewayv2_integration.apigw.id}"
  authorization_type = "JWT"
  authorizer_id = aws_apigatewayv2_authorizer.apigw_userAuth.id
}

resource "aws_apigatewayv2_route" "apigw_managerAuth" {
  api_id    = aws_apigatewayv2_api.apigw.id
  route_key = "ANY /manager_auth/{proxy+}"
  target = "integrations/${aws_apigatewayv2_integration.apigw.id}"
  authorization_type = "JWT"
  authorizer_id = aws_apigatewayv2_authorizer.apigw_managerAuth.id
}

resource "aws_apigatewayv2_route" "cors" {
  api_id = aws_apigatewayv2_api.apigw.id
  route_key = "OPTIONS /{proxy+}"
  target = "integrations/${aws_apigatewayv2_integration.cors.id}"
}

resource "aws_apigatewayv2_vpc_link" "apigw" {
  name               = "${var.name}-link"
  security_group_ids = [data.aws_security_group.apigw.id]
  subnet_ids         = [data.aws_subnet.apigw.id]
}

resource "aws_lambda_permission" "cors" {
  function_name = aws_lambda_function.cors.arn
  principal = "apigateway.amazonaws.com"
  action = "lambda:InvokeFunction"

  source_arn = "${aws_apigatewayv2_api.apigw.execution_arn}/*/*"
}