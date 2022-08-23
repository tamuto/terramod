variable "name" {}
variable "allow_headers" {}
variable "allow_methods" {
    default = ["GET", "POST", "PUT", "DELETE"]
}
variable "allow_origins" {}