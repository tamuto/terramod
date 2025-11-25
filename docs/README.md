# Terraform Provider Documentation

This directory contains downloaded Terraform provider documentation in Markdown format.

## Directory Structure

```
etc/docs/
├── README.md                    # This file
└── providers/                   # Downloaded provider documentation
    ├── aws/
    │   ├── provider.md          # Provider configuration docs
    │   ├── resources/           # Resource documentation
    │   │   ├── aws_instance.md
    │   │   ├── aws_s3_bucket.md
    │   │   └── ...
    │   └── data_sources/        # Data source documentation
    │       ├── aws_ami.md
    │       └── ...
    ├── google/
    │   └── ...
    └── azurerm/
        └── ...
```

## Downloading Documentation

Documentation is automatically downloaded from the Terraform Registry using the `terramod-schema` tool:

```bash
# From project root
terramod-schema download-docs
```

This will:
1. Read the provider list from `etc/providers/providers.json`
2. Download documentation for each provider from Terraform Registry
3. Save Markdown files to `etc/docs/providers/{provider_name}/`

## Manual Download (Alternative)

If you need to manually download documentation, you can use the Terraform Registry API:

### API Endpoints

- **Provider Documentation**: `https://registry.terraform.io/v2/provider-docs/{namespace}/{name}/{version}`

  Example:
  ```bash
  curl https://registry.terraform.io/v2/provider-docs/hashicorp/aws/6.19.0 | jq .
  ```

### Response Format

The API returns JSON with the following structure:

```json
{
  "provider": {
    "content": "# Provider Configuration\n\n..."
  },
  "resources": {
    "aws_instance": {
      "content": "# aws_instance\n\n..."
    }
  },
  "data-sources": {
    "aws_ami": {
      "content": "# aws_ami\n\n..."
    }
  }
}
```

## Usage in Schema Generation

These Markdown files are parsed during YAML schema generation to extract:

- **Default values** for attributes
- **Possible/valid values** (enums)
- **Enhanced descriptions** with more context
- **Computed attributes** information

Example from Markdown:

```markdown
## Argument Reference

* `instance_type` - (Optional) The instance type. Valid values are `t2.micro`, `t2.small`, `t2.medium`. Defaults to `t2.micro`.
```

Will extract:
- `default_value: "t2.micro"`
- `possible_values: ["t2.micro", "t2.small", "t2.medium"]`

## Updating Documentation

When provider versions are updated:

1. Update providers in `etc/terraform/providers.tf`
2. Run `terraform init` to download new versions
3. Generate new schema: `terraform providers schema -json > etc/providers/providers.json`
4. Download updated docs: `terramod-schema download-docs`
5. Regenerate YAML: `terramod-schema generate --with-markdown`

## Notes

- Documentation is fetched from the official Terraform Registry
- Files are stored in UTF-8 encoding
- Markdown format follows Terraform documentation standards
- Documentation is version-specific to match the provider version in `providers.json`
