"""Pydantic models for Terraform schema data structures."""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class LocalizedDescription(BaseModel):
    """Multi-language description support."""

    en_us: str = Field(default="", description="English description")
    ja_jp: str = Field(default="", description="Japanese description")

    def __init__(self, **data):
        """Initialize with flexible input - accepts string or dict."""
        if isinstance(data.get("en_us"), str):
            super().__init__(**data)
        else:
            # If only a plain string is provided
            super().__init__(en_us=data.get("en_us", ""), ja_jp=data.get("ja_jp", ""))


class AttributeSchema(BaseModel):
    """Schema for a single attribute."""

    name: str = Field(..., description="Attribute name")
    type: Any = Field(..., description="Attribute type (can be string or complex type)")
    description: LocalizedDescription = Field(
        default_factory=LocalizedDescription, description="Localized descriptions"
    )
    required: bool = Field(default=False, description="Whether attribute is required")
    optional: bool = Field(default=False, description="Whether attribute is optional")
    computed: bool = Field(default=False, description="Whether attribute is computed")
    sensitive: bool = Field(default=False, description="Whether attribute is sensitive")
    default_value: Optional[Any] = Field(
        default=None, description="Default value (extracted from markdown)"
    )
    possible_values: List[Any] = Field(
        default_factory=list, description="Possible values (extracted from markdown)"
    )
    deprecated: bool = Field(default=False, description="Whether attribute is deprecated")
    deprecation_message: Optional[str] = Field(
        default=None, description="Deprecation message"
    )


class BlockSchema(BaseModel):
    """Schema for a nested block."""

    name: str = Field(..., description="Block name")
    nesting_mode: str = Field(
        default="single",
        description="Nesting mode: single, list, set, map",
    )
    description: LocalizedDescription = Field(
        default_factory=LocalizedDescription, description="Localized descriptions"
    )
    attributes: Dict[str, AttributeSchema] = Field(
        default_factory=dict, description="Block attributes"
    )
    block_types: Dict[str, "BlockSchema"] = Field(
        default_factory=dict, description="Nested blocks"
    )
    min_items: Optional[int] = Field(default=None, description="Minimum items")
    max_items: Optional[int] = Field(default=None, description="Maximum items")


# Enable forward references for nested BlockSchema
BlockSchema.model_rebuild()


class ResourceSchema(BaseModel):
    """Schema for a resource or data source."""

    name: str = Field(..., description="Resource name")
    type: str = Field(
        ..., description="Type: resource, data_source, or ephemeral_resource"
    )
    version: int = Field(default=0, description="Schema version")
    description: LocalizedDescription = Field(
        default_factory=LocalizedDescription, description="Localized descriptions"
    )
    attributes: Dict[str, AttributeSchema] = Field(
        default_factory=dict, description="Resource attributes"
    )
    block_types: Dict[str, BlockSchema] = Field(
        default_factory=dict, description="Nested blocks"
    )
    timeouts_configurable: bool = Field(
        default=False, description="Whether timeouts are configurable"
    )
    deprecated: bool = Field(default=False, description="Whether resource is deprecated")


class ProviderInfo(BaseModel):
    """Provider information extracted from registry path."""

    namespace: str = Field(..., description="Provider namespace (e.g., hashicorp)")
    name: str = Field(..., description="Provider name (e.g., aws)")
    version: str = Field(default="", description="Provider version")

    @property
    def full_name(self) -> str:
        """Get full provider name."""
        return f"registry.terraform.io/{self.namespace}/{self.name}"


class ProviderSchema(BaseModel):
    """Complete provider schema."""

    provider_info: ProviderInfo = Field(..., description="Provider information")
    provider_config: Optional[ResourceSchema] = Field(
        default=None, description="Provider configuration schema"
    )
    resources: Dict[str, ResourceSchema] = Field(
        default_factory=dict, description="Resource schemas"
    )
    data_sources: Dict[str, ResourceSchema] = Field(
        default_factory=dict, description="Data source schemas"
    )
    ephemeral_resources: Dict[str, ResourceSchema] = Field(
        default_factory=dict, description="Ephemeral resource schemas"
    )
    functions: Dict[str, Any] = Field(
        default_factory=dict, description="Provider functions"
    )

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for YAML serialization."""
        return self.model_dump(exclude_none=True)
