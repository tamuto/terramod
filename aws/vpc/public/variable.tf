variable "name" {}
variable "enable_dns_hostnames" {
    default = true
}
variable "vpc_cidr" {}
variable "public_1a_cidr" {}
variable "az_1a" {
    default = "ap-northeast-1a"
}
variable "create_inetgw" {
    default = false
}
variable "create_natgw" {
    default = false
}
