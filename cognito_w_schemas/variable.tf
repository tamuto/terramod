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
    sms_role_ext_id = "cognito-test-sms-role-external-id"
  }
}