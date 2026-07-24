# Design Plan - Capstone Bench Allocator MVP

**Status**: Design Phase  
**Last Updated**: 2026-07-22  
**Owner**: Design Team

---

## Executive Summary

This document outlines the complete UI/UX design plan for the Capstone Bench Allocator MVP. The system provides resource managers with an AI-assisted interface to allocate engineers to projects through a conversational chat assistant and analytics dashboard.

### Key Design Objectives
- ✅ Simple, intuitive interface for non-technical stakeholders
- ✅ Evidence-based recommendations with clear reasoning
- ✅ Quick staffing decisions through chat + dashboard
- ✅ Accessible and responsive design

---

## 1. Design System

### 1.1 Color Palette

| Purpose | Color | Hex | Usage |
|---------|-------|-----|-------|
| Primary Action | Blue | `#1976D2` | Buttons, links, active states |
| Secondary Action | Magenta | `#DC004E` | Highlights, important CTAs |
| Success/Available | Green | `#4CAF50` | Bench availability, positive metrics |
| Warning/Caution | Orange | `#FF9800` | Low utilization, pending states |
| Danger/Critical | Red | `#F44336` | Critical bench, alerts |
| Background (Light) | Light Gray | `#ECEFF1` | Containers, cards |
| Background (Neutral) | Lighter Gray | `#F5F5F5` | Sidebar, panels |
| Text (Primary) | Dark Gray | `#212121` | Headings, primary content |
| Text (Secondary) | Medium Gray | `#424242` | Body text, descriptions |
| Text (Tertiary) | Light Gray | `#757575` | Captions, disabled text |
| Border | Very Light Gray | `#E0E0E0` | Card borders, dividers |

### 1.2 Typography

| Element | Font Size | Weight | Line Height | Color | Usage |
|---------|-----------|--------|-------------|-------|-------|
| Heading 1 | 32px | Bold (700) | 40px | #212121 | Page titles |
| Heading 2 | 24px | Semi-bold (600) | 32px | #212121 | Section titles |
| Heading 3 | 18px | Semi-bold (600) | 26px | #424242 | Card titles |
| Body | 14px | Regular (400) | 20px | #424242 | Main content |
| Body Small | 12px | Regular (400) | 18px | #757575 | Captions, metadata |
| Button | 14px | Semi-bold (600) | 16px | Varies | CTA text |

**Font Family**: System fonts (San Francisco, Segoe UI, Roboto)

### 1.3 Spacing & Layout

- **Base Unit**: 8px
- **Common Spacing**: 8px, 16px, 24px, 32px, 48px
- **Container Max Width**: 1400px
- **Default Padding**: 24px (outer), 16px (inner)
- **Card Gap**: 16px
- **Section Gap**: 24px
- **Border Radius**: 8px (cards), 4px (buttons)

### 1.4 Shadows

| Elevation | Shadow |
|-----------|--------|
| None | No shadow |
| Hover | `0 2px 8px rgba(0,0,0,0.1)` |
| Raised | `0 4px 12px rgba(0,0,0,0.15)` |
| Modal | `0 8px 24px rgba(0,0,0,0.2)` |

---

## 2. Screen Designs

### 2.1 Screen 1: Dashboard (Main Landing)

**Purpose**: Display bench status, utilization metrics, active projects, and recent allocations at a glance.

**Layout**: 
```
┌──────────────────────────────────────────────────────────┐
│  Header: Resource Allocation Dashboard  [Filters] [⋮]   │
├─────────────────┬──────────────────────────────────────┤
│                 │                                        │
│  Sidebar Nav    │     Main Content Area                 │
│  (300px)        │     (Dashboard Cards)                 │
│                 │                                        │
│  🏠 Dashboard   │  ┌──────────────┬──────────────────┐  │
│  💬 Chat       │  │ Bench Status │ Utilization    │  │
│  👥 Recommend  │  │ 24 engineers│ 78%            │  │
│  ⚙️  Settings   │  └──────────────┴──────────────────┘  │
│                 │                                        │
│                 │  ┌────────────────────────────────┐   │
│                 │  │ Active Projects (Table)        │   │
│                 │  │ Project | Skills | Priority    │   │
│                 │  └────────────────────────────────┘   │
│                 │                                        │
│                 │  ┌────────────────────────────────┐   │
│                 │  │ Recent Allocations (Timeline)  │   │
│                 │  │ Employee → Project (Date)      │   │
│                 │  └────────────────────────────────┘   │
│                 │                                        │
└─────────────────┴──────────────────────────────────────┘
```

