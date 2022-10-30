variable "secgroup_name" {
    default = "default"
}
variable "vpc_name" {}

data "aws_vpc" "vpc" {
    filter {
        name = "tag:Name"
        values = [var.vpc_name]
    }
}

data "aws_security_group" "default" {
    name = var.secgroup_name
    vpc_id = data.aws_vpc.vpc.id
}

output "sg_id" {
    value = data.aws_security_group.default.id
}
