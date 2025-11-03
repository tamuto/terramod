"""Parser for Terraform provider Markdown documentation."""

import logging
import re
from pathlib import Path
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


class MarkdownParser:
    """Parser for extracting information from Terraform provider Markdown docs."""

    @staticmethod
    def extract_argument_reference(markdown_content: str) -> Dict[str, Dict[str, Any]]:
        """
        Extract argument reference information from Markdown.

        Args:
            markdown_content: Markdown content

        Returns:
            Dictionary mapping argument names to their metadata
        """
        result = {}

        # Find the Argument Reference section
        arg_ref_pattern = r"##\s*Argument[s]?\s*Reference\s*\n(.*?)(?=\n##|\Z)"
        arg_ref_match = re.search(
            arg_ref_pattern, markdown_content, re.DOTALL | re.IGNORECASE
        )

        if not arg_ref_match:
            logger.debug("No Argument Reference section found")
            return result

        arg_ref_section = arg_ref_match.group(1)

        # Extract individual arguments
        # Pattern: * `argument_name` - description
        arg_pattern = r"\*\s*`([^`]+)`\s*[-–—]\s*(.+?)(?=\n\*\s*`|\n\n|\Z)"
        for match in re.finditer(arg_pattern, arg_ref_section, re.DOTALL):
            arg_name = match.group(1).strip()
            arg_desc = match.group(2).strip()

            # Extract default value
            default_value = MarkdownParser._extract_default_value(arg_desc)

            # Extract possible values
            possible_values = MarkdownParser._extract_possible_values(arg_desc)

            # Check if required/optional
            is_required = bool(
                re.search(r"\(required\)", arg_desc, re.IGNORECASE)
            )
            is_optional = bool(
                re.search(r"\(optional\)", arg_desc, re.IGNORECASE)
            )

            result[arg_name] = {
                "description": arg_desc,
                "default_value": default_value,
                "possible_values": possible_values,
                "required": is_required,
                "optional": is_optional,
            }

        logger.debug(f"Extracted {len(result)} arguments from Markdown")
        return result

    @staticmethod
    def _extract_default_value(description: str) -> Optional[Any]:
        """
        Extract default value from description text.

        Args:
            description: Argument description

        Returns:
            Default value if found, None otherwise
        """
        # Pattern: "Defaults to X", "Default: X", "Default is X"
        patterns = [
            r"[Dd]efaults?\s+to\s+[`'\"]?([^`'\".,\s]+)[`'\"]?",
            r"[Dd]efault:\s*[`'\"]?([^`'\".,\s]+)[`'\"]?",
            r"[Dd]efault\s+is\s+[`'\"]?([^`'\".,\s]+)[`'\"]?",
            r"[Dd]efault\s+value\s+is\s+[`'\"]?([^`'\".,\s]+)[`'\"]?",
        ]

        for pattern in patterns:
            match = re.search(pattern, description)
            if match:
                value = match.group(1)
                # Try to convert to appropriate type
                if value.lower() == "true":
                    return True
                elif value.lower() == "false":
                    return False
                elif value.lower() in ["null", "nil", "none"]:
                    return None
                elif value.isdigit():
                    return int(value)
                else:
                    return value

        return None

    @staticmethod
    def _extract_possible_values(description: str) -> List[Any]:
        """
        Extract possible/valid values from description text.

        Args:
            description: Argument description

        Returns:
            List of possible values
        """
        possible_values = []

        # Pattern: "Valid values are: X, Y, Z" or "Possible values: X, Y, Z"
        # Also handles: "Valid values are `X`, `Y`, and `Z`"
        patterns = [
            r"[Vv]alid\s+values?\s+(?:are|is)[\s:]+(.+?)(?:[.!]|\n|$)",
            r"[Pp]ossible\s+values?[\s:]+(.+?)(?:[.!]|\n|$)",
            r"[Mm]ust\s+be\s+one\s+of[\s:]+(.+?)(?:[.!]|\n|$)",
            r"[Oo]ne\s+of[\s:]+(.+?)(?:[.!]|\n|$)",
        ]

        for pattern in patterns:
            match = re.search(pattern, description)
            if match:
                values_str = match.group(1)
                # Extract values in backticks
                values = re.findall(r"`([^`]+)`", values_str)
                if values:
                    possible_values.extend(values)
                else:
                    # Try comma-separated without backticks
                    values = [v.strip() for v in values_str.split(",")]
                    # Remove "and" or "or" from last value
                    if values:
                        values[-1] = re.sub(
                            r"\s+(and|or)\s+", "", values[-1]
                        ).strip()
                    possible_values.extend([v for v in values if v])

        return possible_values

    @staticmethod
    def extract_attributes_reference(markdown_content: str) -> Dict[str, Dict[str, Any]]:
        """
        Extract attributes reference information (for computed attributes).

        Args:
            markdown_content: Markdown content

        Returns:
            Dictionary mapping attribute names to their metadata
        """
        result = {}

        # Find the Attributes Reference section
        attr_ref_pattern = r"##\s*Attributes?\s*Reference\s*\n(.*?)(?=\n##|\Z)"
        attr_ref_match = re.search(
            attr_ref_pattern, markdown_content, re.DOTALL | re.IGNORECASE
        )

        if not attr_ref_match:
            logger.debug("No Attributes Reference section found")
            return result

        attr_ref_section = attr_ref_match.group(1)

        # Extract individual attributes (same pattern as arguments)
        attr_pattern = r"\*\s*`([^`]+)`\s*[-–—]\s*(.+?)(?=\n\*\s*`|\n\n|\Z)"
        for match in re.finditer(attr_pattern, attr_ref_section, re.DOTALL):
            attr_name = match.group(1).strip()
            attr_desc = match.group(2).strip()

            result[attr_name] = {
                "description": attr_desc,
                "computed": True,
            }

        logger.debug(f"Extracted {len(result)} attributes from Markdown")
        return result

    @classmethod
    def parse_file(cls, file_path: Path) -> Dict[str, Any]:
        """
        Parse a Markdown documentation file.

        Args:
            file_path: Path to Markdown file

        Returns:
            Dictionary containing extracted information
        """
        if not file_path.exists():
            logger.warning(f"Markdown file not found: {file_path}")
            return {}

        content = file_path.read_text(encoding="utf-8")

        return {
            "arguments": cls.extract_argument_reference(content),
            "attributes": cls.extract_attributes_reference(content),
        }

    @classmethod
    def enrich_schema_with_markdown(
        cls, schema: Dict[str, Any], markdown_dir: Path, resource_name: str
    ) -> Dict[str, Any]:
        """
        Enrich schema with information from Markdown documentation.

        Args:
            schema: Schema dictionary (from JSON parser)
            markdown_dir: Directory containing Markdown files
            resource_name: Resource name (e.g., "aws_instance")

        Returns:
            Enriched schema dictionary
        """
        # Determine the correct markdown file path
        # Could be in resources/ or data_sources/ subdirectory
        possible_paths = [
            markdown_dir / f"{resource_name}.md",
            markdown_dir / "resources" / f"{resource_name}.md",
            markdown_dir / "data_sources" / f"{resource_name}.md",
        ]

        markdown_data = {}
        for md_path in possible_paths:
            if md_path.exists():
                markdown_data = cls.parse_file(md_path)
                logger.debug(f"Found markdown for {resource_name} at {md_path}")
                break

        if not markdown_data:
            logger.debug(f"No markdown documentation found for {resource_name}")
            return schema

        # Enrich attributes with markdown data
        md_arguments = markdown_data.get("arguments", {})
        md_attributes = markdown_data.get("attributes", {})

        # Update schema attributes
        for attr_name, attr_schema in schema.get("attributes", {}).items():
            if attr_name in md_arguments:
                md_data = md_arguments[attr_name]
                attr_schema["default_value"] = md_data.get("default_value")
                attr_schema["possible_values"] = md_data.get("possible_values", [])
                # Update description if more detailed
                if len(md_data.get("description", "")) > len(
                    attr_schema.get("description", {}).get("en_us", "")
                ):
                    attr_schema["description"]["en_us"] = md_data["description"]

            if attr_name in md_attributes:
                md_data = md_attributes[attr_name]
                attr_schema["computed"] = md_data.get("computed", False)

        return schema
