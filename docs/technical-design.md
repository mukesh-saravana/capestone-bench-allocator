# Technical Design - Capstone Bench Allocator

## 1. Purpose

Define the technical architecture and implementation design for an AI-powered bench allocation and resource recommendation system using a React UI and a Python AI/backend stack.

## 2. Chosen Architecture Pattern

We will use a **Modular Monolith** with **Clean (Hexagonal) Architecture**.

Why this pattern:
- Fast to build and demo for MVP
- Clear separation between business logic and external tools (LLM, DB, retrieval/indexing)
- Easy to evolve into microservices later if scale requires it

Layers:
1. **Presentation Layer** - React UI and HTTP API endpoints
2. **Application Layer** - Use-case orchestration
3. **Domain Layer** - Core entities and ranking rules
4. **Infrastructure Layer** - Database, retrieval index, LLM adapters, ingestion, logging

## 3. Chosen Technology Stack

### Frontend
- React + TypeScript + Vite
- UI: MUI
- Data fetching/state: React Query + Axios
- Charts: Recharts

### Backend and AI
- FastAPI (Python)
- Hybrid RAG orchestration: backend-owned retrieval service
- LLM/embeddings: OpenAI or Azure OpenAI (optional cloud mode)
- Relational DB: SQLite for local dev, PostgreSQL for production-style setups
- Retrieval index: in-memory/local lexical chunks with optional cloud embedding fallback

### Platform
- Docker Compose for local/development deployment
- Optional reverse proxy: Nginx

## 4. High-Level Component Design

## Frontend (React)
- **Chat Module**: Ask staffing questions and view recommendations with reasoning
- **Recommendations Module**: Ranked candidates with filters and explanation columns
- **Dashboard Module**: Bench status, utilization trends, allocation summaries
- **API Client Module**: Typed hooks for backend endpoints

## Backend (FastAPI)
- **API Router**: REST endpoints for chat, recommendations, dashboard metrics
- **Use Cases**:
  - `AskStaffingQuestion`
  - `RecommendCandidates`
  - `GetBenchMetrics`
  - `GetUtilizationMetrics`
- **Domain Services**:
  - Ranking service
  - Skill normalization service
  - Explainability service
- **Repositories**:
  - Employee repository
  - Project repository
  - Allocation history repository
- **RAG Service**:
  - Retrieval + context builder + query planning + answer generation

## Data Stores
- SQLite/PostgreSQL for transactional and analytical base data
- In-memory retrieval index for local RAG mode

## 5. Domain Model (Core Entities)

- **Employee**: id, name, role, skills, experience, availability, utilization
- **ProjectNeed**: id, project_name, required_skills, priority, start_date
- **AllocationHistory**: employee_id, project_id, role, start_date, end_date, outcome
- **Recommendation**: request_id, employee_id, score, reasons, rank

## 5a. Database Schema (PostgreSQL)

All tables use UUID primary keys and `created_at` / `updated_at` audit columns.

```sql
-- Users (authentication)
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       TEXT UNIQUE NOT NULL,
    name        TEXT NOT NULL,
    role        TEXT NOT NULL CHECK (role IN ('admin', 'resource_manager', 'delivery_manager', 'project_lead')),
    password_hash TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Employees (resource pool)
CREATE TABLE employees (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    email           TEXT UNIQUE NOT NULL,
    role            TEXT NOT NULL,          -- e.g. "Senior Engineer", "Tech Lead"
    department      TEXT NOT NULL,
    experience_years INT NOT NULL DEFAULT 0,
    availability    TEXT NOT NULL CHECK (availability IN ('available', 'allocated', 'on_leave', 'exiting')),
    utilization_pct INT NOT NULL DEFAULT 0 CHECK (utilization_pct BETWEEN 0 AND 100),
    bench_since     DATE,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Skills (normalized tag catalogue)
CREATE TABLE skills (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT UNIQUE NOT NULL,
    category    TEXT NOT NULL,             -- e.g. "Frontend", "Cloud", "Database"
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- Employee ↔ Skill (many-to-many with proficiency)
CREATE TABLE employee_skills (
    employee_id     UUID REFERENCES employees(id) ON DELETE CASCADE,
    skill_id        UUID REFERENCES skills(id) ON DELETE CASCADE,
    proficiency     INT NOT NULL DEFAULT 3 CHECK (proficiency BETWEEN 1 AND 5),
    PRIMARY KEY (employee_id, skill_id)
);

-- Projects
CREATE TABLE projects (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    description     TEXT,
    status          TEXT NOT NULL CHECK (status IN ('active', 'upcoming', 'completed', 'on_hold')),
    start_date      DATE,
    end_date        DATE,
    priority        TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Project open needs (open slots to fill)
CREATE TABLE project_needs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID REFERENCES projects(id) ON DELETE CASCADE,
    role_title      TEXT NOT NULL,
    open_slots      INT NOT NULL DEFAULT 1,
    required_skills TEXT[] NOT NULL DEFAULT '{}',  -- denormalized for fast querying
    start_date      DATE,
    status          TEXT NOT NULL CHECK (status IN ('open', 'filled', 'cancelled')),
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Allocation history
CREATE TABLE allocation_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id     UUID REFERENCES employees(id),
    project_id      UUID REFERENCES projects(id),
    role            TEXT NOT NULL,
    start_date      DATE NOT NULL,
    end_date        DATE,
    outcome         TEXT CHECK (outcome IN ('completed', 'transferred', 'early_exit', 'ongoing')),
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Recommendation requests and results (audit trail)
CREATE TABLE recommendation_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requested_by    UUID REFERENCES users(id),
    project_need_id UUID REFERENCES project_needs(id),
    query_text      TEXT NOT NULL,
    strategy        TEXT NOT NULL DEFAULT 'hybrid' CHECK (strategy IN ('skill_first', 'utilization_first', 'hybrid')),
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE recommendation_results (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id      UUID REFERENCES recommendation_requests(id) ON DELETE CASCADE,
    employee_id     UUID REFERENCES employees(id),
    rank            INT NOT NULL,
    score           NUMERIC(4,2) NOT NULL,
    score_breakdown JSONB,                 -- e.g. {"skill_match": 6.0, "experience": 2.2, "availability": 1.0}
    reasons         TEXT[] NOT NULL,
    evidence_snippets TEXT[],
    created_at      TIMESTAMPTZ DEFAULT now()
);
```

