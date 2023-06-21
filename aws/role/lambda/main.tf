resource "aws_iam_role" "lambda" {
    name = var.role_name
    path = var.role_path
    assume_role_policy = data.aws_iam_policy_document.lambda_policy.json
}

data "aws_iam_policy_document" "lambda_policy" {
    statement {
        principals {
            type = "Service"
            identifiers = [
                "lambda.amazonaws.com"
            ]
        }
        effect = "Allow"
        actions = [
            "sts:AssumeRole"
        ]
    }
}
