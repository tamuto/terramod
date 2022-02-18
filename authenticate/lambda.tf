data "archive_file" "src_apply_cookie" {
    type = "zip"
    source_file = "${path.module}/js/apply_cookie.js"
    output_path = "${path.module}/dist/apply_cookie.zip"
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
}

data "aws_iam_role" "iam_role_lambda" {
    name = "${var.prefix}-lambda-role"
}
