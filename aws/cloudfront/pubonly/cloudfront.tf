resource "aws_cloudfront_distribution" "web" {
    enabled = true
    is_ipv6_enabled = false
    price_class = "PriceClass_100"

    default_root_object = "index.html"

    aliases = ["${var.domain}"]

    origin {
        domain_name = module.s3.bucket.bucket_regional_domain_name
        origin_id = "public_web"
        origin_path = var.origin_path
        origin_access_control_id = aws_cloudfront_origin_access_control.web.id
    }

    viewer_certificate {
        acm_certificate_arn = data.aws_acm_certificate.issued.arn
        ssl_support_method = "sni-only"
        minimum_protocol_version = "TLSv1.2_2021"
    }

    logging_config {
        bucket = module.s3.bucket.bucket_regional_domain_name
        include_cookies = true
        prefix = "logs/"        
    }

    restrictions {
        geo_restriction {
            restriction_type = "whitelist"
            locations = ["JP"]
        }
    }

    default_cache_behavior {
        allowed_methods = ["GET", "HEAD"]
        cached_methods = ["GET", "HEAD"]
        target_origin_id = "public_web"

        forwarded_values {
            query_string = false
            cookies {
                forward = "none"
            }
        }
        viewer_protocol_policy = "redirect-to-https"

        dynamic "function_association" {
            for_each = var.viewer_request_arn == null ? range(0) : range(1)
            content {
                event_type = "viewer-request"
                function_arn = var.viewer_request_arn
            }
        }
    }
}

resource "aws_cloudfront_origin_access_control" "web" {
    name = var.oac_name
    description = var.oac_description
    origin_access_control_origin_type = "s3"
    signing_behavior = "always"
    signing_protocol = "sigv4"
}
