variable name {}
variable private_ip {}
variable ami {
    default = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-6.1-x86_64"
}
variable instance_type {}
variable vpc_name {}
variable subnet_name {}
variable security_group_ids {}
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