**Key design notes:**
- `employee_skills` uses a proficiency 1–5 scale matching the UI star rating
- `project_needs.required_skills` is a denormalized array for fast skill-matching queries; the normalized join via `employee_skills` is used for scoring
- `recommendation_results.score_breakdown` stores the weighted sub-scores as JSONB so the explainability layer can surface them without recomputing
- All allocation writes go through `allocation_history` — the `employees.availability` column is updated by a trigger or application service after each allocation event

## 6. RAG Pipeline Design

1. Ingest employee, project, and allocation datasets
2. Build in-memory retrieval chunks from live store data
3. Use lexical matching in local mode or embeddings in cloud mode
4. Retrieve top-k evidence for the user query
5. Infer query intent from the user request and retrieved context
6. Re-rank candidates using domain scoring logic
7. Generate response grounded in retrieved evidence
8. Return ranked list + explanation + source snippets + retrieval mode

Guardrails:
- Responses must be evidence-grounded
- Include "why suggested" factors
- No final automated allocation; human approval remains required
- Allocated/on-leave/exiting employees are excluded from candidate selection
- User requests like "single best candidate" should return one recommendation

## 7. Recommendation/Ranking Design

Scoring factors (weighted):
- Skill match score
- Recent relevant project experience
- Current utilization and bench availability
- Historical allocation fit (role/domain similarity)
- Optional business priority boost

Implementation pattern:
- **Strategy Pattern** for ranking strategies:
  - Skill-first
  - Utilization-first
  - Hybrid (default)

## 8. API Design (MVP Endpoints)

- `POST /api/auth/login`
  - Input: email, password
  - Output: JWT token (set in HTTP-only cookie), user profile (name, role)

- `POST /api/auth/logout`
  - Clears the session cookie

- `GET /api/auth/me`
  - Output: current authenticated user profile

- `POST /api/chat/query`
  - Input: staffing question/context
  - Output: answer, ranked recommendations, evidence, citations, retrieval mode

- `POST /api/recommendations`
  - Input: project need + constraints
  - Output: ranked candidates + scores + reasons

- `GET /api/dashboard/bench`
  - Output: current bench metrics and breakdowns

- `GET /api/dashboard/utilization`
  - Output: utilization trends and summaries

- `GET /api/dashboard/allocations`
  - Output: allocation summary metrics

- `GET /api/rag/status`
  - Output: retrieval mode, chunk counts, cloud status

- `POST /api/rag/reindex`
  - Rebuilds the in-memory retrieval index

- `POST /api/allocations`
  - Input: employee_id, project_need_id, role, start_date, notes
  - Output: created allocation record
  - Side effect: updates employee availability and utilization in the DB

## 9. Security and Access (MVP)

- JWT-based authentication
- Role checks for manager-level features
- Input validation on all API endpoints
- Audit logging for recommendation requests

## 10. Non-Functional Design

- Reliability: deterministic ranking logic with fallback messages on low-confidence retrieval
- Explainability: always return scoring reasons and evidence snippets
- Performance targets (MVP):
  - Chat/recommendation response: <= 5 seconds for common queries
  - Dashboard loads: <= 2 seconds for cached/aggregated metrics

