resource "aws_apigatewayv2_api" "authapi" {
    name = "AuthAPI"
    protocol_type = "HTTP"
    disable_execute_api_endpoint = true
}

resource "aws_apigatewayv2_integration" "authapi" {
    api_id = aws_apigatewayv2_api.authapi.id
    integration_type = "AWS_PROXY"
    integration_uri = aws_lambda_function.apply_cookie.arn
    payload_format_version = "2.0"
}

resource "aws_apigatewayv2_authorizer" "authapi" {
    api_id = aws_apigatewayv2_api.authapi.id
    authorizer_type = "JWT"
    identity_sources = ["$request.header.Authorization"]
    name = "cognito"
    jwt_configuration {
        audience = [aws_cognito_user_pool_client.pool_client.id]
        issuer = "https://${aws_cognito_user_pool.user_pool.endpoint}"
    }
}

resource "aws_apigatewayv2_route" "authapi" {
    api_id = aws_apigatewayv2_api.authapi.id
    route_key = "GET /auth"
    target = "integrations/${aws_apigatewayv2_integration.authapi.id}"
    authorization_type = "JWT"
    authorizer_id = aws_apigatewayv2_authorizer.authapi.id
}

resource "aws_apigatewayv2_stage" "default" {
    api_id = aws_apigatewayv2_api.authapi.id
    name = "$default"
    auto_deploy = true
    access_log_settings {
        destination_arn = aws_cloudwatch_log_group.authapi.arn
        format = jsonencode({ "requestId" : "$context.requestId", "ip" : "$context.identity.sourceIp", "requestTime" : "$context.requestTime", "httpMethod" : "$context.httpMethod", "routeKey" : "$context.routeKey", "status" : "$context.status", "protocol" : "$context.protocol", "responseLength" : "$context.responseLength" })
    }
}

resource "aws_lambda_permission" "authapi" {
    function_name = aws_lambda_function.apply_cookie.arn
    principal = "apigateway.amazonaws.com"
    action = "lambda:InvokeFunction"

    source_arn = "${aws_apigatewayv2_api.authapi.execution_arn}/*/*"
}

resource "aws_apigatewayv2_api_mapping" "authapi" {
    api_id = aws_apigatewayv2_api.authapi.id
    domain_name = aws_apigatewayv2_domain_name.authapi.id
    stage = "$default"
}
