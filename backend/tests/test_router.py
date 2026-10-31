"""Tests for LLM router, caching, and token budgeting."""

from app.llm.router import TokenBudget, cache_key, get_cached_response, set_cached_response


def test_token_budget():
    """Verify TokenBudget tracks tokens and tool calls."""
    budget = TokenBudget(max_tokens=1000, max_tool_calls=5)
    assert not budget.exhausted

    budget.record_tokens(input_tokens=400, output_tokens=200)
    assert budget.used_tokens == 600
    assert not budget.exhausted

    budget.record_tokens(input_tokens=250, output_tokens=200)
    assert budget.used_tokens == 1050
    assert budget.exhausted


def test_token_budget_tool_calls():
    """Verify TokenBudget exhausts when max_tool_calls is reached."""
    budget = TokenBudget(max_tokens=10000, max_tool_calls=3)
    budget.record_tool_call()
    budget.record_tool_call()
    assert not budget.exhausted
    budget.record_tool_call()
    assert budget.exhausted


def test_caching():
    """Verify prompt version and input hash based caching."""
    key1 = cache_key("v1.0", {"text": "Solar investment in Thoothukudi"})
    key2 = cache_key("v1.0", {"text": "Solar investment in Thoothukudi"})
    key3 = cache_key("v1.1", {"text": "Solar investment in Thoothukudi"})

    assert key1 == key2
    assert key1 != key3

    set_cached_response(key1, {"project": "Solar Farm", "jobs": 500})
    cached = get_cached_response(key1)
    assert cached is not None
    assert cached["jobs"] == 500
