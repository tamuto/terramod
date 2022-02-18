
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
    name = "${var.prefix}-lambda-role"
    assume_role_policy = data.aws_iam_policy_document.lambda_assume_policy.json
}

resource "aws_iam_role_policy_attachment" "aws_lambda_exec_policy_attach" {
    role = aws_iam_role.iam_role_lambda.name
    policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}
