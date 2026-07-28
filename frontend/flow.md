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

- **welcome banner** at the top — greets the logged-in user by first name with a time-of-day message (Good morning / afternoon / evening), today's date, and three live key stats (On Bench, Utilization, Open Roles) in glassmorphism mini-cards
- top summary cards (On Bench, Utilization, Open Roles, Active Allocations) — animate into view one by one on page load
- active projects panel
- utilization-by-department panel
- recent allocations feed
- engineers-on-bench list
- top bar live RAG status chip

Drill-down (detail drawer):

- clicking a **metric card** (On Bench, Utilization, Open Roles, Active Allocations) opens a right-side detail drawer with deeper data for that metric
- clicking an **employee row** in the bench list opens an employee detail view inside the drawer
- clicking a **project row** opens a project detail view
- clicking a **department bar** in the utilization chart opens a department drill-down
- the drawer has a sticky dark-gradient header with a back button (for nested views) and a close button
- all drill-down data is live from the backend

Why it matters:

- the banner immediately sets context for the current day before the manager takes action
- staggered card animations draw attention to key metrics in order of priority
- clicking into any metric removes the need to navigate away — managers stay in context

---

## Step C: Chat Assistant

What you see:

- **assistant header** with gradient AI icon, title, and a "● Live" status chip
- **animated empty state** — a pulsing gradient icon with a description and suggested prompt chips, shown before any messages are sent
- **message area** with a subtle dot-grid background for visual depth
- **asymmetric chat bubbles** — user messages appear on the right with a gradient primary background; AI replies appear on the left with a soft blue card style and rounded corners that resemble modern messaging apps
- **AI avatar** (robot icon) shown beside every assistant message; user avatar beside every user message
- **sender labels** ("You" / "Bench Allocator AI") above each bubble
- **animated message entrance** — each new message slides and fades in smoothly
- **typing indicator** — three bouncing dots while the assistant is thinking
- suggested prompt chips that reappear at the bottom once a conversation has started
- **Live Snapshot** side panel showing Engineers on Bench, Open Roles, and Avg Utilization as color-coded stat cards
- **Department filter** side panel with styled chips (active chip shows gradient)
- **Pro Tips** card with prompt writing suggestions

What happens:

- you ask a staffing question
- assistant responds with text grounded in current staffing data
- the system uses RAG to fetch relevant context before ranking candidates
- for matching-type queries, ranked candidate cards appear inside the AI reply bubble
- questions like "single best candidate" return one result

---

## Step D: Recommendations

What you see:

- filter bar (search, department, sort)
- ranked candidate cards
- candidate score and reason context

Actions available:

- **Click card** to open profile (same as View Profile — whole card is clickable)
- **View Profile** opens detailed modal (dark gradient header with score circle, "Best Match" chip for top candidate, skills with proficiency bars, project history, rationale)
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

- left: **Sidebar** — dark gradient, active nav item with glow, logged-in user profile card with online dot at the bottom
- top: **TopBar** — glassmorphism, page title/subtitle, live/RAG status chips, notifications, avatar, sign-out
- center: current page content (page-transition animation on every route change)

Routes:

- `/dashboard`
- `/chat`
- `/recommendations`
- `/settings`
- `/login` (public)

If not logged in:

- protected routes redirect to login

---

## 5) What UI improvements are integrated

### Visual system

- updated color palette (indigo primary, teal success)
- gradient tokens for key surfaces (primary, success, warning, danger — solid and soft variants)
- improved shadows and rounded corners
- Inter font and refined typography
- extended MUI component overrides: Dialog (glassmorphism + blurred backdrop), Alert (bordered), LinearProgress (gradient bar), Tooltip (dark), Skeleton, Divider, Select, Badge

### Sidebar

- dark gradient sidebar
- bright active state with glow and border
- right-side rounded corners only
- smoother hover/active movement
- **user profile card** at the bottom: avatar, name, role, online status dot

### Top bar

- glassmorphism effect (blur + semi-transparent)
- live status chip, RAG mode chip, notifications, profile avatar, sign-out

### Dashboard

