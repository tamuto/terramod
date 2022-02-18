# User Pool
resource "aws_cognito_user_pool" "user_pool" {
  name = "${var.prefix}-${var.name}-user"

  schema {
    attribute_data_type = "String"
    name                = "email"
    required            = true
  }

  username_configuration {
    case_sensitive = false
  }

  auto_verified_attributes = [
    "email"
  ]

  password_policy {

    minimum_length    = 8
    require_lowercase = false
    require_uppercase = false
    require_numbers   = false
    require_symbols   = false

    temporary_password_validity_days = 7
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
  name            = "${var.prefix}-${var.name}-client"
  user_pool_id    = aws_cognito_user_pool.user_pool.id
  generate_secret = false

  ### LEGACY or ENABLED (AWSの推奨はENABLED)
  prevent_user_existence_errors = "ENABLED"

}

/*
# Identity Pool
resource "aws_cognito_identity_pool" "id_pool" {
  identity_pool_name               = "${var.prefix}-${var.name}-idpool"
  allow_unauthenticated_identities = true
  cognito_identity_providers {
    client_id               = aws_cognito_user_pool_client.pool_client.id
    provider_name           = aws_cognito_user_pool.user_pool.endpoint
    server_side_token_check = false
  }
}

resource "aws_cognito_identity_pool_roles_attachment" "user_role_attach" {
  identity_pool_id = aws_cognito_identity_pool.id_pool.id
  roles = {
    "authenticated"   = aws_iam_role.iam_role_cognito_auth.arn
    "unauthenticated" = aws_iam_role.iam_role_cognito_unauth.arn
  }

  role_mapping {
    ambiguous_role_resolution = "Deny"
    identity_provider         = "cognito-idp.${aws.region}.amazonaws.com/${aws_cognito_user_pool.user_pool.id}:${aws_cognito_user_pool_client.pool_client.id}"
    type                      = "Token"
  }

}
*/
