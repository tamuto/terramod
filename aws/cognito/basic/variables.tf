variable "poolname" {}
variable "clientname" {}
variable "auto_verified" {
    default = ["email"]
}
variable "allow_admin_create_user_only" {
    default = true
}
variable "schemas" {
    default = {}
}
variable "password_minimum_length" {
    default = 8
}
variable "password_require_lowercase" {
    default = true
}
variable "password_require_numbers" {
    default = true
}
variable "password_require_symbols" {
    default = true
}
variable "account_recovery" {
    default = "admin_only"
}
