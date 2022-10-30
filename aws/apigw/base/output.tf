output "apigw_id" {
    value = aws_apigatewayv2_api.apigw.id
}

output "stage_id" {
    value = aws_apigatewayv2_stage.apigw.id
}
