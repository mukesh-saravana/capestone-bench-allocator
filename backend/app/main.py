from __future__ import annotations

from datetime import date
from uuid import uuid4

from fastapi import Cookie, Depends, FastAPI, Header, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware

from .data import store
from .models import (
    AllocationsSummary,
    AllocationHistory,
    AssignRequest,
    BenchMetrics,
    BenchTrendPoint,
    ChatQueryRequest,
    ChatQueryResponse,
    Employee,
    LoginRequest,
    LoginResponse,
    ProjectNeed,
    RecommendationRequest,
    RecommendationResponse,
    User,
    UtilizationDepartmentPoint,
    UtilizationMetrics,
    UtilizationTrendPoint,
)
from .services import recommend, recommend_from_query

app = FastAPI(title="Capstone Bench Allocator Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _extract_bearer_token(authorization: str | None) -> str | None:
    if not authorization:
        return None
    prefix = "bearer "
    if authorization.lower().startswith(prefix):
        return authorization[len(prefix) :].strip()
    return None


def get_current_user(
    authorization: str | None = Header(default=None),
    auth_token: str | None = Cookie(default=None),
) -> User:
    token = _extract_bearer_token(authorization) or auth_token
    user = store.get_user_by_token(token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    return user


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/auth/login", response_model=LoginResponse)
def login(payload: LoginRequest, response: Response) -> LoginResponse:
    if len(payload.password) < 4:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password must be at least 4 characters")

    user = store.users.get(payload.email)
    if not user:
        user = User(id=f"usr-{uuid4()}", name=payload.email.split("@")[0].title(), email=payload.email, role="resource_manager")
        store.users[payload.email] = user

    token = store.issue_token(payload.email)
    response.set_cookie("auth_token", token, httponly=True, samesite="lax")
    return LoginResponse(token=token, user=user)


@app.post("/api/auth/logout")
def logout(response: Response, authorization: str | None = Header(default=None), auth_token: str | None = Cookie(default=None)) -> dict[str, str]:
    token = _extract_bearer_token(authorization) or auth_token
    if token:
        store.revoke_token(token)
    response.delete_cookie("auth_token")
    return {"status": "ok"}


@app.get("/api/auth/me", response_model=User)
def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@app.get("/api/employees", response_model=list[Employee])
def list_employees(current_user: User = Depends(get_current_user)) -> list[Employee]:
    _ = current_user
    return list(store.employees.values())


@app.get("/api/project-needs", response_model=list[ProjectNeed])
def list_project_needs(current_user: User = Depends(get_current_user)) -> list[ProjectNeed]:
    _ = current_user
    return list(store.project_needs.values())


@app.get("/api/allocation-history", response_model=list[AllocationHistory])
def list_allocation_history(current_user: User = Depends(get_current_user)) -> list[AllocationHistory]:
    _ = current_user
    return store.allocations


@app.post("/api/chat/query", response_model=ChatQueryResponse)
def chat_query(payload: ChatQueryRequest, current_user: User = Depends(get_current_user)) -> ChatQueryResponse:
    recommendation_response = recommend_from_query(
        query=payload.query, strategy=payload.strategy, department=(payload.filters.department if payload.filters else None)
    )
    recommendations = recommendation_response.recommendations
    top_names = ", ".join(rec.employee.name for rec in recommendations[:3]) if recommendations else "No matching candidates"
    answer = f"For '{payload.query}', top candidates are: {top_names}."
    evidence = [snippet for rec in recommendations for snippet in rec.evidenceSnippets][:3]
    _ = current_user
    return ChatQueryResponse(
        answer=answer,
        recommendations=recommendations,
        evidenceSnippets=evidence,
        messageId=f"msg-{uuid4()}",
    )


@app.post("/api/recommendations", response_model=RecommendationResponse)
def recommendations(payload: RecommendationRequest, current_user: User = Depends(get_current_user)) -> RecommendationResponse:
    required_skills = payload.requiredSkills
    if payload.projectNeedId:
        need = store.project_needs.get(payload.projectNeedId)
        if not need:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project need not found")
        required_skills = need.requiredSkills

    _ = current_user
    return recommend(required_skills=required_skills, department=payload.department, strategy=payload.strategy, top_k=5)


@app.get("/api/dashboard/bench", response_model=BenchMetrics)
def bench_metrics(current_user: User = Depends(get_current_user)) -> BenchMetrics:
    _ = current_user
    by_department = store.get_bench_department_counts()
    return BenchMetrics(
        totalOnBench=sum(by_department.values()),
        trend=[
            BenchTrendPoint(date=date.fromisoformat("2026-06-24"), count=8),
            BenchTrendPoint(date=date.fromisoformat("2026-07-01"), count=7),
            BenchTrendPoint(date=date.fromisoformat("2026-07-08"), count=6),
            BenchTrendPoint(date=date.fromisoformat("2026-07-15"), count=5),
            BenchTrendPoint(date=date.fromisoformat("2026-07-22"), count=4),
        ],
        byDepartment=[{"department": department, "count": count} for department, count in sorted(by_department.items())],
    )


@app.get("/api/dashboard/utilization", response_model=UtilizationMetrics)
def utilization_metrics(current_user: User = Depends(get_current_user)) -> UtilizationMetrics:
    _ = current_user
    employees = list(store.employees.values())
    average_pct = round(sum(emp.utilizationPct for emp in employees) / len(employees))

    per_department: dict[str, list[int]] = {}
    for emp in employees:
        per_department.setdefault(emp.department, []).append(emp.utilizationPct)

    by_department = [
        UtilizationDepartmentPoint(department=department, pct=round(sum(values) / len(values)))
        for department, values in sorted(per_department.items())
    ]
    return UtilizationMetrics(
        averagePct=average_pct,
        trend=[
            UtilizationTrendPoint(date=date.fromisoformat("2026-06-24"), pct=68),
            UtilizationTrendPoint(date=date.fromisoformat("2026-07-01"), pct=70),
            UtilizationTrendPoint(date=date.fromisoformat("2026-07-08"), pct=73),
            UtilizationTrendPoint(date=date.fromisoformat("2026-07-15"), pct=74),
            UtilizationTrendPoint(date=date.fromisoformat("2026-07-22"), pct=76),
        ],
        byDepartment=by_department,
    )


@app.get("/api/dashboard/allocations", response_model=AllocationsSummary)
def allocation_summary(current_user: User = Depends(get_current_user)) -> AllocationsSummary:
    _ = current_user
    total = len(store.allocations)
    active = sum(1 for allocation in store.allocations if allocation.outcome == "ongoing")
    completed = sum(1 for allocation in store.allocations if allocation.outcome == "completed")
    return AllocationsSummary(
        totalAllocations=total,
        activeAllocations=active,
        completedAllocations=completed,
        recent=store.allocations[:5],
    )


@app.post("/api/allocations")
def create_allocation(payload: AssignRequest, current_user: User = Depends(get_current_user)):
    _ = current_user
    if payload.employeeId not in store.employees:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    if payload.projectNeedId not in store.project_needs:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project need not found")
    return store.create_allocation(
        employee_id=payload.employeeId,
        project_need_id=payload.projectNeedId,
        role=payload.role,
        start_date=payload.startDate,
        notes=payload.notes,
    )
