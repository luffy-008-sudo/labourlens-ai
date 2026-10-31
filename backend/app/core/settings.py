"""KaushalSetu core settings — loads from .env and config YAML files."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Literal

import yaml
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# Paths
ROOT_DIR = Path(__file__).resolve().parents[3]  # kaushalsetu/
CONFIG_DIR = ROOT_DIR / "config"
DATA_DIR = ROOT_DIR / "data"


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=str(ROOT_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # --- App Info ---
    app_name: str = "KaushalSetu"

    # --- Database ---
    database_url: str = "postgresql+psycopg://ks:ks@db:5432/kaushalsetu"

    # --- API Keys ---
    ogd_api_key: str = ""
    ndap_api_key: str = ""
    google_maps_api_key: str = ""

    # --- LLM ---
    llm_provider: Literal["google", "anthropic", "openai"] = "google"
    llm_fast_model: str = ""
    llm_strong_model: str = ""
    google_api_key: str = ""
    anthropic_api_key: str = ""
    openai_api_key: str = ""

    # --- Embeddings ---
    embeddings_provider: Literal["local", "provider"] = "local"
    embeddings_model: str = "BAAI/bge-m3"

    # --- Observability ---
    langfuse_host: str = ""
    langfuse_public_key: str = ""
    langfuse_secret_key: str = ""

    # --- Mode ---
    demo_mode: bool = False

    # --- Budget ---
    run_token_budget: int = 400000
    coverage_stale_days: int = 14

    # --- Confidence ---
    auto_accept: float = 0.75
    review_min: float = 0.45

    # --- Security ---
    admin_password: str = ""
    secret_key: str = "change-me-in-production"
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:3000"])

    # --- Server ---
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    log_level: str = "INFO"


@lru_cache
def get_settings() -> Settings:
    """Singleton settings instance."""
    return Settings()


def load_yaml_config(filename: str) -> dict:
    """Load a YAML config file from the config directory."""
    path = CONFIG_DIR / filename
    if not path.exists():
        raise FileNotFoundError(f"Config file not found: {path}")
    with open(path) as f:
        return yaml.safe_load(f)


@lru_cache
def get_coverage_config() -> dict:
    return load_yaml_config("coverage.yaml")


@lru_cache
def get_clusters_config() -> dict:
    return load_yaml_config("clusters.yaml")


@lru_cache
def get_scoring_config() -> dict:
    return load_yaml_config("scoring.yaml")


@lru_cache
def get_sources_config() -> dict:
    return load_yaml_config("sources.yaml")
