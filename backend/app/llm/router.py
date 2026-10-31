"""LLM router — provider-agnostic model access with retries, budgeting, and caching."""

from __future__ import annotations

import hashlib
import json
from typing import Any, Literal

from langchain.chat_models import init_chat_model
from langchain_core.language_models import BaseChatModel

from app.core.logging import get_logger
from app.core.settings import get_settings

logger = get_logger("llm.router")

# Simple in-memory response cache
_response_cache: dict[str, Any] = {}


def _get_model_id(role: Literal["fast", "strong"]) -> str:
    """Resolve model ID from settings."""
    settings = get_settings()
    if role == "fast":
        return settings.llm_fast_model
    return settings.llm_strong_model


def _get_provider() -> str:
    """Get the configured LLM provider."""
    return get_settings().llm_provider


def get_llm(role: Literal["fast", "strong"], **kwargs: Any) -> BaseChatModel:
    """Get a configured LLM instance for the given role.

    Args:
        role: "fast" for query generation, triage, classification.
              "strong" for extraction, narratives, explanations, chat.
        **kwargs: Additional kwargs passed to init_chat_model.

    Returns:
        A BaseChatModel instance.
    """
    model_id = _get_model_id(role)
    provider = _get_provider()

    if not model_id:
        raise ValueError(
            f"No model configured for role '{role}'. Set LLM_{role.upper()}_MODEL in .env"
        )

    logger.info("Initialising LLM: provider=%s model=%s role=%s", provider, model_id, role)

    model = init_chat_model(
        model=model_id,
        model_provider=provider,
        temperature=kwargs.pop("temperature", 0.1 if role == "fast" else 0.3),
        **kwargs,
    )

    return model


def cache_key(prompt_version: str, input_data: Any) -> str:
    """Generate a cache key from prompt version and input hash."""
    input_str = json.dumps(input_data, sort_keys=True, default=str)
    input_hash = hashlib.sha256(input_str.encode()).hexdigest()[:16]
    return f"{prompt_version}:{input_hash}"


def get_cached_response(key: str) -> Any | None:
    """Get a cached LLM response."""
    return _response_cache.get(key)


def set_cached_response(key: str, response: Any) -> None:
    """Cache an LLM response."""
    _response_cache[key] = response


class TokenBudget:
    """Track token usage within a single agent run."""

    def __init__(self, max_tokens: int | None = None, max_tool_calls: int | None = None):
        settings = get_settings()
        self.max_tokens = max_tokens or settings.run_token_budget
        self.max_tool_calls = max_tool_calls or 50
        self.used_tokens = 0
        self.used_tool_calls = 0

    def record_tokens(self, input_tokens: int, output_tokens: int) -> None:
        self.used_tokens += input_tokens + output_tokens

    def record_tool_call(self) -> None:
        self.used_tool_calls += 1

    @property
    def exhausted(self) -> bool:
        return self.used_tokens >= self.max_tokens or self.used_tool_calls >= self.max_tool_calls

    def to_dict(self) -> dict:
        return {
            "max_tokens": self.max_tokens,
            "used_tokens": self.used_tokens,
            "max_tool_calls": self.max_tool_calls,
            "used_tool_calls": self.used_tool_calls,
        }
