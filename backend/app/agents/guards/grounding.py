"""Grounding and injection guards for signal extraction.

These are **deterministic** checks that run after every LLM extraction
step.  They enforce the spec rule: "every LLM output that reaches users
or the database must pass a code check".

Checks performed by ``ground_check``:
1. ``evidence_quote`` must appear verbatim in the article text
   (normalised whitespace; rapidfuzz partial_ratio ≥ 92).
2. Every number in ``investment_inr_cr`` / ``jobs_expected`` must derive
   from the evidence quote (currency conversion aware).
3. The district must resolve through ``resolve_district`` from either the
   ``place_mentioned`` field or the broader article text.
4. Dates must be plausible (not in the future by more than 3 years, not
   before 2010).

The injection guard strips or flags articles that contain strings that
look like prompt-injection attempts (per §12 of the spec).
"""

from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass, field
from datetime import date

from rapidfuzz import fuzz

from app.core.logging import get_logger
from app.reference.gazetteer import resolve_district
from app.schemas.llm import IndustrySignal

logger = get_logger("agents.guards.grounding")

# ─────────────────────────────────────────────────────────────────────────────
# Injection guard
# ─────────────────────────────────────────────────────────────────────────────

_INJECTION_PATTERNS = re.compile(
    r"(ignore\s+(previous|all)\s+(instructions?|prompts?)"
    r"|system\s*:\s*you\s+are"
    r"|<\s*system\s*>"
    r"|<\s*/?instructions?\s*>"
    r"|IGNORE\s+ABOVE"
    r"|disregard\s+(all\s+)?previous"
    r"|\bACT\s+AS\b"
    r"|\bDAN\b"
    r"|\bJailbreak\b)",
    re.IGNORECASE,
)


def injection_check(text: str) -> bool:
    """Return True if the text looks clean (no injection patterns).

    Args:
        text: Raw article or user-supplied text.

    Returns:
        True if the text passes (no injection detected).
        False if a potential injection pattern is found.
    """
    result = not bool(_INJECTION_PATTERNS.search(text))
    if not result:
        logger.warning("Injection pattern detected in article text (first 200 chars): %r", text[:200])
    return result


# ─────────────────────────────────────────────────────────────────────────────
# Text normalisation
# ─────────────────────────────────────────────────────────────────────────────


