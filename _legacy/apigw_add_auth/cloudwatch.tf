resource "aws_cloudwatch_log_group" "apigw" {
    name = "/aws/apigateway/apigw"
    retention_in_days = 7
}
