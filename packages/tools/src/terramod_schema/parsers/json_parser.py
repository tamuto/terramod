"""Parser for Terraform providers.json schema file."""

import json
import logging
from pathlib import Path
from typing import Any, Dict, List

from ..models.schema import (
    AttributeSchema,
    BlockSchema,
    LocalizedDescription,
    ProviderInfo,
    ProviderSchema,
    ResourceSchema,
)

logger = logging.getLogger(__name__)


class JSONSchemaParser:
    """Parser for Terraform provider schema JSON."""

    @staticmethod
    def parse_provider_name(full_name: str) -> ProviderInfo:
        """
        Parse provider full name into components.

        Args:
            full_name: Full provider name like "registry.terraform.io/hashicorp/aws"

        Returns:
            ProviderInfo object
        """
        parts = full_name.replace("registry.terraform.io/", "").split("/")
        if len(parts) >= 2:
            return ProviderInfo(namespace=parts[0], name=parts[1])
        else:
            return ProviderInfo(namespace="unknown", name=parts[0] if parts else "unknown")

    @staticmethod
    def parse_attribute(name: str, attr_data: Dict[str, Any]) -> AttributeSchema:
        """
        Parse a single attribute from JSON schema.

        Args:
            name: Attribute name
            attr_data: Attribute data from JSON

        Returns:
            AttributeSchema object
        """
        description = attr_data.get("description", "")

        return AttributeSchema(
            name=name,
            type=attr_data.get("type", "string"),
            description=LocalizedDescription(en_us=description),
            required=attr_data.get("required", False),
            optional=attr_data.get("optional", False),
            computed=attr_data.get("computed", False),
            sensitive=attr_data.get("sensitive", False),
            deprecated=attr_data.get("deprecated", False),
            deprecation_message=attr_data.get("deprecation_message"),
        )

    @classmethod
    def parse_block(cls, name: str, block_data: Dict[str, Any]) -> BlockSchema:
        """
        Parse a nested block from JSON schema.

        Args:
            name: Block name
            block_data: Block data from JSON

        Returns:
            BlockSchema object
        """
        block_def = block_data.get("block", {})
        description = block_def.get("description", block_data.get("description", ""))

        # Parse attributes
        attributes = {}
        for attr_name, attr_data in block_def.get("attributes", {}).items():
            attributes[attr_name] = cls.parse_attribute(attr_name, attr_data)

        # Parse nested blocks recursively
        block_types = {}
        for nested_name, nested_data in block_def.get("block_types", {}).items():
            block_types[nested_name] = cls.parse_block(nested_name, nested_data)

        return BlockSchema(
            name=name,
            nesting_mode=block_data.get("nesting_mode", "single"),
            description=LocalizedDescription(en_us=description),
            attributes=attributes,
            block_types=block_types,
            min_items=block_data.get("min_items"),
            max_items=block_data.get("max_items"),
        )

    @classmethod
    def parse_resource(
        cls, name: str, resource_data: Dict[str, Any], resource_type: str
    ) -> ResourceSchema:
        """
        Parse a resource or data source schema.

        Args:
            name: Resource name
            resource_data: Resource data from JSON
            resource_type: Type of resource (resource, data_source, ephemeral_resource)

        Returns:
            ResourceSchema object
        """
        block = resource_data.get("block", {})
        description = block.get("description", "")

        # Parse attributes
        attributes = {}
        for attr_name, attr_data in block.get("attributes", {}).items():
            attributes[attr_name] = cls.parse_attribute(attr_name, attr_data)

        # Parse block types
        block_types = {}
        for block_name, block_data in block.get("block_types", {}).items():
            block_types[block_name] = cls.parse_block(block_name, block_data)

        return ResourceSchema(
            name=name,
            type=resource_type,
            version=resource_data.get("version", 0),
            description=LocalizedDescription(en_us=description),
            attributes=attributes,
            block_types=block_types,
            deprecated=block.get("deprecated", False),
        )

    @classmethod
    def parse_file(cls, file_path: Path) -> List[ProviderSchema]:
        """
        Parse providers.json file.

        Args:
            file_path: Path to providers.json

        Returns:
            List of ProviderSchema objects

        Raises:
            FileNotFoundError: If file doesn't exist
            json.JSONDecodeError: If file is not valid JSON
        """
        logger.info(f"Parsing schema file: {file_path}")

        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        provider_schemas = []

        for provider_name, provider_data in data.get("provider_schemas", {}).items():
            logger.info(f"Parsing provider: {provider_name}")

            provider_info = cls.parse_provider_name(provider_name)

            # Parse provider configuration
            provider_config = None
            if "provider" in provider_data:
                provider_config = cls.parse_resource(
                    provider_info.name, provider_data["provider"], "provider"
                )

            # Parse resources
            resources = {}
            for res_name, res_data in provider_data.get("resource_schemas", {}).items():
                resources[res_name] = cls.parse_resource(res_name, res_data, "resource")

            # Parse data sources
            data_sources = {}
            for ds_name, ds_data in provider_data.get("data_source_schemas", {}).items():
                data_sources[ds_name] = cls.parse_resource(
                    ds_name, ds_data, "data_source"
                )

            # Parse ephemeral resources
            ephemeral_resources = {}
            for er_name, er_data in provider_data.get(
                "ephemeral_resource_schemas", {}
            ).items():
                ephemeral_resources[er_name] = cls.parse_resource(
                    er_name, er_data, "ephemeral_resource"
                )

            # Parse functions
            functions = provider_data.get("functions", {})

            provider_schema = ProviderSchema(
                provider_info=provider_info,
                provider_config=provider_config,
                resources=resources,
                data_sources=data_sources,
                ephemeral_resources=ephemeral_resources,
                functions=functions,
            )

            provider_schemas.append(provider_schema)
            logger.info(
                f"Parsed {provider_info.name}: "
                f"{len(resources)} resources, "
                f"{len(data_sources)} data sources, "
                f"{len(ephemeral_resources)} ephemeral resources"
            )

        return provider_schemas
