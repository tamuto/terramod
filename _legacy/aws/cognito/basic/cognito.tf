# User Pool
resource "aws_cognito_user_pool" "user_pool" {
    name = var.poolname
    auto_verified_attributes = var.auto_verified

    admin_create_user_config {
        allow_admin_create_user_only = var.allow_admin_create_user_only
    }
    username_configuration {
        case_sensitive = false
    }
    dynamic "schema" {
        for_each = var.schemas
        content {
            attribute_data_type = schema.value.type
            name = schema.key
            required = false
            mutable = schema.value.mutable
            string_attribute_constraints {
                min_length = schema.value.min_length
                max_length = schema.value.max_length
            }
        }
    }
    password_policy {
        minimum_length = var.password_minimum_length
        require_lowercase = var.password_require_lowercase
        require_numbers = var.password_require_numbers
        require_symbols = var.password_require_symbols
    }
    account_recovery_setting {
        recovery_mechanism {
            name = var.account_recovery
            priority = 1
        }
    }
}

# App Client
resource "aws_cognito_user_pool_client" "pool_client" {
  name            = var.clientname
  user_pool_id    = aws_cognito_user_pool.user_pool.id
  generate_secret = false

  ### LEGACY or ENABLED (AWSの推奨はENABLED)
  prevent_user_existence_errors = "ENABLED"
}
