data "aws_iam_policy_document" "cf_web" {
    statement {
        principals {
            type = "AWS"
            identifiers = [
                aws_cloudfront_origin_access_identity.static_web.iam_arn
            ]
        }
        effect = "Allow"
        actions = [
            "s3:GetObject"
        ]
        resources = [
            "arn:aws:s3:::${var.prefix}-web/*"
        ]
    }
}

resource "aws_s3_bucket" "cf_web" {
    bucket = "${var.prefix}-web"
    policy = data.aws_iam_policy_document.cf_web.json
}

resource "aws_s3_bucket_public_access_block" "cf_web" {
    bucket = aws_s3_bucket.cf_web.bucket
    block_public_acls = true
    block_public_policy = true
    ignore_public_acls = true
    restrict_public_buckets = true
}
