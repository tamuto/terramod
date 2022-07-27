variable "db_name" {}
variable "db_username" {}
variable "db_password" {}
variable "engine" { default = "mysql" }
variable "engine_version" { default = "8.0.20" }
variable "db_instance" { default = "db.t3.micro" }
variable "subnet_1a_name" {}
variable "subnet_1c_name" {}

data "aws_subnets" "subnet" {
    filter {
        name = "tag:Name"
        values = [var.subnet_1a_name, var.subnet_1c_name]
    }
}
