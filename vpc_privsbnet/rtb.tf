resource "aws_route_table" "rtb_main" {
    vpc_id = aws_vpc.vpc.id
    tags = {
        Name = "${var.name}-rtb-main"
    }
}

resource "aws_route_table_association" "rtb_main" {
    subnet_id = aws_subnet.private_1a.id
    route_table_id = aws_route_table.rtb_main.id
}

resource "aws_main_route_table_association" "rtb_main" {
    vpc_id = aws_vpc.vpc.id
    route_table_id = aws_route_table.rtb_main.id
}
