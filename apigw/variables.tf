variable "name" {}
variable "instance_ip" {}
variable "instance_port" {
    default = "80"
}
variable "subnet_name" {}
variable "vpc_name" {}
variable secgroup_name {
    default = "default"
}

variable "cors_headers" {
    default = "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token"
}

variable "cors_methods" {
    default = "GET,POST,PUT,DELETE"
}
variable "cors_origins" {}

data "aws_subnet" "apigw" {
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

data "aws_security_group" "apigw" {
  name = var.secgroup_name
  vpc_id = data.aws_vpc.vpc.id
}
