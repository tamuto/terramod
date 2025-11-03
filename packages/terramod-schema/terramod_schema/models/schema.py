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
    warning: Optional[str] = Field(
        default=None, description="Warning message (e.g., documentation not found)"
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
    warning: Optional[str] = Field(
        default=None, description="Warning message (e.g., documentation not found)"
    )


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

    def enrich_with_markdown(self, markdown_dir: "Path", logger: Optional[Any] = None) -> None:
        """
        Enrich schema with information from Markdown documentation.

        Args:
            markdown_dir: Directory containing Markdown files for this provider
            logger: Optional logger instance
        """
        from pathlib import Path
        import logging as log

        if logger is None:
            logger = log.getLogger(__name__)

        if not markdown_dir.exists():
            logger.warning(f"Markdown directory not found: {markdown_dir}")
            return

        # Import here to avoid circular dependency
        from ..parsers.markdown_parser import MarkdownParser

        # Helper function to enrich a resource schema
        def enrich_resource(resource_name: str, resource: ResourceSchema, category: str):
            # Determine markdown file path
            possible_paths = [
                markdown_dir / f"{resource_name}.md",
                markdown_dir / category / f"{resource_name}.md",
            ]

            markdown_data = {}
            for md_path in possible_paths:
                if md_path.exists():
                    markdown_data = MarkdownParser.parse_file(md_path)
                    logger.debug(f"Found markdown for {resource_name} at {md_path}")
                    break

            if not markdown_data:
                logger.debug(f"No markdown documentation found for {resource_name}")
                return

            # Enrich resource description
            content = md_path.read_text(encoding="utf-8") if md_path.exists() else ""
            # Extract description from frontmatter or first paragraph
            import re
            desc_match = re.search(r'description:\s*[-|]?\s*\n?\s*(.+?)(?:\n---|$)', content, re.DOTALL)
            if desc_match:
                desc = desc_match.group(1).strip()
                if len(desc) > len(resource.description.en_us):
                    resource.description.en_us = desc

            # Enrich attributes
            md_arguments = markdown_data.get("arguments", {})
            md_attributes = markdown_data.get("attributes", {})
            md_all_attributes = markdown_data.get("all_attributes", {})
            md_block_refs = markdown_data.get("block_references", {})
            md_block_attributes = markdown_data.get("block_attributes", {})

            # Helper function to enrich a single attribute
            def enrich_attribute(attr_name: str, attr, source: str = "general"):
                """Enrich a single attribute with markdown data."""
                # Try argument reference first (most specific)
                if attr_name in md_arguments:
                    md_data = md_arguments[attr_name]
                # Fall back to all_attributes (includes nested block attributes)
                elif attr_name in md_all_attributes:
                    md_data = md_all_attributes[attr_name]
                else:
                    # No markdown data for this attribute
                    if source == "block":
                        attr.warning = "No documentation found for this attribute"
                    return

                # Update description if markdown has more detail
                if len(md_data.get("description", "")) > len(attr.description.en_us):
                    attr.description.en_us = md_data["description"]

                # Set default and possible values
                if md_data.get("default_value") is not None:
                    attr.default_value = md_data["default_value"]
                if md_data.get("possible_values"):
                    attr.possible_values = md_data["possible_values"]

            # Enrich resource attributes
            for attr_name, attr in resource.attributes.items():
                enrich_attribute(attr_name, attr, source="resource")

            # Enrich computed attributes (from Attributes Reference section)
            for attr_name, attr in resource.attributes.items():
                if attr_name in md_attributes:
                    md_data = md_attributes[attr_name]
                    if len(md_data.get("description", "")) > len(attr.description.en_us):
                        attr.description.en_us = md_data["description"]

            # Recursively enrich block types
            def enrich_blocks(block_dict: Dict[str, BlockSchema]):
                for block_name, block in block_dict.items():
                    # Check if this block has documentation via internal link
                    if block_name in md_block_attributes:
                        # Use block-specific attributes (most accurate!)
                        block_attrs = md_block_attributes[block_name]
                        logger.debug(f"Using block-specific documentation for '{block_name}'")

                        for attr_name, attr in block.attributes.items():
                            if attr_name in block_attrs:
                                md_data = block_attrs[attr_name]
                                # Update description
                                if len(md_data.get("description", "")) > len(attr.description.en_us):
                                    attr.description.en_us = md_data["description"]
                                # Set default and possible values
                                if md_data.get("default_value") is not None:
                                    attr.default_value = md_data["default_value"]
                                if md_data.get("possible_values"):
                                    attr.possible_values = md_data["possible_values"]
                            else:
                                # Attribute not documented in this block's section
                                attr.warning = f"No documentation found in '{block_name}' section"

                    elif block_name in md_block_refs:
                        # Block has a reference but we couldn't extract attributes
                        block.warning = f"Documentation link found ({md_block_refs[block_name]}) but could not extract attributes"
                        # Try fallback
                        for attr_name, attr in block.attributes.items():
                            enrich_attribute(attr_name, attr, source="block")

                    else:
                        # No internal link found for this block
                        block.warning = "No documentation link found in Argument Reference"
                        # Try fallback
                        for attr_name, attr in block.attributes.items():
                            enrich_attribute(attr_name, attr, source="block")

                    # Recursively enrich nested blocks
                    if block.block_types:
                        enrich_blocks(block.block_types)

            if resource.block_types:
                enrich_blocks(resource.block_types)

        # Enrich provider config
        if self.provider_config:
            enrich_resource(self.provider_info.name, self.provider_config, "")

        # Enrich resources
        for res_name, resource in self.resources.items():
            enrich_resource(res_name, resource, "resources")

        # Enrich data sources
        for ds_name, data_source in self.data_sources.items():
            enrich_resource(ds_name, data_source, "data_sources")

        # Enrich ephemeral resources
        for er_name, eph_resource in self.ephemeral_resources.items():
            enrich_resource(er_name, eph_resource, "ephemeral_resources")

        logger.info(f"Enriched {self.provider_info.name} with Markdown documentation")
