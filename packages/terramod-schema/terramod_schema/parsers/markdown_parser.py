"""Parser for Terraform provider Markdown documentation."""

import logging
import re
from pathlib import Path
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


class MarkdownParser:
    """Parser for extracting information from Terraform provider Markdown docs."""

    @staticmethod
    def extract_block_references(markdown_content: str) -> Dict[str, str]:
        """
        Extract block names and their internal documentation links.

        Args:
            markdown_content: Markdown content

        Returns:
            Dictionary mapping block names to section anchor IDs
            Example: {"ebs_block_device": "#ebs-ephemeral-and-root-block-devices"}
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

        # Pattern: * `block_name` - ... See [text](#section-id) ... or [...](#section-id)
        # Matches internal links like [Block Devices](#ebs-ephemeral-and-root-block-devices)
        attr_pattern = r'\*\s*`([^`]+)`\s*-\s*(.*?)(?=\n\*\s*`|\n\n|\Z)'

        for match in re.finditer(attr_pattern, arg_ref_section, re.DOTALL):
            attr_name = match.group(1).strip()
            attr_desc = match.group(2).strip()

            # Look for internal links in the description
            link_pattern = r'\[([^\]]+)\]\(#([^)]+)\)'
            link_match = re.search(link_pattern, attr_desc)

            if link_match:
                section_anchor = link_match.group(2)
                result[attr_name] = f"#{section_anchor}"
                logger.debug(f"Found link for '{attr_name}': #{section_anchor}")

        logger.debug(f"Extracted {len(result)} block references with internal links")
        return result

    @staticmethod
    def extract_section_by_anchor(markdown_content: str, anchor: str) -> str:
        """
        Extract section content by its anchor ID.

        Args:
            markdown_content: Markdown content
            anchor: Section anchor (e.g., "#ebs-ephemeral-and-root-block-devices")

        Returns:
            Section content (without the heading)
        """
        # Remove leading # if present
        anchor_id = anchor.lstrip('#')

        # Try to find section by various heading levels (###, ####, etc.)
        # The anchor is generated from the heading text by:
        # - Converting to lowercase
        # - Replacing spaces with hyphens
        # - Removing special characters

        # Find all headings with level 3 or 4
        heading_pattern = r'^(#{3,4})\s+(.+?)$'

        lines = markdown_content.split('\n')
        section_start = None
        section_level = None

        for i, line in enumerate(lines):
            match = re.match(heading_pattern, line)
            if match:
                heading_level = len(match.group(1))
                heading_text = match.group(2).strip()

                # Generate anchor from heading text
                generated_anchor = heading_text.lower()
                generated_anchor = re.sub(r'[^\w\s-]', '', generated_anchor)
                generated_anchor = re.sub(r'[-\s]+', '-', generated_anchor)

                if generated_anchor == anchor_id:
                    section_start = i + 1
                    section_level = heading_level
                    break

        if section_start is None:
            logger.warning(f"Section with anchor '{anchor}' not found")
            return ""

        # Extract content until next heading of same or higher level
        section_lines = []
        for i in range(section_start, len(lines)):
            line = lines[i]

            # Check if we hit another heading
            match = re.match(heading_pattern, line)
            if match:
                next_level = len(match.group(1))
                if next_level <= section_level:
                    break

            section_lines.append(line)

        section_content = '\n'.join(section_lines)
        logger.debug(f"Extracted section for anchor '{anchor}': {len(section_content)} chars")
        return section_content

    @staticmethod
    def extract_block_attributes_from_section(
        section_content: str, block_name: str
    ) -> Dict[str, Dict[str, Any]]:
        """
        Extract attributes for a specific block within a section.

        Args:
            section_content: Content of a documentation section
            block_name: Name of the block (e.g., "ebs_block_device")

        Returns:
            Dictionary mapping attribute names to their metadata
        """
        result = {}

        # Find the sub-section for this specific block
        # Patterns like:
        # - "The `ebs_block_device` block supports the following:"
        # - "Each `ebs_block_device` block supports the following:"
        # - "`ebs_block_device` supports:"

        block_pattern = rf"(?:The|Each)\s+`{re.escape(block_name)}`\s+block\s+supports.*?:\s*\n(.*?)(?=\n(?:The|Each)\s+`[^`]+`\s+block\s+supports|\n###|\n##|\Z)"

        match = re.search(block_pattern, section_content, re.DOTALL | re.IGNORECASE)

        if not match:
            logger.debug(f"No sub-section found for block '{block_name}' in section")
            return result

        block_section = match.group(1)

        # Extract attributes from this sub-section
        attr_pattern = r"\*\s*`([^`]+)`\s*[-–—]\s*(.+?)(?=\n\*\s*`|\n\n|\Z)"

        for attr_match in re.finditer(attr_pattern, block_section, re.DOTALL):
            attr_name = attr_match.group(1).strip()
            attr_desc = attr_match.group(2).strip()

            # Extract default value and possible values
            default_value = MarkdownParser._extract_default_value(attr_desc)
            possible_values = MarkdownParser._extract_possible_values(attr_desc)

            # Check if required/optional
            is_required = bool(re.search(r"\(required\)", attr_desc, re.IGNORECASE))
            is_optional = bool(re.search(r"\(optional\)", attr_desc, re.IGNORECASE))

            result[attr_name] = {
                "description": attr_desc,
                "default_value": default_value,
                "possible_values": possible_values,
                "required": is_required,
                "optional": is_optional,
            }

        logger.debug(f"Extracted {len(result)} attributes for block '{block_name}'")
        return result

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
        # Additional patterns for common variations:
        # - "Each value may be one of: X, Y, Z"
        # - "may be one of: X, Y, Z"
        # - "can be one of: X, Y, Z"
        # - "accepts: X, Y, Z"
        # - "Valid values include X, Y, Z"
        patterns = [
            r"[Vv]alid\s+values?\s+(?:are|is|include)[\s:]+(.+?)(?:[.!]|\n|$)",
            r"[Pp]ossible\s+values?[\s:]+(.+?)(?:[.!]|\n|$)",
            r"[Mm]ust\s+be\s+one\s+of[\s:]+(.+?)(?:[.!]|\n|$)",
            r"[Mm]ay\s+be\s+one\s+of[\s:]+(.+?)(?:[.!]|\n|$)",
            r"[Cc]an\s+be\s+one\s+of[\s:]+(.+?)(?:[.!]|\n|$)",
            r"[Oo]ne\s+of[\s:]+(.+?)(?:[.!]|\n|$)",
            r"[Aa]ccepts?[\s:]+(.+?)(?:[.!]|\n|$)",
            r"[Aa]llowed\s+values?[\s:]+(.+?)(?:[.!]|\n|$)",
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

                # Only use the first matching pattern to avoid duplicates
                break

        # Remove duplicates while preserving order
        seen = set()
        unique_values = []
        for value in possible_values:
            if value not in seen:
                seen.add(value)
                unique_values.append(value)

        return unique_values

    @staticmethod
    def extract_all_attributes(markdown_content: str) -> Dict[str, Dict[str, Any]]:
        """
        Extract all attribute definitions from the entire Markdown document.

        This extracts attributes from all sections, not just "Argument Reference".
        Useful for finding nested block attributes that are documented in separate sections.

        Args:
            markdown_content: Markdown content

        Returns:
            Dictionary mapping attribute names to their metadata
        """
        result = {}

        # Pattern: * `attribute_name` - description
        # This will match attributes in any section of the document
        attr_pattern = r"\*\s*`([^`]+)`\s*[-–—]\s*(.+?)(?=\n\*\s*`|\n\n|\Z)"

        for match in re.finditer(attr_pattern, markdown_content, re.DOTALL):
            attr_name = match.group(1).strip()
            attr_desc = match.group(2).strip()

            # Skip if attribute name contains dots (e.g., "aws_instance.ami")
            # These are references, not actual attribute definitions
            if '.' in attr_name:
                continue

            # Extract default value and possible values
            default_value = MarkdownParser._extract_default_value(attr_desc)
            possible_values = MarkdownParser._extract_possible_values(attr_desc)

            # Check if required/optional
            is_required = bool(re.search(r"\(required\)", attr_desc, re.IGNORECASE))
            is_optional = bool(re.search(r"\(optional\)", attr_desc, re.IGNORECASE))

            # Store the attribute (if we find it multiple times, keep the most detailed)
            if attr_name not in result or len(attr_desc) > len(result[attr_name].get("description", "")):
                result[attr_name] = {
                    "description": attr_desc,
                    "default_value": default_value,
                    "possible_values": possible_values,
                    "required": is_required,
                    "optional": is_optional,
                }

        logger.debug(f"Extracted {len(result)} attributes from entire document")
        return result

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

        # Extract block references (internal links)
        block_refs = cls.extract_block_references(content)

        # Extract block-specific attributes using internal links
        block_attributes = {}
        for block_name, anchor in block_refs.items():
            section_content = cls.extract_section_by_anchor(content, anchor)
            if section_content:
                attrs = cls.extract_block_attributes_from_section(section_content, block_name)
                if attrs:
                    block_attributes[block_name] = attrs

        return {
            "arguments": cls.extract_argument_reference(content),
            "attributes": cls.extract_attributes_reference(content),
            "all_attributes": cls.extract_all_attributes(content),
            "block_references": block_refs,
            "block_attributes": block_attributes,
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
