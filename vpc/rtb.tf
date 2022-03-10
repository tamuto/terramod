resource "aws_route_table" "rtb_private" {
    count = var.private_1a_cidr == null ? 0 : 1
    vpc_id = aws_vpc.vpc.id

    dynamic "route" {
        for_each = var.create_natgw == true ? range(1) : range(0)
        content {
            cidr_block = "0.0.0.0/0"
            nat_gateway_id =  aws_nat_gateway.natgw[0].id
        }
    }

    tags = {
        Name = "${var.name}-rtb-private"
    }
}

resource "aws_route_table_association" "rtb_private" {
    count = var.private_1a_cidr == null ? 0 : 1
    subnet_id = aws_subnet.private_1a[0].id
    route_table_id = aws_route_table.rtb_private[0].id
}

resource "aws_main_route_table_association" "rtb_private" {
    count = var.private_rt_is_main == true ? 1 : 0
    vpc_id = aws_vpc.vpc.id
    route_table_id = aws_route_table.rtb_private[0].id
}

resource "aws_route_table" "rtb_public" {
    count = var.public_1a_cidr == null ? 0 : 1
    vpc_id = aws_vpc.vpc.id

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
    count = var.public_1a_cidr == null ? 0 : 1
    subnet_id = aws_subnet.public_1a[0].id
    route_table_id = aws_route_table.rtb_public[0].id
}

resource "aws_main_route_table_association" "rtb_public" {
    count = var.public_rt_is_main == true ? 1 : 0
    vpc_id = aws_vpc.vpc.id
    route_table_id = aws_route_table.rtb_public[0].id
}
