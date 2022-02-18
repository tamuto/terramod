resource "aws_cloudfront_distribution" "static_web" {
    origin {
        domain_name = aws_s3_bucket.cf_web.bucket_regional_domain_name
        origin_id = "public_s3"
        origin_path = "/public"
        s3_origin_config {
            origin_access_identity = aws_cloudfront_origin_access_identity.static_web.cloudfront_access_identity_path
        }
    }
    origin {
        domain_name = aws_s3_bucket.cf_web.bucket_regional_domain_name
        origin_id = "private_s3"
        s3_origin_config {
            origin_access_identity = aws_cloudfront_origin_access_identity.static_web.cloudfront_access_identity_path
        }
    }
    enabled = true
    is_ipv6_enabled = false
    price_class = "PriceClass_100"

    default_root_object = "index.html"

    aliases = ["${var.prefix}.${var.domain}"]

    viewer_certificate {
        acm_certificate_arn = aws_acm_certificate.cert.arn
        ssl_support_method = "sni-only"
        minimum_protocol_version = "TLSv1.2_2021"
    }

    logging_config {
        bucket = aws_s3_bucket.cf_logging.bucket_domain_name
        include_cookies = true
        prefix = "cloudfront/"        
    }

    default_cache_behavior {
        allowed_methods = ["GET", "HEAD"]
        cached_methods = ["GET", "HEAD"]
        target_origin_id = "public_s3"

        forwarded_values {
            query_string = false

            cookies {
                forward = "none"
            }
        }
        viewer_protocol_policy = "redirect-to-https"
    }

    ordered_cache_behavior {
        path_pattern = "/private/*"
        allowed_methods = ["GET", "HEAD"]
        cached_methods = ["GET", "HEAD"]
        target_origin_id = "private_s3"

        trusted_key_groups = [
            aws_cloudfront_key_group.keygroup.id
        ]

        forwarded_values {
            query_string = false

            cookies {
                forward = "none"
            }
        }
        viewer_protocol_policy = "redirect-to-https"

        lambda_function_association {
            event_type = "origin-request"
            lambda_arn = aws_lambda_function.indexdir.qualified_arn
        }
    }

    restrictions {
        geo_restriction {
            restriction_type = "whitelist"
            locations = ["JP"]
        }
    }
}

resource "aws_cloudfront_origin_access_identity" "static_web" {}

resource "aws_cloudfront_public_key" "keypair" {
    encoded_key = file("./keys/public_key.pem")
    name = "${var.prefix}-key"
}

resource "aws_cloudfront_key_group" "keygroup" {
    items = [aws_cloudfront_public_key.keypair.id]
    name = "${var.prefix}-key-group"
}
