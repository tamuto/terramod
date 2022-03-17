variable name {}
variable private_ip {}
variable ami {
    default = "ami-07b4f72c4c356c19d"
}
variable instance_type {}
variable vpc_name {}
variable subnet_name {}
variable secgroup_name {
    default = "default"
}
variable volume_size {
    default = 20
}
variable key_name {}
variable ec2_role {}

data "aws_subnet" "subnet" {
    filter {
        name = "tag:Name"
        values = [var.subnet_name]
    }
}

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
