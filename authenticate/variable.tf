variable "ses_mail" {}
variable "prefix" {}
variable "name" {}
variable "domain" {}
variable "cors_methods" {
    default = "GET,POST,PUT,DELETE"
}
variable "cors_origins" {
    default = "http://localhost:8000"
}
variable "keypair" {}
variable "policy" {}
variable "signature" {}
