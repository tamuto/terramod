"""Command-line interface for terramod-schema tool."""

import logging
import sys
from pathlib import Path

import click

from .config import Config
from .generators.yaml_generator import YAMLGenerator
from .parsers.json_parser import JSONSchemaParser
from .parsers.markdown_parser import MarkdownParser
from .registry_client import RegistryAPIClient
from .utils import find_terraform_lock_file, parse_terraform_lock_file


def setup_logging(level: str) -> None:
    """
    Set up logging configuration.

    Args:
        level: Log level (DEBUG, INFO, WARNING, ERROR)
    """
    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )


@click.group()
@click.option(
    "--env-file",
    type=click.Path(exists=True, path_type=Path),
    help="Path to .env file",
)
@click.option(
    "--log-level",
    type=click.Choice(["DEBUG", "INFO", "WARNING", "ERROR"], case_sensitive=False),
    help="Logging level",
)
@click.pass_context
def main(ctx, env_file, log_level):
    """Terraform schema to multi-language YAML converter."""
    # Initialize config
    config = Config(env_file=env_file)

    # Set up logging
    if log_level:
        setup_logging(log_level)
    else:
        setup_logging(config.log_level)

    # Ensure directories exist
    config.ensure_directories()

    # Store config in context
    ctx.ensure_object(dict)
    ctx.obj["config"] = config


@main.command()
@click.pass_context
def download_docs(ctx):
    """Download provider documentation from Terraform Registry."""
    config: Config = ctx.obj["config"]
    logger = logging.getLogger(__name__)

    logger.info("Starting documentation download...")

    # Parse providers.json to get provider list
    try:
        provider_schemas = JSONSchemaParser.parse_file(config.providers_json_path)
    except FileNotFoundError:
        logger.error(f"providers.json not found at {config.providers_json_path}")
        logger.error("Run 'terraform providers schema -json > providers.json' first")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Failed to parse providers.json: {e}")
        sys.exit(1)

    # Try to get version information from .terraform.lock.hcl
    lock_file = find_terraform_lock_file(config.project_root)
    provider_versions = {}
    if lock_file:
        logger.info(f"Found .terraform.lock.hcl at {lock_file}")
        provider_versions = parse_terraform_lock_file(lock_file)
        logger.info(f"Extracted versions for {len(provider_versions)} providers")
    else:
        logger.warning("No .terraform.lock.hcl found, will use latest versions")

    # Download documentation for each provider
    client = RegistryAPIClient(config.terraform_registry_api_url)

    for provider_schema in provider_schemas:
        provider_info = provider_schema.provider_info

        # Set version from lock file if available
        if provider_info.name in provider_versions:
            provider_info.version = provider_versions[provider_info.name]
            logger.info(f"Using version {provider_info.version} from .terraform.lock.hcl")

        try:
            logger.info(f"Downloading docs for {provider_info.name}...")
            client.download_and_save_docs(provider_info, config.docs_output_dir)
        except Exception as e:
            logger.error(f"Failed to download docs for {provider_info.name}: {e}")
            logger.exception(e)
            continue

    logger.info("Documentation download completed!")


@main.command()
@click.option(
    "--no-diff",
    is_flag=True,
    help="Disable differential update (overwrite existing files)",
)
@click.option(
    "--with-markdown",
    is_flag=True,
    help="Enrich schema with information from Markdown documentation",
)
@click.pass_context
def generate(ctx, no_diff, with_markdown):
    """Generate YAML schema files from providers.json."""
    config: Config = ctx.obj["config"]
    logger = logging.getLogger(__name__)

    logger.info("Starting YAML generation...")

    # Get list of provider names without parsing full schemas (memory efficient)
    try:
        provider_names = JSONSchemaParser.get_provider_names(config.providers_json_path)
        logger.info(f"Found {len(provider_names)} providers to process")
    except FileNotFoundError:
        logger.error(f"providers.json not found at {config.providers_json_path}")
        logger.error("Run 'terraform providers schema -json > providers.json' first")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Failed to read providers.json: {e}")
        sys.exit(1)

    # Process each provider individually (memory efficient)
    generator = YAMLGenerator()
    differential = not no_diff
    generated_files = []

    for provider_full_name in provider_names:
        logger.info(f"Processing {provider_full_name}...")

        # Parse single provider
        try:
            provider_schema = JSONSchemaParser.parse_single_provider(
                config.providers_json_path, provider_full_name
            )
            if not provider_schema:
                logger.warning(f"Skipping {provider_full_name}")
                continue
        except Exception as e:
            logger.error(f"Failed to parse {provider_full_name}: {e}")
            logger.exception(e)
            continue

        # Enrich with Markdown if requested
        if with_markdown:
            provider_name = provider_schema.provider_info.name
            markdown_dir = config.docs_output_dir / provider_name

            if markdown_dir.exists():
                logger.info(f"Enriching {provider_name} with Markdown documentation...")
                try:
                    provider_schema.enrich_with_markdown(markdown_dir, logger)
                except Exception as e:
                    logger.error(f"Failed to enrich {provider_name} with Markdown: {e}")
                    logger.exception(e)
            else:
                logger.warning(
                    f"Markdown directory not found for {provider_name}, skipping enrichment"
                )

        # Generate YAML file for this provider
        try:
            output_file = generator.generate_yaml(
                provider_schema, config.yaml_output_dir, differential=differential
            )
            generated_files.append(output_file)
        except Exception as e:
            logger.error(f"Failed to generate YAML for {provider_schema.provider_info.name}: {e}")
            logger.exception(e)
            continue

    logger.info(f"Generated {len(generated_files)} YAML files:")
    for file_path in generated_files:
        logger.info(f"  - {file_path}")

    logger.info("YAML generation completed!")


@main.command()
@click.pass_context
def full_process(ctx):
    """Run the full process: download docs and generate YAML."""
    logger = logging.getLogger(__name__)

    logger.info("Starting full process...")

    # Download docs
    ctx.invoke(download_docs)

    # Generate YAML with Markdown enrichment
    ctx.invoke(generate, with_markdown=True, no_diff=False)

    logger.info("Full process completed!")


@main.command()
@click.pass_context
def info(ctx):
    """Display configuration information."""
    config: Config = ctx.obj["config"]

    click.echo("Terramod Schema Configuration:")
    click.echo(f"  Project Root: {config.project_root}")
    click.echo(f"  Providers JSON: {config.providers_json_path}")
    click.echo(f"  Docs Output Dir: {config.docs_output_dir}")
    click.echo(f"  YAML Output Dir: {config.yaml_output_dir}")
    click.echo(f"  Registry API URL: {config.terraform_registry_api_url}")
    click.echo(f"  Log Level: {config.log_level}")


if __name__ == "__main__":
    main()
