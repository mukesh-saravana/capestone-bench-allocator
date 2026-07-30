# UI/UX Design Specification - Capstone Bench Allocator MVP

## Design System Overview

### Color Palette
- **Primary**: #1976D2 (Blue) - CTAs, active states
- **Secondary**: #DC004E (Pink/Magenta) - Highlights
- **Success**: #4CAF50 (Green) - Available candidates
- **Warning**: #FF9800 (Orange) - Low utilization
- **Danger**: #F44336 (Red) - Critical bench
- **Neutral**: #ECEFF1 (Light Gray) - Backgrounds
- **Text**: #212121 (Dark Gray) - Primary text

### Typography
- **Heading 1**: 32px, Bold, Color: #212121
- **Heading 2**: 24px, Semi-bold, Color: #212121
- **Heading 3**: 18px, Semi-bold, Color: #424242
- **Body**: 14px, Regular, Color: #424242
- **Caption**: 12px, Regular, Color: #757575

### Spacing & Layout
- **Grid**: 8px base unit
- **Container Max Width**: 1400px
- **Padding**: 16px, 24px, 32px
- **Gap**: 16px (cards), 24px (sections)

---

## Screen 1: Main Dashboard (Landing)

### Layout: 3-Column Grid
```
[Sidebar Nav] [Main Content] [Right Panel - Quick Actions]
     20%           60%              20%
```

### Sidebar Navigation
- Logo + App Name (48px height)
- Nav Items:
  - 🏠 Dashboard (active)
  - 💬 Chat Assistant
  - 👥 Recommendations
  - ⚙️ Settings

### Header
- Title: "Resource Allocation Dashboard"
- Action buttons: [📅 Date Filter] [⬇️ Export] [🔔 Notifications]

### Main Content - 4 Cards Layout

#### Card 1: Bench Status (Top-Left, 50% width)
- Title: "Bench Status"
- Metric: Large number "24" (available engineers)
- Subtitle: "Engineers on bench"
- Sparkline chart showing trend over 30 days
- Color: Green for healthy bench

#### Card 2: Utilization Rate (Top-Right, 50% width)
- Title: "Average Utilization"
- Metric: Large percentage "78%"
- Progress bar visual
- Subtitle: "Team utilization rate"
- Color: Orange if below 80%

#### Card 3: Active Projects (Full width)
- Title: "Active Projects with Open Needs"
- Table:
  - Columns: Project Name | Skills Required | Priority | Open Slots
  - 5 rows with sample data
  - Row highlighting on hover

#### Card 4: Recent Allocations (Full width)
- Title: "Recent Allocations"
- Timeline-style list:
  - Employee Name → Project Name (Date)
  - Status badge: "Allocated" (green), "Pending" (yellow)
  - 6 items

---

## Screen 2: Chat Assistant Interface

### Layout: Split View
```
[Chat Messages - 65%] [Context Panel - 35%]
```

### Chat Panel (Left)
- **Header**: "Staffing Assistant"
- **Message History**: Scrollable area with:
  - User messages (right-aligned, blue background)
  - Assistant responses (left-aligned, light gray background)
  - Each assistant message shows: question + context + recommendation

- **Chat Input Box** (Bottom):
  - Placeholder: "Ask for resource recommendations... e.g., 'Find a React developer for Q3'"
  - Send button: Blue icon button
  - Suggested prompts below input (chips):
    - "Who's available on the bench?"
    - "Best match for Django project?"
    - "Show underutilized team members"

### Context Panel (Right)
- **Section 1: Retrieved Context**
  - Title: "Relevant Data"
  - Show 3-4 snippets of retrieved employee/project info
  - Format: Small cards with key data

- **Section 2: Quick Filters**
  - Department filter dropdown
  - Skill filter chips
  - Availability toggle

---

## Screen 3: Recommendations List

### Layout: Full Width with Sidebar

### Header
- Title: "Recommended Candidates"
- Filter bar:
  - Search by name
  - Skill filter (multi-select)
  - Department filter
  - Sort: [Relevance ▼] [Score ▼]

### Main Content: Ranked Candidate Cards (Vertical List)

#### Each Candidate Card (Full width, 120px height)
```
┌─────────────────────────────────────────────────────┐
│ Rank Badge │ Name, Role       │ Skills  │ Score │ Action │
│    #1      │ John Doe         │ React,  │ 9.2/  │ View   │
│            │ Senior Engineer  │ Python  │ 10    │ Assign │
│            │ Team: Frontend   │ AWS     │       │        │
└─────────────────────────────────────────────────────┘
```

