variable "function_name" {}
variable "handler" {
    default = "lambda/index.handler"
}
variable "content" {
    default = "// empty"
}
variable "filename" {
    default = "lambda/index.js"
}
variable "runtime" {
    default = "nodejs18.x"
}
variable "role_arn" {}
variable "publish" {
    default = false
}
