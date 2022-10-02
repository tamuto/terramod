resource "aws_subnet" "subnet" {
    vpc_id = var.aws_vpc.id
    cidr_block = var.subnet_cidr

    availability_zone = var.availability_zone

    tags = {
        Name = "${var.name}-${var.subnet_name}"
    }
}

resource "aws_default_route_table" "rtb" {
    default_route_table_id = var.aws_vpc.main_route_table_id

    dynamic "route" {
        for_each = var.nat_gateway_id == null ? range(0) : range(1)
        content {
            cidr_block = "0.0.0.0/0"
            nat_gateway_id = var.nat_gateway_id
        }
    }

    tags = {
        Name = "${var.name}-private-rtb"
    }
}

resource "aws_route_table_association" "rtb" {
    subnet_id = aws_subnet.subnet.id
    route_table_id = aws_default_route_table.rtb.id
}

resource "aws_vpc_endpoint" "s3" {
    count = var.create_s3_endpoint == true ? 1 : 0

    vpc_id = var.aws_vpc.id
    service_name = var.s3_service_name

    tags = {
        Name = "${var.name}-ep-s3"
    }

    route_table_ids = [aws_default_route_table.rtb.id]
}
