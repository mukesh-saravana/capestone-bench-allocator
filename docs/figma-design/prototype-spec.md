# Capstone Bench Allocator - Figma Prototype Spec

This file defines a high-fidelity, clickable Figma prototype for the MVP.

## 1. Figma File Setup

- File name: Capstone Bench Allocator - MVP Prototype
- Pages:
  - Cover
  - Foundations
  - Components
  - Screens/Desktop
  - Screens/Tablet
  - Screens/Mobile
  - Prototype Flow
  - Handoff

## 2. Frame Inventory

Create these root frames in `Screens/Desktop`:

1. `D-01 Dashboard` (1440x1024)
2. `D-02 Chat Assistant` (1440x1024)
3. `D-03 Recommendations` (1440x1024)
4. `D-04 Candidate Profile (Modal Open)` (1440x1024)
5. `D-05 Settings` (1440x1024)
6. `D-06 Assignment Confirmation` (1440x1024)

Create these root frames in `Screens/Tablet`:

1. `T-01 Dashboard` (1024x1366)
2. `T-02 Chat Assistant` (1024x1366)
3. `T-03 Recommendations` (1024x1366)

Create these root frames in `Screens/Mobile`:

1. `M-01 Dashboard` (390x844)
2. `M-02 Chat Assistant` (390x844)
3. `M-03 Recommendations` (390x844)

## 3. Design Direction

- Visual style: clean enterprise analytics with warm neutral surfaces.
- Density: medium.
- Personality: trustworthy and decisive.
- Motion: subtle, purposeful transitions only.

## 4. Foundations (Variables and Styles)

Import variables from `figma-tokens.json`.

Create style groups:

- Color/*
- Type/*
- Effect/*
- Radius/*
- Spacing/*

## 5. Components to Build

Build in `Components` page with variants and Auto Layout.

1. `Nav/Item`
   - Variants: `default`, `active`, `hover`
   - Props: icon, label

2. `Button`
   - Variants: `primary`, `secondary`, `ghost`, `danger`
   - States: `default`, `hover`, `disabled`
   - Sizes: `sm`, `md`

3. `Chip`
   - Variants: `outline`, `filled`, `status-success`, `status-warning`, `status-danger`

4. `Card/Metric`
   - Props: title, value, subtitle, trend
   - Accent variants: `success`, `warning`, `neutral`

5. `Table/Row Project`
   - States: `default`, `hover`, `selected`

6. `Candidate/Card`
   - Variants: `rank-1`, `rank-2plus`
   - States: `default`, `hover`

7. `Message/Bubble`
   - Variants: `user`, `assistant`

8. `Modal/Base`
   - Sizes: `md` (600w), `lg` (760w)

9. `Input/Search`
   - States: `default`, `focus`, `filled`

10. `Progress/Linear`
    - Variants: `success`, `warning`, `neutral`

## 6. Screen Build Notes

### D-01 Dashboard

- Left sidebar: 240px fixed.
- Top app bar: 72px.
- Main grid: 12 columns, 24px gutters, 24px margins.
- Place metric cards on row 1:
  - Bench Status
  - Utilization Rate
  - Open Roles
  - Allocation Velocity
- Row 2:
  - Active Projects table (8 columns wide)
  - Quick Actions panel (4 columns wide)
- Row 3:
  - Recent Allocations timeline (12 columns wide)

### D-02 Chat Assistant

- Split layout:
  - Left chat stream: 8 columns.
  - Right context rail: 4 columns.
- Bottom composer anchored to viewport.
- Add 3 suggestion chips under input.

### D-03 Recommendations

- Filter bar under title.
- Candidate list uses repeated `Candidate/Card` components.
- Top card highlighted with green accent and elevated shadow.

### D-04 Candidate Profile (Modal Open)

- Dimmed overlay over `D-03`.
- Modal tabs:
  - Overview
  - Skills and Certifications
  - Project History
  - Recommendation Rationale
- Sticky footer actions:
  - Cancel
  - Recommend for Another Role
  - Assign Now

### D-05 Settings

- Left tab rail:
  - General
  - Skill Tags
  - Data Management
  - Notifications
- Right content pane updates by tab.

### D-06 Assignment Confirmation

- Confirmation panel includes:
  - Candidate summary
  - Target project
  - Start date picker placeholder
  - Confirm / Back actions

## 7. Prototype Connections

Wire these interactions in `Prototype Flow`:

1. From `D-01`, click `Chat Assistant` nav -> `D-02`
2. From `D-02`, click `View Recommendations` in assistant message -> `D-03`
3. From `D-03`, click `View Profile` on top candidate -> `D-04` (open overlay)
4. From `D-04`, click `Assign Now` -> `D-06`
5. From `D-06`, click `Confirm` -> `D-01`
6. Global nav:
   - Dashboard -> `D-01`
   - Chat -> `D-02`
   - Recommendations -> `D-03`
   - Settings -> `D-05`

Prototype animation guidance:

- Page transitions: Smart Animate, 300ms, Ease Out.
- Modal open: Dissolve, 180ms.
- Hover states: Instant on mouse enter.

## 8. Content and Data

Use realistic sample records from `prototype-content.json`.

- Keep person names consistent across dashboard, chat, and recommendations.
- Keep scores and explanations aligned with ranking factors.

## 9. Accessibility Checklist

- Minimum 4.5:1 text contrast for body text.
- Keyboard order left-to-right, top-to-bottom.
- Visible focus state for all interactive controls.
- Do not rely on color alone for status badges.

## 10. Handoff Deliverables

In `Handoff` page, include:

1. Annotated desktop flow (D-01 -> D-06).
2. Responsive adaptation notes (desktop/tablet/mobile).
3. Component inventory and variant table.
4. Token export snapshot.
5. Developer notes:
   - Frontend target: React + TypeScript + MUI.
   - Recommended spacing scale: 4/8/12/16/24/32.

## 11. Definition of Done

- All 6 desktop screens are fully designed and linked.
- Tablet and mobile key screens exist.
- Components are reusable, named, and variant-driven.
- Tokens are applied consistently (no local hardcoded colors except imagery).
- Clickable prototype demonstrates full staffing request journey.