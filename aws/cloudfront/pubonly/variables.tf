variable "domain" {}
variable "acm_domain" {}
variable "origin_path" {
    default = "/public"
}
variable "viewer_request_arn" {
    default = null
}
variable "oac_name" {}
variable "oac_description" {}
variable "bucket_name" {}
variable "bucket_policy" {
    default = true
}

data "aws_acm_certificate" "issued" {
    domain = var.acm
    statuses = ["ISSUED"]
}
