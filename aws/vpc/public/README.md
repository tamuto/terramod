# Terraform Modules for AWS VPC

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

### Usage

```terraform
module "vpc" {
    source = "github.com/tamuto/terramod/aws/vpc/vpc"

    name = "name"
    vpc_cidr = "10.0.0.0/16"
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
