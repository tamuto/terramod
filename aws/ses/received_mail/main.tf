# resource "aws_ses_domain_identity" "domain" {
#   domain = var.receiver_address
# }

# resource "aws_ses_domain_dkim" "domain" {
#   domain = aws_ses_domain_identity.domain.domain
# }

resource "aws_s3_bucket_policy" "mailbox" {
  bucket = var.s3_bucket_id
  policy = data.aws_iam_policy_document.mailbox.json
}

data "aws_iam_policy_document" "mailbox" {
  statement {
    effect = "Allow"
    principals {
      type = "Service"
      identifiers = ["ses.amazonaws.com"]
    }
    actions =[
      "s3:PutObject"
    ]
    resources = ["${var.s3_bucket_arn}/*"]
  }
}

resource "aws_ses_receipt_rule_set" "main" {
  rule_set_name = "s3"
}

resource "aws_ses_receipt_rule" "main" {
  name = "s3"
  rule_set_name = aws_ses_receipt_rule_set.main.rule_set_name
  recipients = ["${var.receiver_address}"]
  enabled = true
  scan_enabled = true
  s3_action {
    bucket_name = var.s3_bucket_id
    object_key_prefix = "mailbox/${var.receiver_address}"
    position = 1
  }
}

resource "aws_ses_active_receipt_rule_set" "main" {
  rule_set_name = aws_ses_receipt_rule.main.rule_set_name
}
