from __future__ import annotations

from datetime import UTC, datetime

from .data import store
from .models import Recommendation, RecommendationResponse, ScoreBreakdown, Strategy


STRATEGY_WEIGHTS: dict[Strategy, tuple[float, float, float]] = {
    "skill_first": (0.65, 0.2, 0.15),
    "utilization_first": (0.45, 0.15, 0.4),
    "hybrid": (0.55, 0.2, 0.25),
}


def _normalize_skill(skill: str) -> str:
    return skill.strip().lower()


def _extract_known_skills(query: str) -> list[str]:
    query_lower = query.lower()
    known = {employee_skill.skill.name for emp in store.employees.values() for employee_skill in emp.skills}
    return [skill for skill in sorted(known) if skill.lower() in query_lower]


def _availability_score(availability: str, utilization_pct: int) -> float:
    if availability == "available":
        return 2.0 if utilization_pct <= 20 else 1.6
    if availability == "allocated":
        return 0.8 if utilization_pct < 80 else 0.4
    if availability == "on_leave":
        return 0.1
    return 0.0


def recommend(
    *,
    required_skills: list[str] | None,
    department: str | None,
    strategy: Strategy,
    top_k: int = 5,
) -> RecommendationResponse:
    required_skill_set = {_normalize_skill(skill) for skill in (required_skills or [])}
    skill_weight, experience_weight, availability_weight = STRATEGY_WEIGHTS[strategy]

    recommendations: list[Recommendation] = []
    for employee in store.employees.values():
        if department and employee.department.lower() != department.lower():
            continue
        if employee.availability in {"on_leave", "exiting"}:
            continue

        skill_map = {_normalize_skill(entry.skill.name): entry.proficiency for entry in employee.skills}
        if required_skill_set:
            matched = [skill for skill in required_skill_set if skill in skill_map]
            if not matched:
                continue
            average_proficiency = sum(skill_map[skill] for skill in matched) / len(required_skill_set)
            skill_score = min(6.0, average_proficiency * (len(matched) / len(required_skill_set)) * 1.2)
        else:
            matched = []
            skill_score = 3.0

        experience_score = min(2.5, (employee.experienceYears / 8.0) * 2.5)
        availability_score = _availability_score(employee.availability, employee.utilizationPct)
        total = round(
            (skill_score * skill_weight) + (experience_score * experience_weight) + (availability_score * availability_weight),
            2,
        )

        reasons = []
        if matched:
            reasons.append(f"Matched skills: {', '.join(sorted(skill.title() for skill in matched))}")
        reasons.append(f"{employee.experienceYears} years relevant experience")
        if employee.availability == "available":
            reasons.append("Currently on bench and immediately available")
        else:
            reasons.append(f"Current utilization at {employee.utilizationPct}%")

        evidence = []
        for allocation in store.allocations:
            if allocation.employeeId == employee.id:
                period = f"{allocation.startDate.isoformat()} to {(allocation.endDate.isoformat() if allocation.endDate else 'present')}"
                evidence.append(f"{allocation.role} on {allocation.projectName} ({period})")
                break

        recommendations.append(
            Recommendation(
                id=f"rec-{employee.id}",
                rank=0,
                score=total,
                scoreBreakdown=ScoreBreakdown(
                    skillMatch=round(skill_score, 2),
                    projectExperience=round(experience_score, 2),
                    availability=round(availability_score, 2),
                ),
                reasons=reasons,
                evidenceSnippets=evidence,
                employee=employee,
            )
        )

    recommendations.sort(key=lambda rec: rec.score, reverse=True)
    for idx, rec in enumerate(recommendations, start=1):
        rec.rank = idx

    return RecommendationResponse(recommendations=recommendations[:top_k], generatedAt=datetime.now(UTC))


def recommend_from_query(*, query: str, strategy: Strategy, department: str | None) -> RecommendationResponse:
    inferred_skills = _extract_known_skills(query)
    return recommend(required_skills=inferred_skills or ["React"], department=department, strategy=strategy, top_k=3)
