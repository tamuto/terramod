resource "aws_ecr_repository" "repo" {
    name = var.name
    image_tag_mutability = "MUTABLE"

    image_scanning_configuration {
        scan_on_push = true
    }
}

resource "aws_ecr_lifecycle_policy" "repo" {
    repository = aws_ecr_repository.repo.name

    policy = jsonencode(
        {
            rules = [
                {
                    action = {
                        type = "expire"
                    }
                    description = "keep several generations"
                    rulePriority = 1
                    selection = {
                        countNumber = var.countNumber
                        countType = var.countType
                        tagStatus = var.tagStatus
                    }
                }
            ]
        }
    )
}

data "aws_iam_policy_document" "repo" {
    statement {
        sid = "allow-pull-policy"
        effect = "Allow"
        principals {
            type = "AWS"
            identifiers = var.identifiers
        }
        actions = [
            "ecr:GetDownloadUrlForLayer",
            "ecr:BatchGetImage",
            "ecr:BatchCheckLayerAvailability"
        ]
    }
}

resource "aws_ecr_repository_policy" "repo" {
    repository = aws_ecr_repository.repo.name
    policy = data.aws_iam_policy_document.repo.json
}
