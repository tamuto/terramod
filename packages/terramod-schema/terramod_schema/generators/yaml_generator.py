"""YAML generator with differential update support."""

import logging
from pathlib import Path
from typing import Any, Dict, Optional

import yaml

from ..models.schema import ProviderSchema

logger = logging.getLogger(__name__)


class YAMLGenerator:
    """Generator for multi-language YAML schema files with differential updates."""

    def __init__(self):
        """Initialize YAML generator."""
        # Configure YAML to preserve order and format nicely
        self.yaml_dumper = yaml.SafeDumper
        self.yaml_dumper.add_representer(
            type(None),
            lambda dumper, value: dumper.represent_scalar("tag:yaml.org,2002:null", ""),
        )

    def _merge_localized_descriptions(
        self, existing: Dict[str, str], new: Dict[str, str]
    ) -> Dict[str, str]:
        """
        Merge localized descriptions, preserving existing translations.

        Args:
            existing: Existing description dict
            new: New description dict

        Returns:
            Merged description dict
        """
        result = existing.copy() if existing else {}

        # Update en_us if changed
        if new.get("en_us") and new["en_us"] != existing.get("en_us"):
            result["en_us"] = new["en_us"]
            # Clear non-English translations as they may be outdated
            for lang in list(result.keys()):
                if lang != "en_us" and result[lang]:
                    # Keep existing translation but mark it may need update
                    pass  # Keep as-is, user will update via LLM

        # Preserve existing translations
        for lang, text in existing.items():
            if lang not in result and text:
                result[lang] = text

        # Add new language keys if they don't exist
        for lang in ["en_us", "ja_jp"]:
            if lang not in result:
                result[lang] = new.get(lang, "")

        return result

    def _merge_attribute(
        self, existing: Dict[str, Any], new: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Merge attribute data, preserving translations and manual edits.

        Args:
            existing: Existing attribute data
            new: New attribute data

        Returns:
            Merged attribute data
        """
        result = new.copy()

        # Merge descriptions
        if "description" in existing:
            result["description"] = self._merge_localized_descriptions(
                existing.get("description", {}), new.get("description", {})
            )

        return result

    def _merge_schema_dict(
        self, existing: Dict[str, Any], new: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Recursively merge schema dictionaries.

        Args:
            existing: Existing schema dict
            new: New schema dict

        Returns:
            Merged schema dict
        """
        result = new.copy()

        # Merge attributes
        if "attributes" in new:
            existing_attrs = existing.get("attributes", {})
            new_attrs = new.get("attributes", {})
            merged_attrs = {}

            for attr_name, attr_data in new_attrs.items():
                if attr_name in existing_attrs:
                    merged_attrs[attr_name] = self._merge_attribute(
                        existing_attrs[attr_name], attr_data
                    )
                else:
                    merged_attrs[attr_name] = attr_data

            result["attributes"] = merged_attrs

        # Merge block_types recursively
        if "block_types" in new:
            existing_blocks = existing.get("block_types", {})
            new_blocks = new.get("block_types", {})
            merged_blocks = {}

            for block_name, block_data in new_blocks.items():
                if block_name in existing_blocks:
                    merged_blocks[block_name] = self._merge_schema_dict(
                        existing_blocks[block_name], block_data
                    )
                else:
                    merged_blocks[block_name] = block_data

            result["block_types"] = merged_blocks

        # Merge description at this level
        if "description" in new and "description" in existing:
            result["description"] = self._merge_localized_descriptions(
                existing.get("description", {}), new.get("description", {})
            )

        return result

    def load_existing_yaml(self, file_path: Path) -> Optional[Dict[str, Any]]:
        """
        Load existing YAML file.

        Args:
            file_path: Path to YAML file

        Returns:
            Parsed YAML data or None if file doesn't exist
        """
        if not file_path.exists():
            return None

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return yaml.safe_load(f)
        except Exception as e:
            logger.warning(f"Failed to load existing YAML {file_path}: {e}")
            return None

    def generate_yaml(
        self,
        provider_schema: ProviderSchema,
        output_dir: Path,
        differential: bool = True,
    ) -> Path:
        """
        Generate YAML file for a provider schema.

        Args:
            provider_schema: Provider schema to convert
            output_dir: Output directory for YAML files
            differential: If True, merge with existing YAML to preserve translations

        Returns:
            Path to generated YAML file
        """
        output_dir.mkdir(parents=True, exist_ok=True)

        provider_name = provider_schema.provider_info.name
        output_file = output_dir / f"{provider_name}.yaml"

        # Convert schema to dict
        new_data = provider_schema.to_dict()

        # Load existing YAML if differential mode
        if differential:
            existing_data = self.load_existing_yaml(output_file)
            if existing_data:
                logger.info(f"Merging with existing YAML for {provider_name}")

                # Merge provider config
                if "provider_config" in new_data and "provider_config" in existing_data:
                    new_data["provider_config"] = self._merge_schema_dict(
                        existing_data["provider_config"], new_data["provider_config"]
                    )

                # Merge resources
                if "resources" in new_data:
                    existing_resources = existing_data.get("resources", {})
                    for res_name, res_data in new_data["resources"].items():
                        if res_name in existing_resources:
                            new_data["resources"][res_name] = self._merge_schema_dict(
                                existing_resources[res_name], res_data
                            )

                # Merge data sources
                if "data_sources" in new_data:
                    existing_ds = existing_data.get("data_sources", {})
                    for ds_name, ds_data in new_data["data_sources"].items():
                        if ds_name in existing_ds:
                            new_data["data_sources"][ds_name] = self._merge_schema_dict(
                                existing_ds[ds_name], ds_data
                            )

                # Merge ephemeral resources
                if "ephemeral_resources" in new_data:
                    existing_er = existing_data.get("ephemeral_resources", {})
                    for er_name, er_data in new_data["ephemeral_resources"].items():
                        if er_name in existing_er:
                            new_data["ephemeral_resources"][
                                er_name
                            ] = self._merge_schema_dict(existing_er[er_name], er_data)

        # Write YAML file
        with open(output_file, "w", encoding="utf-8") as f:
            yaml.dump(
                new_data,
                f,
                Dumper=self.yaml_dumper,
                default_flow_style=False,
                allow_unicode=True,
                sort_keys=False,
                width=120,
            )

        logger.info(f"Generated YAML for {provider_name} at {output_file}")
        return output_file

    def generate_yaml_split(
        self,
        provider_schema: ProviderSchema,
        output_dir: Path,
        differential: bool = True,
    ) -> list[Path]:
        """
        Generate split YAML files (one per resource/data_source).

        Directory structure:
        output/
          {provider}/
            provider.yaml
            resources/
              {resource_name}.yaml
            data_sources/
              {data_source_name}.yaml
            ephemeral_resources/
              {ephemeral_resource_name}.yaml

        Args:
            provider_schema: Provider schema to convert
            output_dir: Output directory for YAML files
            differential: If True, merge with existing YAML to preserve translations

        Returns:
            List of generated file paths
        """
        provider_name = provider_schema.provider_info.name
        provider_dir = output_dir / provider_name
        generated_files = []

        # Create provider directory
        provider_dir.mkdir(parents=True, exist_ok=True)

        # Generate provider config file
        if provider_schema.provider_config:
            provider_file = provider_dir / "provider.yaml"
            provider_data = {
                "provider_info": provider_schema.provider_info.model_dump(exclude_none=True),
                "provider_config": provider_schema.provider_config.model_dump(exclude_none=True),
            }

            # Differential merge for provider config
            if differential:
                existing_data = self.load_existing_yaml(provider_file)
                if existing_data and "provider_config" in existing_data:
                    provider_data["provider_config"] = self._merge_schema_dict(
                        existing_data["provider_config"], provider_data["provider_config"]
                    )

            with open(provider_file, "w", encoding="utf-8") as f:
                yaml.dump(
                    provider_data,
                    f,
                    Dumper=self.yaml_dumper,
                    default_flow_style=False,
                    allow_unicode=True,
                    sort_keys=False,
                    width=120,
                )
            generated_files.append(provider_file)
            logger.info(f"Generated provider config: {provider_file}")

        # Generate resource files
        if provider_schema.resources:
            resources_dir = provider_dir / "resources"
            resources_dir.mkdir(exist_ok=True)

            for res_name, resource in provider_schema.resources.items():
                res_file = resources_dir / f"{res_name}.yaml"
                res_data = {
                    "provider_info": provider_schema.provider_info.model_dump(exclude_none=True),
                    "resource": resource.model_dump(exclude_none=True),
                }

                # Differential merge
                if differential:
                    existing_data = self.load_existing_yaml(res_file)
                    if existing_data and "resource" in existing_data:
                        res_data["resource"] = self._merge_schema_dict(
                            existing_data["resource"], res_data["resource"]
                        )

                with open(res_file, "w", encoding="utf-8") as f:
                    yaml.dump(
                        res_data,
                        f,
                        Dumper=self.yaml_dumper,
                        default_flow_style=False,
                        allow_unicode=True,
                        sort_keys=False,
                        width=120,
                    )
                generated_files.append(res_file)

            logger.info(f"Generated {len(provider_schema.resources)} resource files")

        # Generate data source files
        if provider_schema.data_sources:
            data_sources_dir = provider_dir / "data_sources"
            data_sources_dir.mkdir(exist_ok=True)

            for ds_name, data_source in provider_schema.data_sources.items():
                ds_file = data_sources_dir / f"{ds_name}.yaml"
                ds_data = {
                    "provider_info": provider_schema.provider_info.model_dump(exclude_none=True),
                    "data_source": data_source.model_dump(exclude_none=True),
                }

                # Differential merge
                if differential:
                    existing_data = self.load_existing_yaml(ds_file)
                    if existing_data and "data_source" in existing_data:
                        ds_data["data_source"] = self._merge_schema_dict(
                            existing_data["data_source"], ds_data["data_source"]
                        )

                with open(ds_file, "w", encoding="utf-8") as f:
                    yaml.dump(
                        ds_data,
                        f,
                        Dumper=self.yaml_dumper,
                        default_flow_style=False,
                        allow_unicode=True,
                        sort_keys=False,
                        width=120,
                    )
                generated_files.append(ds_file)

            logger.info(f"Generated {len(provider_schema.data_sources)} data source files")

        # Generate ephemeral resource files
        if provider_schema.ephemeral_resources:
            ephemeral_dir = provider_dir / "ephemeral_resources"
            ephemeral_dir.mkdir(exist_ok=True)

            for er_name, ephemeral in provider_schema.ephemeral_resources.items():
                er_file = ephemeral_dir / f"{er_name}.yaml"
                er_data = {
                    "provider_info": provider_schema.provider_info.model_dump(exclude_none=True),
                    "ephemeral_resource": ephemeral.model_dump(exclude_none=True),
                }

                # Differential merge
                if differential:
                    existing_data = self.load_existing_yaml(er_file)
                    if existing_data and "ephemeral_resource" in existing_data:
                        er_data["ephemeral_resource"] = self._merge_schema_dict(
                            existing_data["ephemeral_resource"], er_data["ephemeral_resource"]
                        )

                with open(er_file, "w", encoding="utf-8") as f:
                    yaml.dump(
                        er_data,
                        f,
                        Dumper=self.yaml_dumper,
                        default_flow_style=False,
                        allow_unicode=True,
                        sort_keys=False,
                        width=120,
                    )
                generated_files.append(er_file)

            logger.info(f"Generated {len(provider_schema.ephemeral_resources)} ephemeral resource files")

        logger.info(f"Generated {len(generated_files)} total files for {provider_name}")
        return generated_files

    def generate_all(
        self,
        provider_schemas: list[ProviderSchema],
        output_dir: Path,
        differential: bool = True,
    ) -> list[Path]:
        """
        Generate YAML files for all provider schemas.

        Args:
            provider_schemas: List of provider schemas
            output_dir: Output directory
            differential: If True, merge with existing files

        Returns:
            List of generated file paths
        """
        generated_files = []

        for provider_schema in provider_schemas:
            output_file = self.generate_yaml(provider_schema, output_dir, differential)
            generated_files.append(output_file)

        return generated_files