- **welcome banner**: dark gradient hero with time-of-day greeting, user first name, today's date, and three live stat mini-cards with glassmorphism styling
- **staggered card entrance**: metric summary cards animate in sequentially using framer-motion
- remaining dashboard rows fade/slide in as groups

### Chat

- **animated message bubbles**: framer-motion entrance on each new message
- **asymmetric bubble shapes**: user = gradient right-aligned, AI = soft blue left-aligned — resembles modern chat apps
- **AI avatar + user avatar** per message; sender label above each bubble
- **typing indicator**: animated bouncing dots with primary color
- **animated empty state**: pulsing gradient icon with description and prompt chips
- **dot-grid background** on the message area
- **Live Snapshot** side panel with color-coded stat cards
- **Pro Tips** card

### Cards and surfaces

- metric cards with accent strips and trend indicators
- **clickable metric cards**: pointer cursor, enhanced hover border, and "View details" affordance that fades in on hover
- cleaner panel hierarchy and spacing

### Detail drawer

- `DetailDrawer` — reusable right-side drawer with sticky dark-gradient header, icon badge, back button (for nested views), and close button
- `DashboardDrawer` — dashboard-specific drawer triggered by metric card or row clicks; shows bench employee list, utilization bar chart by department, recent allocations feed, and individual employee/project detail views

### Motion and transitions (global, powered by framer-motion)

- shared motion tokens (durations + easing)
- page enter transitions across all routed screens
- staggered entrance for dashboard metric cards
- per-message animation in chat
- smoother button/card/input/list interactions (CSS transitions via MUI theme)
- reduced-motion accessibility fallback supported

---

## 6) How all parts are integrated (simple explanation)

Think of it like layers:

1. **Theme Layer** (`src/theme.ts`)  
   Controls colors, gradient tokens (solid + soft variants), typography, spacing, shadows, animation behavior, and extended MUI component overrides (Dialog, Alert, LinearProgress, Tooltip, etc.).

2. **Animation Layer** (`framer-motion`)  
   Handles page-level transitions, staggered card entrances on the dashboard, per-message bubble animations in chat, and the typing indicator.

3. **App Provider Layer** (`src/main.tsx`)  
   Wraps the app with routing, theme, query caching, auth, and toast notifications.

4. **Route Layer** (`src/App.tsx`)  
   Decides which screen to show for each URL.

5. **Layout Layer** (`src/components/layout/`)  
   Shared frame used by all logged-in pages (sidebar + topbar + content area).

6. **Feature Screens** (`src/features/*`, `src/pages/LoginPage.tsx`)  
   Actual business pages (Dashboard, Chat, Recommendations, Settings, Login).

7. **Reusable UI Components** (`src/components/common/`)  
   Building blocks like badges, cards, progress bars, empty/skeleton states, and the reusable `DetailDrawer` shell.

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
- modernized UI theme and interactions (MUI v9 + framer-motion)
- protected route flow
- dashboard/chat/recommendation/settings/login surfaces
- modals for profile and assignment flow
- live backend integration for staffing workflow and RAG controls
- dashboard welcome banner with greeting and live key stats
- redesigned chat UI with animated bubbles, AI avatar, live snapshot panel
- sidebar user profile card
- extended MUI theme (Dialog, Alert, LinearProgress, Tooltip, Badge, etc.)
- clickable dashboard metric cards with drill-down `DashboardDrawer` (bench, utilization, allocations, employee/project views)
- reusable `DetailDrawer` shell for right-side contextual drawers
- `CandidateCard` whole-card click to open profile
- redesigned `ProfileModal` with gradient header, score circle, "Best Match" chip, and proficiency bars

### Next integration phase

- optional cloud LLM planner for harder natural-language queries
- richer historical trend snapshots if needed

---

## 11) Quick checklist for non-technical demo

1. Login
2. Open Dashboard and explain metrics
3. Click a metric card to show the drill-down drawer (e.g., On Bench → bench employee list)
4. Ask staffing question in Chat
5. Show ranked candidates in Recommendations
6. Click a candidate card to open the redesigned profile modal
7. Confirm assignment and show toast
8. Visit Settings to show admin-ready surface

If all above works, the frontend flow is functioning as intended.
