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
