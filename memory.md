# Project Memory

This file stores durable project context so future prompts can continue with consistent decisions.

## Project Identity

- Project: Capstone Bench Allocator
- Goal: AI-assisted resource allocation and bench management with recommendations and analytics
- Stage: Implemented MVP with backend + frontend integration, hybrid RAG, and dashboard docs

## Chosen Architecture and Pattern

- Primary pattern: Modular Monolith
- Architecture style: Clean/Hexagonal Architecture
- Layers:
  - Presentation (React UI + API endpoints)
  - Application (use cases/orchestration)
  - Domain (entities, ranking rules)
  - Infrastructure (DB, retrieval index, LLM adapters, ingestion)

## Chosen Stack

- Frontend: React + TypeScript + Vite
- UI library: MUI
- State/data: React Query + Axios
- Charts: Recharts
- Backend: FastAPI (Python)
- RAG: backend-owned hybrid retrieval service with optional OpenAI embeddings
- LLM/Embeddings: OpenAI or Azure OpenAI (optional cloud planner/retrieval mode)
- Relational DB: SQLite for local dev, PostgreSQL for production-style setups
- Deployment: Docker Compose

## MVP Scope Snapshot

- Inputs: Employee, Project, Historical Allocation datasets
- Capabilities:
  - RAG-based staffing Q&A
  - Ranked candidate recommendations
  - Dashboard for bench/utilization/allocation metrics
  - RAG admin/status controls
- Constraints:
  - Human approval required (no fully automated final allocation)
  - Demo-ready MVP with live backend integration, not full production rollout

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
- `docs/rag-overview.md`: RAG behavior, data flow, and operational controls
- `docs/dashboard-elements-and-data.md`: dashboard cards/charts and their data sources
- `memory.md`: persistent project decisions and notes

## Current Known Next Steps

1. Optional cloud LLM planner for harder natural-language queries
2. Historical snapshotting if more accurate trend charts are needed
3. Production hardening (migrations, monitoring, stronger RBAC)

## Working Agreements for Future Prompts

- Preserve chosen architecture unless explicitly changed
- Preserve React + FastAPI + hybrid RAG direction
- Keep naming in lowercase kebab-case for new non-canonical files
- Keep documentation updates aligned with actual implementation changes
