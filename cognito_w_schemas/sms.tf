data "aws_iam_policy_document" "sms_role" {
    statement {
        actions = ["sts:AssumeRole"]
        effect = "Allow"
        principals {
            type = "Service"
            identifiers = ["cognito-idp.amazonaws.com"]
        }
    }
}

resource "aws_iam_role" "iam_role_mfa" {
name = "${var.name}"
assume_role_policy = data.aws_iam_policy_document.sms_role.json
managed_policy_arns = [aws_iam_policy.policy_one.arn]
}

resource "aws_iam_policy" "policy_one" {
  name = "policy-sns"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action   = [
            "sns:GetTopicAttributes",
            "sns:List*"
        ]
        Effect   = "Allow"
        Resource = "*"
      },
    ]
  })
}