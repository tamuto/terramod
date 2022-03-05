variable name {}
variable private_ip {}
variable ami {
    default = "ami-07b4f72c4c356c19d"
}
variable instance_type {}
variable subnet_name {}
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

data "aws_security_group" "default" {
    name = "default"
}
