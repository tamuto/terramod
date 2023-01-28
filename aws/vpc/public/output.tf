output "nat_gateway_id" {
    value = length(aws_nat_gateway.natgw) > 0 ? aws_nat_gateway.natgw[0].id : null
}
output "inet_gateway_id" {
    value = length(aws_internet_gateway.inetgw) > 0 ? aws_internet_gateway.inetgw[0].id : null
}
