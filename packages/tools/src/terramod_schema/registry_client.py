"""Terraform Registry API client for downloading provider documentation."""

import logging
import time
from pathlib import Path
from typing import Dict, List, Optional

import requests

from .models.schema import ProviderInfo

logger = logging.getLogger(__name__)


class RegistryAPIClient:
    """Client for interacting with Terraform Registry API."""

    def __init__(
        self,
        base_url: str = "https://registry.terraform.io",
        request_delay: float = 0.1,
        page_delay: float = 0.5,
    ):
        """
        Initialize the Registry API client.

        Args:
            base_url: Base URL for Terraform Registry API
            request_delay: Delay between individual document requests (seconds)
            page_delay: Delay between page requests (seconds)
        """
        self.base_url = base_url.rstrip("/")
        self.request_delay = request_delay
        self.page_delay = page_delay
        self.session = requests.Session()
        self.session.headers.update(
            {
                "User-Agent": "terramod-schema/0.1.0",
                "Accept": "application/json",
            }
        )

    def get_provider_version_id(
        self, namespace: str, name: str, version: str
    ) -> Optional[str]:
        """
        Get provider version ID from version string.

        Args:
            namespace: Provider namespace (e.g., 'hashicorp')
            name: Provider name (e.g., 'aws')
            version: Version string (e.g., '6.19.0')

        Returns:
            Provider version ID string, or None if not found

        Raises:
            requests.RequestException: If API request fails
        """
        url = f"{self.base_url}/v2/providers/{namespace}/{name}/provider-versions"
        response = self.session.get(url)
        response.raise_for_status()

        data = response.json()
        for pv in data.get("data", []):
            if pv.get("attributes", {}).get("version") == version:
                return pv.get("id")

        return None

    def get_latest_version(self, namespace: str, name: str) -> str:
        """
        Get latest provider version.

        Args:
            namespace: Provider namespace
            name: Provider name

        Returns:
            Latest version string

        Raises:
            requests.RequestException: If API request fails
        """
        url = f"{self.base_url}/v2/providers/{namespace}/{name}/provider-versions"
        response = self.session.get(url)
        response.raise_for_status()

        data = response.json()
        versions = [pv.get("attributes", {}).get("version") for pv in data.get("data", [])]

        # Sort versions and return latest
        if versions:
            # Simple string sort (may need semantic versioning for production)
            return sorted(versions, reverse=True)[0]

        return ""

    def get_provider_docs_list(
        self, provider_version_id: str, category: Optional[str] = None, page_size: int = 100
    ) -> List[Dict]:
        """
        Get list of provider documentation entries.

        Args:
            provider_version_id: Provider version ID
            category: Optional category filter (provider, resources, data-sources, guides, etc.)
            page_size: Number of results per page

        Returns:
            List of document metadata

        Raises:
            requests.RequestException: If API request fails
        """
        all_docs = []
        page = 1

        while True:
            url = f"{self.base_url}/v2/provider-docs"
            params = {
                "filter[provider-version]": provider_version_id,
                "page[size]": page_size,
                "page[number]": page,
            }

            if category:
                params["filter[category]"] = category

            response = self.session.get(url, params=params)
            response.raise_for_status()

            data = response.json()
            docs = data.get("data", [])

            if not docs:
                break

            all_docs.extend(docs)

            logger.debug(f"Retrieved page {page} with {len(docs)} documents")

            # Check if there are more pages
            # If we got fewer docs than page_size, we've reached the end
            if len(docs) < page_size:
                break

            # Also check meta if available
            meta = data.get("meta", {})
            if meta and "pagination" in meta:
                total_pages = meta["pagination"].get("total-pages", 0)
                if total_pages > 0 and page >= total_pages:
                    break

            page += 1

            # Rate limiting: wait before next page request
            if page > 1:  # Don't wait after the first page
                time.sleep(self.page_delay)

        return all_docs

    def get_document_content(self, doc_id: str) -> str:
        """
        Get content of a specific document.

        Args:
            doc_id: Document ID

        Returns:
            Document content (Markdown)

        Raises:
            requests.RequestException: If API request fails
        """
        url = f"{self.base_url}/v2/provider-docs/{doc_id}"
        response = self.session.get(url)
        response.raise_for_status()

        data = response.json()

        # Rate limiting: wait before next request
        time.sleep(self.request_delay)

        return data.get("data", {}).get("attributes", {}).get("content", "")

    def download_and_save_docs(
        self, provider_info: ProviderInfo, output_dir: Path
    ) -> None:
        """
        Download and save provider documentation to disk.

        Args:
            provider_info: Provider information (must include version)
            output_dir: Directory to save documentation

        Raises:
            requests.RequestException: If API request fails
        """
        # Get provider version from .terraform.lock.hcl if not set
        if not provider_info.version:
            provider_info.version = self.get_latest_version(
                provider_info.namespace, provider_info.name
            )
            logger.info(f"Using latest version: {provider_info.version}")

        logger.info(
            f"Fetching documentation for {provider_info.name} v{provider_info.version}"
        )

        # Get provider version ID
        provider_version_id = self.get_provider_version_id(
            provider_info.namespace, provider_info.name, provider_info.version
        )

        if not provider_version_id:
            logger.error(
                f"Provider version {provider_info.version} not found for {provider_info.name}"
            )
            return

        logger.info(f"Provider version ID: {provider_version_id}")

        # Create provider-specific directory
        provider_dir = output_dir / provider_info.name
        provider_dir.mkdir(parents=True, exist_ok=True)

        # Download all documentation (category filter doesn't work reliably)
        logger.info("Downloading all documentation...")
        all_docs = self.get_provider_docs_list(provider_version_id)
        logger.info(f"Found {len(all_docs)} total documents")

        # Categorize documents
        categorized = {
            "provider": [],
            "resources": [],
            "data-sources": [],
            "guides": [],
            "actions": [],
            "other": []
        }

        for doc in all_docs:
            category = doc.get("attributes", {}).get("category", "other")
            if category in categorized:
                categorized[category].append(doc)
            else:
                categorized["other"].append(doc)

        # Save provider configuration docs
        if categorized["provider"]:
            logger.info(f"Downloading {len(categorized['provider'])} provider docs...")
            for idx, doc_meta in enumerate(categorized["provider"], 1):
                doc_id = doc_meta.get("id")
                slug = doc_meta.get("attributes", {}).get("slug", "provider")
                content = self.get_document_content(doc_id)

                provider_file = provider_dir / f"{slug}.md"
                provider_file.write_text(content, encoding="utf-8")

                if idx % 10 == 0:
                    logger.debug(f"  Progress: {idx}/{len(categorized['provider'])}")

            logger.info(f"Saved {len(categorized['provider'])} provider docs")

        # Save resource docs
        if categorized["resources"]:
            logger.info(f"Downloading {len(categorized['resources'])} resource docs...")
            resources_dir = provider_dir / "resources"
            resources_dir.mkdir(exist_ok=True)

            for idx, doc_meta in enumerate(categorized["resources"], 1):
                doc_id = doc_meta.get("id")
                slug = doc_meta.get("attributes", {}).get("slug")
                content = self.get_document_content(doc_id)

                # Note: slug does not include provider prefix (e.g., "instance" not "aws_instance")
                # Add prefix for filename
                resource_file = resources_dir / f"{provider_info.name}_{slug}.md"
                resource_file.write_text(content, encoding="utf-8")

                if idx % 100 == 0:
                    logger.info(f"  Progress: {idx}/{len(categorized['resources'])}")

            logger.info(f"Saved {len(categorized['resources'])} resource docs")

        # Save data source docs
        if categorized["data-sources"]:
            logger.info(f"Downloading {len(categorized['data-sources'])} data source docs...")
            data_sources_dir = provider_dir / "data_sources"
            data_sources_dir.mkdir(exist_ok=True)

            for idx, doc_meta in enumerate(categorized["data-sources"], 1):
                doc_id = doc_meta.get("id")
                slug = doc_meta.get("attributes", {}).get("slug")
                content = self.get_document_content(doc_id)

                # Add provider prefix for filename
                ds_file = data_sources_dir / f"{provider_info.name}_{slug}.md"
                ds_file.write_text(content, encoding="utf-8")

                if idx % 50 == 0:
                    logger.info(f"  Progress: {idx}/{len(categorized['data-sources'])}")

            logger.info(f"Saved {len(categorized['data-sources'])} data source docs")

        # Save other categories (guides, actions, etc.)
        for category, docs in categorized.items():
            if category in ["provider", "resources", "data-sources"] or not docs:
                continue

            logger.info(f"Downloading {len(docs)} {category} docs...")
            category_dir = provider_dir / category
            category_dir.mkdir(exist_ok=True)

            for idx, doc_meta in enumerate(docs, 1):
                doc_id = doc_meta.get("id")
                slug = doc_meta.get("attributes", {}).get("slug")
                content = self.get_document_content(doc_id)

                doc_file = category_dir / f"{slug}.md"
                doc_file.write_text(content, encoding="utf-8")

                if idx % 10 == 0:
                    logger.debug(f"  Progress: {idx}/{len(docs)}")

            logger.info(f"Saved {len(docs)} {category} docs")

        logger.info(
            f"All documentation for {provider_info.name} saved to {provider_dir}"
        )
