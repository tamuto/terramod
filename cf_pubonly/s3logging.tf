data "aws_iam_policy_document" "cf_logging" {
    statement {
        principals {
            type = "AWS"
            identifiers = [
                aws_cloudfront_origin_access_identity.static_web.iam_arn
            ]
        }
        effect = "Allow"
        actions = [
            "s3:PutObject"
        ]
        resources = [
            "arn:aws:s3:::${var.s3prefix}-cf-logging/*"
        ]
    }
}

resource "aws_s3_bucket" "cf_logging" {
    bucket = "${var.s3prefix}-cf-logging"
}

resource "aws_s3_bucket_policy" "cf_logging" {
    bucket = aws_s3_bucket.cf_logging.id
    policy = data.aws_iam_policy_document.cf_logging.json
}

resource "aws_s3_bucket_public_access_block" "cf_logging" {
    bucket = aws_s3_bucket.cf_logging.bucket
    block_public_acls = true
    block_public_policy = true
    ignore_public_acls = true
    restrict_public_buckets = true
}
