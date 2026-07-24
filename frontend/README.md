# Capstone Bench Allocator Frontend

This is the React frontend for the Capstone Bench Allocator MVP.

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
- Chat assistant surface with suggested prompts
- Recommendation ranking cards, profile modal, assignment modal
- Settings tabs for preferences and data management UI
- Loading/empty/error feedback patterns and toast notifications
- Global smooth page and component transitions

## Important note

Current MVP uses mock/demo data and mock auth flow.  
API integration points are already structured for backend hookup.

## Full non-technical walkthrough

See **`frontend/flow.md`** for a complete end-to-end explanation of:

- how screens connect
- what users do on each screen
- what outcomes to expect
- what is demo behavior vs next integration phase
