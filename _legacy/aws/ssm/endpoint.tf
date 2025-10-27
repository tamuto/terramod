data "aws_iam_policy_document" "vpc_endpoint" {
    statement {
        effect = "Allow"
        actions = ["*"]
        resources = ["*"]
        principals {
            type = "AWS"
            identifiers = ["*"]
        }
    }
}

resource "aws_vpc_endpoint" "ssm" {
    vpc_endpoint_type = "Interface"
    vpc_id = data.aws_vpc.vpc.id
    service_name = "com.amazonaws.${var.region}.ssm"
    policy = data.aws_iam_policy_document.vpc_endpoint.json
    subnet_ids = [data.aws_subnet.subnet.id]
    private_dns_enabled = true
    security_group_ids = [data.aws_security_group.default.id]
}

resource "aws_vpc_endpoint" "ssmmessages" {
    vpc_endpoint_type = "Interface"
    vpc_id = data.aws_vpc.vpc.id
    service_name = "com.amazonaws.${var.region}.ssmmessages"
    policy = data.aws_iam_policy_document.vpc_endpoint.json
    subnet_ids = [data.aws_subnet.subnet.id]
    private_dns_enabled = true
    security_group_ids = [data.aws_security_group.default.id]
}

resource "aws_vpc_endpoint" "ec2messages" {
    vpc_endpoint_type = "Interface"
    vpc_id = data.aws_vpc.vpc.id
    service_name = "com.amazonaws.${var.region}.ec2messages"
    policy = data.aws_iam_policy_document.vpc_endpoint.json
    subnet_ids = [data.aws_subnet.subnet.id]
    private_dns_enabled = true
    security_group_ids = [data.aws_security_group.default.id]
}

