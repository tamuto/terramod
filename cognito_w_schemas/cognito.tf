# User Pool
resource "aws_cognito_user_pool" "user_pool" {
  name = var.poolname
  auto_verified_attributes = var.auto_verified

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

  admin_create_user_config {
    allow_admin_create_user_only = var.create_user
  }

  username_configuration {
    case_sensitive = false
  }

  password_policy {
    minimum_length = 8
    require_lowercase = true
    require_numbers = true
    require_symbols = true
  }

  verification_message_template {
    email_subject = var.email_subject
    email_message = var.email_message
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = var.account_recovery
      priority = 1
    }
  }

  lifecycle {
    ignore_changes = [
      ### AWS doesn't allow schema updates, so every build will re-create 
      ### the user pool unless we ignore this bit
      schema
    ]
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
