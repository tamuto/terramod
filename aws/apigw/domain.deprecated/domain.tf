resource "aws_apigatewayv2_domain_name" "domain" {
    domain_name = var.domain_name

    domain_name_configuration {
        certificate_arn = var.acm_arn
        endpoint_type = "REGIONAL"
        security_policy = "TLS_1_2"
    }
}

resource "aws_apigatewayv2_api_mapping" "domain" {
    api_id = var.apigw_id
    domain_name = aws_apigatewayv2_domain_name.domain.id
    stage = var.stage_id
}
