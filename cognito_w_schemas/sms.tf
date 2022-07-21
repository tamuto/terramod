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
}