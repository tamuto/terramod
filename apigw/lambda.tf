data "aws_iam_policy_document" "lambda_assume_policy" {
    statement {
        principals {
            type = "Service"
            identifiers = [
                "lambda.amazonaws.com",
                "edgelambda.amazonaws.com"
            ]
        }
        effect = "Allow"
        actions = [
            "sts:AssumeRole"
        ]
    }
}

resource "aws_iam_role" "iam_role_lambda" {
    name = "${var.name}-lambda-role"
    assume_role_policy = data.aws_iam_policy_document.lambda_assume_policy.json
}

data "archive_file" "src_cors" {
    type = "zip"
    source_file = "${path.module}/js/cors.js"
    output_path = "./dist/cors.zip"
}

resource "aws_lambda_function" "cors" {
    function_name = "cors"
    role = aws_iam_role.iam_role_lambda.arn
    runtime = "nodejs12.x"
    handler = "cors.handler"
    timeout = 10
    filename = data.archive_file.src_cors.output_path
    source_code_hash = data.archive_file.src_cors.output_base64sha256

    publish = true

    environment {
        variables = {
            cors_headers = var.cors_headers
            cors_methods = var.cors_methods
            cors_origins = var.cors_origins
        }
    }
}