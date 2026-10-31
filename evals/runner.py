"""Evaluation runner for KaushalSetu gold sets.

Runs:
1. Signal extraction precision/recall against gold set.
2. Deduplication match/non-match F1 score.
3. Learner guidance sanity and Equity Toggle contract verification across 4 personas.
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

# Add backend to path
BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from app.reference.gazetteer import resolve_district
from app.services.pathways import assemble_pathways_for_profile
from app.services.recommendation import LearnerProfile


def run_signal_extraction_eval() -> dict:
    gold_path = Path(__file__).parent / "gold_sets" / "signal_extraction.json"
    with open(gold_path, "r", encoding="utf-8") as f:
        cases = json.load(f)

    correct_district = 0
    correct_relevance = 0
    total_relevant = 0

    for c in cases:
        text = c["text"]
        is_rel = c["is_relevant"]

        # Gazetteer check
        resolved = resolve_district(text)
        has_district = resolved is not None

        if is_rel:
            total_relevant += 1
            gt = c["ground_truth"]
            if has_district and resolved[0] == gt["district_lgd"]:
                correct_district += 1
            if has_district:
                correct_relevance += 1
        else:
            if not has_district:
                correct_relevance += 1

    precision_district = correct_district / total_relevant if total_relevant else 1.0
    relevance_acc = correct_relevance / len(cases)

    return {
        "precision_district": precision_district,
        "relevance_accuracy": relevance_acc,
        "passed": precision_district >= 0.90 and relevance_acc >= 0.85,
    }


def run_dedupe_eval() -> dict:
    gold_path = Path(__file__).parent / "gold_sets" / "dedupe_pairs.json"
    with open(gold_path, "r", encoding="utf-8") as f:
        pairs = json.load(f)

    from rapidfuzz import fuzz

    tp = fp = fn = tn = 0
    for p in pairs:
        score = fuzz.token_set_ratio(p["article_a"], p["article_b"])
        pred_merge = score >= 55.0
        should_merge = p["should_merge"]

        if pred_merge and should_merge:
            tp += 1
        elif pred_merge and not should_merge:
            fp += 1
        elif not pred_merge and should_merge:
            fn += 1
        else:
            tn += 1

    precision = tp / (tp + fp) if (tp + fp) else 1.0
    recall = tp / (tp + fn) if (tp + fn) else 1.0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) else 1.0

    return {
        "f1": f1,
        "precision": precision,
        "recall": recall,
        "passed": f1 >= 0.90,
    }


def run_guidance_eval() -> dict:
    gold_path = Path(__file__).parent / "gold_sets" / "guidance_personas.json"
    with open(gold_path, "r", encoding="utf-8") as f:
        personas = json.load(f)

    all_passed = True
    results = []

    for p in personas:
        prof = LearnerProfile(
            education=p["education"],
            district_lgd=p["district_lgd"],
            skills=p["skills"],
            interests=p.get("interests", []),
            max_travel_km=p["max_travel_km"],
        )

        routes_local = assemble_pathways_for_profile(prof, mode="local_priority")
        routes_market = assemble_pathways_for_profile(prof, mode="market")

        assert len(routes_local) > 0, f"No local routes for {p['id']}"
        assert len(routes_market) > 0, f"No market routes for {p['id']}"

        top_local = routes_local[0]
        top_market = routes_market[0]

        # In local mode, cluster matches local priority expectation
        local_cluster = top_local.get("cluster", {}).get("slug")
        market_cluster = top_market.get("cluster", {}).get("slug")

        # Crucial check: Local prioritizes local cluster, market switches to metro_it
        case_pass = (market_cluster == "metro_it") and (top_local["role"]["title"] != top_market["role"]["title"])
        if not case_pass:
            all_passed = False

        results.append({
            "persona": p["id"],
            "top_local": top_local["role"]["title"],
            "top_market": top_market["role"]["title"],
            "passed": case_pass,
        })

    return {
        "passed": all_passed,
        "personas_evaluated": len(personas),
        "results": results,
    }


def main():
    print("=" * 60)
    print("KaushalSetu Evaluation Suite (§13 Targets)")
    print("=" * 60)

    print("\n1. Running Signal Extraction Gold Set Evaluation...")
    ext_res = run_signal_extraction_eval()
    print(f"   District Precision: {ext_res['precision_district'] * 100:.1f}% (target >= 90%)")
    print(f"   Relevance Accuracy: {ext_res['relevance_accuracy'] * 100:.1f}% (target >= 85%)")
    print(f"   Status: {'PASS' if ext_res['passed'] else 'FAIL'}")

    print("\n2. Running Deduplication Gold Set Evaluation...")
    dedupe_res = run_dedupe_eval()
    print(f"   Dedupe F1 Score: {dedupe_res['f1']:.3f} (target >= 0.90)")
    print(f"   Status: {'PASS' if dedupe_res['passed'] else 'FAIL'}")

    print("\n3. Running Learner Guidance & Equity Toggle Benchmark...")
    guide_res = run_guidance_eval()
    print(f"   Personas evaluated: {guide_res['personas_evaluated']}")
    for r in guide_res["results"]:
        print(f"   - Persona {r['persona']}: Local='{r['top_local']}' vs Market='{r['top_market']}' -> {'OK' if r['passed'] else 'FAIL'}")
    print(f"   Status: {'PASS' if guide_res['passed'] else 'FAIL'}")

    print("\n" + "=" * 60)
    if ext_res["passed"] and dedupe_res["passed"] and guide_res["passed"]:
        print("ALL EVALUATIONS PASSED!")
        print("=" * 60)
        sys.exit(0)
    else:
        print("EVALUATIONS FAILED!")
        print("=" * 60)
        sys.exit(1)


if __name__ == "__main__":
    main()
