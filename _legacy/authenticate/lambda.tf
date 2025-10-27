data "archive_file" "src_apply_cookie" {
    type = "zip"
    source_file = "${path.module}/js/apply_cookie.js"
    output_path = "./dist/apply_cookie.zip"
}

resource "aws_lambda_function" "apply_cookie" {
    function_name = "apply_cookie"
    role = data.aws_iam_role.iam_role_lambda.arn
    runtime = "nodejs12.x"
    handler = "apply_cookie.handler"
    timeout = 10
    filename = data.archive_file.src_apply_cookie.output_path
    source_code_hash = data.archive_file.src_apply_cookie.output_base64sha256

    publish = true

    environment {
        variables = {
            cors_methods = var.cors_methods
            cors_origins = var.cors_origins
            keypair = var.keypair
            policy = var.policy
            signature = var.signature
        }
    }
}

data "aws_iam_role" "iam_role_lambda" {
    name = "${var.prefix}-lambda-role"
}

data "archive_file" "src_cors" {
    type = "zip"
    source_file = "${path.module}/js/cors.js"
    output_path = "./dist/cors.zip"
}

resource "aws_lambda_function" "cors" {
    function_name = "cors"
    role = data.aws_iam_role.iam_role_lambda.arn
    runtime = "nodejs12.x"
    handler = "cors.handler"
    timeout = 10
    filename = data.archive_file.src_cors.output_path
    source_code_hash = data.archive_file.src_cors.output_base64sha256

    publish = true

    environment {
        variables = {
            cors_methods = var.cors_methods
            cors_origins = var.cors_origins
        }
    }
}