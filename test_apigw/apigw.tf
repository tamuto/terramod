# data "aws_subnet" "apigw" {
#   filter {
#     name   = "tag:Name"
#     values = [var.subnet_name]
#   }
# }

# data "aws_vpc" "vpc" {
#   filter {
#     name   = "tag:Name"
#     values = [var.vpc_name]
#   }
# }

# data "aws_security_group" "apigw" {
#   name   = var.secgroup_name
#   vpc_id = data.aws_vpc.vpc.id
# }

resource "aws_apigatewayv2_api" "apigw" {
  name                         = "${var.name}-apigw"
  protocol_type                = "HTTP"
  disable_execute_api_endpoint = true

  cors_configuration {
    allow_headers = ["Content-Type", "X-Amz-Date", "Authorization", "X-Api-Key", "X-Amz-Security-Token", "x-echo", "member_id", "admin_id"]
    allow_methods = ["GET", "POST", "PUT", "DELETE"]
    # TODO: 調査と書き換え
    allow_origins = ["*"]
  }
}

data "aws_cognito_user_pool_client" "apigw_userAuth" {
  client_id = var.cognito_user_client_id
  user_pool_id = var.cognito_user_pool_id
}

data "aws_cognito_user_pool_client" "apigw_managerAuth" {
  client_id = var.cognito_manager_client_id
  user_pool_id = var.cognito_manager_pool_id
}

resource "aws_apigatewayv2_authorizer" "apigw_userAuth" {
    api_id = aws_apigatewayv2_api.apigw.id
    authorizer_type = "JWT"
    identity_sources = ["$request.header.Authorization"]
    name = "cognito"
    jwt_configuration {
        audience = ["${data.aws_cognito_user_pool_client.apigw_userAuth.client_id}"]
        issuer = "https://cognito-idp.ap-northeast-1.amazonaws.com/${data.aws_cognito_user_pool_client.apigw_userAuth.user_pool_id}"
    }
}

resource "aws_apigatewayv2_stage" "apigw_st" {
  api_id      = aws_apigatewayv2_api.apigw.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_apigatewayv2_integration" "apigw_http" {
  api_id             = aws_apigatewayv2_api.apigw.id
  integration_type   = "HTTP_PROXY"
  integration_method = "ANY"
  integration_uri = "https://api.auth.ap-northeast-1.amazoncognito.com/{proxy}"
}

resource "aws_apigatewayv2_route" "apigw_rt" {
  api_id    = aws_apigatewayv2_api.apigw.id
  route_key = "ANY /api/{proxy+}"
}

resource "aws_apigatewayv2_route" "apigw_rt_auth_user" {
  api_id    = aws_apigatewayv2_api.apigw.id
  route_key = "ANY /user_auth/{proxy+}"
  authorization_type = "JWT"
  authorizer_id = aws_apigatewayv2_authorizer.apigw_userAuth.id
}

resource "aws_apigatewayv2_route" "apigw_rt_auth_manager" {
  api_id    = aws_apigatewayv2_api.apigw.id
  route_key = "ANY /manager_auth/{proxy+}"
  authorization_type = "JWT"
  authorizer_id = aws_apigatewayv2_authorizer.apigw_managerAuth.id
}

# resource "aws_apigatewayv2_vpc_link" "Test_API_vpc" {
#   name               = "${var.name}-link"
#   security_group_ids = [data.aws_security_group.apigw.id]
#   subnet_ids         = [data.aws_subnet.apigw.id]
# }