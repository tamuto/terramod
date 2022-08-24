resource "aws_api_gateway_rest_api" "example" {
  name        = "EstQ_Dev_API"
  description = "example API Gateway"
  disable_execute_api_endpoint = true
  body        = "${data.template_file.swagger.rendered}"
}
data "template_file" "swagger" {
  template = var.template

  vars = {
    title                   = "EstQ_Dev_API"
    aws_region_name         = "ap-northeast-1"
  }
}

resource "aws_api_gateway_authorizer" "api_authorizer" {
  name          = "CognitoUserPoolAuthorizer"
  type          = "COGNITO_USER_POOLS"
  rest_api_id   = "${aws_api_gateway_rest_api.example.id}"
  provider_arns = [var.cognito_user_arn]
}