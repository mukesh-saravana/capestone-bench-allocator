"""
QueryPlanner — uses a local (Ollama) or cloud (OpenAI) LLM to extract structured
staffing intent from a free-text query.

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
  "top_k": <integer, 1 if user wants a single/one result, 3 otherwise unless specified>,
  "skills": <list of skill names mentioned or clearly implied, e.g. ["React", "TypeScript"]>,
  "department": <department name string if explicitly mentioned, else null>,
  "strategy": <"skill_first" | "utilization_first" | "hybrid" based on query emphasis>
}

Rules:
- top_k=1 for: "give me one", "just one", "single best", "one candidate", "best candidate", "top candidate"
- strategy="utilization_first" when user asks about availability/bench/idle engineers
- strategy="skill_first" when user asks about a specific skill or technology
- strategy="hybrid" when both matter or neither is clear
- Return ONLY the JSON object, no explanation or markdown.
"""


@dataclass
class QueryIntent:
    top_k: int
    skills: list[str]
    department: str | None
    strategy: str


class QueryPlanner:
    """
    Calls a local Ollama instance or OpenAI chat completions to parse query intent.
    Returns None if LLM is unavailable or response cannot be parsed — caller falls back to regex.
    """

    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    @property
    def enabled(self) -> bool:
        return self._settings.llm_mode in ("local", "cloud")

    def plan(self, query: str) -> QueryIntent | None:
        mode = self._settings.llm_mode.strip().lower()
        if mode == "local":
            return self._call_ollama(query)
        if mode == "cloud":
            return self._call_openai(query)
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
    skills = raw.get("skills")
    department = raw.get("department")
    strategy = raw.get("strategy", "hybrid")

    if not isinstance(top_k, int) or top_k < 1:
        return None
    if not isinstance(skills, list):
        skills = []
    if department is not None and not isinstance(department, str):
        department = None
    if strategy not in ("skill_first", "utilization_first", "hybrid"):
        strategy = "hybrid"

    return QueryIntent(
        top_k=max(1, top_k),
        skills=[s for s in skills if isinstance(s, str)],
        department=department or None,
        strategy=strategy,
    )