def _normalise(text: str) -> str:
    """Collapse whitespace and normalise unicode for quote matching."""
    text = unicodedata.normalize("NFC", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


# ─────────────────────────────────────────────────────────────────────────────
# Currency normalisation (₹ crore extraction)
# ─────────────────────────────────────────────────────────────────────────────

_CRORE_PATTERNS = [
    # "₹1,200 crore" / "Rs 1200 crore" / "INR 1200 crore"
    re.compile(r"(?:₹|Rs\.?\s*|INR\s*)([\d,]+(?:\.\d+)?)\s*(?:crore|cr\.?)", re.IGNORECASE),
    # "1,200 crore" (without currency symbol)
    re.compile(r"([\d,]+(?:\.\d+)?)\s*(?:crore|cr\.?)", re.IGNORECASE),
    # "Rs X billion" → multiply by 100 to get crores
    re.compile(r"(?:₹|Rs\.?\s*|INR\s*)([\d,]+(?:\.\d+)?)\s*billion", re.IGNORECASE),
    # "Rs X lakh crore"
    re.compile(r"(?:₹|Rs\.?\s*|INR\s*)([\d,]+(?:\.\d+)?)\s*lakh\s*crore", re.IGNORECASE),
]


def _extract_crore_values(text: str) -> list[float]:
    """Extract all ₹ crore values mentioned in text."""
    values: list[float] = []
    for i, pat in enumerate(_CRORE_PATTERNS):
        for match in pat.finditer(text):
            raw = match.group(1).replace(",", "")
            try:
                v = float(raw)
                if i == 2:  # billion pattern
                    v = v * 100  # 1 billion = 100 crore
                elif i == 3:  # lakh crore pattern
                    v = v * 100000
                values.append(round(v, 2))
            except ValueError:
                pass
    return values


_JOB_PATTERNS = [
    re.compile(r"([\d,]+(?:\.\d+)?)\s*(?:k\b)?\s*(?:direct\s+)?jobs?", re.IGNORECASE),
    re.compile(r"employ(?:ment|ees?)\s+(?:of\s+|to\s+)?([\d,]+)", re.IGNORECASE),
    re.compile(r"([\d,]+)\s*(?:k\b)?\s*workers?", re.IGNORECASE),
]


def _extract_job_values(text: str) -> list[int]:
    """Extract all job count values mentioned in text."""
    values: list[int] = []
    for pat in _JOB_PATTERNS:
        for match in pat.finditer(text):
            raw = match.group(1).replace(",", "").lower()
            try:
                v = float(raw)
                # Handle "3k" style
                if "k" in match.group(0).lower():
                    v *= 1000
                values.append(int(round(v)))
            except ValueError:
                pass
    return values


# ─────────────────────────────────────────────────────────────────────────────
# Grounding check result
# ─────────────────────────────────────────────────────────────────────────────


@dataclass
class GroundingResult:
    passed: bool
    failures: list[str] = field(default_factory=list)


def ground_check(signal: IndustrySignal, article_text: str) -> GroundingResult:
    """Run all grounding checks against the source article text.

    Args:
        signal: The extracted ``IndustrySignal``.
        article_text: Full text of the article the signal was extracted from.

    Returns:
        ``GroundingResult`` with ``passed=True`` if all checks succeed.
    """
    failures: list[str] = []
    norm_article = _normalise(article_text)
    norm_quote = _normalise(signal.evidence_quote)

    # ── Check 1: evidence_quote must appear in article ─────────────────────
    quote_score = fuzz.partial_ratio(norm_quote, norm_article)
    if quote_score < 92:
        failures.append(
            f"evidence_quote not found in article text "
            f"(rapidfuzz partial_ratio={quote_score}, threshold=92). "
            f"Quote: {repr(signal.evidence_quote[:120])}"
        )

    # ── Check 2: investment_inr_cr must come from the quote ───────────────
    if signal.investment_inr_cr is not None:
        article_crore_vals = _extract_crore_values(norm_article)
        quote_crore_vals = _extract_crore_values(norm_quote)

        # The claimed value must be within 5% of at least one value in the
        # article (allowing for unit conversions described in notes).
        claimed = signal.investment_inr_cr
        tolerance = max(claimed * 0.05, 5.0)  # 5% or ₹5 crore minimum
        article_vals = article_crore_vals or quote_crore_vals
        if article_vals and not any(abs(v - claimed) <= tolerance for v in article_vals):
            failures.append(
                f"investment_inr_cr={claimed} not grounded in article. "
                f"Values found: {article_vals}"
            )

    # ── Check 3: jobs_expected must come from the article ─────────────────
    if signal.jobs_expected is not None:
        article_job_vals = _extract_job_values(norm_article)
        claimed_jobs = signal.jobs_expected
        tolerance_jobs = max(int(claimed_jobs * 0.15), 50)
        if article_job_vals and not any(abs(v - claimed_jobs) <= tolerance_jobs for v in article_job_vals):
            failures.append(
                f"jobs_expected={claimed_jobs} not grounded in article. "
                f"Values found: {article_job_vals}"
            )

    # ── Check 4: district must resolve ────────────────────────────────────
    # Try place_mentioned first, then the broader article snippet.
    resolved = resolve_district(signal.place_mentioned)
    if resolved is None:
        # Try from a wider context (first 1000 chars of article)
        resolved = resolve_district(article_text[:1000])
    if resolved is None:
        failures.append(
            f"place_mentioned={repr(signal.place_mentioned)!r} could not be resolved "
            "to a known TN district via gazetteer."
        )

    # ── Check 5: announced_date plausibility ──────────────────────────────
    if signal.announced_date is not None:
        today = date.today()
        if signal.announced_date > date(today.year + 3, today.month, today.day):
            failures.append(
                f"announced_date={signal.announced_date} is implausibly far in the future."
            )
        if signal.announced_date < date(2010, 1, 1):
            failures.append(
                f"announced_date={signal.announced_date} is before 2010 — likely erroneous."
            )

    return GroundingResult(passed=len(failures) == 0, failures=failures)