- **Rank Badge**: Circular, large number with background color
- **Info Section**: 
  - Name (bold) + Role (gray) + Team (small gray text)
  - Skills (pill-style tags)
- **Score**: Large number + visual gauge (0-10 scale)
- **Explanation Tooltip** (on hover):
  - "Score based on weighted contributions: skill match (5.1), project experience (1.8), availability (2.0)"
- **Action Buttons**: 
  - "View Profile" (outline button)
  - "Assign" (solid blue button)

### Card Highlighting
- Top candidate (#1): Light green border
- Remaining: Standard border
- Hover: Subtle shadow increase

---

## Screen 4: Candidate Profile Modal

### Modal Size: 600px width, 80vh height
### Layout: Scrollable content

#### Header Section
- Avatar (80px)
- Name, Role, Department
- Utilization status badge (color-coded)
- Close button (X)

#### Tabs
- **Overview** (default)
- **Skills & Certifications**
- **Project History**
- **Allocation Recommendations**

#### Overview Tab Content
1. **Key Metrics** (3-column grid)
   - Utilization: 65%
   - Avg. Project Duration: 6 months
   - Last Allocated: 2 weeks ago

2. **Skills Matrix**
   - Skill name + Proficiency bar (1-5 stars)
   - 8-10 skills listed

3. **Recommendation Reasoning** (highlighted box)
   - "Matched for Frontend role because:"
   - ✅ 3 years React experience
   - ✅ Recently worked on similar AWS architecture
   - ⚠️ Limited Python skills

#### Action Buttons (Bottom)
- [Cancel] [Recommend for Another Role] [Assign Now]

---

## Screen 5: Settings / Configuration

### Tabs
- **General Settings**
- **Skill Tags** (manage predefined skills)
- **Data Management** (upload/refresh datasets)
- **Notifications**

### General Settings
- App theme toggle (Light/Dark)
- Default view (Dashboard/Chat)
- Recommendation filters defaults

### Skill Tags
- List of all recognized skills with usage count
- Add/Edit/Delete skills (admin only)
- Skill category grouping

---

## Screen 6: Login

### Layout: Centered Card (480px wide, vertically centered)

```
┌──────────────────────────────────────┐
│  [Logo]                              │
│  Bench Allocator                     │
│  "AI-assisted resource allocation"   │
│                                      │
│  Email                               │
│  [___________________________]       │
│                                      │
│  Password                            │
│  [___________________________] 👁     │
│                                      │
│  [       Sign In       ]             │
│                                      │
│  ─────── or ───────────             │
│                                      │
│  Forgot password?                    │
└──────────────────────────────────────┘
```

### Components
- **Logo + App Name** (center-aligned, 48px logo)
- **Email field**: standard text input with label
- **Password field**: masked input with show/hide toggle
- **Sign In button**: Primary full-width button
- **Error inline message**: Red text below field on invalid credentials
- **Forgot password link**: Ghost text link

### States
- **Default**: Empty fields, Sign In enabled
- **Loading**: Button shows spinner, fields disabled
- **Error**: "Invalid email or password" shown inline in red
- **Success**: Redirect to Dashboard (no visible state)

### Notes
- No self-registration in MVP — accounts are created by admin
- Session token stored in HTTP-only cookie (not localStorage)
- Auto-redirect to Dashboard if already authenticated

---

## Screen 7: Assignment Confirmation

### Layout: Modal (600px wide)

```
┌──────────────────────────────────────┐
│  Confirm Allocation          [X]     │
├──────────────────────────────────────┤
│                                      │
│  Assigning:                          │
│  [Avatar] John Doe                   │
│           Senior Engineer            │
│                                      │
│  To Project:                         │
│  ◼ Alpha Commerce Platform           │
│    Role: Frontend Lead               │
│                                      │
│  Start Date                          │
│  [  2026-08-01  ] 📅                 │
│                                      │
│  Notes (optional)                    │
│  [___________________________]       │
│                                      │
├──────────────────────────────────────┤
│  [Back]              [Confirm Assign]│
└──────────────────────────────────────┘
```

### States
- **Default**: Employee and project pre-populated from context, date defaults to today
- **Loading**: "Confirm Assign" button shows spinner
- **Success**: Modal closes, toast notification shown: "✅ John Doe assigned to Alpha Commerce Platform"
- **Error**: Inline error message if assignment fails

---

## UI States — Error, Loading, and Empty

These states apply across all screens and must be implemented for every data-fetching surface.

### Loading States
- **Metric cards**: Show skeleton shimmer (gray animated rectangle in place of number)
- **Tables and lists**: 3–5 skeleton rows with shimmer
- **Chat response**: Typing indicator (three animated dots) while assistant responds
- **Buttons**: Replace button label with a circular spinner; disable the button

### Empty States
Each screen has a defined empty state shown when no data is available:

| Screen | Condition | Empty State Message |
|--------|-----------|---------------------|
| Dashboard | No allocation history | "No allocations yet. Upload data to get started." + [Upload Data] button |
| Recommendations | No candidates match query | "No matching candidates found. Try adjusting filters or broadening your query." |
| Chat | No prior messages | "Ask a staffing question to get started." + suggested prompts |
| Active Projects table | No open needs | "No open project needs at this time." |

Empty state visual structure:
- Centered icon (48px, neutral gray)
- Short heading (16px, bold)
- Descriptive sub-text (14px, gray)
- Optional call-to-action button

### Error States
- **API error (5xx)**: Toast notification: "Something went wrong. Please try again." with Retry button
- **Network offline**: Persistent top banner: "⚠️ Connection lost. Some features may be unavailable."
- **Validation errors (forms)**: Inline red text below each invalid field
- **No LLM response / timeout**: Chat shows: "The assistant is taking longer than expected. Please try again."
- **Auth expired**: Redirect to Login with message: "Your session expired. Please sign in again."

### Toast / Notification System
Toasts appear top-right, auto-dismiss after 4 seconds (errors stay until dismissed):

| Type | Color | Icon | Example |
|------|-------|------|---------|
| Success | #4CAF50 | ✅ | "John Doe assigned successfully" |
| Error | #F44336 | ❌ | "Failed to load recommendations" |
| Warning | #FF9800 | ⚠️ | "Low confidence match — review manually" |
| Info | #1976D2 | ℹ️ | "Recommendation data refreshed" |

---

## Component Library

### Reusable Components

#### Badge / Chip
- Variants: Success, Warning, Danger, Info
- Example: `<Badge color="success">Available</Badge>`

#### Progress Bar
- Width: Full container
- Height: 8px
- Color: Dynamic based on value

#### Metric Card
- Title, Large Value, Subtitle
- Optional: Sparkline, Status indicator

#### Card Container
- Border: 1px solid #ECEFF1
- Border-radius: 8px
- Padding: 16px
- Shadow: 0 2px 8px rgba(0,0,0,0.1) on hover

#### Button Styles
- Primary: Solid blue, white text
- Secondary: Outline blue
- Danger: Solid red
- Ghost: Text only

#### Tab Navigation
- Tab items with underline indicator
- Active: Blue underline, bold text

---

## Responsive Breakpoints

- **Desktop**: 1400px+ (full 3-column)
- **Tablet**: 768px-1399px (2-column, sidebar collapsible)
- **Mobile**: <768px (1-column, bottom nav)

### Mobile Adaptations
- Sidebar → Hamburger menu
- 3-column layout → Stacked single column
- Full-width cards
- Bottom navigation bar

---

## User Flow - Staffing Request

1. User navigates to app → Login screen if not authenticated
2. User signs in → Redirect to Dashboard
3. User clicks "Chat Assistant" nav item → Chat Screen opens
4. User types: "Find a React developer available next month"
5. Chat submits → Backend retrieves relevant employee/project data
6. Assistant returns: Top 3 recommendations with scores
7. User clicks "View Details" → Candidate Profile Modal opens
8. User reviews profile + project history
9. User clicks "Assign" → Assignment Confirmation Modal opens
10. User confirms start date → Allocation recorded → Dashboard updates + success toast shown

---

## Accessibility Features

- ARIA labels on all buttons and interactive elements
- Color not sole differentiator (use icons + text)
- Keyboard navigation: Tab through all interactive elements
- Focus indicators visible on all interactive elements
- Minimum contrast ratio 4.5:1 for text
- Responsive font sizes (no fixed px for body text)

---

## Performance Considerations

- Lazy load recommendation cards (virtual scroll if >50 items)
- Cache chat history locally
- Debounce filter/search inputs (300ms)
- Chart updates on data change (not on every render)

---

## Animations & Transitions

- Button hover: 200ms ease-in-out
- Modal appearance: 300ms fade-in
- Card highlight: 150ms ease
- Recommendation badge increment: 500ms scale animation

---

## Next Steps

1. Create wireframes in Figma (desktop & mobile)
2. Build component library in Storybook (React)
3. Implement in React + MUI
4. User testing with sample stakeholders
