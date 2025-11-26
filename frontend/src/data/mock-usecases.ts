import type { UseCase } from './types'

export const mockUseCases: UseCase[] = [
  {
    id: 'cloudfront-custom-domain',
    name: 'CloudFront + Custom Domain',
    description:
      'CloudFrontにカスタムドメインとSSL証明書を設定した構成。Route53との連携を含みます。',
    templateIds: ['cloudfront-basic'],
    tags: ['cdn', 'custom-domain', 'route53', 'ssl'],
    readme: `# CloudFront + Custom Domain

## 概要
CloudFrontにカスタムドメインを設定し、Route53でDNS管理を行う構成です。

## 構成要素
- CloudFront Distribution
- ACM Certificate
- Route53 Hosted Zone & Records

## 前提条件
- Route53でホストゾーンが作成済み
- ACMでSSL証明書を取得済み（us-east-1リージョン）

## 使い方
\`\`\`hcl
module "cloudfront_with_domain" {
  source = "./usecases/cloudfront-custom-domain"

  domain_name    = "example.com"
  zone_id        = "Z1234567890ABC"
  certificate_arn = "arn:aws:acm:us-east-1:123456789012:certificate/..."
}
\`\`\`

## アーキテクチャ
- CloudFront（カスタムドメイン設定）→ Route53 → オリジン
- SSL/TLS証明書による暗号化通信`,
    code: `resource "aws_cloudfront_distribution" "main" {
  enabled             = true
  aliases             = [var.domain_name]
  price_class         = "PriceClass_All"

  origin {
    domain_name = var.origin_domain_name
    origin_id   = "main-origin"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "main-origin"
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  viewer_certificate {
    acm_certificate_arn = var.certificate_arn
    ssl_support_method  = "sni-only"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
}

resource "aws_route53_record" "main" {
  zone_id = var.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.main.domain_name
    zone_id                = aws_cloudfront_distribution.main.hosted_zone_id
    evaluate_target_health = false
  }
}`,
    architecture: `graph LR
    User[User] --> Route53[Route53]
    Route53 --> CloudFront[CloudFront]
    CloudFront --> Origin[Origin Server]
    ACM[ACM Certificate] -.->|SSL/TLS| CloudFront`,
    createdAt: '2025-01-16T10:00:00Z',
    updatedAt: '2025-01-16T10:00:00Z',
  },
  {
    id: 'cloudfront-s3-oac',
    name: 'CloudFront + S3 + OAC',
    description:
      'CloudFrontとS3を組み合わせた静的サイト配信。OAC（Origin Access Control）でセキュアにアクセスします。',
    templateIds: ['cloudfront-basic', 's3-private'],
    tags: ['cdn', 's3', 'static-site', 'security', 'oac'],
    readme: `# CloudFront + S3 + OAC

## 概要
S3の静的コンテンツをCloudFront経由で配信する構成です。
OAC（Origin Access Control）を使用してS3への直接アクセスを防ぎます。

## 構成要素
- CloudFront Distribution
- S3 Bucket（プライベート）
- Origin Access Control

## セキュリティ
- S3バケットはパブリックアクセスブロック
- CloudFrontからのアクセスのみ許可
- HTTPS強制

## 使い方
\`\`\`hcl
module "static_site" {
  source = "./usecases/cloudfront-s3-oac"

  bucket_name = "my-static-site"
  domain_name = "static.example.com"
}
\`\`\``,
    code: `resource "aws_s3_bucket" "main" {
  bucket = var.bucket_name
}

resource "aws_s3_bucket_public_access_block" "main" {
  bucket = aws_s3_bucket.main.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_cloudfront_origin_access_control" "main" {
  name                              = "\${var.bucket_name}-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "main" {
  enabled             = true
  default_root_object = "index.html"

  origin {
    domain_name              = aws_s3_bucket.main.bucket_regional_domain_name
    origin_id                = "s3-origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.main.id
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "s3-origin"
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
}

resource "aws_s3_bucket_policy" "main" {
  bucket = aws_s3_bucket.main.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "\${aws_s3_bucket.main.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.main.arn
          }
        }
      }
    ]
  })
}`,
    architecture: `graph LR
    User[User] --> CloudFront[CloudFront]
    CloudFront -->|OAC| S3[S3 Private Bucket]
    OAC[Origin Access Control] -.->|Secure Access| S3`,
    createdAt: '2025-01-16T10:00:00Z',
    updatedAt: '2025-01-16T10:00:00Z',
  },
  {
    id: 'api-gateway-lambda-custom-domain',
    name: 'API Gateway + Lambda + Custom Domain',
    description:
      'API GatewayとLambdaを組み合わせたサーバーレスAPI。カスタムドメインを設定します。',
    templateIds: ['api-gateway-basic'],
    tags: ['api', 'lambda', 'serverless', 'custom-domain'],
    readme: `# API Gateway + Lambda + Custom Domain

## 概要
API GatewayとLambdaを使用したサーバーレスAPIにカスタムドメインを設定します。

## 構成要素
- API Gateway REST API
- Lambda Function
- Custom Domain Name
- Route53 Record

## 使い方
\`\`\`hcl
module "serverless_api" {
  source = "./usecases/api-gateway-lambda-custom-domain"

  api_name        = "my-api"
  domain_name     = "api.example.com"
  zone_id         = "Z1234567890ABC"
  certificate_arn = "arn:aws:acm:..."
}
\`\`\``,
    code: `resource "aws_api_gateway_rest_api" "main" {
  name = var.api_name
}

resource "aws_api_gateway_resource" "proxy" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "proxy" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.proxy.id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_method.proxy.resource_id
  http_method = aws_api_gateway_method.proxy.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.main.invoke_arn
}

resource "aws_api_gateway_domain_name" "main" {
  domain_name              = var.domain_name
  regional_certificate_arn = var.certificate_arn

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

resource "aws_api_gateway_base_path_mapping" "main" {
  api_id      = aws_api_gateway_rest_api.main.id
  stage_name  = aws_api_gateway_stage.main.stage_name
  domain_name = aws_api_gateway_domain_name.main.domain_name
}

resource "aws_route53_record" "api" {
  zone_id = var.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_api_gateway_domain_name.main.regional_domain_name
    zone_id                = aws_api_gateway_domain_name.main.regional_zone_id
    evaluate_target_health = false
  }
}`,
    architecture: `graph LR
    User[User] --> Route53[Route53]
    Route53 --> APIGateway[API Gateway]
    APIGateway --> Lambda[Lambda Function]`,
    createdAt: '2025-01-16T10:00:00Z',
    updatedAt: '2025-01-16T10:00:00Z',
  },
  {
    id: 'ecs-vpc-alb',
    name: 'ECS + VPC + ALB',
    description:
      'ECSサービスをVPC内でALB経由で公開する構成。マルチAZ対応です。',
    templateIds: ['ecs-minimal', 'vpc-minimal'],
    tags: ['compute', 'ecs', 'vpc', 'alb', 'load-balancer'],
    readme: `# ECS + VPC + ALB

## 概要
ECSサービスをApplication Load Balancer経由で公開する構成です。

## 構成要素
- VPC（パブリック・プライベートサブネット）
- Application Load Balancer
- ECS Fargate Service
- Security Groups

## 使い方
\`\`\`hcl
module "ecs_with_alb" {
  source = "./usecases/ecs-vpc-alb"

  vpc_cidr     = "10.0.0.0/16"
  service_name = "my-app"
  image        = "nginx:latest"
}
\`\`\``,
    code: `# VPC
resource "aws_vpc" "main" {
  cidr_block = var.vpc_cidr
}

resource "aws_subnet" "public" {
  count      = 2
  vpc_id     = aws_vpc.main.id
  cidr_block = cidrsubnet(var.vpc_cidr, 8, count.index)
}

# ALB
resource "aws_lb" "main" {
  name               = "\${var.service_name}-alb"
  internal           = false
  load_balancer_type = "application"
  subnets            = aws_subnet.public[*].id
  security_groups    = [aws_security_group.alb.id]
}

resource "aws_lb_target_group" "main" {
  name        = "\${var.service_name}-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    path = "/"
  }
}

resource "aws_lb_listener" "main" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.main.arn
  }
}

# ECS Service
resource "aws_ecs_service" "main" {
  name            = var.service_name
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.main.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = aws_subnet.private[*].id
    security_groups = [aws_security_group.ecs.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.main.arn
    container_name   = var.service_name
    container_port   = 80
  }
}`,
    architecture: `graph LR
    Internet[Internet] --> ALB[Application Load Balancer]
    ALB --> ECS1[ECS Task 1]
    ALB --> ECS2[ECS Task 2]
    ECS1 --> VPC[VPC Private Subnet]
    ECS2 --> VPC`,
    createdAt: '2025-01-16T10:00:00Z',
    updatedAt: '2025-01-16T10:00:00Z',
  },
  {
    id: 'rds-enhanced-monitoring',
    name: 'RDS + Enhanced Monitoring',
    description:
      'RDSに拡張モニタリングとCloudWatchアラームを設定した本番環境向け構成。',
    templateIds: ['rds-dev'],
    tags: ['database', 'rds', 'monitoring', 'production', 'cloudwatch'],
    readme: `# RDS + Enhanced Monitoring

## 概要
本番環境向けのRDS構成。拡張モニタリングとアラーム設定を含みます。

## 構成要素
- RDS Instance（マルチAZ）
- Enhanced Monitoring
- CloudWatch Alarms
- SNS Topic

## 監視項目
- CPU使用率
- ストレージ使用率
- 接続数
- レプリケーション遅延

## 使い方
\`\`\`hcl
module "rds_production" {
  source = "./usecases/rds-enhanced-monitoring"

  db_name          = "production_db"
  db_username      = "admin"
  db_password      = var.db_password
  alert_email      = "ops@example.com"
  multi_az         = true
}
\`\`\``,
    code: `resource "aws_db_instance" "main" {
  identifier     = var.db_name
  engine         = "postgres"
  engine_version = "15.3"
  instance_class = "db.t3.medium"

  allocated_storage = 100
  storage_type      = "gp3"
  storage_encrypted = true

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  multi_az               = var.multi_az
  backup_retention_period = 30

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  monitoring_interval = 60
  monitoring_role_arn = aws_iam_role.rds_monitoring.arn

  performance_insights_enabled = true
}

resource "aws_cloudwatch_metric_alarm" "cpu" {
  alarm_name          = "\${var.db_name}-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.id
  }

  alarm_actions = [aws_sns_topic.alerts.arn]
}

resource "aws_sns_topic" "alerts" {
  name = "\${var.db_name}-alerts"
}

resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}`,
    architecture: `graph TB
    RDS[RDS Instance Multi-AZ] --> CW[CloudWatch]
    CW --> Alarm[CloudWatch Alarms]
    Alarm --> SNS[SNS Topic]
    SNS --> Email[Email Notification]
    RDS -.->|Enhanced Monitoring| CW`,
    createdAt: '2025-01-16T10:00:00Z',
    updatedAt: '2025-01-16T10:00:00Z',
  },
]
