"""Tests for application settings and configuration."""

from app.core.settings import get_settings


def test_settings_defaults():
    """Verify default application settings are properly loaded."""
    settings = get_settings()
    assert settings.app_name == "KaushalSetu"
    assert settings.llm_provider in ("google", "anthropic", "openai")
    assert settings.run_token_budget > 0
    assert 0.0 <= settings.auto_accept <= 1.0
    assert 0.0 <= settings.review_min <= 1.0
