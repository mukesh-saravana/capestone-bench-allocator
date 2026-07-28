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
    response = client.post("/api/import/candidate_profiles", headers=headers, files={"file": ("candidates-sample.csv", csv_payload, "text/csv")})
    assert response.status_code == 200
    assert response.json()["imported"] >= 1

    summary = client.get("/api/data/summary", headers=headers)
    assert summary.status_code == 200
    datasets = {item["key"]: item for item in summary.json()}
    assert "candidate_profiles" in datasets
    assert datasets["employees"]["importEnabled"] is True
    assert datasets["project_needs"]["importEnabled"] is True
    assert datasets["allocation_history"]["importEnabled"] is True
    assert datasets["candidate_profiles"]["importEnabled"] is True


def test_other_dataset_imports() -> None:
    headers = login_headers()
    employees_payload = (
        "employee_id,name,email,role,department,experience_years,skills,availability,utilization_pct,bench_since\n"
        "emp-777,Test Employee,test.employee@company.com,Engineer,Backend,4,Python|FastAPI,available,20,2026-07-01\n"
    ).encode("utf-8")
    project_payload = (
        "need_id,project_id,project_name,role_title,open_slots,required_skills,start_date,status,priority\n"
        "need-777,prj-777,Test Project,Backend Engineer,2,Python|SQL,2026-08-10,open,high\n"
    ).encode("utf-8")
    allocation_payload = (
        "allocation_id,employee_id,employee_name,project_id,project_name,role,start_date,end_date,outcome,notes\n"
        "alloc-777,emp-777,Test Employee,prj-777,Test Project,Backend Engineer,2026-08-12,,ongoing,Imported allocation\n"
    ).encode("utf-8")

    employee_response = client.post("/api/import/employees", headers=headers, files={"file": ("employees.csv", employees_payload, "text/csv")})
    assert employee_response.status_code == 200
    assert employee_response.json()["dataset"] == "employees"

    project_response = client.post("/api/import/project_needs", headers=headers, files={"file": ("project-needs.csv", project_payload, "text/csv")})
    assert project_response.status_code == 200
    assert project_response.json()["dataset"] == "project_needs"

    allocation_response = client.post(
        "/api/import/allocation_history",
        headers=headers,
        files={"file": ("allocations.csv", allocation_payload, "text/csv")},
    )
    assert allocation_response.status_code == 200
    assert allocation_response.json()["dataset"] == "allocation_history"


def test_skill_tags_crud() -> None:
    headers = login_headers()
    initial = client.get("/api/settings/skills", headers=headers)
    assert initial.status_code == 200
    base_count = len(initial.json())

    created = client.post("/api/settings/skills", headers=headers, json={"name": "Go", "category": "Backend"})
    assert created.status_code == 201
    created_body = created.json()
    assert created_body["name"] == "Go"
    skill_id = created_body["id"]

    updated = client.put(f"/api/settings/skills/{skill_id}", headers=headers, json={"name": "Golang", "category": "Backend"})
    assert updated.status_code == 200
    assert updated.json()["name"] == "Golang"

    deleted = client.delete(f"/api/settings/skills/{skill_id}", headers=headers)
    assert deleted.status_code == 204

    final = client.get("/api/settings/skills", headers=headers)
    assert final.status_code == 200
    assert len(final.json()) == base_count


def test_chat_query_returns_recommendations() -> None:
    headers = login_headers()
    response = client.post("/api/chat/query", headers=headers, json={"query": "Find a React developer", "strategy": "hybrid"})
    assert response.status_code == 200
    body = response.json()
    assert body["recommendations"]
    assert body["answer"]
    assert body["retrievalMode"] == "local"
    assert body["citations"]
    assert body["evidenceSnippets"]
    assert body["evidenceSnippets"][0].startswith("[")
    assert body["messageId"].startswith("msg-")


def test_chat_query_single_best_candidate_returns_one_result() -> None:
    headers = login_headers()
    response = client.post(
        "/api/chat/query",
        headers=headers,
        json={"query": "Give me a single best candidate for React", "strategy": "hybrid"},
    )
    assert response.status_code == 200
    body = response.json()
    assert len(body["recommendations"]) == 1
    assert "best candidate is" in body["answer"].lower()


def test_chat_query_uses_rag_context_for_project_specific_request() -> None:
    headers = login_headers()
    response = client.post(
        "/api/chat/query",
        headers=headers,
        json={"query": "Give me a single best candidate for Alpha Commerce Platform", "strategy": "hybrid"},
    )
    assert response.status_code == 200
    body = response.json()
    assert len(body["recommendations"]) == 1
    assert body["recommendations"][0]["employee"]["name"] == "John Doe"


def test_chat_query_honors_top_k_from_user_request() -> None:
    headers = login_headers()
    response = client.post(
        "/api/chat/query",
        headers=headers,
        json={"query": "Give me top 2 candidates with React and AWS", "strategy": "hybrid"},
    )
    assert response.status_code == 200
    body = response.json()
    assert len(body["recommendations"]) == 2


def test_rag_status_and_reindex_endpoints() -> None:
    headers = login_headers()

    status_response = client.get("/api/rag/status", headers=headers)
    assert status_response.status_code == 200
    status_body = status_response.json()
    assert status_body["mode"] == "hybrid"
    assert status_body["retrievalMode"] == "local"
    assert status_body["indexedChunks"] >= 1
    assert status_body["employeeChunks"] >= 1
    assert status_body["projectNeedChunks"] >= 1
    assert status_body["allocationChunks"] >= 1
    assert status_body["cloudConfigured"] is False

    reindex_response = client.post("/api/rag/reindex", headers=headers)
    assert reindex_response.status_code == 200
    reindex_body = reindex_response.json()
    assert reindex_body["status"] == "ok"
    assert reindex_body["indexedChunks"] == status_body["indexedChunks"]
    assert reindex_body["retrievalMode"] == "local"


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

    recommendations = client.post(
        "/api/recommendations",
        headers=headers,
        json={"requiredSkills": ["Docker", "Kubernetes"], "strategy": "hybrid"},
    )
    assert recommendations.status_code == 200
    rec_body = recommendations.json()
    assert all(item["employee"]["id"] != "emp-003" for item in rec_body["recommendations"])
