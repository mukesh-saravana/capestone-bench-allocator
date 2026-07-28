# Dashboard Elements and Data Sources

This document explains what each dashboard card, chart, and list shows, what data it uses, and how that data is retrieved.

## How dashboard data is retrieved

The dashboard page fetches data through React Query using these API calls:

- `GET /api/dashboard/bench`
- `GET /api/dashboard/utilization`
- `GET /api/dashboard/allocations`
- `GET /api/project-needs`
- `GET /api/employees`

Those frontend helpers live in `frontend/src/lib/api.ts` and call the backend through Axios.

On the backend, the dashboard endpoints build responses from the live in-memory/database store:

- employees
- project needs
- allocation history

## 1) Summary cards

### On Bench
- **What it shows:** total number of engineers currently available for allocation.
- **Data source:** `benchMetrics.totalOnBench`
- **How it is calculated:** backend counts employees with `availability === 'available'`.
- **Chart used:** mini line chart
- **Chart data:** `benchMetrics.trend`

### Utilization
- **What it shows:** average utilization percentage across the team.
- **Data source:** `utilizationMetrics.averagePct`
- **How it is calculated:** backend averages `employee.utilizationPct` across all employees.
- **Chart used:** progress bar
- **Chart data:** same average percentage value

### Open Roles
- **What it shows:** total open staffing slots across all project needs.
- **Data source:** `projectNeeds`
- **How it is calculated:** sum of `openSlots` where `status === 'open'`
- **Chart used:** mini area chart
- **Chart data:** `benchMetrics.trend`
- **Note:** this chart currently reuses the bench trend series, so it is more of a visual summary than a true open-roles timeline.

### Active Allocations
- **What it shows:** active ongoing allocations this month.
- **Data source:** `allocationsSummary.activeAllocations`
- **How it is calculated:** backend counts allocations where `outcome === 'ongoing'`
- **Chart used:** none

## 2) Active Projects table

- **What it shows:** current project staffing needs.
- **Data source:** `GET /api/project-needs`
- **Displays:**
  - project name
  - role title
  - required skills
  - open slots
  - priority badge
- **How it is retrieved:** frontend renders the full project-needs list and filters for open staffing needs.

## 3) Utilization by Department

- **What it shows:** average utilization for each department.
- **Data source:** `utilizationMetrics.byDepartment`
- **How it is calculated:** backend groups employees by `department` and averages `utilizationPct` within each group.
- **Chart used:** horizontal progress bars

## 4) Recent Allocations

- **What it shows:** most recent allocation activity.
- **Data source:** `allocationsSummary.recent`
- **How it is calculated:** backend sorts allocations by latest start date and returns the newest entries.
- **Displays:**
  - employee name
  - project name
  - role
  - start date
  - outcome

## 5) On Bench list

- **What it shows:** employees currently available for allocation.
- **Data source:** `GET /api/employees`
- **How it is calculated on the frontend:** filters employees where `availability === 'available'`
- **Displays:**
  - employee name
  - role
  - department
  - bench since date
  - top skills

## 6) Trend charts

### Bench trend
- **Used in:** On Bench card
- **Data field:** `benchMetrics.trend`
- **Series field:** `count`

### Open roles trend visual
- **Used in:** Open Roles card
- **Data field:** `benchMetrics.trend`
- **Series field:** `count`

### Utilization trend
- **Used in:** utilization endpoint output
- **Data field:** `utilizationMetrics.trend`
- **Series field:** `pct`

## 7) Important implementation note

Some dashboard charts are currently based on backend-provided trend snapshots rather than a fully time-series database. That means:

- the current values are live
- the trend lines are lightweight summaries
- the dashboard remains fast and simple for the MVP

If you want, this can later be upgraded to real historical trend calculation from persisted snapshots or audit events.
