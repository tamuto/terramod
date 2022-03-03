resource "aws_vpc_endpoint" "s3" {
    vpc_id = aws_vpc.vpc.id
    service_name = "com.amazonaws.ap-northeast-1.s3"

    tags = {
        Name = "${var.name}-ep-s3"
    }

    route_table_ids = [aws_route_table.rtb_main.id]
}
