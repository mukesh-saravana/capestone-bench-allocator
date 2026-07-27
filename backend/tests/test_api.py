from __future__ import annotations

import os
from pathlib import Path

from fastapi.testclient import TestClient

TEST_DB_FILE = Path(__file__).resolve().parent / "test_bench_allocator.db"
if TEST_DB_FILE.exists():
    TEST_DB_FILE.unlink()
os.environ["BACKEND_DATABASE_URL"] = f"sqlite:///{TEST_DB_FILE.as_posix()}"

from app.main import app


client = TestClient(app)


def login_headers() -> dict[str, str]:
    response = client.post("/api/auth/login", json={"email": "manager@company.com", "password": "demo1234"})
    assert response.status_code == 200
    token = response.json()["token"]
    return {"Authorization": f"Bearer {token}"}


def test_auth_me_requires_login() -> None:
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_auth_me_with_token() -> None:
    headers = login_headers()
    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 200
    body = response.json()
    assert body["email"] == "manager@company.com"


def test_recommendations_rank_react_candidate() -> None:
    headers = login_headers()
    response = client.post(
        "/api/recommendations",
        headers=headers,
        json={"requiredSkills": ["React", "TypeScript"], "strategy": "hybrid"},
    )
    assert response.status_code == 200
    body = response.json()
    top = body["recommendations"][0]
    assert top["employee"]["name"] == "John Doe"
    assert top["rank"] == 1


def test_reference_data_endpoints() -> None:
    headers = login_headers()
    employees = client.get("/api/employees", headers=headers)
    needs = client.get("/api/project-needs", headers=headers)
    history = client.get("/api/allocation-history", headers=headers)
    assert employees.status_code == 200
    assert needs.status_code == 200
    assert history.status_code == 200
    assert len(employees.json()) >= 1
    assert len(needs.json()) >= 1
    assert len(history.json()) >= 1


def test_candidate_import_and_summary() -> None:
    headers = login_headers()
    csv_payload = (
        "candidate_id,name,email,role,department,experience_years,skills,availability,utilization_pct,interview_score,interview_result\n"
        "cand-101,Arun Kumar,arun.kumar@company.com,Engineer,Backend,5,Python|FastAPI|PostgreSQL,available,0,84,selected\n"
    ).encode("utf-8")
    response = client.post(
        "/api/import/candidates",
        headers=headers,
        files={"file": ("candidates-sample.csv", csv_payload, "text/csv")},
    )
    assert response.status_code == 200
    assert response.json()["imported"] >= 1

    summary = client.get("/api/data/summary", headers=headers)
    assert summary.status_code == 200
    datasets = {item["key"]: item for item in summary.json()}
    assert "candidate_profiles" in datasets
    assert datasets["candidate_profiles"]["importEnabled"] is True


def test_chat_query_returns_recommendations() -> None:
    headers = login_headers()
    response = client.post("/api/chat/query", headers=headers, json={"query": "Find a React developer", "strategy": "hybrid"})
    assert response.status_code == 200
    body = response.json()
    assert body["recommendations"]
    assert body["answer"]
    assert body["messageId"].startswith("msg-")


def test_allocation_creation_updates_state() -> None:
    headers = login_headers()
    response = client.post(
        "/api/allocations",
        headers=headers,
        json={
            "employeeId": "emp-003",
            "projectNeedId": "need-003",
            "role": "DevOps Engineer",
            "startDate": "2026-07-27",
            "notes": "Allocated from bench",
        },
    )
    assert response.status_code == 200

    summary = client.get("/api/dashboard/allocations", headers=headers)
    assert summary.status_code == 200
    assert summary.json()["totalAllocations"] >= 5
