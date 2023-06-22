data "archive_file" "empty_function" {
    type = "zip"
    output_path = "${path.module}/.temp/lambda.zip"
    source {
        content = var.content
        filename = var.filename
    }
}

resource "aws_lambda_function" "lambda" {
    function_name = var.function_name
    role = var.role_arn
    handler = var.handler
    runtime = var.runtime
    publish = var.publish

    filename = data.archive_file.empty_function.output_path
    source_code_hash = data.archive_file.empty_function.output_base64sha256
}

resource "aws_cloudwatch_log_group" "lambda" {
    name = "/aws/lambda/${var.function_name}"
    retention_in_days = var.retention_in_days
}
