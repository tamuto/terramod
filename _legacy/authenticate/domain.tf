resource "aws_apigatewayv2_domain_name" "authapi" {
    domain_name = "api.${var.domain}"

    domain_name_configuration {
        certificate_arn = data.aws_acm_certificate.cert.arn
        endpoint_type = "REGIONAL"
        security_policy = "TLS_1_2"
    }
}

data "aws_acm_certificate" "cert" {
    domain = "*.${var.domain}"
}
