variable name {}
variable description {}
variable vpc_name {}

data "aws_vpc" "vpc" {
    filter {
        name = "tag:Name"
        values = [var.vpc_name]
    }
}
