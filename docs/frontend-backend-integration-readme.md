# Frontend + Backend API Integration Guide

This guide explains how to run both apps together and verify the end-to-end flow.

---

## 1) Prerequisites

Install:

- Node.js 20+ (includes npm): https://nodejs.org/
- Python 3.11+ (with `py` launcher on Windows): https://www.python.org/downloads/
- Git

Backend setup details are in: `backend/README.md`

---

## 2) Install dependencies

### Backend

```bash
cd backend
py -m pip install -r requirements.txt
```

### Frontend

```bash
cd frontend
npm install
```

---

## 3) Configure frontend to call backend

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
```

If backend runs on another port, update this URL.

---

## 4) Start both services

Use two terminals.

### Terminal 1: Backend

```bash
cd backend
py -m uvicorn app.main:app --reload --port 8000
```

### Terminal 2: Frontend

```bash
cd frontend
npm run dev
```

Open the URL shown by Vite (usually `http://localhost:5173`).

---

## 5) Integration architecture (simple)

### Frontend API layer

- Axios client: `frontend/src/lib/apiClient.ts`
- Typed API functions: `frontend/src/lib/api.ts`

### Auth flow

1. Login page calls backend `POST /api/auth/login`
2. Backend returns user + token and sets cookie
3. Frontend stores token for dev fallback
4. Protected routes rely on auth state
5. 401 responses auto-redirect to `/login?reason=expired`

### Query/mutation flow

- React Query hooks call typed API helpers
- Create/assign actions invalidate stale dashboard/recommendation queries
- UI refreshes with latest backend data

---

## 6) API usage map by frontend screen

### Login page

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout` (from top bar signout)

### Dashboard page

- `GET /api/dashboard/bench`
- `GET /api/dashboard/utilization`
- `GET /api/dashboard/allocations`
- `GET /api/project-needs`
- `GET /api/employees`

### Chat page

- `POST /api/chat/query`
- reads supporting dashboard/project data endpoints

### Recommendations page

- `POST /api/recommendations`
- `GET /api/project-needs`
- `GET /api/allocation-history`

### Assignment modal

- `POST /api/allocations`
- then refetches related queries

---

## 7) End-to-end verification checklist

1. Open login page
2. Login with:
   - `manager@company.com`
   - password: `demo1234`
3. Confirm Dashboard loads data (no mock placeholders)
4. Open Chat and send: `Find a React developer`
5. Confirm recommendations are returned in chat
6. Open Recommendations page and verify ranked list
7. Assign a candidate
8. Confirm success toast + refreshed dashboard/allocation data

---

## 8) Common issues and fixes

### Frontend shows network error

- Confirm backend is running
- Confirm `VITE_API_URL` matches backend URL

### Login loops back to page

- Check backend is reachable at `/api/auth/me`
- Check browser cookies are not blocked for localhost

### CORS error

- Set backend `BACKEND_CORS_ORIGIN` to frontend URL (`http://localhost:5173`)

### Data does not refresh after assign

- Check `POST /api/allocations` response in browser Network tab
- Confirm query invalidation runs (React Query Devtools optional)

---

## 9) Recommended developer workflow

1. Start backend first
2. Start frontend
3. Verify `/health` and `/docs`
4. Make backend changes
5. Re-run:
   - backend tests: `py -m pytest -q`
   - frontend build: `npm run build`

This keeps integration stable while developing features.
