# Terraform Modules for AWS VPC

## VPC

### Variables

| Varriable Name       | Default | Description    |
| -------------------- | ------- | -------------- |
| name                 |         | `'{name}-vpc'` |
| enable_dns_hostnames | true    |                |
| vpc_cidr             |         |                |

### Outputs

| Variable Name | Description |
| ------------- | ----------- |
| aws_vpc       | vpc object  |

## Public Subnet

![public_vpc](../_img/public_vpc.png)

### Variables

| Varriable Name    | Default         | Description              |
| ----------------- | --------------- | ------------------------ |
| aws_vpc           |                 | Terraform aws_vpc Object |
| name              |                 |                          |
| subnet_cidr       |                 |                          |
| availability_zone | ap-northeast-1a |                          |
| subnet_name       | public-1a       |                          |
| create_inetgw     | false           |                          |
| create_natgw      | false           |                          |

### Outputs

| Variable Name  | Description                                           |
| -------------- | ----------------------------------------------------- |
| nat_gateway_id | NAT Gateway ID if create_natgw is true, or else null. |

## Private Subnet

![private_vpc](../_img/private_vpc.png)

### Variables

| Varriable Name     | Default                         | Description              |
| ------------------ | ------------------------------- | ------------------------ |
| aws_vpc            |                                 | Terraform aws_vpc Object |
| name               |                                 |                          |
| subnet_cidr        |                                 |                          |
| availability_zone  | ap-northeast-1a                 |                          |
| subnet_name        | private-1a                      |                          |
| create_s3_endpoint | true                            |                          |
| s3_service_name    | com.amazonaws.ap-northeast-1.s3 |                          |
| nat_gateway_id     | null                            |                          |

### Usage

```terraform
module "vpc" {
    source = "github.com/tamuto/terramod/aws/vpc/vpc"

    name = "name"
    vpc_cidr = "10.0.0.0/16"
}

#
# Private Subnet
#
module "private_subnet" {
    source = "github.com/tamuto/terramod/aws/vpc/private"

    aws_vpc = module.vpc.aws_vpc
    name = "name"
    subnet_cidr = "10.0.1.0/24"
    create_s3_endpoint = false
    nat_gateway_id = module.public_subnet.nat_gateway_id
}

#
# Public Subnet
#
module "public_subnet" {
    source = "github.com/tamuto/terramod/aws/vpc/public"

    aws_vpc = module.vpc.aws_vpc
    name = "name"
    subnet_cidr = "10.0.0.0/24"
    create_inetgw = true
    create_natgw = true
}
```
