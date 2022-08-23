resource "aws_api_gateway_rest_api" "example" {
  name        = "EstQ_Dev_API"
  description = "example API Gateway"
}

resource "aws_api_gateway_resource" "api" {
  rest_api_id = aws_api_gateway_rest_api.example.id
  parent_id   = aws_api_gateway_rest_api.example.root_resource_id
  path_part   = "api"
}