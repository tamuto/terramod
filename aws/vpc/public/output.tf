output "nat_gateway_id" {
    value = length(aws_nat_gateway.natgw) > 0 ? aws_nat_gateway.natgw[0].id : null
}
