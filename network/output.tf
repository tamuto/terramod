output "vpc_id" {
    value = aws_vpc.vpc.*.id[0]
}

output "private_1a_id" {
    value = aws_subnet.private_1a.*.id[0]
}
