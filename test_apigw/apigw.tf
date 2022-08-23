resource "aws_api_gateway_rest_api" "example" {
  name        = "EstQ_Dev_API"
  description = "example API Gateway"
  body        = "${data.template_file.swagger.rendered}"
}
data "template_file" "swagger" {
  template = var.template

  vars = {
    title                   = "EstQ_Dev_API"
    aws_region_name         = "ap-northeast-1"
  }
}
