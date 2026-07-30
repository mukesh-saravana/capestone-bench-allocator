# Backend Setup Guide (FastAPI)

This guide explains how to set up and run the backend in a clean, beginner-friendly way.

## Docs index

- `README.md` — backend setup, run, test, and API flow guide
- `README.md` (root) — project overview and links to all docs
- `docs/technical-design.md` — architecture and implementation design
- `docs/rag-overview.md` — RAG behavior, controls, and rationale
- `docs/dashboard-elements-and-data.md` — dashboard charts and retrieval sources
- `docs/frontend-backend-integration-readme.md` — how frontend and backend connect

---

## 1) What this backend does

The backend provides APIs for:

- Authentication (`/api/auth/*`)
- Chat recommendations (`/api/chat/query`)
- Recommendation ranking (`/api/recommendations`)
- Dashboard metrics (`/api/dashboard/*`)
- Allocation actions (`/api/allocations`)
- Reference data (`/api/employees`, `/api/project-needs`, `/api/allocation-history`)

It uses:

- **FastAPI** for APIs
- **SQLAlchemy** for data persistence
- **SQLite (default)** for local setup
- **PostgreSQL (optional/prod-like)** via `BACKEND_DATABASE_URL`

---

## Dataset import samples

Sample files are available in:

- `backend/samples/candidate-import-sample.csv`
- `backend/samples/candidate-import-sample.xlsx`
- `backend/samples/employees-import-sample.csv`
- `backend/samples/employees-import-sample.xlsx`
- `backend/samples/project-needs-import-sample.csv`
- `backend/samples/project-needs-import-sample.xlsx`
- `backend/samples/allocation-history-import-sample.csv`
- `backend/samples/allocation-history-import-sample.xlsx`

Use these files directly from the Settings → Data Management page.

---

## 2) Tools to install

Install these before setup:

### Required

1. **Git**
   - https://git-scm.com/downloads
2. **Python 3.11+** (3.12+ recommended)
   - https://www.python.org/downloads/
   - On Windows, enable the `py` launcher during install
3. **pip** (comes with Python)

### Optional but recommended

4. **PostgreSQL 15+** (for non-SQLite environment)
   - https://www.postgresql.org/download/
5. **VS Code**
   - https://code.visualstudio.com/

---

## 3) Clone and open project

```bash
git clone <your-repo-url>
cd capestone-bench-allocator
```

---

## 4) Install backend dependencies

From repository root:

```bash
cd backend
py -m pip install -r requirements.txt
```

---

## 5) Configure environment

Backend reads env vars with prefix `BACKEND_`.

You can create `backend/.env` (recommended):

```env
BACKEND_DATABASE_URL=sqlite:///./bench_allocator.db
BACKEND_CORS_ORIGIN=http://localhost:5173
BACKEND_AUTH_COOKIE_NAME=auth_token
BACKEND_RAG_MODE=hybrid
BACKEND_RAG_OPENAI_API_KEY=
BACKEND_RAG_OPENAI_EMBEDDING_MODEL=text-embedding-3-small
BACKEND_RAG_CLOUD_TIMEOUT_SECONDS=20
# Local LLM query planner (optional -- see section 5a)
BACKEND_LLM_MODE=none
BACKEND_LLM_LOCAL_URL=http://localhost:11434
BACKEND_LLM_LOCAL_MODEL=llama3.2
BACKEND_LLM_TIMEOUT_SECONDS=10
```

### PostgreSQL example

```env
BACKEND_DATABASE_URL=postgresql+psycopg://<user>:<password>@localhost:5432/bench_allocator
BACKEND_CORS_ORIGIN=http://localhost:5173
BACKEND_AUTH_COOKIE_NAME=auth_token
BACKEND_RAG_MODE=hybrid
BACKEND_RAG_OPENAI_API_KEY=<your-key>
BACKEND_RAG_OPENAI_EMBEDDING_MODEL=text-embedding-3-small
BACKEND_RAG_CLOUD_TIMEOUT_SECONDS=20
```

### RAG mode behavior

- `BACKEND_RAG_MODE=local`: always uses local lexical retrieval.
- `BACKEND_RAG_MODE=cloud`: always uses OpenAI embeddings (requires `BACKEND_RAG_OPENAI_API_KEY`).
- `BACKEND_RAG_MODE=hybrid` (recommended): uses cloud retrieval when key is configured, otherwise local retrieval.

### RAG admin endpoints

- `GET /api/rag/status` — shows current RAG mode, chunk counts, cloud config, and LLM planner status.
- `POST /api/rag/reindex` — rebuilds the in-memory retrieval index after data changes.

---

## 5a) Local LLM query planner (Ollama)

The query planner replaces regex-based intent extraction with a real NLP model running locally via **Ollama**. It extracts `top_k`, `skills`, `department`, and `strategy` from the user's natural language query.

