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

### Usages

```terraform
module "vpc" {
    source = "github.com/tamuto/terramod/aws/vpc/vpc"

    name = "labo"
    vpc_cidr = "10.0.0.0/16"
}
```
