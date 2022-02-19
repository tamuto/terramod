
data "archive_file" "src_indexdir" {
    type = "zip"
    source_file = "${path.module}/js/indexdir.js"
    output_path = "./dist/indexdir.zip"
}

resource "aws_lambda_function" "indexdir" {
    function_name = "indexdir"
    role = aws_iam_role.iam_role_lambda.arn
    runtime = "nodejs12.x"
    handler = "indexdir.handler"
    timeout = 10
    filename = data.archive_file.src_indexdir.output_path
    source_code_hash = data.archive_file.src_indexdir.output_base64sha256

    publish = true
}
