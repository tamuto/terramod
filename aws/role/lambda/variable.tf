variable "role_name" {}
variable "role_path" {
    default = "/services/"
}
variable "logging_group" {}
variable "retention_in_days" {
    default = 14
}
variable "edge" {
    default = false
}
