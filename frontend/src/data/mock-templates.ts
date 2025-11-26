import type { Template } from './types'

export const mockTemplates: Template[] = [
  {
    id: 'cloudfront-basic',
    name: 'CloudFront Basic',
    type: 'cdn',
    category: 'CloudFront',
    description: 'CloudFrontの基本構成テンプレート。シンプルなCDN配信を実現します。',
    tags: ['cdn', 'minimal', 'cloudfront'],
    readme: `# CloudFront Basic Template

## 概要
CloudFrontの最小構成テンプレートです。

## 機能
- 基本的なCloudFrontディストリビューション
- HTTPSデフォルト有効
- 最小限の設定項目

## 使い方
\`\`\`hcl
module "cloudfront" {
  source = "./modules/cloudfront-basic"

  origin_domain_name = "example.com"
  comment            = "My CloudFront Distribution"
}
\`\`\``,
    variables: [
      {
        name: 'origin_domain_name',
        type: 'string',
        description: 'オリジンのドメイン名',
        required: true,
      },
      {
        name: 'comment',
        type: 'string',
        description: 'ディストリビューションの説明',
        default: 'CloudFront Distribution',
        required: false,
      },
      {
        name: 'price_class',
        type: 'string',
        description: '価格クラス',
        default: 'PriceClass_All',
        required: false,
      },
    ],
    code: `resource "aws_cloudfront_distribution" "main" {
  enabled             = true
  comment             = var.comment
  price_class         = var.price_class

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
    cloudfront_default_certificate = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
}`,
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 's3-private',
    name: 'S3 Private Bucket',
    type: 'storage',
    category: 'S3',
    description: 'プライベートS3バケットの基本テンプレート。パブリックアクセスをブロックします。',
    tags: ['storage', 's3', 'security', 'minimal'],
    readme: `# S3 Private Bucket Template

## 概要
セキュアなプライベートS3バケットのテンプレートです。

## 機能
- パブリックアクセス完全ブロック
- バージョニング対応
- 暗号化設定

## 使い方
\`\`\`hcl
module "s3_private" {
  source = "./modules/s3-private"

  bucket_name = "my-private-bucket"
  versioning  = true
}
\`\`\``,
    variables: [
      {
        name: 'bucket_name',
        type: 'string',
        description: 'S3バケット名',
        required: true,
      },
      {
        name: 'versioning',
        type: 'bool',
        description: 'バージョニングの有効化',
        default: 'false',
        required: false,
      },
      {
        name: 'kms_key_id',
        type: 'string',
        description: 'KMS暗号化キーID（オプション）',
        required: false,
      },
    ],
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

resource "aws_s3_bucket_versioning" "main" {
  bucket = aws_s3_bucket.main.id

  versioning_configuration {
    status = var.versioning ? "Enabled" : "Disabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "main" {
  bucket = aws_s3_bucket.main.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = var.kms_key_id != null ? "aws:kms" : "AES256"
      kms_master_key_id = var.kms_key_id
    }
  }
}`,
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'vpc-minimal',
    name: 'VPC Minimal',
    type: 'network',
    category: 'VPC',
    description: '最小限のVPC構成。パブリック・プライベートサブネットを含みます。',
    tags: ['network', 'vpc', 'minimal'],
    readme: `# VPC Minimal Template

## 概要
最小限のVPC構成テンプレートです。

## 機能
- パブリックサブネット x 2
- プライベートサブネット x 2
- インターネットゲートウェイ
- NATゲートウェイ（オプション）

## 使い方
\`\`\`hcl
module "vpc" {
  source = "./modules/vpc-minimal"

  vpc_cidr = "10.0.0.0/16"
  name     = "my-vpc"
}
\`\`\``,
    variables: [
      {
        name: 'vpc_cidr',
        type: 'string',
        description: 'VPCのCIDRブロック',
        default: '10.0.0.0/16',
        required: false,
      },
      {
        name: 'name',
        type: 'string',
        description: 'VPCの名前',
        required: true,
      },
      {
        name: 'enable_nat_gateway',
        type: 'bool',
        description: 'NATゲートウェイの有効化',
        default: 'true',
        required: false,
      },
    ],
    code: `resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = var.name
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "\${var.name}-igw"
  }
}

resource "aws_subnet" "public" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "\${var.name}-public-\${count.index + 1}"
  }
}

resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 2)
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "\${var.name}-private-\${count.index + 1}"
  }
}`,
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'api-gateway-basic',
    name: 'API Gateway Basic',
    type: 'api',
    category: 'API Gateway',
    description: 'API Gatewayの基本構成テンプレート。REST APIをデプロイします。',
    tags: ['api', 'api-gateway', 'minimal'],
    readme: `# API Gateway Basic Template

## 概要
API Gatewayの最小構成テンプレートです。

## 機能
- REST API
- ステージング環境設定
- CORSサポート

## 使い方
\`\`\`hcl
module "api_gateway" {
  source = "./modules/api-gateway-basic"

  api_name = "my-api"
  stage    = "prod"
}
\`\`\``,
    variables: [
      {
        name: 'api_name',
        type: 'string',
        description: 'API名',
        required: true,
      },
      {
        name: 'stage',
        type: 'string',
        description: 'ステージ名',
        default: 'prod',
        required: false,
      },
    ],
    code: `resource "aws_api_gateway_rest_api" "main" {
  name        = var.api_name
  description = "API Gateway for \${var.api_name}"

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

resource "aws_api_gateway_deployment" "main" {
  rest_api_id = aws_api_gateway_rest_api.main.id

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "main" {
  deployment_id = aws_api_gateway_deployment.main.id
  rest_api_id   = aws_api_gateway_rest_api.main.id
  stage_name    = var.stage
}`,
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'ecs-minimal',
    name: 'ECS Minimal Service',
    type: 'compute',
    category: 'ECS',
    description: 'ECSの最小サービス構成。Fargateで動作します。',
    tags: ['compute', 'ecs', 'fargate', 'minimal'],
    readme: `# ECS Minimal Service Template

## 概要
ECS Fargateの最小構成テンプレートです。

## 機能
- Fargateタスク定義
- ECSサービス
- CloudWatch Logsグループ

## 使い方
\`\`\`hcl
module "ecs_service" {
  source = "./modules/ecs-minimal"

  cluster_id   = aws_ecs_cluster.main.id
  service_name = "my-service"
  image        = "nginx:latest"
}
\`\`\``,
    variables: [
      {
        name: 'cluster_id',
        type: 'string',
        description: 'ECSクラスターID',
        required: true,
      },
      {
        name: 'service_name',
        type: 'string',
        description: 'サービス名',
        required: true,
      },
      {
        name: 'image',
        type: 'string',
        description: 'Dockerイメージ',
        required: true,
      },
      {
        name: 'desired_count',
        type: 'number',
        description: 'タスクの希望数',
        default: '1',
        required: false,
      },
    ],
    code: `resource "aws_ecs_task_definition" "main" {
  family                   = var.service_name
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"

  container_definitions = jsonencode([
    {
      name  = var.service_name
      image = var.image

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.main.name
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "main" {
  name            = var.service_name
  cluster         = var.cluster_id
  task_definition = aws_ecs_task_definition.main.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"
}

resource "aws_cloudwatch_log_group" "main" {
  name              = "/ecs/\${var.service_name}"
  retention_in_days = 7
}`,
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'rds-dev',
    name: 'RDS Development',
    type: 'database',
    category: 'RDS',
    description: '開発環境向けRDS構成。コスト最適化されています。',
    tags: ['database', 'rds', 'postgresql', 'cost-optimized'],
    readme: `# RDS Development Template

## 概要
開発環境向けのRDSテンプレートです。

## 機能
- PostgreSQL
- シングルAZ
- 自動バックアップ
- コスト最適化

## 使い方
\`\`\`hcl
module "rds_dev" {
  source = "./modules/rds-dev"

  db_name     = "myapp"
  db_username = "admin"
  db_password = "changeme"
}
\`\`\``,
    variables: [
      {
        name: 'db_name',
        type: 'string',
        description: 'データベース名',
        required: true,
      },
      {
        name: 'db_username',
        type: 'string',
        description: 'データベースユーザー名',
        required: true,
      },
      {
        name: 'db_password',
        type: 'string',
        description: 'データベースパスワード',
        required: true,
      },
      {
        name: 'instance_class',
        type: 'string',
        description: 'インスタンスクラス',
        default: 'db.t3.micro',
        required: false,
      },
    ],
    code: `resource "aws_db_instance" "main" {
  identifier     = var.db_name
  engine         = "postgres"
  engine_version = "15.3"
  instance_class = var.instance_class

  allocated_storage = 20
  storage_type      = "gp3"

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "mon:04:00-mon:05:00"

  skip_final_snapshot = true

  tags = {
    Environment = "development"
  }
}`,
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
  },
]
