variable "name" {}
variable "az_1a" {
    default = "ap-northeast-1a"
}
variable "az_1c" {
    default = "ap-northeast-1c"
}
variable "vpc_cidr" {}
variable "private_1a_cidr" {
    default = null
}
variable "public_1a_cidr" {
    default = null
}
variable "private_1c_cidr" {
    default = null
}
variable "public_1c_cidr" {
    default = null
}
variable "private_rt_is_main" {
    default = false
}
variable "public_rt_is_main" {
    default = false
}
variable "create_inetgw" {
    default = false
}
variable "create_natgw" {
    default = false
}
variable "create_s3_endpoint" {
    default = false
}
variable "s3_service_name" {
    default = "com.amazonaws.ap-northeast-1.s3"
}
