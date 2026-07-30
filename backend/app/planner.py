"""
QueryPlanner — uses a local (Ollama) or cloud (OpenAI/GitHub Models) LLM to extract
structured staffing intent from a free-text query, and to generate natural language answers.

Extracted intent:
  top_k      – how many candidates the user wants (1 for "give me one", etc.)
  skills     – list of skill names inferred from the query
  department – department filter if mentioned, else null
  strategy   – "skill_first" | "utilization_first" | "hybrid"

Falls back silently to None on any failure so the regex path in services.py
is always the safety net.
"""

from __future__ import annotations

import json
import logging
import re
from dataclasses import dataclass

import httpx

from .settings import Settings

logger = logging.getLogger(__name__)

_SYSTEM_PROMPT = """\
You are a staffing query parser for a bench allocation system.
Extract structured intent from the user's staffing query and return ONLY valid JSON.

JSON schema (all fields required):
{
  "is_staffing_query": <true if this is a staffing/HR/skills/availability question, false for greetings or unrelated chat>,
  "top_k": <integer, 1 if user wants a single/one result, 3 otherwise unless specified>,
  "skill_requirements": <list of {name: str, min_years: int} — set min_years to the number of years explicitly mentioned, or 0 if not mentioned>,
  "department": <department name string if explicitly mentioned, else null>,
  "strategy": <"skill_first" | "utilization_first" | "hybrid" based on query emphasis>
}

Rules:
- is_staffing_query=false for: greetings ("hi", "hello"), thanks, general questions not about staffing
- is_staffing_query=true for: skill searches, bench availability, project staffing, candidate queries
- top_k=1 for: "give me one", "just one", "single best", "one candidate", "best candidate", "top candidate"
- strategy="utilization_first" when user asks about availability/bench/idle engineers
- strategy="skill_first" when user asks about a specific skill, technology, or experience requirement
- strategy="hybrid" when both matter or neither is clear
- For queries like "3 years of PHP and 2 years of AWS": skill_requirements=[{name:"PHP",min_years:3},{name:"AWS",min_years:2}]
- For queries like "React developer": skill_requirements=[{name:"React",min_years:0}]
- Return ONLY the JSON object, no explanation or markdown.
"""

_ANSWER_SYSTEM_PROMPT = """\
You are Bench Allocator AI, a helpful staffing assistant for an engineering bench management system.

You will receive a "Matched candidates" list — these are the ONLY real candidates available for this query.
Write a concise, natural, professional response describing ONLY the candidates in that list.
Do NOT mention, invent, or infer any other names beyond what is explicitly listed.
Include relevant details such as skills, experience level, and availability for each listed candidate.
Do not repeat the user's question back. If no candidates were found, say so clearly and suggest the user
adjust their skill or experience requirements.

If the user's message is a greeting or general question (not about staffing), respond naturally and helpfully
as a conversational AI assistant. In that case you will receive an empty candidates list — that's expected.
"""


@dataclass
class QueryIntent:
    top_k: int
    skills: list[str]              # kept for backward compatibility (plain names)
    skill_requirements: list[dict] # [{name: str, min_years: int}]
    department: str | None
    strategy: str
    is_staffing_query: bool = True  # False for greetings / non-staffing messages


