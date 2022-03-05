variable ssm_role {}
variable vpc_name {}
variable subnet_name {}
variable region {
    default = "ap-northeast-1"
}

data "aws_vpc" "vpc" {
    filter {
        name = "tag:Name"
        values = [var.vpc_name]
    }
}

data "aws_subnet" "subnet" {
    filter {
        name = "tag:Name"
        values = [var.subnet_name]
    }
}

data "aws_security_group" "default" {
    name = "default"
}
