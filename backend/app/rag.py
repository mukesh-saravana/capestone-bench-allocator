from __future__ import annotations

import math
import re
from dataclasses import dataclass

import httpx

from .data import DatabaseStore
from .settings import Settings

_TOKEN_PATTERN = re.compile(r"[a-z0-9]+")
_VALID_MODES = {"local", "cloud", "hybrid"}


@dataclass(frozen=True)
class RagChunk:
    id: str
    source: str
    text: str
    department: str | None = None


@dataclass(frozen=True)
class RagContext:
    snippets: list[str]
    citations: list[str]
    mode: str


def _tokenize(value: str) -> set[str]:
    return set(_TOKEN_PATTERN.findall(value.lower()))


def _cosine_similarity(lhs: list[float], rhs: list[float]) -> float:
    if len(lhs) != len(rhs):
        raise RuntimeError("Embedding vector lengths do not match")
    dot_product = 0.0
    lhs_norm = 0.0
    rhs_norm = 0.0
    for lhs_item, rhs_item in zip(lhs, rhs):
        dot_product += lhs_item * rhs_item
        lhs_norm += lhs_item * lhs_item
        rhs_norm += rhs_item * rhs_item
    if lhs_norm == 0.0 or rhs_norm == 0.0:
        return 0.0
    return dot_product / (math.sqrt(lhs_norm) * math.sqrt(rhs_norm))


