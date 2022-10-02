variable "aws_vpc" {}
variable "name" {}
variable "subnet_cidr" {}
variable "availability_zone" {
    default = "ap-northeast-1a"
}
variable "subnet_name" {
    default = "public-1a"
}
variable "create_inetgw" {
    default = false
}
variable "create_natgw" {
    default = false
}
