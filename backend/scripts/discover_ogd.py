"""Script to search data.gov.in catalogue for datasets matching key terms."""

from __future__ import annotations

import argparse
from typing import Any

import httpx

from app.core.logging import get_logger, setup_logging
from app.core.settings import get_settings

logger = get_logger("scripts.discover_ogd")


def search_catalogue(query: str, api_key: str | None = None) -> list[dict[str, Any]]:
    """Search data.gov.in catalogue API by keyword query."""
    settings = get_settings()
    key = api_key or settings.ogd_api_key

    # Query endpoint
    url = "https://api.data.gov.in/catalog/v1"
    params = {"title": query, "format": "json"}
    if key:
        params["api-key"] = key

    logger.info("Searching data.gov.in for '%s'...", query)
    try:
        with httpx.Client(timeout=15.0) as client:
            resp = client.get(url, params=params)
            if resp.status_code == 200:
                data = resp.json()
                return data.get("records", [])
            else:
                logger.warning("Catalogue search returned HTTP %d", resp.status_code)
                return []
    except Exception as e:
        logger.error("Failed to connect to data.gov.in catalogue: %s", e)
        return []


def main():
    parser = argparse.ArgumentParser(description="Search data.gov.in catalogue for datasets")
    parser.add_argument("--query", "-q", default="UDYAM MSME", help="Search keyword")
    args = parser.parse_args()

    setup_logging()
    results = search_catalogue(args.query)

    print(f"\n--- Found {len(results)} datasets for query '{args.query}' ---")
    for r in results[:10]:
        print(f"Title: {r.get('title')}")
        print(f"Resource ID: {r.get('index_name') or r.get('id')}")
        print(f"Description: {r.get('desc', '')[:120]}...")
        print("-" * 50)


if __name__ == "__main__":
    main()
