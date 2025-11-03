"""Parsers for Terraform schema and documentation."""

from .json_parser import JSONSchemaParser
from .markdown_parser import MarkdownParser

__all__ = ["JSONSchemaParser", "MarkdownParser"]
