resource "aws_iam_role" "lambda" {
    name = var.role_name
    path = var.role_path
    assume_role_policy = data.aws_iam_policy_document.lambda_policy.json
    managed_policy_arns = data.aws_iam_policy_document.logging_policy.json
}

data "aws_iam_policy_document" "lambda_policy" {
    statement {
        principals {
            type = "Service"
            identifiers = var.edge ? ["lambda.amazonaws.com", "edgelambda.amazonaws.com"] : ["lambda.amazonaws.com"]
        }
        effect = "Allow"
        actions = [
            "sts:AssumeRole"
        ]
    }
}

data "aws_iam_policy_document" "logging_policy" {
    statement {
        resources = var.logging_account
        effect = "Allow"
        actions = [
            "logs:CreateLogGroup"
        ]
    }
    statement {
        resources = var.logging_group
        effect = "Allow"
        actions = [
            "logs:CreateLogStream",
            "logs:PutLogEvents"
        ]
    }
}
