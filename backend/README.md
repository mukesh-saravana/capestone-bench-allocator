# Backend Setup Guide (FastAPI)

This guide explains how to set up and run the backend in a clean, beginner-friendly way.

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
```

### PostgreSQL example

```env
BACKEND_DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/bench_allocator
BACKEND_CORS_ORIGIN=http://localhost:5173
BACKEND_AUTH_COOKIE_NAME=auth_token
```

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
2. Backend scores candidates by:
   - skill match
   - experience
   - availability/utilization
3. Backend returns ranked candidates + score breakdown + reasons

### C. Chat flow

1. Frontend sends query to `POST /api/chat/query`
2. Backend infers skills from query
3. Recommendation engine runs
4. Backend returns:
   - answer text
   - recommendations
   - evidence snippets

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
