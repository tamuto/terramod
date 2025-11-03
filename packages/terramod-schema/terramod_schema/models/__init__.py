"""Data models for Terraform schema structures."""

from .schema import (
    AttributeSchema,
    BlockSchema,
    LocalizedDescription,
    ProviderInfo,
    ProviderSchema,
    ResourceSchema,
)

__all__ = [
    "LocalizedDescription",
    "AttributeSchema",
    "BlockSchema",
    "ResourceSchema",
    "ProviderSchema",
    "ProviderInfo",
]
