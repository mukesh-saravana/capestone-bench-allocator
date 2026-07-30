from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime
import re

from .data import store
from .models import Recommendation, RecommendationResponse, ScoreBreakdown, Strategy


STRATEGY_WEIGHTS: dict[Strategy, tuple[float, float, float]] = {
    "skill_first": (0.65, 0.2, 0.15),
    "utilization_first": (0.45, 0.15, 0.4),
    "hybrid": (0.55, 0.2, 0.25),
}

MAX_SKILL_SCORE = 6.0
MAX_EXPERIENCE_SCORE = 2.5
MAX_AVAILABILITY_SCORE = 2.0


@dataclass
class SkillRequirement:
    """A skill with an optional minimum years-of-experience constraint."""
    name: str
    min_years: int = 0  # 0 = no year constraint


def _normalize_skill(skill: str) -> str:
    return skill.strip().lower()


def _find_canonical_skill(skill_name: str, known_skills: set[str]) -> str | None:
    """Case-insensitive lookup of a skill name against the known skill catalog."""
    skill_lower = skill_name.lower()
    for skill in known_skills:
        if skill.lower() == skill_lower:
            return skill
    return None


def _years_to_min_proficiency(years: int) -> int:
    """Map years of experience to minimum proficiency level (1-5 scale)."""
    if years <= 1:
        return 1
    if years <= 2:
        return 2
    if years <= 4:
        return 3
    if years <= 6:
        return 4
    return 5


def _looks_like_skill(name: str) -> bool:
    """Heuristic: does this token look like a technology/skill name vs. a common English word?"""
    if len(name) < 2:
        return False
    # Contains at least one uppercase letter or tech-typical special char / digit
    return bool(re.search(r"[A-Z]", name)) or bool(re.search(r"[.#+\d]", name))


def _parse_skill_requirements(query: str) -> list[SkillRequirement]:
    """
    Parse NLP query into structured skill requirements.

    Handles patterns such as:
      - "3 years of PHP skill"
      - "PHP with 2 years of experience"
      - "candidate with 3 years of PHP and 2 years of AWS"

    When year-based patterns are detected, the effective skill name is always
    recorded (using the canonical catalog name when available, or the literal
    string otherwise).  This ensures that unknown skills produce zero results
    in strict all-match mode instead of silently falling back to an
    unfiltered search.

    Falls back to plain skill name extraction only when no year patterns are
    found at all.
    """
    known_skills: set[str] = {
        s.skill.name for emp in store.employees.values() for s in emp.skills
    }
    requirements: dict[str, SkillRequirement] = {}
    year_patterns_found = False

    _NOISE_WORDS = {
        "skill", "skills", "experience", "expertise", "knowledge", "proficiency",
        "the", "a", "an", "my", "your", "his", "her", "their", "its",
        "work", "working", "exposure", "background",
    }

    # Pattern 1: "N years of SKILL [skill/experience]"
    for match in re.finditer(
        r"(\d+)\s+years?\s+(?:of\s+)?([A-Za-z][\w.+#-]*)",
        query,
        re.IGNORECASE,
    ):
        years = int(match.group(1))
        raw_name = match.group(2).rstrip(".")
        if raw_name.lower() in _NOISE_WORDS:
            continue
        canonical = _find_canonical_skill(raw_name, known_skills)
        # Only accept the raw name when it looks like a genuine skill token
        if not canonical and not _looks_like_skill(raw_name):
            continue
        year_patterns_found = True
        effective_name = canonical or raw_name
        key = effective_name.lower()
        if key not in requirements or requirements[key].min_years < years:
            requirements[key] = SkillRequirement(name=effective_name, min_years=years)

    # Pattern 2: known "SKILL with N years" — restricted to catalog names to avoid false positives
    for known_skill in sorted(known_skills, key=len, reverse=True):
        m = re.search(
            r"\b" + re.escape(known_skill) + r"\b\s+(?:with\s+)?(\d+)\s+years?",
            query,
            re.IGNORECASE,
        )
        if m:
            years = int(m.group(1))
            year_patterns_found = True
            key = known_skill.lower()
            if key not in requirements or requirements[key].min_years < years:
                requirements[key] = SkillRequirement(name=known_skill, min_years=years)

    # Return immediately when year patterns were found (even if some skills are unknown)
    if year_patterns_found:
        return list(requirements.values())

    # Fallback: plain skill name extraction (no year constraint)
    for skill in _extract_known_skills(query):
        if skill.lower() not in requirements:
            requirements[skill.lower()] = SkillRequirement(name=skill, min_years=0)

    return list(requirements.values())


