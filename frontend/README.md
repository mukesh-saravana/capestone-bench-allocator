# Capstone Bench Allocator Frontend

This is the React frontend for the Capstone Bench Allocator MVP.

## Docs index

- `README.md` — frontend overview and run instructions
- `flow.md` — non-technical walkthrough of the UI
- `docs/frontend-backend-integration-readme.md` — end-to-end setup guide
- `docs/rag-overview.md` — RAG behavior and why it matters
- `docs/dashboard-elements-and-data.md` — dashboard cards, charts, and data sources

## Stack

- React + TypeScript + Vite
- Material UI (MUI)
- React Router
- TanStack Query
- React Hook Form
- Recharts

## Run locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Implemented pages

- `/login`
- `/dashboard`
- `/chat`
- `/recommendations`
- `/settings`

## Key UX capabilities implemented

- Protected route flow with login redirect
- Modernized visual design system (colors, gradients, typography, shadows)
- Sidebar and topbar shell for all authenticated screens
- Dashboard metrics and staffing overview panels
- Chat assistant surface with suggested prompts and RAG-assisted candidate ranking
- Recommendation ranking cards, profile modal, assignment modal
- Settings tabs for preferences, data management, and RAG admin controls
- Live RAG mode/status chip in the top bar
- Loading/empty/error feedback patterns and toast notifications
- Global smooth page and component transitions

## Important note

The frontend is now wired to the backend APIs for the core staffing workflow.
Demo auth remains lightweight, but chat, recommendations, dashboard, allocations, and RAG controls all talk to the backend.

## Full non-technical walkthrough

See **`frontend/flow.md`** for a complete end-to-end explanation of:

- how screens connect
- what users do on each screen
- what outcomes to expect
- what is demo behavior vs next integration phase
