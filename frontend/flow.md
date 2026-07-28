# Frontend Flow Guide (Non-Technical)

This guide explains how the frontend works today, what you will see on each screen, how screens connect to each other, and what to expect when using the app.

---

## 1) What this frontend is

The frontend is the visual part of the **Capstone Bench Allocator**.  
It helps a resource manager:

- see bench/utilization status
- ask staffing questions in chat
- review AI-ranked candidates
- confirm allocations
- manage settings and data inputs

Right now, the app is a **working MVP demo UI**:

- UI is fully implemented
- core screens are connected to the backend APIs
- login remains lightweight/demo-friendly
- chat and recommendations use the live staffing backend with RAG support

---

## 2) How to start and use

1. Open terminal in `frontend/`
2. Run `npm install` (first time only)
3. Run `npm run dev`
4. Open the shown local URL (usually `http://localhost:5173`)
5. Sign in on login page (any email + password with 4+ characters)

For production build check:

- `npm run build`

---

## 3) First user journey (screen-by-screen)

## Step A: Login

What you see:

- split layout: branded left panel + login form right panel
- email and password fields
- sign-in button
- session-expired warning if redirected after token expiry

What happens:

- on valid input, demo token is stored in browser localStorage
- you are redirected to Dashboard

If something is wrong:

- short password (<4 chars) shows error message

---

## Step B: Dashboard (overview screen)

What you see:

- top summary cards (On Bench, Utilization, Open Roles, Active Allocations)
- active projects panel
- utilization-by-department panel
- recent allocations feed
- engineers-on-bench list
- top bar live RAG status chip

Why it matters:

- this gives quick business context before taking staffing action

---

## Step C: Chat Assistant

What you see:

- message area
- suggested prompt chips
- input box and send button
- relevant-data side panel

What happens:

- you ask a staffing question
- assistant responds with text grounded in current staffing data
- the system uses RAG to fetch relevant context before ranking candidates
- for matching-type queries, ranked candidate cards appear inside chat
- questions like "single best candidate" return one result

---

## Step D: Recommendations

What you see:

- filter bar (search, department, sort)
- ranked candidate cards
- candidate score and reason context

Actions available:

- **View Profile** opens detailed modal (overview, skills, project history, rationale)
- **Assign** opens assignment confirmation modal

---

## Step E: Assignment Confirmation

What you do:

- review selected candidate and project
- pick start date
- add optional notes
- click confirm

What happens:

- success toast appears at top-right
- modal closes

---

## Step F: Settings

Tabs available:

- General
- Skill Tags
- Data Management
- RAG Admin
- Notifications

Purpose:

- gives a place for preferences, data management, and RAG control workflows

---

## 4) Navigation and page structure

After login, all screens are inside a protected app shell:

- left: Sidebar
- top: TopBar
- center: current page content

Routes:

- `/dashboard`
- `/chat`
- `/recommendations`
- `/settings`
- `/login` (public)

If not logged in:

- protected routes redirect to login

---

## 5) What “modern UI updates” were integrated

### Visual system

- updated color palette (indigo primary, teal success)
- gradient tokens for key surfaces
- improved shadows and rounded corners
- Inter font and refined typography

### Sidebar

- dark gradient sidebar
- bright active state
- right-side rounded corners only
- smoother hover/active movement and glow

### Top bar

- glassmorphism effect
- live status chip, RAG mode chip, notifications, profile avatar styling

### Cards and surfaces

- metric cards with accent strips and trend indicators
- cleaner panel hierarchy and spacing

### Motion and transitions (global)

- shared motion tokens (durations + easing)
- page enter transitions across all routed screens
- smoother button/card/input/list interactions
- reduced-motion accessibility fallback supported

---

## 6) How all parts are integrated (simple explanation)

Think of it like layers:

1. **Theme Layer** (`src/theme.ts`)  
   Controls colors, typography, spacing, animation behavior.

2. **App Provider Layer** (`src/main.tsx`)  
   Wraps the app with routing, theme, query caching, auth, and toast notifications.

3. **Route Layer** (`src/App.tsx`)  
   Decides which screen to show for each URL.

4. **Layout Layer** (`src/components/layout/`)  
   Shared frame used by all logged-in pages (sidebar + topbar + content area).

5. **Feature Screens** (`src/features/*`, `src/pages/LoginPage.tsx`)  
   Actual business pages (Dashboard, Chat, Recommendations, Settings, Login).

6. **Reusable UI Components** (`src/components/common/`)  
   Building blocks like badges, cards, progress bars, empty/skeleton states.

This separation helps keep the backend-connected MVP easy to evolve without redesigning UI.

---

## 7) Current expected behavior (important)

This is expected in the current MVP:

- data comes from the backend APIs, so dashboard/recommendation/chat values reflect current store data
- chat replies are generated by the live backend query flow with RAG context
- login is still lightweight demo auth, but it goes through the backend
- assignment confirmation simulates completion and shows toast

This is intentional and supports demos while the app stays backend-driven.

---

## 8) Error/loading/empty behavior you should expect

- Login errors: invalid credentials message
- Loading states: skeleton cards/tables where implemented
- Empty states: clear message and guidance when result lists are empty
- Toasts: success/info/error messages on user actions

---

## 9) Accessibility and responsiveness

- mobile behavior: sidebar becomes temporary drawer
- reduced-motion preference respected globally
- clear text hierarchy and consistent contrast improvements applied

---

## 10) What is complete vs next

### Completed now

- full frontend routing and page implementation
- modernized UI theme and interactions
- protected route flow
- dashboard/chat/recommendation/settings/login surfaces
- modals for profile and assignment flow
- live backend integration for staffing workflow and RAG controls

### Next integration phase

- optional cloud LLM planner for harder natural-language queries
- richer historical trend snapshots if needed

---

## 11) Quick checklist for non-technical demo

1. Login
2. Open Dashboard and explain metrics
3. Ask staffing question in Chat
4. Show ranked candidates in Recommendations
5. Open profile and confirm assignment
6. Show toast confirmation
7. Visit Settings to show admin-ready surface

If all above works, the frontend flow is functioning as intended.
