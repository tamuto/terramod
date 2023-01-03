resource "aws_cloudfront_function" "indexer" {
    name = "indexer"
    runtime = "cloudfront-js-1.0"
    comment = "add index.html"
    publish = true
    code = file("${path.module}/js/indexer.js")
}
