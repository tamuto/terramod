"""Utility functions for terramod-schema."""

import re
from pathlib import Path
from typing import Dict, Optional


def parse_terraform_lock_file(lock_file_path: Path) -> Dict[str, str]:
    """
    Parse .terraform.lock.hcl file to extract provider versions.

    Args:
        lock_file_path: Path to .terraform.lock.hcl file

    Returns:
        Dictionary mapping provider names to versions
        Example: {"aws": "6.19.0", "google": "7.9.0"}
    """
    if not lock_file_path.exists():
        return {}

    content = lock_file_path.read_text(encoding="utf-8")
    provider_versions = {}

    # Pattern to match provider blocks and their versions
    # Example: provider "registry.terraform.io/hashicorp/aws" {
    #            version = "6.19.0"
    provider_pattern = r'provider\s+"registry\.terraform\.io/[\w-]+/([\w-]+)"\s+\{[^}]*?version\s+=\s+"([^"]+)"'

    for match in re.finditer(provider_pattern, content, re.DOTALL):
        provider_name = match.group(1)
        version = match.group(2)
        provider_versions[provider_name] = version

    return provider_versions


def find_terraform_lock_file(start_dir: Path) -> Optional[Path]:
    """
    Find .terraform.lock.hcl file by searching up from start directory.

    Args:
        start_dir: Directory to start search from

    Returns:
        Path to .terraform.lock.hcl if found, None otherwise
    """
    current = start_dir.resolve()

    while current != current.parent:
        lock_file = current / ".terraform.lock.hcl"
        if lock_file.exists():
            return lock_file

        # Also check etc/terraform subdirectory
        etc_lock = current / "etc" / "terraform" / ".terraform.lock.hcl"
        if etc_lock.exists():
            return etc_lock

        current = current.parent

    return None
