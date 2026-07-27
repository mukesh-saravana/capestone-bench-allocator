from __future__ import annotations

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field


AvailabilityStatus = Literal["available", "allocated", "on_leave", "exiting"]
Priority = Literal["high", "medium", "low"]
ProjectStatus = Literal["active", "upcoming", "completed", "on_hold"]
AllocationOutcome = Literal["completed", "transferred", "early_exit", "ongoing"]
UserRole = Literal["admin", "resource_manager", "delivery_manager", "project_lead"]
Strategy = Literal["skill_first", "utilization_first", "hybrid"]


class Skill(BaseModel):
    id: str
    name: str
    category: str


class EmployeeSkill(BaseModel):
    skill: Skill
    proficiency: Literal[1, 2, 3, 4, 5]


class Employee(BaseModel):
    id: str
    name: str
    email: str
    role: str
    department: str
    experienceYears: int
    availability: AvailabilityStatus
    utilizationPct: int = Field(ge=0, le=100)
    benchSince: date | None = None
    interviewScore: int | None = Field(default=None, ge=0, le=100)
    interviewResult: str | None = None
    skills: list[EmployeeSkill]
    avatar: str | None = None


class Project(BaseModel):
    id: str
    name: str
    description: str | None = None
    status: ProjectStatus
    startDate: date | None = None
    endDate: date | None = None
    priority: Priority


class ProjectNeed(BaseModel):
    id: str
    projectId: str
    projectName: str
    roleTitle: str
    openSlots: int
    requiredSkills: list[str]
    startDate: date | None = None
    status: Literal["open", "filled", "cancelled"]
    priority: Priority


class AllocationHistory(BaseModel):
    id: str
    employeeId: str
    employeeName: str
    projectId: str
    projectName: str
    role: str
    startDate: date
    endDate: date | None = None
    outcome: AllocationOutcome
    notes: str | None = None


class ScoreBreakdown(BaseModel):
    skillMatch: float
    projectExperience: float
    availability: float
    historicalFit: float | None = None


class Recommendation(BaseModel):
    id: str
    employee: Employee
    rank: int
    score: float
    scoreBreakdown: ScoreBreakdown
    reasons: list[str]
    evidenceSnippets: list[str] = []


class BenchTrendPoint(BaseModel):
    date: date
    count: int


class BenchDepartmentPoint(BaseModel):
    department: str
    count: int


class BenchMetrics(BaseModel):
    totalOnBench: int
    trend: list[BenchTrendPoint]
    byDepartment: list[BenchDepartmentPoint]


class UtilizationTrendPoint(BaseModel):
    date: date
    pct: int


class UtilizationDepartmentPoint(BaseModel):
    department: str
    pct: int


class UtilizationMetrics(BaseModel):
    averagePct: int
    trend: list[UtilizationTrendPoint]
    byDepartment: list[UtilizationDepartmentPoint]


class User(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    token: str
    user: User


class ChatFilters(BaseModel):
    skills: list[str] | None = None
    department: str | None = None


class ChatQueryRequest(BaseModel):
    query: str
    strategy: Strategy = "hybrid"
    filters: ChatFilters | None = None


class ChatQueryResponse(BaseModel):
    answer: str
    recommendations: list[Recommendation]
    evidenceSnippets: list[str]
    messageId: str


class RecommendationRequest(BaseModel):
    projectNeedId: str | None = None
    requiredSkills: list[str] | None = None
    department: str | None = None
    strategy: Strategy = "hybrid"


class RecommendationResponse(BaseModel):
    recommendations: list[Recommendation]
    generatedAt: datetime


class AssignRequest(BaseModel):
    employeeId: str
    projectNeedId: str
    role: str
    startDate: date
    notes: str | None = None


class AllocationsSummary(BaseModel):
    totalAllocations: int
    activeAllocations: int
    completedAllocations: int
    recent: list[AllocationHistory]


class DataSetSummary(BaseModel):
    key: str
    label: str
    rows: int
    lastUpdated: str
    importEnabled: bool = False


class CandidateImportResult(BaseModel):
    imported: int
    updated: int
    skipped: int
    sourceFile: str
    dataset: str = "candidate_profiles"


class SkillTag(BaseModel):
    id: str
    name: str
    category: str
    usage: int = 0


class SkillTagCreateRequest(BaseModel):
    name: str
    category: str


class SkillTagUpdateRequest(BaseModel):
    name: str
    category: str
