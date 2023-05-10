resource "aws_ram_resource_share" "subnet" {
    name = var.name
    allow_external_principals = true
    tags = {
        Name = var.name
    }
}

resource "aws_ram_principal_association" "invite" {
    # Allesc
    principal = var.principal
    resource_share_arn = aws_ram_resource_share.subnet.arn
}

resource "aws_ram_resource_association" "subnet" {
    resource_arn = var.subnet
    resource_share_arn = aws_ram_resource_share.subnet.arn
}