class QueryPlanner:
    """
    Calls a local Ollama instance or OpenAI chat completions to parse query intent.
    Returns None if LLM is unavailable or response cannot be parsed — caller falls back to regex.
    """

    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    @property
    def enabled(self) -> bool:
        return self._settings.llm_mode in ("local", "cloud", "github")

    def plan(self, query: str) -> QueryIntent | None:
        mode = self._settings.llm_mode.strip().lower()
        if mode == "local":
            return self._call_ollama(query)
        if mode == "cloud":
            return self._call_openai(query)
        if mode == "github":
            return self._call_github_models(query, system_prompt=_SYSTEM_PROMPT, json_mode=True)
        return None

    def generate_answer(
        self,
        *,
        query: str,
        candidate_summaries: list[str],
        evidence_snippets: list[str],
    ) -> str | None:
        """
        Generate a natural language answer using the LLM.
        Returns None when LLM is unavailable — caller should use a template fallback.
        """
        mode = self._settings.llm_mode.strip().lower()
        if mode not in ("local", "cloud", "github"):
            return None

        context_parts: list[str] = []
        if candidate_summaries:
            context_parts.append(
                f"Matched candidates ({len(candidate_summaries)} total — describe ONLY these):\n"
                + "\n".join(f"- {s}" for s in candidate_summaries)
            )
        else:
            context_parts.append("No candidates matched the query.")
        # Evidence snippets are intentionally excluded to prevent the LLM from
        # hallucinating candidate names that appear in RAG context but are not
        # in the actual recommendations list.

        user_content = f"User query: {query}\n\n{chr(10).join(context_parts)}"

        messages = [
            {"role": "system", "content": _ANSWER_SYSTEM_PROMPT},
            {"role": "user", "content": user_content},
        ]

        if mode == "local":
            return self._call_ollama_raw(messages)
        if mode == "cloud":
            return self._call_openai_raw(messages)
        if mode == "github":
            return self._call_github_models_raw(messages)
        return None

    # ── Ollama ────────────────────────────────────────────────────────────────

    def _call_ollama(self, query: str) -> QueryIntent | None:
        url = f"{self._settings.llm_local_url.rstrip('/')}/api/chat"
        payload = {
            "model": self._settings.llm_local_model,
            "stream": False,
            "messages": [
                {"role": "system", "content": _SYSTEM_PROMPT},
                {"role": "user", "content": query},
            ],
        }
        try:
            response = httpx.post(url, json=payload, timeout=self._settings.llm_timeout_seconds)
            response.raise_for_status()
            data = response.json()
            content = data.get("message", {}).get("content", "")
            return _parse_intent(content)
        except Exception as exc:  # noqa: BLE001
            logger.debug("Ollama planner failed (%s), falling back to regex", exc)
            return None

    def _call_ollama_raw(self, messages: list[dict]) -> str | None:
        url = f"{self._settings.llm_local_url.rstrip('/')}/api/chat"
        payload = {"model": self._settings.llm_local_model, "stream": False, "messages": messages}
        try:
            response = httpx.post(url, json=payload, timeout=self._settings.llm_timeout_seconds)
            response.raise_for_status()
            return response.json().get("message", {}).get("content", "").strip() or None
        except Exception as exc:  # noqa: BLE001
            logger.debug("Ollama answer generation failed (%s)", exc)
            return None

    # ── OpenAI chat completions ───────────────────────────────────────────────

    def _call_openai(self, query: str) -> QueryIntent | None:
        api_key = self._settings.llm_cloud_openai_api_key
        if not api_key:
            logger.debug("LLM mode=cloud but BACKEND_LLM_CLOUD_OPENAI_API_KEY is not set, skipping")
            return None
        payload = {
            "model": self._settings.llm_cloud_model,
            "messages": [
                {"role": "system", "content": _SYSTEM_PROMPT},
                {"role": "user", "content": query},
            ],
            "response_format": {"type": "json_object"},
        }
        try:
            response = httpx.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json=payload,
                timeout=self._settings.llm_timeout_seconds,
            )
            response.raise_for_status()
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            return _parse_intent(content)
        except Exception as exc:  # noqa: BLE001
            logger.debug("OpenAI planner failed (%s), falling back to regex", exc)
            return None

    def _call_openai_raw(self, messages: list[dict]) -> str | None:
        api_key = self._settings.llm_cloud_openai_api_key
        if not api_key:
            return None
        payload = {"model": self._settings.llm_cloud_model, "messages": messages}
        try:
            response = httpx.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json=payload,
                timeout=self._settings.llm_timeout_seconds,
            )
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"].strip() or None
        except Exception as exc:  # noqa: BLE001
            logger.debug("OpenAI answer generation failed (%s)", exc)
            return None

    # ── GitHub Models (Copilot-compatible) ────────────────────────────────────

    def _call_github_models(
        self, query: str, *, system_prompt: str, json_mode: bool = False
    ) -> QueryIntent | None:
        token = self._settings.llm_github_token
        if not token:
            logger.warning("LLM mode=github but BACKEND_LLM_GITHUB_TOKEN is not set, skipping")
            return None
        payload: dict = {
            "model": self._settings.llm_github_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": query},
            ],
        }
        # Note: json_mode is intentionally NOT sent — GitHub Models does not require it
        # and some models reject the parameter. The system prompt instructs JSON-only output.
        try:
            response = httpx.post(
                "https://models.inference.ai.azure.com/chat/completions",
                headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                json=payload,
                timeout=self._settings.llm_timeout_seconds,
            )
            response.raise_for_status()
            content = response.json()["choices"][0]["message"]["content"]
            return _parse_intent(content)
        except Exception as exc:  # noqa: BLE001
            logger.warning("GitHub Models planner failed (%s), falling back to regex", exc)
            return None

    def _call_github_models_raw(self, messages: list[dict]) -> str | None:
        token = self._settings.llm_github_token
        if not token:
            return None
        payload = {"model": self._settings.llm_github_model, "messages": messages}
        try:
            response = httpx.post(
                "https://models.inference.ai.azure.com/chat/completions",
                headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                json=payload,
                timeout=self._settings.llm_timeout_seconds,
            )
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"].strip() or None
        except Exception as exc:  # noqa: BLE001
            logger.warning("GitHub Models answer generation failed (%s)", exc)
            return None


