resource "aws_eip" "eip" {
    count = var.create_natgw == true ? var.public_1a_cidr == null ? 0 : 1 : 0
    vpc = true
}

resource "aws_nat_gateway" "natgw" {
    count = var.create_natgw == true ? var.public_1a_cidr == null ? 0 : 1 : 0
    allocation_id = aws_eip.eip[0].id
    subnet_id = aws_subnet.public_1a[0].id

    tags = {
        Name = "${var.name}-natgw"
    }
}
