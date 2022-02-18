#
# VPC
#
resource "aws_vpc" "vpc" {
    cidr_block = var.vpc_cidr
    enable_dns_hostnames = true
    tags = {
        Name = "${var.system}-${var.env}-vpc"
    }
}

#
# Subnet
#
resource "aws_subnet" "private_1a" {
    vpc_id = aws_vpc.vpc.id
    cidr_block = var.private_1a_cidr
    availability_zone = "ap-northeast-1a"

    tags = {
        Name = "${var.system}-${var.env}-private-1a"
    }
}
