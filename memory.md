# Project Memory

This file stores durable project context so future prompts can continue with consistent decisions.

## Project Identity

- Project: Capstone Bench Allocator
- Goal: AI-assisted resource allocation and bench management with recommendations and analytics
- Stage: Planning and architecture finalized; implementation folders not yet created

## Chosen Architecture and Pattern

- Primary pattern: Modular Monolith
- Architecture style: Clean/Hexagonal Architecture
- Layers:
  - Presentation (React UI + API endpoints)
  - Application (use cases/orchestration)
  - Domain (entities, ranking rules)
  - Infrastructure (DB, vector store, LLM adapters, ingestion)

## Chosen Stack

- Frontend: React + TypeScript + Vite
- UI library: MUI
- State/data: React Query + Axios
- Charts: Recharts
- Backend: FastAPI (Python)
- RAG framework: LlamaIndex or LangChain
- LLM/Embeddings: OpenAI or Azure OpenAI
- Relational DB: PostgreSQL
- Vector DB: Qdrant (or pgvector as alternative)
- Deployment: Docker Compose

## MVP Scope Snapshot

- Inputs: Employee, Project, Historical Allocation datasets
- Capabilities:
  - RAG-based staffing Q&A
  - Ranked candidate recommendations
  - Dashboard for bench/utilization/allocation metrics
- Constraints:
  - Human approval required (no fully automated final allocation)
  - Demo-ready MVP, not full production rollout

## Repository Naming Standards Applied

Based on common current repository/documentation conventions:
- Keep canonical file names uppercase where standard exists: `README.md`, `LICENSE`
- Use lowercase kebab-case for custom docs/files/folders
- Avoid spaces in file and directory names
- Group project documentation under `docs/`

## Renames Completed

- `projectStarters` -> `project-starters`
- `Scope.md` -> `docs/scope.md`
- `technical design.md` -> `docs/technical-design.md`

## Documentation Map

- `README.md`: project overview
- `docs/scope.md`: scope and boundaries
- `docs/technical-design.md`: architecture and technical design
- `memory.md`: persistent project decisions and notes

## Current Known Next Steps

1. Create implementation folder skeleton (`frontend/`, `backend/`, `data/`, optionally `infra/`)
2. Define API contracts from technical design
3. Build ingestion and normalization pipeline
4. Implement recommendation + explainability logic
5. Build React chat and dashboard UI

## Working Agreements for Future Prompts

- Preserve chosen architecture unless explicitly changed
- Preserve React + FastAPI + PostgreSQL + vector DB direction
- Keep naming in lowercase kebab-case for new non-canonical files
- Keep documentation updates aligned with actual implementation changes

