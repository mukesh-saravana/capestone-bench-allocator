# Capstone Bench Allocator

AI-powered resource allocation and bench management system with RAG-assisted recommendations and an analytics dashboard.

## What This Project Solves

Teams often struggle to:
- Match available engineers to project needs quickly
- Reduce bench time without manual effort
- Make allocation decisions using fragmented data

This project provides a decision-support assistant that uses relevant historical and skills data to suggest suitable allocations.

## Core Solution

The solution has two main parts:
- AI Assistant (RAG-based): answers staffing questions and recommends candidate resources
- Analytics Dashboard (SQL-based): shows utilization, bench trends, and allocation insights

## Key Features

- Skill-based resource recommendations
- Retrieval-augmented responses grounded in internal data
- Historical allocation context for better matching
- Bench and utilization analytics for managers
- Simple chat-style interaction for allocation queries
- Dataset import (CSV/XLSX) for candidates, employees, project needs, and allocation history

## MVP Data Inputs

- Employee data
- Project data
- Historical allocation data

## Implementation Phases

1. Data preparation
2. Build RAG pipeline
3. Retrieval and ranking
4. Recommendation logic
5. Dashboard development

## Repository Structure

- `project-starters/`: source reference PDFs for project brief and guidelines
- `docs/scope.md`: clear boundaries of what is included in MVP
- `docs/technical-design.md`: selected architecture pattern, stack, and system design
- `docs/DESIGN-PLAN.md`: detailed UI/UX plan and implementation roadmap
- `docs/rag-overview.md`: how RAG works in this app and why it matters
- `docs/dashboard-elements-and-data.md`: dashboard cards/charts and their data sources
- `frontend/`: React + Vite + TypeScript application (implemented MVP UI)
- `backend/`: FastAPI backend API scaffold for auth, chat, recommendations, dashboard, and allocations
- `backend/README.md`: detailed backend setup, tools install, environment, and API flow guide
- `docs/frontend-backend-integration-readme.md`: step-by-step frontend + backend integration setup
- `docs/settings-functionality-status.md`: current settings page feature status (working vs pending)
- `frontend/flow.md`: non-technical end-to-end frontend usage and behavior guide
- `README.md`: project overview and progress

## Success Criteria

- Recommendations are relevant to project needs and skills
- Allocation insights are easy to interpret from the dashboard
- Demo flow clearly shows business impact: better utilization and reduced bench time

## Suggested KPIs

- Recommendation relevance score (manual reviewer rating)
- Bench reduction trend over reporting periods
- Resource utilization improvement
- Time saved in staffing decisions

## High-Level Demo Flow

1. Upload or load employee, project, and allocation data
2. Ask staffing question in chat
3. Review top recommended candidates with reasoning
4. Validate metrics in the dashboard
5. Explain business impact using before/after comparison

## Current Status

The project has moved from planning into active implementation.

### Completed

- Frontend MVP implemented in `frontend/` using React + Vite + TypeScript + MUI v9
- Protected login flow and route-based app shell
- Screens delivered: Login, Dashboard, Chat Assistant, Recommendations, Settings
- Candidate Profile and Assignment Confirmation modals
- Loading, empty, and toast feedback states
- Modernized UI pass: dark-gradient sidebar, glass-style topbar, modern cards, smooth transitions
- Global motion system with page-level transitions and reduced-motion support (via `framer-motion`)
- Hybrid RAG-assisted chat and recommendation flow wired end-to-end
- RAG admin/status controls in Settings plus live RAG mode chip in the top bar
- Dashboard element/data documentation added for charts and summary cards
- Dashboard welcome banner with time-of-day greeting, live key stats, and staggered card entrance animations
- Redesigned Chat UI: AI avatar, animated message bubbles, asymmetric chat layout, animated empty state, live snapshot context panel, and "Pro Tips" card
- Sidebar user profile card showing logged-in user's name, role, and online indicator
- Extended MUI theme overrides: Dialog glassmorphism, Alert, LinearProgress, Tooltip, Skeleton, Divider, Select, Badge
- Clickable dashboard metric cards with animated "View details" affordance that open a drill-down detail drawer
- `DashboardDrawer` — contextual right-side drawer showing bench list, utilization breakdown, allocation feed, and employee/project detail views
- `DetailDrawer` — reusable right-side drawer shell (gradient header, back/close actions) used across dashboard and future screens
- `CandidateCard` whole-card click to open profile (button-level actions still stop propagation)
- Redesigned `ProfileModal`: dark gradient header, score circle with color-coded grade, "Best Match" chip for rank-1, proficiency bars for skills

### In Progress / Next

- Backend API and frontend are integrated for the core staffing workflow
- Optional cloud LLM planner can be added later for more advanced query understanding
- Persisted data and settings workflows can be extended further if needed

For a non-technical walkthrough, see: **`frontend/flow.md`**

## Backend Quick Start

From repository root:

```bash
cd backend
py -m pip install -r requirements.txt
py -m uvicorn app.main:app --reload --port 8000
```

### Backend hardening configuration

- Persistence is now DB-backed through SQLAlchemy.
- Default local DB (if unset): `sqlite:///./bench_allocator.db`
- Configure PostgreSQL with:

```bash
set BACKEND_DATABASE_URL=postgresql+psycopg://<user>:<password>@localhost:5432/bench_allocator
```

Available MVP endpoints:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/settings/skills`
- `POST /api/settings/skills`
- `PUT /api/settings/skills/{skill_id}`
- `DELETE /api/settings/skills/{skill_id}`
- `GET /api/employees`
- `GET /api/project-needs`
- `GET /api/allocation-history`
- `GET /api/data/summary`
- `POST /api/chat/query`
- `POST /api/recommendations`
- `GET /api/dashboard/bench`
- `GET /api/dashboard/utilization`
- `GET /api/dashboard/allocations`
- `GET /api/rag/status`
- `POST /api/rag/reindex`
- `POST /api/allocations`
- `POST /api/import/{dataset_key}` (`candidate_profiles`, `employees`, `project_needs`, `allocation_history`)
- `POST /api/import/candidates` (compatibility alias for candidate profiles)
- `GET /api/export/candidates`
- `GET /health`

## Setup Guides

- Backend setup (tools, env, run, testing, API flows): **`backend/README.md`**
- Frontend + backend integration setup (end-to-end): **`docs/frontend-backend-integration-readme.md`**
- Settings feature status (working vs pending): **`docs/settings-functionality-status.md`**

## Documentation Index

- `docs/scope.md` — MVP scope and boundaries
- `docs/technical-design.md` — architecture and implementation design
- `docs/rag-overview.md` — what RAG is and how it works in this app
- `docs/dashboard-elements-and-data.md` — dashboard cards, charts, and data sources
- `docs/frontend-backend-integration-readme.md` — how frontend and backend connect
- `docs/settings-functionality-status.md` — current settings page status

## Import Samples

Use these files to test dataset imports from the Settings page:

- `backend/samples/candidate-import-sample.csv`
- `backend/samples/candidate-import-sample.xlsx`
- `backend/samples/employees-import-sample.csv`
- `backend/samples/employees-import-sample.xlsx`
- `backend/samples/project-needs-import-sample.csv`
- `backend/samples/project-needs-import-sample.xlsx`
- `backend/samples/allocation-history-import-sample.csv`
- `backend/samples/allocation-history-import-sample.xlsx`
