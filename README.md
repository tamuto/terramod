# terramod

modules for terraform

## Table of Contents

* AWS
  * [VPC](./aws/vpc/vpc/README.md)
  * [Public Subnet](./aws/vpc/public/README.md)
  * [Private Subnet](./aws/vpc/private/README.md)


## Usage

```
module "xx" {
    source = "github.com/tamuto/terramod/xxxx"

}
```

```
terraform init
or
terraform get --update
```