# ── Helpers ────────────────────────────────────────────────────────────────────

def _parse_intent(content: str) -> QueryIntent | None:
    """Extract and validate JSON intent from LLM response text."""
    # Strip markdown code fences if present
    content = re.sub(r"```(?:json)?\s*", "", content).strip()
    try:
        raw = json.loads(content)
    except json.JSONDecodeError:
        # Try to find the first JSON object in the text
        match = re.search(r"\{.*\}", content, flags=re.DOTALL)
        if not match:
            return None
        try:
            raw = json.loads(match.group())
        except json.JSONDecodeError:
            return None

    top_k = raw.get("top_k")
    department = raw.get("department")
    strategy = raw.get("strategy", "hybrid")

    if not isinstance(top_k, int) or top_k < 1:
        return None
    if department is not None and not isinstance(department, str):
        department = None
    if strategy not in ("skill_first", "utilization_first", "hybrid"):
        strategy = "hybrid"

    # Support both new skill_requirements format and legacy skills list
    raw_skill_reqs = raw.get("skill_requirements")
    raw_skills = raw.get("skills")

    skill_requirements: list[dict] = []
    if isinstance(raw_skill_reqs, list):
        for item in raw_skill_reqs:
            if isinstance(item, dict) and isinstance(item.get("name"), str):
                skill_requirements.append({
                    "name": item["name"],
                    "min_years": int(item.get("min_years", 0) or 0),
                })
    elif isinstance(raw_skills, list):
        # Backward compat: convert plain skill list to skill_requirements
        skill_requirements = [
            {"name": s, "min_years": 0}
            for s in raw_skills
            if isinstance(s, str)
        ]

    # Derive the plain skills list for backward compat
    skills = [sr["name"] for sr in skill_requirements]

    is_staffing = bool(raw.get("is_staffing_query", True))

    return QueryIntent(
        top_k=max(1, top_k),
        skills=skills,
        skill_requirements=skill_requirements,
        department=department or None,
        strategy=strategy,
        is_staffing_query=is_staffing,
    )
