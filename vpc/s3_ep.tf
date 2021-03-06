resource "aws_vpc_endpoint" "s3" {
    count = var.create_s3_endpoint == true ? 1 : 0

    vpc_id = aws_vpc.vpc.id
    service_name = var.s3_service_name

    tags = {
        Name = "${var.name}-ep-s3"
    }

    route_table_ids = [aws_route_table.rtb_private[0].id]
}
