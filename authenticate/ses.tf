resource "aws_ses_email_identity" "ses" {
    email = var.ses_mail
}
