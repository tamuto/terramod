#
# Subnet
#
resource "aws_subnet" "private_1a" {
    vpc_id = aws_vpc.vpc.id
    cidr_block = var.private_1a_cidr
    availability_zone = "ap-northeast-1a"

    tags = {
        Name = "${var.name}-private-1a"
    }
}
