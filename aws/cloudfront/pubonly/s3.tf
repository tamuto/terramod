module "s3" {
    source = "../../s3"
    bucket_name = var.bucket_name
}

resource "aws_s3_bucket_policy" "s3" {
    count = var.bucket_policy ? 1 : 0
    bucket = module.s3.bucket.id
    policy = data.aws_iam_policy_document.s3_policy.json
}

data "aws_iam_policy_document" "s3_policy" {
    statement {
        principals {
            type = "Service"
            identifiers = ["cloudfront.amazonaws.com"]
        }
        actions = ["s3:GetObject"]
        resources = ["${module.s3.bucket.arn}/*"]
        condition {
            test = "StringEquals"
            variable = "aws:SourceArn"
            values = [aws_cloudfront_distribution.web.arn]
        }
    }

    statment {
        principals {
            type = "Service"
            identifiers = ["cloudfront.amazonaws.com"]
        }
        actions = ["s3:PutObject"]
        resources = ["${module.s3.bucket.arn}/logs/*"]
        condition {
            test = "StringEquals"
            variable = "aws:SourceArn"
            values = [aws_cloudfront_distribution.web.arn]
        }
    }
}
