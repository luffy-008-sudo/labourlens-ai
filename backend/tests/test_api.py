"""Tests for M7 — Complete FastAPI endpoints and SSE streams."""

from __future__ import annotations

import os

os.environ["DEMO_MODE"] = "true"
os.environ["DATABASE_URL"] = os.getenv("DATABASE_URL", "sqlite:///./test.db")


def test_list_districts(client):
    res = client.get("/api/v1/districts")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert any(d["lgd_code"] == "582" for d in data)  # Krishnagiri
    assert any(d["lgd_code"] == "608" for d in data)  # Thoothukudi


def test_get_district_overview(client):
    res = client.get("/api/v1/districts/582")
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "Krishnagiri"
    assert "parks_count" in data
    assert "institutions_count" in data


def test_get_district_clusters(client):
    res = client.get("/api/v1/districts/582/clusters?mode=local_priority")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)


def test_get_cluster_detail(client):
    res = client.get("/api/v1/districts/582/clusters/ev_auto")
    assert res.status_code == 200
    data = res.json()
    assert data["cluster_slug"] == "ev_auto"
    assert "narrative_md" in data
    assert "metrics" in data


def test_sensitivity_endpoint(client):
    res = client.get("/api/v1/analysis/sensitivity?district=582")
    assert res.status_code == 200
    data = res.json()
    assert "total_grid_points" in data
    assert "stability" in data
    assert data["total_grid_points"] > 0


def test_guidance_stream_routes_event(client):
    profile = {
        "district_lgd": "582",
        "education": "Diploma",
        "skills": ["basic electrical"],
        "interests": ["ev_auto"],
        "max_travel_km": 30.0,
        "language": "en",
    }
    res = client.post("/api/v1/guidance?mode=local_priority", json=profile)
    assert res.status_code == 200
    assert "text/event-stream" in res.headers["content-type"]
    text = res.text
    assert "event: routes" in text
    assert "event: token" in text
    assert "event: done" in text


def test_analyst_chat_stream(client):
    res = client.post(
        "/api/v1/chat",
        json={"message": "What is emerging in Krishnagiri?", "district_lgd": "582"},
    )
    assert res.status_code == 200
    assert "text/event-stream" in res.headers["content-type"]
    text = res.text
    assert "event: message" in text
    assert "event: done" in text


def test_runs_endpoints(client):
    # List runs
    res = client.get("/api/v1/runs")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)

    # Trigger a run
    res_trigger = client.post("/api/v1/runs/skill_mapping?cluster_slug=solar")
    assert res_trigger.status_code == 200
    assert res_trigger.json()["status"] == "completed"


def test_sources_endpoint(client):
    res = client.get("/api/v1/sources")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)


def test_review_queue_endpoint(client):
    res = client.get("/api/v1/review")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)

