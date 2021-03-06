variable ssm_role {}
variable vpc_name {}
variable subnet_name {}
variable secgroup_name {
    default = "default"
}
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
    name = var.secgroup_name
    vpc_id = data.aws_vpc.vpc.id
}
