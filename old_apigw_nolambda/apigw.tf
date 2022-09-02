#apigwのフォルダの構成をapigw_nolambda内で構成しオーソライザーの箇所を書き換える
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
    allow_headers = var.allow_headers
    allow_methods = var.allow_methods
    allow_origins = var.allow_origins
  }
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
  # authorization_type = "JWT"
  # authorizer_id = aws_apigatewayv2_authorizer.apigw_userAuth.id
}

resource "aws_apigatewayv2_route" "apigw_rt_auth_manager" {
  api_id    = aws_apigatewayv2_api.apigw.id
  route_key = "ANY /manager_auth/{proxy+}"
  # authorization_type = "JWT"
  # authorizer_id = aws_apigatewayv2_authorizer.apigw_managerAuth.id
}

# resource "aws_apigatewayv2_vpc_link" "apigw_vpc" {
#   name               = "${var.name}-link"
#   security_group_ids = [data.aws_security_group.apigw.id]
#   subnet_ids         = [data.aws_subnet.apigw.id]
# }
