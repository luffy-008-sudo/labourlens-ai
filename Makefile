.PHONY: help up down test lint migrate seed demo run-discovery eval clean

help:
	@echo "KaushalSetu Commands:"
	@echo "  make up              Start docker compose services"
	@echo "  make down            Stop docker compose services"
	@echo "  make test            Run all backend tests"
	@echo "  make lint            Run ruff & mypy checks"
	@echo "  make migrate         Run alembic migrations"
	@echo "  make seed            Seed reference data (districts, places, clusters, etc.)"
	@echo "  make demo            Run in demo mode with preloaded synthetic & cached runs"
	@echo "  make run-discovery   Run signal discovery for a district (e.g. make run-discovery DISTRICT=Krishnagiri)"
	@echo "  make eval            Run evaluation suites"

up:
	docker compose up -d

down:
	docker compose down

test:
	cd backend && pytest -v

lint:
	cd backend && ruff check . && ruff format --check . && mypy app

format:
	cd backend && ruff format . && ruff check --fix .

migrate:
	cd backend && alembic upgrade head

seed:
	cd backend && python -m app.reference.loader

demo:
	export DEMO_MODE=true && cd backend && python -m app.main

run-discovery:
	cd backend && python -m app.agents.runner --district $(or $(DISTRICT),Krishnagiri)

eval:
	cd backend && .venv/bin/python ../evals/runner.py

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
