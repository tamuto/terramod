#
# VPC
#
resource "aws_vpc" "vpc" {
    cidr_block = var.vpc_cidr
    enable_dns_hostnames = var.enable_dns_hostnames
    tags = {
        Name = "${var.name}-vpc"
    }
}
