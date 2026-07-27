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
- `frontend/`: React + Vite + TypeScript application (implemented MVP UI)
- `backend/`: FastAPI backend API scaffold for auth, chat, recommendations, dashboard, and allocations
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

- Frontend MVP implemented in `frontend/` using React + Vite + TypeScript + MUI
- Protected login flow and route-based app shell
- Screens delivered: Login, Dashboard, Chat Assistant, Recommendations, Settings
- Candidate Profile and Assignment Confirmation modals
- Loading, empty, and toast feedback states
- Modernized UI pass: dark-gradient sidebar, glass-style topbar, modern cards, smooth transitions
- Global motion system with page-level transitions and reduced-motion support

### In Progress / Next

- Backend API scaffold implemented (`backend/app/main.py`) and ready for frontend integration
- RAG service hookup for live chat/recommendation responses
- Persisted data and settings workflows

For a non-technical walkthrough, see: **`frontend/flow.md`**

## Backend Quick Start

From repository root:

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

Available MVP endpoints:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/employees`
- `GET /api/project-needs`
- `GET /api/allocation-history`
- `POST /api/chat/query`
- `POST /api/recommendations`
- `GET /api/dashboard/bench`
- `GET /api/dashboard/utilization`
- `GET /api/dashboard/allocations`
- `POST /api/allocations`
- `GET /health`
