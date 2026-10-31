
"""Gazetteer and district resolution service.

Resolves free-text mentions (e.g., 'Tuticorin', 'Hosur SIPCOT', 'Pochampalli plant')
to canonical LGD districts using exact, alias, place-level, and fuzzy matching.
"""

from __future__ import annotations

import re
from typing import NamedTuple

from rapidfuzz import fuzz

# Curated reference map of Tamil Nadu focus districts & aliases
DISTRICT_CATALOG = {
    "582": {
        "name": "Krishnagiri",
        "aliases": [
            "krishnagiri",
            "hosur",
            "dharmapuri north",
            "pochampalli",
            "shoolagiri",
            "bargur",
        ],
        "places": [
            "hosur",
            "pochampalli",
            "shoolagiri",
            "bargur",
            "denkanikottai",
            "kelamangalam",
            "sipcot hosur",
            "thally",
            "uthangarai",
        ],
    },
    "608": {
        "name": "Thoothukudi",
        "aliases": ["thoothukudi", "tuticorin", "pearl city", "muthunagar", "muthu nagar"],
        "places": [
            "tuticorin",
            "kovilpatti",
            "tiruchendur",
            "kayalpattinam",
            "ottapidaram",
            "srivaikuntam",
            "ettayapuram",
            "vilathikulam",
            "sipcot thoothukudi",
            "voc port",
        ],
    },
    "603": {
        "name": "Chennai",
        "aliases": ["chennai", "madras", "singara chennai"],
        "places": [
            "guindy",
            "omr",
            "sholinganallur",
            "tidel park",
            "ambattur",
            "ennoor",
            "sriperumbudur",
            "oragadam",
        ],
    },
}


class ResolvedDistrict(NamedTuple):
    district_lgd: str
    name: str
    confidence: float
    matched_term: str


def _clean_text(text: str) -> str:
    """Normalize text for matching."""
    text = text.lower()
    text = re.sub(r"[^\w\s]", " ", text)
    return " ".join(text.split())


def resolve_district(text: str, min_confidence: float = 75.0) -> ResolvedDistrict | None:
    """Resolve a district mention from raw text.

    Order of precedence:
    1. Exact district name match (1.0)
    2. Curated alias match (0.95)
    3. Known gazetteer place / industrial park match (0.90)
    4. Trigram / fuzzy token match (scaled confidence >= min_confidence)
    """
    clean = _clean_text(text)
    if not clean:
        return None

    words = set(clean.split())

    # 1. Exact Name & Direct Alias Check
    for lgd, data in DISTRICT_CATALOG.items():
        canonical = data["name"].lower()
        if canonical in clean or canonical in words:
            return ResolvedDistrict(
                district_lgd=lgd,
                name=data["name"],
                confidence=1.0,
                matched_term=canonical,
            )

        for alias in data["aliases"]:
            # Check whole phrase or word
            if f" {alias} " in f" {clean} " or alias == clean:
                return ResolvedDistrict(
                    district_lgd=lgd,
                    name=data["name"],
                    confidence=0.95,
                    matched_term=alias,
                )

    # 2. Place / Sub-district / Industrial Hub Check
    for lgd, data in DISTRICT_CATALOG.items():
        for place in data["places"]:
            if f" {place} " in f" {clean} " or place == clean:
                return ResolvedDistrict(
                    district_lgd=lgd,
                    name=data["name"],
                    confidence=0.90,
                    matched_term=place,
                )

    # 3. Fuzzy Match
    best_match: tuple[str, str, float, str] | None = None
    best_score = 0.0

    for lgd, data in DISTRICT_CATALOG.items():
        # Check against name and aliases
        candidates = [data["name"]] + data["aliases"] + data["places"]
        for cand in candidates:
            score = fuzz.token_set_ratio(clean, cand)
            if score > best_score and score >= min_confidence:
                best_score = score
                best_match = (lgd, data["name"], score / 100.0, cand)

    if best_match:
        return ResolvedDistrict(
            district_lgd=best_match[0],
            name=best_match[1],
            confidence=best_match[2],
            matched_term=best_match[3],
        )

    return None