def _extract_known_skills(query: str) -> list[str]:
    query_lower = query.lower()
    known = {employee_skill.skill.name for emp in store.employees.values() for employee_skill in emp.skills}
    return [skill for skill in sorted(known) if skill.lower() in query_lower]


def _extract_skills_from_text(text: str, *, known_skills: set[str]) -> list[str]:
    text_lower = text.lower()
    found: set[str] = set()
    for skill in known_skills:
        if skill.lower() in text_lower:
            found.add(skill)

    for match in re.finditer(r"skills?[:\s]+([^.;]+)", text, flags=re.IGNORECASE):
        for token in re.split(r"[,\|/]| and ", match.group(1)):
            normalized = token.strip().strip(" .")
            if not normalized:
                continue
            for skill in known_skills:
                if skill.lower() == normalized.lower():
                    found.add(skill)

    return sorted(found)


def _extract_skills_from_snippets(snippets: list[str]) -> list[str]:
    known = {employee_skill.skill.name for emp in store.employees.values() for employee_skill in emp.skills}
    discovered: set[str] = set()
    for snippet in snippets:
        for skill in _extract_skills_from_text(snippet, known_skills=known):
            discovered.add(skill)
    return sorted(discovered)


def _extract_skills_from_project_names(query: str) -> list[str]:
    query_lower = query.lower()
    discovered: set[str] = set()
    for need in store.list_project_needs():
        if need.projectName.lower() in query_lower or need.roleTitle.lower() in query_lower:
            for skill in need.requiredSkills:
                discovered.add(skill)
    return sorted(discovered)


def _infer_top_k(query: str, default: int = 3) -> int:
    query_lower = query.lower()
    if any(marker in query_lower for marker in (
        "single best", "best candidate", "single candidate", "one best", "top candidate", "first candidate",
        "give me one", "show me one", "find me one", "get me one", "just one", "one candidate",
    )):
        return 1
    if re.search(r"\bonly one\b", query_lower):
        return 1
    if re.search(r"\bgive\s+me\s+a\s+(?:single|one)\b", query_lower):
        return 1
    match = re.search(r"\btop\s+(\d+)\b", query_lower)
    if match:
        return max(1, int(match.group(1)))
    return default


def _infer_department(_: str, __: list[str], explicit_department: str | None) -> str | None:
    return explicit_department


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
    skill_requirements: list[SkillRequirement] | None = None,
    department: str | None,
    strategy: Strategy,
    top_k: int = 5,
) -> RecommendationResponse:
    """
    Return ranked candidates.

    When *skill_requirements* is supplied the engine uses **strict** matching:
    the candidate must possess **every** listed skill and meet the minimum
    proficiency inferred from the requested years of experience.

    When only *required_skills* is supplied the legacy **any-match** behaviour
    is preserved (candidate needs at least one of the skills).
    """
    skill_weight, experience_weight, availability_weight = STRATEGY_WEIGHTS[strategy]

    # Build the effective requirement map for strict-mode queries
    use_strict = skill_requirements is not None and len(skill_requirements) > 0
    req_map: dict[str, SkillRequirement] = (
        {_normalize_skill(r.name): r for r in skill_requirements}
        if use_strict else {}
    )
    required_skill_set = {_normalize_skill(skill) for skill in (required_skills or [])}

    recommendations: list[Recommendation] = []
    for employee in store.employees.values():
        if department and employee.department.lower() != department.lower():
            continue
        if employee.availability in {"allocated", "on_leave", "exiting"}:
            continue

        skill_map = {_normalize_skill(entry.skill.name): entry.proficiency for entry in employee.skills}

        if use_strict:
            # Candidate MUST have ALL required skills at the minimum proficiency
            matched_keys: list[str] = []
            all_matched = True
            for req_key, req in req_map.items():
                if req_key not in skill_map:
                    all_matched = False
                    break
                if req.min_years > 0 and skill_map[req_key] < _years_to_min_proficiency(req.min_years):
                    all_matched = False
                    break
                matched_keys.append(req_key)
            if not all_matched:
                continue
            average_proficiency = sum(skill_map[k] for k in matched_keys) / len(matched_keys) if matched_keys else 3.0
            skill_score = min(6.0, average_proficiency * 1.2)
            matched = matched_keys
        elif required_skill_set:
            # Legacy: any skill match is enough
            matched = [skill for skill in required_skill_set if skill in skill_map]
            if not matched:
                continue
            average_proficiency = sum(skill_map[skill] for skill in matched) / len(required_skill_set)
            skill_score = min(6.0, average_proficiency * (len(matched) / len(required_skill_set)) * 1.2)
        else:
            # No skill filter: return all available candidates
            matched = []
            skill_score = 3.0

        experience_score = min(MAX_EXPERIENCE_SCORE, (employee.experienceYears / 8.0) * MAX_EXPERIENCE_SCORE)
        availability_score = _availability_score(employee.availability, employee.utilizationPct)

        # Normalize each component to 0-1 before applying strategy weights,
        # then scale back to a 0-10 total score.
        skill_weighted = (skill_score / MAX_SKILL_SCORE) * skill_weight * 10
        experience_weighted = (experience_score / MAX_EXPERIENCE_SCORE) * experience_weight * 10
        availability_weighted = (availability_score / MAX_AVAILABILITY_SCORE) * availability_weight * 10
        total = round(
            skill_weighted + experience_weighted + availability_weighted,
            2,
        )

        reasons = []
        if matched:
            reasons.append(f"Matched skills: {', '.join(sorted(skill.title() for skill in matched))}")
        if use_strict:
            for req in skill_requirements:  # type: ignore[union-attr]
                norm = _normalize_skill(req.name)
                if req.min_years > 0 and norm in skill_map:
                    actual_prof = skill_map[norm]
                    reasons.append(
                        f"{req.name}: proficiency {actual_prof}/5 "
                        f"(>={req.min_years}yr requirement met)"
                    )
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
                    skillMatch=round(skill_weighted, 2),
                    projectExperience=round(experience_weighted, 2),
                    availability=round(availability_weighted, 2),
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


