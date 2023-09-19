output "bucket" {
    value = module.s3.bucket
}

output "cloudfront" {
    value = aws_cloudfront_distribution.web
}
