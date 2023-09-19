variable "name" {}
variable "vpclink_id" {}
variable "instance_ip" {}
variable "instance_port" {}
variable "disable_apigw_endpoint" {
    default = false
}
variable "allow_cors" {
    default = false
}
variable "allow_headers" {
    default = ["*"]
}
variable "allow_methods" {
    default = ["*"]
}
variable "allow_origins" {
    default = ["*"]
}
