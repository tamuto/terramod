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
    default = ["Content-Type", "X-Amz-Date", "Authorization", "X-Api-Key", "X-Amz-Security-Token"]
}
variable "allow_methods" {
    default = ["GET", "POST", "PUT", "DELETE"]
}
variable "allow_origins" {
    default = ["*"]
}
