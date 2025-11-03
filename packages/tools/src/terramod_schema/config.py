"""Configuration management for terramod schema tools."""

import os
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv


class Config:
    """Configuration class that loads settings from environment variables."""

    def __init__(self, env_file: Optional[Path] = None):
        """
        Initialize configuration.

        Args:
            env_file: Optional path to .env file. If not provided, searches for .env
                     in current directory and project root.
        """
        self._project_root = self._find_project_root()

        # Load .env file
        if env_file:
            load_dotenv(env_file)
        else:
            # Try to load .env from current directory, then project root
            for env_path in [Path.cwd() / ".env", self._project_root / ".env"]:
                if env_path.exists():
                    load_dotenv(env_path)
                    break

    @staticmethod
    def _find_project_root() -> Path:
        """
        Find the project root directory by looking for .git directory.

        Returns:
            Path to project root directory.
        """
        current = Path.cwd()

        # Search upwards for .git directory
        while current != current.parent:
            if (current / ".git").exists():
                return current
            current = current.parent

        # If not found, return current working directory
        return Path.cwd()

    @property
    def project_root(self) -> Path:
        """Get the project root directory."""
        return self._project_root

    def _resolve_path(self, path_str: str) -> Path:
        """
        Resolve a path relative to project root.

        Args:
            path_str: Path string (can be relative or absolute).

        Returns:
            Resolved absolute Path object.
        """
        path = Path(path_str)
        if path.is_absolute():
            return path
        return (self._project_root / path).resolve()

    @property
    def providers_json_path(self) -> Path:
        """Get the path to providers.json file."""
        path_str = os.getenv("PROVIDERS_JSON_PATH", "etc/providers/providers.json")
        return self._resolve_path(path_str)

    @property
    def docs_output_dir(self) -> Path:
        """Get the directory for downloaded provider documentation."""
        path_str = os.getenv("DOCS_OUTPUT_DIR", "etc/docs/providers")
        return self._resolve_path(path_str)

    @property
    def yaml_output_dir(self) -> Path:
        """Get the directory for generated YAML files."""
        path_str = os.getenv("YAML_OUTPUT_DIR", "packages/tools/output")
        return self._resolve_path(path_str)

    @property
    def terraform_registry_api_url(self) -> str:
        """Get the Terraform Registry API base URL."""
        return os.getenv("TERRAFORM_REGISTRY_API_URL", "https://registry.terraform.io")

    @property
    def log_level(self) -> str:
        """Get the logging level."""
        return os.getenv("LOG_LEVEL", "INFO")

    def ensure_directories(self) -> None:
        """Create necessary directories if they don't exist."""
        self.docs_output_dir.mkdir(parents=True, exist_ok=True)
        self.yaml_output_dir.mkdir(parents=True, exist_ok=True)
