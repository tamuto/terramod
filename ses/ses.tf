resource "aws_ses_email_identity" "example" {
  email = var.identity_email
}

data "aws_iam_policy_document" "example" {
  statement {
    actions   = ["SES:SendEmail"]
    resources = ["${aws_ses_email_identity.example.arn}"]

    principals {
      identifiers = ["*"]
      type        = "AWS"
    }
  }
}

resource "aws_ses_identity_policy" "example" {
  identity = "${aws_ses_email_identity.example.arn}"
  name     = var.identity_name
  policy   = data.aws_iam_policy_document.example.json
}