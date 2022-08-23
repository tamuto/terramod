resource "aws_api_gateway_rest_api" "example" {
  name        = "EstQ_Dev_API"
  description = "example API Gateway"
  body        = "${data.template_file.swagger.rendered}"
}
