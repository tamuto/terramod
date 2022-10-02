variable "aws_vpc" {}
variable "name" {}
variable "subnet_cidr" {}
variable "availability_zone" {
    default = "ap-northeast-1a"
}
variable "subnet_name" {
    default = "private-1a"
}
variable "create_s3_endpoint" {
    default = true
}
variable "s3_service_name" {
    default = "com.amazonaws.ap-northeast-1.s3"
}
variable "nat_gateway_id" {
    default = null
}
