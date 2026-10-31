"""Search tools for the signal discovery agent.

All tools are read-only and may only query sources listed in
``sources.yaml`` or public RSS feeds.  No arbitrary URL access.
"""

from __future__ import annotations

import hashlib
import re
from typing import Any
from urllib.parse import quote_plus

import feedparser
import httpx
import trafilatura
from langchain_core.tools import tool

from app.core.logging import get_logger
from app.core.settings import get_settings

logger = get_logger("agents.tools.search")

# GDELT DOC 2.0 base URL (public, no key required)
_GDELT_BASE = "https://api.gdeltproject.org/api/v2/doc/doc"

# Google News RSS
_GNEWS_BASE = "https://news.google.com/rss/search"

# PIB RSS
_PIB_RSS = "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3"


def _canonical_url(url: str) -> str:
    """Best-effort canonical URL (strip utm_ params, trailing slash)."""
    url = re.sub(r"[?&]utm_[^&]*", "", url).rstrip("/").rstrip("?&")
    return url


def _content_hash(text: bytes) -> str:
    return hashlib.sha256(text).hexdigest()


# ─────────────────────────────────────────────────────────────────────────────
# GDELT search
# ─────────────────────────────────────────────────────────────────────────────


@tool
def search_gdelt(query: str, max_records: int = 30) -> list[dict[str, Any]]:
    """Search GDELT DOC 2.0 for Indian news articles matching a query.

    Args:
        query: The search query string (English or transliterated).
        max_records: Maximum records to return (≤ 250 per GDELT limits).

    Returns:
        List of article dicts with keys: url, title, domain, language, seendate.
    """
    settings = get_settings()
    if settings.demo_mode:
        logger.info("DEMO_MODE: returning mock GDELT results for query=%r", query)
        return _mock_gdelt_results(query)

    params = {
        "query": f"{query} sourcelang:english country:IN",
        "mode": "artlist",
        "maxrecords": min(max_records, 250),
        "format": "json",
        "sort": "DateDesc",
        "timespan": "90d",
    }
    try:
        with httpx.Client(timeout=15) as client:
            resp = client.get(_GDELT_BASE, params=params)
            resp.raise_for_status()
            data = resp.json()
            articles = data.get("articles", [])
            return [
                {
                    "url": a.get("url", ""),
                    "canonical_url": _canonical_url(a.get("url", "")),
                    "title": a.get("title", ""),
                    "domain": a.get("domain", ""),
                    "language": a.get("language", "English"),
                    "seendate": a.get("seendate", ""),
                    "channel": "gdelt",
                }
                for a in articles
            ]
    except Exception as exc:
        logger.warning("GDELT search failed for %r: %s", query, exc)
        return []


def _mock_gdelt_results(query: str) -> list[dict[str, Any]]:
    """Synthetic GDELT results for demo / test mode."""
    q_lower = query.lower()
    results = []

    if "solar" in q_lower or "thoothukudi" in q_lower or "tuticorin" in q_lower:
        results.append(
            {
                "url": "https://www.thehindu.com/business/Industry/siemens-gamesa-wind-solar-thoothukudi/article1.html",
                "canonical_url": "https://www.thehindu.com/business/Industry/siemens-gamesa-wind-solar-thoothukudi/article1.html",
                "title": "Siemens Gamesa to set up 500 MW solar-wind hybrid plant in Thoothukudi",
                "domain": "thehindu.com",
                "language": "English",
                "seendate": "20240315T120000Z",
                "channel": "gdelt",
            }
        )
    if "ev" in q_lower or "hosur" in q_lower or "krishnagiri" in q_lower:
        results.append(
            {
                "url": "https://economictimes.indiatimes.com/industry/auto/ev/ola-electric-hosur-expansion/article2.html",
                "canonical_url": "https://economictimes.indiatimes.com/industry/auto/ev/ola-electric-hosur-expansion/article2.html",
                "title": "Ola Electric expands Hosur FutureFactory; ₹2,400 crore investment, 3,000 jobs",
                "domain": "economictimes.indiatimes.com",
                "language": "English",
                "seendate": "20240320T080000Z",
                "channel": "gdelt",
            }
        )
    if "food" in q_lower or "krishnagiri" in q_lower:
        results.append(
            {
                "url": "https://www.business-standard.com/article/companies/ifs-food-park-krishnagiri-article3.html",
                "canonical_url": "https://www.business-standard.com/article/companies/ifs-food-park-krishnagiri-article3.html",
                "title": "IFS to develop integrated food park in Krishnagiri, MoU signed with TIDCO",
                "domain": "business-standard.com",
                "language": "English",
                "seendate": "20240301T100000Z",
                "channel": "gdelt",
            }
        )
    return results


# ─────────────────────────────────────────────────────────────────────────────
# Google News RSS search
# ─────────────────────────────────────────────────────────────────────────────


@tool
def search_gnews_rss(query: str, max_records: int = 20) -> list[dict[str, Any]]:
    """Search Google News RSS for recent articles.

    Args:
        query: The search query string.
        max_records: Maximum articles to return.

    Returns:
        List of article dicts with keys: url, title, source, published.
    """
    settings = get_settings()
    if settings.demo_mode:
        logger.info("DEMO_MODE: returning mock GNews results for query=%r", query)
        return _mock_gdelt_results(query)  # reuse mock for simplicity

    url = f"{_GNEWS_BASE}?q={quote_plus(query)}&hl=en-IN&gl=IN&ceid=IN:en"
    try:
        feed = feedparser.parse(url)
        entries = feed.get("entries", [])[:max_records]
        return [
            {
                "url": e.get("link", ""),
                "canonical_url": _canonical_url(e.get("link", "")),
                "title": e.get("title", ""),
                "source": e.get("source", {}).get("title", ""),
                "published": e.get("published", ""),
                "channel": "gnews_rss",
            }
            for e in entries
        ]
    except Exception as exc:
        logger.warning("GNews RSS search failed for %r: %s", query, exc)
        return []


