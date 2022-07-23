#
# Subnet
#
resource "aws_subnet" "private_1a" {
    count = var.private_1a_cidr == null ? 0 : 1
    vpc_id = aws_vpc.vpc.id
    cidr_block = var.private_1a_cidr
    availability_zone = var.az_1a

    tags = {
        Name = "${var.name}-private-1a"
    }
}

resource "aws_subnet" "public_1a" {
    count = var.public_1a_cidr == null ? 0 : 1
    vpc_id = aws_vpc.vpc.id
    cidr_block = var.public_1a_cidr

    availability_zone = var.az_1a

    tags = {
        Name = "${var.name}-public-1a"
    }
}

resource "aws_subnet" "private_1c" {
    count = var.private_1c_cidr == null ? 0 : 1
    vpc_id = aws_vpc.vpc.id
    cidr_block = var.private_1c_cidr
    availability_zone = var.az_1c

    tags = {
        Name = "${var.name}-private-1c"
    }
}

resource "aws_subnet" "public_1c" {
    count = var.public_1c_cidr == null ? 0 : 1
    vpc_id = aws_vpc.vpc.id
    cidr_block = var.public_1c_cidr

    availability_zone = var.az_1c

    tags = {
        Name = "${var.name}-public-1c"
    }
}
