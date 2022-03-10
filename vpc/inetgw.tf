resource "aws_internet_gateway" "inetgw" {
    count = var.create_inetgw == true ? 1 : var.create_natgw == true ? 1 : 0
    vpc_id = aws_vpc.vpc.id
}
