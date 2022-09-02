variable "name" {}
variable "cognito_user_client_id" {}
variable "cognito_user_pool_id" {}
variable "cognito_manager_client_id" {}
variable "cognito_manager_pool_id" {}
variable "allow_headers" {
    default = ["Content-Type", "X-Amz-Date", "Authorization", "X-Api-Key", "X-Amz-Security-Token"]
}

variable "allow_methods" {
    default = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}
variable "allow_origins" {}
# variable "user_poolname" {}
# variable "manager_poolname" {}