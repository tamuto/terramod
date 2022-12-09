
resource "aws_ses_receipt_rule" "main" {
  name = var.rule_name
  rule_set_name = var.rule_set_name
  recipients = [var.receiver_address]
  enabled = true
  scan_enabled = true
  s3_action {
    bucket_name = var.s3_bucket_id
    object_key_prefix = "mailbox/${var.receiver_address}"
    position = var.position
  }
}

