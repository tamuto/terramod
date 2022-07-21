variable "poolname" {}
variable "clientname" {}
variable "schemas" {}
variable "auto_verified" {}
variable "create_user" {}
variable "email_subject" {}
variable "email_message" {}
variable "account_recovery" {}
variable "name" {}
variable "mfa_configuration" {}
variable "sms_authentication_message" {}
variable "aws" {
  default = {
    sms_role_ext_id = "2a027710-8f71-4d65-9607-d441f2d2d7f8"
  }
}