## 11. Deployment Design

Docker Compose services:
- `frontend` (React app)
- `backend` (FastAPI app)
- `postgres`
- `qdrant`

Environment configuration:
- LLM keys and DB credentials via environment variables
- Separate `.env` values per local/dev/prod profile

## 12. Observability

- Structured application logs
- Request/response timing metrics
- Error tracking with clear API error responses
- Basic health checks:
  - `/health` for backend
  - DB connectivity and RAG index refresh checks

## 13. Delivery Phases

1. Data ingestion + validation
2. Core backend domain + repositories
3. RAG and ranking implementation
4. React chat + recommendations UI
5. React dashboard analytics UI
6. End-to-end integration, testing, and demo script

## 14. Testing Strategy

### Unit Tests (Backend)
- Target: domain services, ranking logic, skill normalization, scoring calculations
- Framework: `pytest`
- Coverage target: ≥ 80% for domain and application layers
- Key cases:
  - Ranking returns correct order for a given scoring input
  - Skill normalization maps aliases to canonical tags (e.g. "ReactJS" → "React")
  - Score breakdown sums to expected total
  - Each Strategy (skill-first, utilization-first, hybrid) produces different ordering

### Integration Tests (Backend)
- Target: API endpoints + database interactions
- Framework: `pytest` + `httpx` (async test client for FastAPI)
- Database: Use a dedicated test PostgreSQL schema or `testcontainers` for ephemeral DB
- Key cases:
  - `POST /api/chat/query` returns a structured response with recommendations
  - `POST /api/recommendations` returns ranked candidates with score breakdowns
  - `GET /api/dashboard/*` endpoints return expected metric shapes
  - Auth middleware blocks unauthenticated requests

### Unit Tests (Frontend)
- Target: utility functions, custom hooks, score formatting, filter logic
- Framework: `vitest` + `@testing-library/react`
- Key cases:
  - Candidate card renders rank badge and score correctly
  - Filter/sort logic produces expected ordering
  - Chat input sends message and displays response

### End-to-End Tests (Demo Path)
- Target: critical user journey for demo
- Framework: `Playwright`
- Scenarios:
  1. Login → Dashboard loads with bench and utilization metrics
  2. Chat query → Recommendations appear with reasoning
  3. View Profile modal → Skills and project history visible
  4. Assign action → Confirmation screen → Redirect to Dashboard

### RAG Quality Checks
- Manual spot-check: 10 representative staffing queries against seed data
- Acceptance: ≥ 7/10 queries return a relevant top candidate
- Hallucination guard: assert that every assistant response cites at least one retrieved evidence snippet

## 15. Sample and Seed Data Plan

The demo requires realistic, consistent data across all three datasets. All seed data is stored in `data/seed/` and loaded by a one-command script.

### Volume (MVP / Demo)
| Dataset | Records | Notes |
|---------|---------|-------|
| Employees | 30 | Mix of roles, departments, availability states |
| Skills | 25 | Covers Frontend, Backend, Cloud, Data, DevOps |
| Projects | 10 | Mix of active, upcoming, and completed |
| Project Needs | 15 | Spread across projects, some open, some filled |
| Allocation History | 50 | 1–3 past allocations per employee |
| Users | 5 | 1 admin, 2 resource managers, 2 delivery managers |

### Role and Skill Coverage
Ensure seed data includes at least:
- Roles: Senior Engineer, Engineer, Tech Lead, Architect, QA Engineer
- Departments: Frontend, Backend, Platform, Data, DevOps
- Skills (by category):
  - Frontend: React, TypeScript, Angular, Vue
  - Backend: Python, Node.js, Java, Django, FastAPI
  - Cloud: AWS, Azure, GCP
  - Data: PostgreSQL, MongoDB, Spark
  - DevOps: Docker, Kubernetes, CI/CD

### Availability Distribution (for a realistic bench scenario)
- 8 employees: `available` (on bench)
- 18 employees: `allocated`
- 2 employees: `on_leave`
- 2 employees: `exiting`

### Demo Consistency Rules
- Utilization metric on Dashboard should show ~73–80% so the threshold warning is not triggered
- Top recommended candidate for the primary demo query ("Find a React developer") must be John Doe or equivalent persona to keep the demo narrative stable
- Seed data files: `data/seed/employees.csv`, `data/seed/projects.csv`, `data/seed/allocations.csv`
- Seed script: `data/seed/load_seed_data.py` — idempotent (safe to re-run)

## 16. Future Evolution (Post-MVP)

- Integrate HRMS/ERP sources
- Add forecasting/capacity planning models
- Introduce stronger RBAC and governance
- Split modules into services if scale/performance requires
