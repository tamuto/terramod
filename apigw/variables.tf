variable "name" {}
variable "instance_ip" {}
variable "instance_port" {
    default = "80"
}
variable "subnet_name" {}
variable "secgroup_id" {}

variable "apigw_name" {}

variable "vpc_link" {}
variable "integration_method" {}

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

data "aws_security_group" "apigw" {
  id = var.secgroup_id
}
