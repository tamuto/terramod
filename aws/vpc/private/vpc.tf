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

resource "aws_subnet" "subnet" {
    vpc_id = aws_vpc.vpc.id
    cidr_block = var.subnet_cidr

    availability_zone = var.availability_zone

    tags = {
        Name = "${var.name}-${var.subnet_name}"
    }
}

resource "aws_default_route_table" "rtb" {
    default_route_table_id = aws_vpc.vpc.default_route_table_id

    tags = {
        Name = "${var.name}-rtb"
    }
}

resource "aws_route_table_association" "rtb" {
    subnet_id = aws_subnet.subnet.id
    route_table_id = aws_default_route_table.rtb.id
}

resource "aws_vpc_endpoint" "s3" {
    count = var.create_s3_endpoint == true ? 1 : 0

    vpc_id = aws_vpc.vpc.id
    service_name = var.s3_service_name

    tags = {
        Name = "${var.name}-ep-s3"
    }

    route_table_ids = [aws_default_route_table.rtb.id]
}
