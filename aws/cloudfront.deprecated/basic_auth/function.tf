resource "aws_cloudfront_function" "basic_auth" {
    name = var.func_name
    runtime = "cloudfront-js-1.0"
    comment = "Basic Authenticate For ${var.func_name}"
    publish = true
    code = templatefile(
        "${path.module}/js/basic_auth.js",
        { basic_auth = var.basic_auth })
}
