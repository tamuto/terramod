
resource "aws_subnet" "subnet" {
    vpc_id = var.aws_vpc.id
    cidr_block = var.subnet_cidr

    availability_zone = var.availability_zone

    tags = {
        Name = "${var.name}-${var.subnet_name}"
    }
}

resource "aws_internet_gateway" "inetgw" {
    count = var.create_inetgw == true ? 1 : var.create_natgw == true ? 1 : 0
    vpc_id = var.aws_vpc.id
}

resource "aws_eip" "eip" {
    count = var.create_natgw == true ? 1 : 0
    vpc = true
}

resource "aws_nat_gateway" "natgw" {
    count = var.create_natgw == true ? 1 : 0
    allocation_id = aws_eip.eip[0].id
    subnet_id = aws_subnet.subnet.id

    tags = {
        Name = "${var.name}-natgw"
    }
}

resource "aws_route_table" "rtb" {
    vpc_id = var.aws_vpc.id

    dynamic "route" {
        for_each = var.create_inetgw == true ? range(1) : range(0)
        content {
            cidr_block = "0.0.0.0/0"
            gateway_id = aws_internet_gateway.inetgw[0].id
        }
    }

    dynamic "route" {
        for_each = var.inetgw_id == null ? range(0) : range(1)
        content {
            cidr_block = "0.0.0.0/0"
            gateway_id = var.inetgw_id
        }
    }

    tags = {
        Name = "${var.name}-public-rtb"
    }
}

resource "aws_route_table_association" "rtb" {
    subnet_id = aws_subnet.subnet.id
    route_table_id = aws_route_table.rtb.id
}