def recommend_from_query(
    *,
    query: str,
    strategy: Strategy,
    department: str | None,
    evidence_snippets: list[str] | None = None,
    planner: object | None = None,
    precomputed_intent: object | None = None,
) -> RecommendationResponse:
    # Try LLM-based intent extraction first
    if planner is not None:
        from .planner import QueryPlanner, QueryIntent  # noqa: PLC0415
        if isinstance(planner, QueryPlanner) and planner.enabled:
            intent: QueryIntent | None = (
                precomputed_intent  # type: ignore[assignment]
                if isinstance(precomputed_intent, QueryIntent)
                else planner.plan(query)
            )
            if intent is not None:
                # Build SkillRequirement list from LLM intent
                skill_reqs: list[SkillRequirement] = [
                    SkillRequirement(name=sr["name"], min_years=int(sr.get("min_years", 0) or 0))
                    for sr in (intent.skill_requirements or [])
                    if isinstance(sr, dict) and sr.get("name")
                ]
                if not skill_reqs and intent.skills:
                    skill_reqs = [SkillRequirement(name=s, min_years=0) for s in intent.skills]
                # Always use strict all-match from LLM — every listed skill must be present
                return recommend(
                    required_skills=None,
                    skill_requirements=skill_reqs or None,
                    department=intent.department or department,
                    strategy=intent.strategy,  # type: ignore[arg-type]
                    top_k=intent.top_k,
                )

    # Fallback: NLP regex-based intent extraction
    snippets = evidence_snippets or []
    skill_reqs = _parse_skill_requirements(query)

    # Enrich with project-name and snippet skills when no year-specific pattern was found
    if not skill_reqs or not any(r.min_years > 0 for r in skill_reqs):
        extra_skills = _extract_skills_from_project_names(query)
        extra_skills.extend(s for s in _extract_skills_from_snippets(snippets) if s not in extra_skills)
        known_keys = {r.name.lower() for r in skill_reqs}
        for s in extra_skills:
            if s.lower() not in known_keys:
                skill_reqs.append(SkillRequirement(name=s, min_years=0))

    inferred_department = _infer_department(query, snippets, department)
    top_k = _infer_top_k(query)

    has_year_reqs = any(r.min_years > 0 for r in skill_reqs)

    if has_year_reqs:
        # Use strict all-match with proficiency filter when years are specified
        return recommend(
            required_skills=None,
            skill_requirements=skill_reqs,
            department=inferred_department,
            strategy=strategy,
            top_k=top_k,
        )
    elif skill_reqs:
        # Use strict all-match even without year constraints so that multi-skill
        # queries (e.g. "PHP and AWS") require the candidate to have ALL skills.
        return recommend(
            required_skills=None,
            skill_requirements=skill_reqs,
            department=inferred_department,
            strategy=strategy,
            top_k=top_k,
        )
    else:
        # No skill filter: return all available candidates (e.g., "who's on the bench?")
        return recommend(
            required_skills=None,
            skill_requirements=None,
            department=inferred_department,
            strategy=strategy,
            top_k=top_k,
        )
