resource "aws_iam_role" "lambda" {
    name = var.role_name
    path = var.role_path
    assume_role_policy = data.aws_iam_policy_document.lambda_policy.json
    managed_policy_arns = data.aws_iam_policy_document.logging_policy.json
}

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

locals {
    account_id = data.aws_caller_identity.current.account_id
    region = data.aws_region.current.name
}

resource "aws_cloudwatch_log_group" "lambda" {
    name = var.logging_group
    retention_in_days = var.retention_in_days
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
        resources = "arn:aws:logs:${region}:${account_id}"
        effect = "Allow"
        actions = [
            "logs:CreateLogGroup"
        ]
    }
    statement {
        resources = "arn:aws:logs:${region}:${account_id}:log-group:${var.logging_group}:*"
        effect = "Allow"
        actions = [
            "logs:CreateLogStream",
            "logs:PutLogEvents"
        ]
    }
}
