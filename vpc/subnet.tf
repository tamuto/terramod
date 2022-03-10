#
# Subnet
#
resource "aws_subnet" "private_1a" {
    count = var.private_1a_cidr == null ? 0 : 1
    vpc_id = aws_vpc.vpc.id
    cidr_block = var.private_1a_cidr
    availability_zone = var.availability_zone

    tags = {
        Name = "${var.name}-private-1a"
    }
}

resource "aws_subnet" "public_1a" {
    count = var.public_1a_cidr == null ? 0 : 1
    vpc_id = aws_vpc.vpc.id
    cidr_block = var.public_1a_cidr

    availability_zone = var.availability_zone

    tags = {
        Name = "${var.name}-public-1a"
    }
}