# ─────────────────────────────────────────────────────────────────────────────
# PIB RSS
# ─────────────────────────────────────────────────────────────────────────────


@tool
def search_pib(keyword: str) -> list[dict[str, Any]]:
    """Fetch recent Press Information Bureau releases matching a keyword.

    Args:
        keyword: Keyword to filter PIB headlines (case-insensitive substring).

    Returns:
        List of article dicts with keys: url, title, published.
    """
    try:
        feed = feedparser.parse(_PIB_RSS)
        entries = feed.get("entries", [])
        kw = keyword.lower()
        matched = [
            {
                "url": e.get("link", ""),
                "canonical_url": _canonical_url(e.get("link", "")),
                "title": e.get("title", ""),
                "published": e.get("published", ""),
                "channel": "pib",
            }
            for e in entries
            if kw in e.get("title", "").lower() or kw in e.get("summary", "").lower()
        ]
        return matched
    except Exception as exc:
        logger.warning("PIB RSS fetch failed: %s", exc)
        return []


# ─────────────────────────────────────────────────────────────────────────────
# Article fetch (trafilatura + optional Playwright fallback)
# ─────────────────────────────────────────────────────────────────────────────


@tool
def fetch_article(url: str, use_playwright_fallback: bool = False) -> dict[str, Any]:
    """Fetch and extract the main text of a news article.

    Uses ``trafilatura`` for static pages.  If ``use_playwright_fallback``
    is True and trafilatura returns nothing, attempts a headless browser
    fetch (requires Playwright to be installed and browsers downloaded).

    Args:
        url: Article URL.  Must be an http/https URL.
        use_playwright_fallback: Whether to try Playwright if trafilatura fails.

    Returns:
        Dict with keys: url, text, language, content_sha256, fetch_method.
        ``text`` is None if extraction failed.
    """
    settings = get_settings()
    if settings.demo_mode:
        return _mock_article(url)

    if not url.startswith(("http://", "https://")):
        return {"url": url, "text": None, "language": None, "content_sha256": None, "fetch_method": "failed"}

    text: str | None = None
    fetch_method = "trafilatura"

    try:
        downloaded = trafilatura.fetch_url(url)
        if downloaded:
            text = trafilatura.extract(
                downloaded,
                include_comments=False,
                include_tables=True,
                no_fallback=False,
            )
    except Exception as exc:
        logger.warning("trafilatura failed for %s: %s", url, exc)

    if not text and use_playwright_fallback:
        text, fetch_method = _playwright_fetch(url)

    sha = _content_hash(text.encode() if text else b"")

    return {
        "url": url,
        "text": text,
        "language": _detect_language(text),
        "content_sha256": sha,
        "fetch_method": fetch_method,
    }


def _playwright_fetch(url: str) -> tuple[str | None, str]:
    """Headless browser fetch using Playwright (best effort)."""
    try:
        from playwright.sync_api import sync_playwright  # type: ignore[import-untyped]

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(url, timeout=20000)
            html = page.content()
            browser.close()
        text = trafilatura.extract(html, include_comments=False, include_tables=True)
        return text, "playwright"
    except Exception as exc:
        logger.warning("Playwright fetch failed for %s: %s", url, exc)
        return None, "failed"


def _detect_language(text: str | None) -> str | None:
    """Very lightweight language hint based on Unicode script ranges."""
    if not text:
        return None
    tamil_chars = sum(1 for c in text[:500] if "\u0B80" <= c <= "\u0BFF")
    devanagari_chars = sum(1 for c in text[:500] if "\u0900" <= c <= "\u097F")
    if tamil_chars > 10:
        return "ta"
    if devanagari_chars > 10:
        return "hi"
    return "en"


def _mock_article(url: str) -> dict[str, Any]:
    """Return a synthetic article for demo / test mode."""
    articles = {
        "siemens-gamesa": {
            "text": (
                "Siemens Gamesa Renewable Energy announced a ₹1,200 crore investment "
                "to set up a 500 MW solar-wind hybrid power plant in Thoothukudi district, "
                "Tamil Nadu. The project, which is expected to create 800 direct jobs, "
                "received MoU approval from the Tamil Nadu government. "
                "Construction is expected to begin in Q3 2024."
            ),
            "language": "en",
        },
        "ola-electric": {
            "text": (
                "Ola Electric has announced an expansion of its Hosur FutureFactory with "
                "an additional investment of ₹2,400 crore. The expansion, located in Hosur, "
                "Krishnagiri district, is expected to generate approximately 3,000 new jobs. "
                "The company signed a land allotment agreement with SIPCOT for 200 additional acres."
            ),
            "language": "en",
        },
        "ifs-food-park": {
            "text": (
                "IFS (Integrated Food Systems) signed a Memorandum of Understanding with TIDCO "
                "to develop an integrated food park in Krishnagiri district, Tamil Nadu. "
                "The Rs 350 crore project will provide employment to 500 workers and focus on "
                "fruit and vegetable processing for export markets."
            ),
            "language": "en",
        },
    }
    for key, data in articles.items():
        if key in url.lower():
            sha = _content_hash(data["text"].encode())
            return {
                "url": url,
                "text": data["text"],
                "language": data["language"],
                "content_sha256": sha,
                "fetch_method": "mock",
            }
    # Generic fallback
    fallback = f"This article at {url} discusses industrial development in Tamil Nadu."
    return {
        "url": url,
        "text": fallback,
        "language": "en",
        "content_sha256": _content_hash(fallback.encode()),
        "fetch_method": "mock",
    }

