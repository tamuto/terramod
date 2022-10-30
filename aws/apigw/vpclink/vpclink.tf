resource "aws_apigatewayv2_vpc_link" "apigw" {
  name               = "${var.name}-link"
  security_group_ids = var.security_group_ids
  subnet_ids         = var.subnet_ids
}
