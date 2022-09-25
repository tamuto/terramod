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

resource "aws_subnet" "public_1a" {
    vpc_id = aws_vpc.vpc.id
    cidr_block = var.public_1a_cidr

    availability_zone = var.az_1a

    tags = {
        Name = "${var.name}-public-1a"
    }
}

resource "aws_internet_gateway" "inetgw" {
    count = var.create_inetgw == true ? 1 : var.create_natgw == true ? 1 : 0
    vpc_id = aws_vpc.vpc.id
}

resource "aws_eip" "eip" {
    count = var.create_natgw == true ? 1 : 0
    vpc = true
}

resource "aws_nat_gateway" "natgw" {
    count = var.create_natgw == true ? 1 : 0
    allocation_id = aws_eip.eip[0].id
    subnet_id = aws_subnet.public_1a.id

    tags = {
        Name = "${var.name}-natgw"
    }
}

resource "aws_default_route_table" "rtb_public" {
    default_route_table_id = aws_vpc.vpc.default_route_table_id

    dynamic "route" {
        for_each = var.create_inetgw == true ? range(1) : range(0)
        content {
            cidr_block = "0.0.0.0/0"
            gateway_id = aws_internet_gateway.inetgw[0].id
        }
    }

    tags = {
        Name = "${var.name}-rtb-public"
    }
}

resource "aws_route_table_association" "rtb_public" {
    subnet_id = aws_subnet.public_1a.id
    route_table_id = aws_default_route_table.rtb_public.id
}

# resource "aws_main_route_table_association" "rtb_public" {
#     vpc_id = aws_vpc.vpc.id
#     route_table_id = aws_route_table.rtb_public.id
# }
