#
# S3 Bucket
#
resource "aws_s3_bucket" "bucket" {
    bucket = "${var.bucket_name}"
}

resource "aws_s3_bucket_acl" "bucket" {
    bucket = aws_s3_bucket.bucket.id
    acl = "private"
}

resource "aws_s3_bucket_public_access_block" "bucket" {
    bucket = "${var.bucket_name}"
    block_public_acls = true
    block_public_policy = true
    ignore_public_acls = true
    restrict_public_buckets = true
}
