resource "aws_cloudwatch_log_group" "authapi" {
    name = "/aws/apigateway/authapi"
    retention_in_days = 7
}