If the LLM is unreachable or returns invalid output, the system silently falls back to the regex path -- nothing breaks.

### Install Ollama

1. Download and install: https://ollama.com/download
2. Pull a model:
   ```bash
   ollama pull llama3.2
   ```
3. Ollama runs as a local server at `http://localhost:11434`.

### Enable the planner

In `backend/.env`:

```env
BACKEND_LLM_MODE=local
BACKEND_LLM_LOCAL_URL=http://localhost:11434
BACKEND_LLM_LOCAL_MODEL=llama3.2
BACKEND_LLM_TIMEOUT_SECONDS=10
```

Restart the backend. The Settings -> RAG Admin tab will show the active LLM planner mode and model.

### Using OpenAI chat instead of Ollama

```env
BACKEND_LLM_MODE=cloud
BACKEND_LLM_CLOUD_OPENAI_API_KEY=<your-openai-key>
BACKEND_LLM_CLOUD_MODEL=gpt-4o-mini
```

### What the planner handles (examples)

| Query | top_k | skills | department | strategy |
|---|---|---|---|---|
| `give me one candidate` | 1 | [] | null | hybrid |
| `top 3 React developers` | 3 | [React] | null | skill_first |
| `someone from backend team who knows Python` | 3 | [Python] | backend | skill_first |
| `who is on bench right now` | 3 | [] | null | utilization_first |
| `single best candidate for AWS role` | 1 | [AWS] | null | skill_first |

### LLM mode behavior

- `BACKEND_LLM_MODE=none` (default): regex-only, no LLM dependency.
- `BACKEND_LLM_MODE=local`: calls Ollama, falls back to regex on failure.
- `BACKEND_LLM_MODE=cloud`: calls OpenAI chat completions, falls back to regex on failure.

---

## 6) Run backend

```bash
py -m uvicorn app.main:app --reload --port 8000
```

Backend will be available at:

- API base: `http://localhost:8000`
- Health: `http://localhost:8000/health`
- Swagger UI: `http://localhost:8000/docs`

On first startup, schema and seed data are initialized automatically.

---

## 7) Run backend tests

```bash
py -m pytest -q
```

Tests use a separate test database file under `backend/tests/`.

---

## 8) API flow (easy view)

### A. Login flow

1. Frontend sends `POST /api/auth/login` with email/password
2. Backend issues token + auth cookie
3. Frontend stores token (dev fallback) and calls `/api/auth/me`
4. Protected APIs use token/cookie validation

### B. Recommendations flow

1. Frontend sends project need/skills to `POST /api/recommendations`
2. Backend computes a normalized score out of 10 using weighted factors:
   - skill match
   - experience
   - availability/utilization
   - each factor is normalized to 0-1, multiplied by strategy weight, and scaled to 10
3. Backend returns ranked candidates + score breakdown + reasons
   - `scoreBreakdown` values are weighted contributions that approximately sum to the total score

### C. Chat flow

1. Frontend sends query to `POST /api/chat/query`
2. Backend retrieves contextual evidence with RAG from employee, project-need, and allocation data
3. Query intent is inferred from the user request plus retrieved context (skills, department, top-k)
4. Recommendation engine runs
5. Backend returns:
   - answer text
   - recommendations
   - evidence snippets + citations

### D. Dashboard flow

Frontend fetches:

- `GET /api/dashboard/bench`
- `GET /api/dashboard/utilization`
- `GET /api/dashboard/allocations`

Backend aggregates and returns display-ready metrics.

### E. Allocation flow

1. Frontend sends `POST /api/allocations`
2. Backend creates allocation record
3. Backend updates employee availability/utilization
4. Backend updates project need slots/status
5. Frontend refreshes dashboard/recommendation queries

### F. Data import flow

1. Frontend uploads CSV/XLSX in Settings → Data Management.
2. Backend validates and parses dataset rows (`POST /api/import/{dataset_key}`).
3. Backend upserts records and tracks import event for summary.
4. Frontend refreshes summary and dependent queries.

---

## 9) Troubleshooting

### Problem: `py` command not found

Use:

```bash
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

### Problem: port 8000 in use

Run on another port:

```bash
py -m uvicorn app.main:app --reload --port 8001
```

Then point frontend to `http://localhost:8001`.

### Problem: CORS error in browser

Set:

```env
BACKEND_CORS_ORIGIN=http://localhost:5173
```

### Problem: DB connection failure (PostgreSQL)

- Verify DB server is running
- Verify username/password/host/port/database
- Recheck `BACKEND_DATABASE_URL`

---

## 10) Current hardening level

- DB persistence enabled (SQLAlchemy)
- Config via env vars
- Deterministic seed bootstrap
- Endpoint contract tests in place

Next hardening can include:

- signed JWT with expiry/refresh
- migration tooling (Alembic)
- stricter role-based authorization
