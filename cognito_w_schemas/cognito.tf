# IAM role for cognito sms
resource "aws_iam_role" "cognito_sms" {
    name_prefix = "${var.name}_CognitoTest_SMS"
    assume_role_policy    = jsonencode(
        {
            Statement = [
                {
                  Condition = {
                            StringEquals = {
                                "sts:ExternalId" = "${var.aws.sms_role_ext_id}"
                            }
                  }
                  Action    = "sts:AssumeRole"
                  Effect    = "Allow"
                  Principal = {
                      Service = "cognito-idp.amazonaws.com"
                  }
                },
            ]
            Version   = "2012-10-17"
        }
    )
    inline_policy {
      name   = "cognito_sms_policy"
      policy = jsonencode({
        Version   = "2012-10-17"
        Statement = [
          {
            Action   = [
              "sns:ListPhoneNumbersOptedOut",
              "sns:Publish",
              "sns:SetSMSAttributes",
              "sns:GetSMSAttributes",
              "sns:OptInPhoneNumber",
              "sns:CheckIfPhoneNumberIsOptedOut",
              "sns:CreateSMSSandboxPhoneNumber"
              ]
            Effect   = "Allow"
            Resource = "*"
          },
        ]
      })
    }
    force_detach_policies = false
    max_session_duration  = 3600
    path                  = "/service-role/"
}

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

  mfa_configuration          = var.mfa_configuration
  sms_authentication_message = var.sms_authentication_message

  sms_configuration {
    external_id    = var.aws.sms_role_ext_id
    sns_caller_arn = aws_iam_role.cognito_sms.arn
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

  ### LEGACY or ENABLED (AWS????????????ENABLED)
  prevent_user_existence_errors = "ENABLED"

}