class RAGService:
    def __init__(self, *, store: DatabaseStore, settings: Settings) -> None:
        self._store = store
        self._settings = settings
        self._chunks: list[RagChunk] = []

    def refresh_index(self) -> None:
        self._chunks = self._build_chunks()

    def status(self) -> dict[str, object]:
        employee_chunks = sum(1 for chunk in self._chunks if chunk.source.startswith("employee:"))
        project_need_chunks = sum(1 for chunk in self._chunks if chunk.source.startswith("project_need:"))
        allocation_chunks = sum(1 for chunk in self._chunks if chunk.source.startswith("allocation:"))
        mode = self._settings.rag_mode.strip().lower()
        if mode not in _VALID_MODES:
            raise RuntimeError("Invalid BACKEND_RAG_MODE. Use one of: local, cloud, hybrid.")
        retrieval_mode = "cloud" if mode == "cloud" or (mode == "hybrid" and self._settings.rag_openai_api_key) else "local"
        return {
            "mode": mode,
            "retrievalMode": retrieval_mode,
            "indexedChunks": len(self._chunks),
            "employeeChunks": employee_chunks,
            "projectNeedChunks": project_need_chunks,
            "allocationChunks": allocation_chunks,
            "cloudConfigured": bool(self._settings.rag_openai_api_key),
        }

    def retrieve(self, *, query: str, department: str | None, top_k: int = 3) -> RagContext:
        mode = self._settings.rag_mode.strip().lower()
        if mode not in _VALID_MODES:
            raise RuntimeError("Invalid BACKEND_RAG_MODE. Use one of: local, cloud, hybrid.")
        if not self._chunks:
            self.refresh_index()

        candidate_chunks = self._filter_chunks(self._chunks, department=department)
        if not candidate_chunks:
            return RagContext(snippets=[], citations=[], mode="local")

        if mode == "local":
            ranked = self._rank_with_local_similarity(query, candidate_chunks)
            active_mode = "local"
        elif mode == "cloud":
            ranked = self._rank_with_cloud_embeddings(query, candidate_chunks)
            active_mode = "cloud"
        elif self._settings.rag_openai_api_key:
            ranked = self._rank_with_cloud_embeddings(query, candidate_chunks)
            active_mode = "cloud"
        else:
            ranked = self._rank_with_local_similarity(query, candidate_chunks)
            active_mode = "local"

        top_chunks = ranked[:top_k]
        return RagContext(
            snippets=[f"[{chunk.source}] {chunk.text}" for chunk, _score in top_chunks],
            citations=[chunk.source for chunk, _score in top_chunks],
            mode=active_mode,
        )

    def _build_chunks(self) -> list[RagChunk]:
        chunks: list[RagChunk] = []
        for employee in self._store.list_employees():
            skill_names = ", ".join(skill.skill.name for skill in employee.skills)
            chunks.append(
                RagChunk(
                    id=f"employee-{employee.id}",
                    source=f"employee:{employee.id}",
                    department=employee.department,
                    text=(
                        f"{employee.name} is a {employee.role} in {employee.department} with {employee.experienceYears} years of experience. "
                        f"Skills: {skill_names}. Availability: {employee.availability}. Utilization: {employee.utilizationPct}%."
                    ),
                )
            )

        for need in self._store.list_project_needs():
            chunks.append(
                RagChunk(
                    id=f"project-need-{need.id}",
                    source=f"project_need:{need.id}",
                    text=(
                        f"{need.projectName} needs {need.roleTitle} with skills {', '.join(need.requiredSkills)}. "
                        f"Open slots: {need.openSlots}. Priority: {need.priority}. Status: {need.status}."
                    ),
                )
            )

        departments_by_employee = {employee.id: employee.department for employee in self._store.list_employees()}
        for allocation in self._store.list_allocations():
            chunks.append(
                RagChunk(
                    id=f"allocation-{allocation.id}",
                    source=f"allocation:{allocation.id}",
                    department=departments_by_employee.get(allocation.employeeId),
                    text=(
                        f"{allocation.employeeName} worked as {allocation.role} on {allocation.projectName} "
                        f"from {allocation.startDate.isoformat()} to {(allocation.endDate.isoformat() if allocation.endDate else 'present')}. "
                        f"Outcome: {allocation.outcome}."
                    ),
                )
            )
        return chunks

    @staticmethod
    def _filter_chunks(chunks: list[RagChunk], *, department: str | None) -> list[RagChunk]:
        if not department:
            return chunks
        normalized_department = department.strip().lower()
        return [chunk for chunk in chunks if chunk.department and chunk.department.lower() == normalized_department]

    def _rank_with_local_similarity(self, query: str, chunks: list[RagChunk]) -> list[tuple[RagChunk, float]]:
        query_tokens = _tokenize(query)
        if not query_tokens:
            return [(chunk, 0.0) for chunk in chunks[:5]]

        scored: list[tuple[RagChunk, float]] = []
        for chunk in chunks:
            chunk_tokens = _tokenize(chunk.text)
            overlap = len(query_tokens & chunk_tokens)
            if overlap == 0:
                continue
            coverage = overlap / len(query_tokens)
            density = overlap / max(1, len(chunk_tokens))
            score = (coverage * 0.75) + (density * 0.25)
            scored.append((chunk, score))
        scored.sort(key=lambda item: item[1], reverse=True)
        return scored

    def _rank_with_cloud_embeddings(self, query: str, chunks: list[RagChunk]) -> list[tuple[RagChunk, float]]:
        api_key = self._settings.rag_openai_api_key
        if not api_key:
            raise RuntimeError("BACKEND_RAG_OPENAI_API_KEY is required when BACKEND_RAG_MODE=cloud.")

        seed_candidates = self._rank_with_local_similarity(query, chunks)
        selected_chunks = [chunk for chunk, _score in seed_candidates[:25]]
        if not selected_chunks:
            selected_chunks = chunks[:25]

        payload = {"model": self._settings.rag_openai_embedding_model, "input": [query, *(chunk.text for chunk in selected_chunks)]}
        try:
            response = httpx.post(
                "https://api.openai.com/v1/embeddings",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json=payload,
                timeout=self._settings.rag_cloud_timeout_seconds,
            )
        except httpx.HTTPError as exc:
            raise RuntimeError(f"Cloud embedding request failed: {exc}") from exc

        if response.status_code >= 400:
            raise RuntimeError(f"Cloud embedding request failed: {response.status_code} {response.text}")

        response_json = response.json()
        embeddings_data = response_json.get("data")
        if not isinstance(embeddings_data, list) or len(embeddings_data) != len(selected_chunks) + 1:
            raise RuntimeError("Cloud embedding response did not include expected vector count")

        query_vector = embeddings_data[0].get("embedding")
        if not isinstance(query_vector, list):
            raise RuntimeError("Cloud embedding response did not include query embedding")

        ranked: list[tuple[RagChunk, float]] = []
        for chunk, item in zip(selected_chunks, embeddings_data[1:]):
            chunk_vector = item.get("embedding")
            if not isinstance(chunk_vector, list):
                raise RuntimeError("Cloud embedding response contained an invalid chunk embedding")
            ranked.append((chunk, _cosine_similarity(query_vector, chunk_vector)))
        ranked.sort(key=lambda item: item[1], reverse=True)
        return ranked