**Components**:

1. **Header Bar** (1920px × 80px)
   - Logo/Title (24px text)
   - Centered page title
   - Right-aligned action buttons: Date filter, Export, Notifications

2. **Sidebar Navigation** (300px width)
   - App logo area (48px)
   - Nav items with icons
   - Active state: Blue background + bold text
   - Hover: Light gray background

3. **Bench Status Card** (calc(50% - 8px) × 200px)
   - Title: "Bench Status"
   - Metric: Large "24" (32px, bold)
   - Subtitle: "Engineers on bench"
   - Sparkline chart (30-day trend)
   - Border: Green (#4CAF50) left accent (4px)

4. **Utilization Card** (calc(50% - 8px) × 200px)
   - Title: "Average Utilization"
   - Metric: Large "78%"
   - Progress bar (80% filled, green)
   - Subtitle: "Team utilization rate"
   - Border: Orange (#FF9800) left accent if <80%

5. **Active Projects Table** (Full width × auto)
   - Header row: Project Name | Required Skills | Priority | Open Slots
   - 5 data rows
   - Alternating row colors (white, #FAFAFA)
   - Row hover: Light blue background
   - Priority badges: Red (High), Orange (Medium), Green (Low)

6. **Recent Allocations Timeline** (Full width × auto)
   - Title: "Recent Allocations"
   - List of allocation events
   - Each item: Timeline dot → Employee name → Project name (date)
   - Status badge: Green "Allocated", Yellow "Pending"
   - Scrollable if >6 items

**Data Shown**:
- Bench count
- Utilization percentage
- Project list with skills
- Allocation history

---

### 2.2 Screen 2: Chat Assistant Interface

**Purpose**: Allow users to ask staffing questions and receive AI recommendations with reasoning.

**Layout**:
```
┌──────────────────────────────────────────────────┐
│ Staffing Assistant           [Settings] [X]      │
├──────────────────────┬───────────────────────────┤
│                      │                           │
│  Chat Messages       │  Context Panel            │
│  (65%)              │  (35%)                    │
│                      │                           │
│  User: "Find React   │  ┌─────────────────────┐ │
│   developer"         │  │ Relevant Data       │ │
│                      │  │ ─────────────────── │ │
│  Assistant: "Based   │  │ • React Skills: 12  │ │
│   on your query,     │  │ • Available: 6 eng  │ │
│   I recommend..."    │  │ • Recent projects   │ │
│                      │  └─────────────────────┘ │
│                      │                           │
│  [Input box]         │  ┌─────────────────────┐ │
│  [Suggested prompts] │  │ Quick Filters       │ │
│                      │  │ ─────────────────── │ │
│                      │  │ Dept: All ▼         │ │
│                      │  │ Skill: [React] [x]  │ │
│                      │  └─────────────────────┘ │
└──────────────────────┴───────────────────────────┘
```

**Components**:

1. **Header** (Fixed, 80px)
   - Title: "Staffing Assistant"
   - Settings icon
   - Close button (if modal)

2. **Chat Message Area** (Scrollable)
   - **User Message** (Right-aligned):
     - Background: #1976D2 (Blue)
     - Text: White
     - Border-radius: 8px (rounded corners)
     - Padding: 12px 16px
     - Max-width: 70%
   
   - **Assistant Message** (Left-aligned):
     - Background: #ECEFF1 (Light Gray)
     - Text: #212121 (Dark Gray)
     - Border-radius: 8px
     - Padding: 12px 16px
     - Max-width: 70%
     - May include data snippets or recommendations

3. **Chat Input Box** (Fixed bottom, Full width - 32px padding)
   - Placeholder: "Ask for resource recommendations... e.g., 'Find a React developer for Q3'"
   - Textarea with 60px height
   - Send button (Blue icon, right side)
   - Character counter optional

4. **Suggested Prompts** (Below input)
   - Horizontal scrollable chips
   - Examples:
     - "Who's available on the bench?"
     - "Best match for Django project?"
     - "Show underutilized team members"
   - Style: Outline button, 8px padding

5. **Context Panel** (Right side, 35% width)
   
   **Section 1: Relevant Data**
   - Title: "Relevant Data Retrieved"
   - Show 3-4 snippets
   - Each snippet: Small card with key + value
   
   **Section 2: Quick Filters**
   - Department dropdown (Multi-select optional)
   - Skill filter: Chips with [x] to remove
   - Availability toggle: "Available" / "Show all"

**Interaction Flow**:
1. User types question → Sends
2. Chat box shows user message (right, blue)
3. Assistant processes → Shows loader
4. Response appears (left, gray) with recommendations
5. Context panel updates with retrieved data

---

### 2.3 Screen 3: Recommendations List

**Purpose**: Display ranked candidates for a staffing need with scoring and action buttons.

**Layout**:
```
┌──────────────────────────────────────────────────────┐
│ Recommended Candidates                              │
├──────────────────────────────────────────────────────┤
│ [Search] [Skill Filter] [Dept Filter] Sort: [Score▼]│
├──────────────────────────────────────────────────────┤
│                                                      │
│ ┌──────────────────────────────────────────────────┐ │
│ │ #1  John Doe              React, Python  9.2/10 │ │
│ │     Senior Engineer       Assign >         View  │ │
│ │     Frontend Team                               │ │
│ └──────────────────────────────────────────────────┘ │
│                                                      │
│ ┌──────────────────────────────────────────────────┐ │
│ │ #2  Jane Smith            React, AWS     8.7/10 │ │
│ │     Engineer              Assign >         View  │ │
│ │     Backend Team                                │ │
│ └──────────────────────────────────────────────────┘ │
│                                                      │
│ ┌──────────────────────────────────────────────────┐ │
│ │ #3  Bob Johnson           React, DevOps  7.5/10 │ │
│ │     Senior Engineer       Assign >         View  │ │
│ │     Platform Team                              │ │
│ └──────────────────────────────────────────────────┘ │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Components**:

1. **Header** (Fixed, 80px)
   - Title: "Recommended Candidates"
   - Subtitle: "For [Project/Need]" (if available)

2. **Filter Bar**
   - Search input (placeholder: "Search by name or skill")
   - Skill multi-select (dropdown with chips)
   - Department filter (dropdown)
   - Sort button: Relevance / Score / Name
   - Clear filters button (appears if filters applied)

3. **Candidate Card** (Full width × 120px, margin: 16px 0)
   
   **Card States**:
   - **#1 Recommended**: Border-left: 4px #4CAF50 (Green)
   - **#2, #3**: Border-left: 4px #E0E0E0 (Gray)
   - **Hover**: Box-shadow: 0 4px 12px rgba(0,0,0,0.15)
   
   **Card Content**:
   - Left (60px): Rank badge (circular, 48px diameter)
     - Background: Green (#4CAF50)
     - Text: White, bold, large
     - Centered number (1, 2, 3)
   
   - Middle (700px):
     - Name (16px, bold, #212121)
     - Role + Team (12px, gray, #757575)
     - Skills: Horizontal pills (background: #ECEFF1, border: 1px #1976D2, 8px padding)
   
   - Right (300px):
     - Score display:
       - Large number: "9.2" (24px, bold, blue)
       - Subtitle: "/10"
       - Visual gauge: Horizontal bar (full width, 4px height)
         - Filled portion: Green, width = score/10 * 100%
   
   - Far Right (150px):
     - "View Profile" button (outline, blue, 8px padding)
     - "Assign" button (solid blue, 8px padding)

4. **Tooltip/Hover** (On card or score)
   - Show scoring breakdown:
     - Skill match: 6.0/10
     - Project experience: 2.2/10
     - Availability: 1.0/10
     - Total: 9.2/10

---

### 2.4 Screen 4: Candidate Profile Modal

**Purpose**: Display detailed candidate information, skills, project history, and allocation options.

**Layout**:
```
┌────────────────────────────────────┐
│ Close [X]                          │
├────────────────────────────────────┤
│                                    │
│  [Avatar]  John Doe                │
│            Senior Engineer         │
│            Frontend Team           │
│            ✅ Available            │
│                                    │
├────────────────────────────────────┤
│ Overview | Skills | History | Reco │
├────────────────────────────────────┤
│                                    │
│  Key Metrics                       │
│  ┌──────┬──────┬──────────────┐   │
│  │ 65%  │ 6mo  │ 2 weeks ago  │   │
│  │ Util │ Avg  │ Last Alloc   │   │
│  └──────┴──────┴──────────────┘   │
│                                    │
│  Skills Matrix                     │
│  React         ⭐⭐⭐⭐⭐         │
│  TypeScript    ⭐⭐⭐⭐          │
│  AWS           ⭐⭐⭐⭐          │
│  Python        ⭐⭐⭐             │
│                                    │
│  Recommendation Reasoning          │
│  ✅ 3 years React experience       │
│  ✅ Recent AWS architecture work   │
│  ⚠️  Limited Python skills         │
│                                    │
├────────────────────────────────────┤
│  [Cancel] [Recommend] [Assign Now] │
└────────────────────────────────────┘
```

**Specs**:
- Modal size: 600px width × 80vh max-height
- Scrollable content area
- Fixed header & footer

**Components**:

1. **Header** (60px)
   - Close button (X, top-right)
   - Avatar (80px circle, centered or left)
   - Name (24px, bold)
   - Role + Department (14px, gray)
   - Status badge ("Available", "Allocated", "On Leave")

2. **Tab Navigation**
   - Overview | Skills & Certifications | Project History | Allocation Recommendations
   - Active tab: Blue underline, bold
   - Border-bottom: 2px #1976D2

3. **Overview Tab Content** (Default)
   
   **Subsection: Key Metrics** (3-column grid)
   - Utilization Rate: "65%"
   - Avg. Project Duration: "6 months"
   - Last Allocated: "2 weeks ago"
   - Each metric in small card (background: #ECEFF1)
   
   **Subsection: Skills Matrix** (List)
   - Skill name (left) | Proficiency stars (right)
   - Example: "React" | ⭐⭐⭐⭐⭐
   - 8-10 skills
   
   **Subsection: Recommendation Reasoning** (Highlighted box)
   - Background: #E3F2FD (light blue)
   - Border-left: 4px #1976D2
   - Title: "Why recommended for this role:"
   - Bullet list:
     - ✅ 3 years React experience
     - ✅ Recently worked on similar AWS architecture
     - ⚠️ Limited Python skills
     - ❌ No mobile development background

4. **Skills Tab Content**
   - Certification list
   - Skill proficiency matrix
   - Training records (if available)

5. **Project History Tab**
   - Timeline of past allocations
   - Project name | Role | Duration | Outcome
   - Sortable by date

6. **Recommendations Tab**
   - List of other suitable roles/projects
   - Recommendations based on skills match

7. **Footer Buttons** (Fixed, 60px)
   - [Cancel] - Outline button
   - [Recommend for Another Role] - Secondary button
   - [Assign Now] - Primary blue button

---

### 2.5 Screen 5: Settings

**Purpose**: Configure app settings, manage skill tags, and data management.

**Layout**:
```
┌──────────────────────────────────────┐
│ Settings                             │
├─────────────────────────────────────┤
│ General | Skills | Data | Notif      │
├─────────────────────────────────────┤
│                                      │
│ General Settings                    │
│                                      │
│ Theme                               │
│ ⚪ Light    ⚫ Dark                   │
│                                      │
│ Default View                         │
│ ○ Dashboard  ⚫ Chat                 │
│                                      │
│ Show Tooltips                        │
│ ✓ Enabled                            │
│                                      │
│ [Save] [Reset to Default]            │
│                                      │
└──────────────────────────────────────┘
```

**Tabs**:

1. **General Settings**
   - Theme: Light / Dark toggle
   - Default view: Dashboard / Chat radio
   - Show tooltips: Checkbox
   - Save button

2. **Skill Tags Management**
   - Table: Skill | Category | Usage Count | Actions
   - Add button: [+ Add Skill]
   - Edit/Delete actions per skill
   - Category selector/grouping

3. **Data Management**
   - Upload dataset: Employee, Projects, Allocations
   - Current dataset info: Last updated, row count
   - Refresh button
   - Export data button

4. **Notifications**
   - Email notifications: Toggle
   - Allocation updates: Checkbox
   - Recommendations available: Checkbox
   - Frequency: Daily / Weekly / Off

---

### 2.6 Screen 6: Login

**Purpose**: Authenticate users before granting access to the application.

**Layout**:
```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│              (Full page, centered content)               │
│                                                          │
│              [Logo 48px]                                 │
│              Bench Allocator                             │
│              "AI-assisted resource allocation"           │
│                                                          │
│         ┌──────────────────────────────────┐            │
│         │  Email                           │            │
│         │  [_____________________________] │            │
│         │                                  │            │
│         │  Password                        │            │
│         │  [____________________________👁]│            │
│         │                                  │            │
│         │  [         Sign In          ]    │            │
│         │                                  │            │
│         │  Forgot password?                │            │
│         └──────────────────────────────────┘            │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Components**:
1. **Logo + App Name** — centered, 48px logo, title below
2. **Email input** — label + standard text field, full-width within card
3. **Password input** — masked, show/hide toggle on right
4. **Sign In button** — Primary full-width, shows spinner when loading
5. **Inline error** — red text below fields on invalid credentials
6. **Forgot password link** — Ghost text, no action required in MVP (link only)

**States**:
- Default, Loading (spinner in button + disabled fields), Error (inline message), Success (redirect)

**Notes**:
- No self-registration in MVP — accounts created by admin via seed data
- Session token stored in HTTP-only cookie

---

### 2.7 Screen 7: Assignment Confirmation

**Purpose**: Confirm allocation details before persisting the assignment.

**Layout** (modal overlaid on Recommendations or Profile):
```
┌────────────────────────────────────┐
│  Confirm Allocation          [X]   │
├────────────────────────────────────┤
│  Assigning:                        │
│  [Avatar] John Doe                 │
│           Senior Engineer          │
│                                    │
│  To Project:                       │
│  ◼ Alpha Commerce Platform         │
│    Role: Frontend Lead             │
│                                    │
│  Start Date                        │
│  [  2026-08-01  ] 📅               │
│                                    │
│  Notes (optional)                  │
│  [________________________________]│
├────────────────────────────────────┤
│  [Back]          [Confirm Assign]  │
└────────────────────────────────────┘
```

**States**:
- Default: Employee and project pre-populated, date defaults to today
- Loading: "Confirm Assign" shows spinner, fields disabled
- Success: Modal closes, toast shown "✅ [Name] assigned to [Project]"
- Error: Inline error message if call fails

---

### 2.8 UI States: Loading, Empty, and Error

These states are required on every screen that fetches data from the backend.

#### Loading States

| Surface | Loading Treatment |
|---------|------------------|
| Metric cards | Animated shimmer skeleton in place of number |
| Tables / candidate lists | 3–5 skeleton rows with shimmer animation |
| Chat response | Typing indicator (3 animated dots) |
| Action buttons | Replace label with circular spinner; disable click |

#### Empty States

| Screen | Trigger | Message + CTA |
|--------|---------|---------------|
| Dashboard | No allocations | "No allocations yet. Upload data to get started." + [Upload Data] |
| Recommendations | No matches for query | "No matching candidates. Try adjusting filters or broadening your query." |
| Chat | First visit / no history | "Ask a staffing question to get started." + suggested prompts |
| Active Projects table | No open needs | "No open project needs at this time." |

Empty state structure: centered gray icon (48px) + bold heading + descriptive sub-text + optional CTA button.

#### Error States

| Scenario | Treatment |
|----------|-----------|
| API 5xx error | Toast (red): "Something went wrong. Please try again." with Retry button |
| Network offline | Persistent top banner: "⚠️ Connection lost. Some features may be unavailable." |
| Form validation | Inline red text below each invalid field |
| LLM timeout | Chat message: "The assistant is taking longer than expected. Please try again." |
| Auth expired | Redirect to Login: "Your session expired. Please sign in again." |

#### Toast Notifications

Toasts appear top-right, auto-dismiss after 4 seconds (errors require manual dismiss):

| Type | Background | Example |
|------|------------|---------|
| Success | #4CAF50 | "✅ John Doe assigned successfully" |
| Error | #F44336 | "❌ Failed to load recommendations" |
| Warning | #FF9800 | "⚠️ Low confidence match — review manually" |
| Info | #1976D2 | "ℹ️ Recommendation data refreshed" |

---

## 3. Component Library

### 3.1 Reusable Components

#### Button Styles

| Variant | Background | Text | Border | Padding |
|---------|------------|------|--------|---------|
| Primary | #1976D2 | White | None | 8px 16px |
| Secondary | Transparent | #1976D2 | 1px #1976D2 | 8px 16px |
| Danger | #F44336 | White | None | 8px 16px |
| Ghost | Transparent | #1976D2 | None | 8px 16px |

#### Badge / Pill

| Type | Background | Text | Usage |
|------|------------|------|-------|
| Success | #4CAF50 | White | "Available", "Allocated" |
| Warning | #FF9800 | White | "Pending", "Low Util" |
| Danger | #F44336 | White | "Critical Bench" |
| Info | #1976D2 | White | "New", "Recommended" |
| Default | #ECEFF1 | #424242 | Neutral tags |

#### Card
- Border: 1px #E0E0E0
- Border-radius: 8px
- Padding: 16px
- Shadow on hover: 0 4px 12px rgba(0,0,0,0.15)
- Background: White

#### Metric Display
- Large number (32px, bold, color-coded)
- Subtitle (14px, gray)
- Optional: Icon, sparkline, badge

#### Progress Bar
- Background: #ECEFF1
- Fill: Color-coded (#4CAF50 if healthy, #FF9800 if warning)
- Height: 8px
- Border-radius: 4px

#### Input
- Border: 1px #E0E0E0
- Border-radius: 4px
- Padding: 8px 12px
- Focus: Border #1976D2, shadow 0 0 0 3px rgba(25,118,210,0.1)

---

## 4. Responsive Design

### Breakpoints

| Device | Width | Layout | Sidebar |
|--------|-------|--------|---------|
| Desktop | 1400px+ | 3-column | Visible |
| Tablet | 768px-1399px | 2-column | Collapsible |
| Mobile | <768px | 1-column | Hidden (hamburger) |

### Mobile Adaptations
- Sidebar → Hamburger menu (top-left)
- Cards: Full-width, stacked vertically
- Chat: Full-width message area, filters in drawer
- Tables: Horizontal scroll or card view
- Buttons: Larger touch targets (48px min)

---

## 5. User Flows

### Flow 0: Authentication

```
1. User navigates to app → Login screen shown (if not already signed in)
2. User enters email + password → Clicks "Sign In"
3. Backend validates credentials → Returns JWT
4. Token stored in HTTP-only cookie → User redirected to Dashboard
5. If credentials invalid → Inline error shown under fields
6. If session expires during use → Redirect to Login with "Session expired" message
```

### Flow 1: Ask for Staffing Recommendation

```
1. User enters app → Dashboard shown
2. User clicks "Chat Assistant" → Chat screen
3. User types question: "Find a React developer"
4. User clicks Send
5. Backend retrieves context → Shows loader
6. Assistant responds with top 3 candidates
7. User clicks "View Details" on #1 candidate
8. Profile modal opens
9. User clicks "Assign" → Assignment Confirmation modal opens
10. User confirms start date → Clicks "Confirm Assign"
11. Success toast: "✅ John Doe assigned to [Project]"
12. Dashboard updates bench/utilization metrics
```

### Flow 2: Browse Recommendations

```
1. User on Dashboard
2. User clicks "Recommendations" nav
3. Recommendations list shown (filtered by recent query)
4. User applies filters: Skill = "React", Dept = "Frontend"
5. List updates
6. User clicks candidate name → Profile modal
7. User reviews project history
8. User clicks "Recommend for Another Role"
9. Returns to recommendations with new context
```

### Flow 3: View Allocations History

```
1. User on Dashboard
2. User scrolls to "Recent Allocations" section
3. User clicks allocation item
4. Drawer opens with allocation details
5. User can see project, role, duration, outcome
6. User can add notes or update status
```

---

## 6. Accessibility Requirements

- **ARIA Labels**: All buttons, inputs, icons
- **Keyboard Navigation**: Tab through all interactive elements
- **Focus Indicators**: Visible on all focusable elements (2px outline)
- **Color Contrast**:
  - Text on background: 4.5:1 minimum
  - UI components: 3:1 minimum
- **Font Sizing**: Responsive (no fixed px in base text)
- **Motion**: Respect `prefers-reduced-motion` media query

---

## 7. Performance Considerations

- **Lazy Loading**: Recommendation cards (virtual scroll if >50 items)
- **Debouncing**: Filter/search inputs (300ms)
- **Caching**: Chat history, user preferences (localStorage)
- **Chart Optimization**: React-Recharts with memoization
- **API Calls**: Batch requests where possible

---

## 8. Animation & Transitions

| Element | Transition | Duration | Easing |
|---------|-----------|----------|--------|
| Button hover | background, shadow | 200ms | ease-in-out |
| Modal open | fade, scale | 300ms | ease-out |
| Card highlight | background | 150ms | ease |
| Recommendation badge | scale | 500ms | elastic |
| Chat message appear | slide-up, fade | 200ms | ease-out |

---

## 9. Implementation Roadmap

### Phase 1: Core Screens (Week 1-2)
- [ ] Login screen
- [ ] Dashboard screen
- [ ] Chat assistant interface
- [ ] Recommendations list

### Phase 2: Modals & Details (Week 2-3)
- [ ] Candidate profile modal
- [ ] Assignment confirmation modal
- [ ] Settings page

### Phase 3: States & Polish (Week 3-4)
- [ ] Loading / skeleton states on all screens
- [ ] Empty states on all data surfaces
- [ ] Error states and toast notification system
- [ ] Responsive design validation
- [ ] Accessibility audit

### Phase 4: Handoff to Dev (Week 4)
- [ ] Component library documentation
- [ ] Design tokens export
- [ ] Figma specs for developers

---

## 10. Design Tokens (For Export)

```json
{
  "colors": {
    "primary": "#1976D2",
    "secondary": "#DC004E",
    "success": "#4CAF50",
    "warning": "#FF9800",
    "danger": "#F44336",
    "neutral": "#ECEFF1",
    "text": "#212121",
    "textSecondary": "#424242",
    "textTertiary": "#757575"
  },
  "typography": {
    "headingXL": "32px bold",
    "headingL": "24px 600",
    "headingM": "18px 600",
    "body": "14px 400",
    "bodySmall": "12px 400"
  },
  "spacing": {
    "xs": "8px",
    "sm": "16px",
    "md": "24px",
    "lg": "32px",
    "xl": "48px"
  },
  "borderRadius": {
    "small": "4px",
    "default": "8px"
  },
  "shadows": {
    "hover": "0 2px 8px rgba(0,0,0,0.1)",
    "raised": "0 4px 12px rgba(0,0,0,0.15)",
    "modal": "0 8px 24px rgba(0,0,0,0.2)"
  }
}
```

---

## 11. Next Steps

1. **Build in Figma**: Create wireframes/high-fidelity mockups using this design plan
2. **User Testing**: Share designs with 3-5 resource managers for feedback
3. **Iterate**: Refine based on feedback
4. **Handoff**: Export components and design tokens to dev team
5. **Develop**: Build React components matching design specs

---

## Appendix: Design Rationale

### Why this layout?
- **Sidebar navigation**: Familiar pattern, reduces cognitive load
- **Dashboard-first**: Quick status overview before diving into chat
- **Chat + context**: Side-by-side reduces context switching
- **Modal for details**: Non-intrusive profile viewing

### Why these colors?
- **Blue**: Trustworthy, professional (primary actions)
- **Green**: Positive, available (bench status)
- **Orange**: Caution, awareness (utilization warnings)
- **Red**: Critical, urgent (bench shortage)

### Why this interaction model?
- **Chat-first**: Conversational is natural for staffing queries
- **Recommendations list**: Allows filtering and detailed review
- **Dashboard**: Passive monitoring of key metrics

---

**Document End**
