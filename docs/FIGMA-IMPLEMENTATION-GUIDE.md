# Figma Implementation Guide

**For**: Capstone Bench Allocator MVP  
**Status**: Ready for Figma Build  
**Target**: High-fidelity mockups for developer handoff

---

## Table of Contents
1. [Setup & Preparation](#setup--preparation)
2. [Creating Design Tokens in Figma](#creating-design-tokens-in-figma)
3. [Screen-by-Screen Build Guide](#screen-by-screen-build-guide)
4. [Component Library Creation](#component-library-creation)
5. [Linking & Prototyping](#linking--prototyping)
6. [Export & Handoff](#export--handoff)

---

## Setup & Preparation

### 1. Create Figma File

1. Go to **[figma.com](https://figma.com)** → New file
2. Rename: `Capstone Bench Allocator - MVP`
3. File type: Team file (for collaboration)

### 2. Set Up Pages

Create these pages in Figma:
- `Design System` - Colors, typography, components
- `Dashboard Screen`
- `Chat Screen`
- `Recommendations Screen`
- `Profile Modal`
- `Settings Screen`
- `Components` - Reusable component library
- `Prototype` - Interaction flows

### 3. Enable Plugins (Optional but recommended)

- Install "Stark" for accessibility checking
- Install "Design Tokens" plugin for token management
- Install "Figma to Code" for dev handoff

---

## Creating Design Tokens in Figma

### Step 1: Create Color Styles

**Navigate to**: `Design System` page

1. **Create a rectangle** → Fill: `#1976D2`
2. Right-click → **"Create Style"**
   - Name: `Color/Primary`
   - Icon: Choose a color swatch icon
3. Repeat for all colors:
   - `Color/Secondary` (#DC004E)
   - `Color/Success` (#4CAF50)
   - `Color/Warning` (#FF9800)
   - `Color/Danger` (#F44336)
   - `Color/Neutral` (#ECEFF1)
   - `Color/NeutralDark` (#F5F5F5)
   - `Color/Text` (#212121)
   - `Color/TextSecondary` (#424242)
   - `Color/TextTertiary` (#757575)
   - `Color/Border` (#E0E0E0)

### Step 2: Create Typography Styles

1. **Create a text element** → Add "Heading 1"
   - Font: System font (SF Pro Display or Roboto)
   - Size: 32px
   - Weight: 700 (Bold)
   - Line height: 40px
   - Color: `Color/Text`

2. Right-click → **"Create Style"**
   - Name: `Typography/Heading 1`

3. Repeat for each text style:
   - `Typography/Heading 2` (24px, 600)
   - `Typography/Heading 3` (18px, 600)
   - `Typography/Body` (14px, 400)
   - `Typography/BodySmall` (12px, 400)
   - `Typography/Button` (14px, 600)

### Step 3: Create Component Styles (Optional)

Create reusable shadow styles:
- `Shadow/Hover` (0 2px 8px rgba(0,0,0,0.1))
- `Shadow/Raised` (0 4px 12px rgba(0,0,0,0.15))
- `Shadow/Modal` (0 8px 24px rgba(0,0,0,0.2))

---

## Screen-by-Screen Build Guide

### Screen 1: Dashboard

**Page**: `Dashboard Screen`  
**Frame**: `Dashboard - Desktop` (1920 × 1080)

#### Step 1: Create Header Bar
```
1. Rectangle: 1920 × 80px
   - Fill: White (#FFFFFF)
   - Border: 1px #E0E0E0 (bottom only)
2. Text: "Resource Allocation Dashboard"
   - Apply style: Typography/Heading 1
   - Position: 24px from left, vertically centered
3. Group: Create a group named "Header Actions"
   - Add 3 icon buttons (24×24px each)
   - Icons: 📅, ⬇️, 🔔
   - Position: 24px from right
```

#### Step 2: Create Sidebar Navigation
```
1. Rectangle: 300 × 1000px
   - Fill: Color/NeutralDark (#F5F5F5)
   - Position: x=0, y=80

2. Create "Logo Area" (300 × 48px)
   - Background: #E8E8E8
   - Text: "Bench"
   - Font: Heading 2
   - Center aligned

3. Create Navigation Items (Repeat 4 times)
   - Group containing:
     - Rectangle background (optional, for hover state)
     - Icon placeholder (20×20px)
     - Text label
   - Spacing: 16px between items
   - First item (Dashboard): Background light blue

   Nav items:
   - 🏠 Dashboard (highlighted)
   - 💬 Chat Assistant
   - 👥 Recommendations
   - ⚙️ Settings
```

#### Step 3: Create Main Content Area
```
1. Create main container frame: 1620 × 900px
   - Position: x=300, y=80
   - Fill: #FAFAFA

2. Add heading: "Resource Allocation Dashboard"
   - Apply style: Typography/Heading 2
   - Padding: 24px
```

#### Step 4: Create Metric Cards (2-column grid)
```
Card 1: Bench Status
1. Rectangle: calc(50% - 8px) × 200px
   - Fill: White
   - Border: 1px #E0E0E0
   - Border-left: 4px #4CAF50
   - Padding: 16px

   Content:
   - Text "Bench Status" (Heading 3)
   - Large number "24" (32px, bold, #4CAF50)
   - Text "Engineers on bench" (BodySmall, gray)
   - [Optional] Small sparkline chart

Card 2: Utilization Rate
1. Rectangle: calc(50% - 8px) × 200px
   - Same structure as Card 1
   - Border-left: 4px #FF9800
   - Metric: "78%"
   - Progress bar: 80% filled with green
```

#### Step 5: Create Active Projects Table
```
1. Rectangle: 100% × auto (340px estimated)
   - Border: 1px #E0E0E0
   - Padding: 16px

   Table structure:
   - Header row (background: #F5F5F5):
     - Project Name | Skills | Priority | Open Slots
   - 5 data rows:
     - Row 1-3: White background
     - Row 4-5: #FAFAFA background
     - Add hover state: Light blue (#E3F2FD)
```

#### Step 6: Create Recent Allocations Timeline
```
1. Rectangle: 100% × auto (280px estimated)
   - Border: 1px #E0E0E0
   - Padding: 16px

   Timeline items (repeat 6 times):
   - Circle dot (12px, #1976D2)
   - Vertical line connecting dots
   - Text: Employee → Project (Date)
   - Status badge (small pill)
```

---

### Screen 2: Chat Assistant

**Page**: `Chat Screen`  
**Frame**: `Chat - Desktop` (1920 × 1080)

#### Step 1: Create Layout Containers
```
1. Split into 2 columns:
   - Left panel (65%): Chat messages
   - Right panel (35%): Context panel

2. Left panel container: 1248px wide
3. Right panel container: 672px wide
```

#### Step 2: Create Chat Header
```
1. Rectangle: 100% × 80px
   - Fill: White
   - Border-bottom: 1px #E0E0E0

2. Add title: "Staffing Assistant"
   - Typography/Heading 2
   - Padding: 24px
```

#### Step 3: Create Chat Message Area
```
1. Create scrollable container for messages

   User Message (Right-aligned):
   - Rectangle bubble (rounded 8px)
   - Fill: #1976D2
   - Text: "Find a React developer for Q3"
   - Text color: White
   - Padding: 12px 16px
   - Max-width: 70%
   - Alignment: Right
   - Margin: 8px

   Assistant Message (Left-aligned):
   - Rectangle bubble (rounded 8px)
   - Fill: #ECEFF1
   - Text: "Based on available data, I recommend..."
   - Text color: #212121
   - Padding: 12px 16px
   - Max-width: 70%
   - Alignment: Left

2. Create 3-4 alternating message pairs
```

#### Step 4: Create Chat Input Area
```
1. Rectangle: 100% × 100px
   - Background: White
   - Border-top: 1px #E0E0E0
   - Padding: 16px

2. Textarea component:
   - Border: 1px #E0E0E0
   - Border-radius: 4px
   - Padding: 12px
   - Placeholder text: "Ask for resource recommendations..."
   - Height: 60px

3. Send button (right side):
   - 48×48px
   - Background: #1976D2
   - Icon: ➤ (send icon)
   - Position: Absolute right, center vertical
```

#### Step 5: Create Suggested Prompts
```
1. Horizontal scroll container below input

   Chips (repeat 3 times):
   - Rounded pill shape
   - Border: 1px #1976D2
   - Background: Transparent
   - Text: "Who's available on the bench?"
   - Padding: 8px 16px
   - Cursor: Pointer on hover
```

#### Step 6: Create Context Panel (Right)
```
Section 1: Relevant Data Retrieved
- Title: "Relevant Data" (Heading 3)
- 3 small cards:
  - Each card: Rounded, background #ECEFF1
  - Content: Key + Value pairs
  - Example: "React Skills Available: 12"

Section 2: Quick Filters
- Title: "Quick Filters" (Heading 3)
- Department dropdown
- Skill filter chips with [x] to remove
- Availability toggle ("Available" / "Show all")
```

---

### Screen 3: Recommendations List

**Page**: `Recommendations Screen`  
**Frame**: `Recommendations - Desktop` (1920 × 1080)

#### Step 1: Create Header + Filters
```
1. Header: 100% × 80px
   - Title: "Recommended Candidates"
   - Border-bottom: 1px #E0E0E0

2. Filter bar: 100% × 60px
   - Search input: 300px wide
   - Skill filter dropdown: 200px
   - Department dropdown: 200px
   - Sort dropdown: 150px
   - Spacing: 16px between elements
```

#### Step 2: Create Candidate Cards
```
Card #1 (Rank #1 - Highlighted):
1. Rectangle: 100% × 120px
   - Border: 1px #E0E0E0
   - Border-left: 4px #4CAF50 (Green)
   - Padding: 16px
   - Margin-bottom: 16px

   Layout (horizontal flex):
   - Left: Rank badge (60px)
     - Circle: 48×48px
     - Fill: #4CAF50
     - Text: "1" (24px, white, bold)
   
   - Middle (main content):
     - Name: "John Doe" (Heading 3, bold)
     - Role: "Senior Engineer" (Body, gray)
     - Team: "Frontend Team" (BodySmall, gray)
     - Skills: Pills layout
       - "React" "Python" "AWS"
       - Each: Rounded pill, border #1976D2, padding 6px 12px
   
   - Right (score):
     - Large "9.2" (24px, bold, #1976D2)
     - Text "/10"
     - Progress bar below (4px height, 92% filled green)
   
   - Far right (actions):
     - "View Profile" button (outline)
     - "Assign" button (solid blue)
     - Spacing: 8px between buttons

Cards #2 & #3:
- Duplicate Card #1
- Change border-left to #E0E0E0
- Update rank badge (2, 3)
- Update content with different names/skills
- Update scores (8.7, 7.5)
```

#### Step 3: Add Hover State
```
Create a copy of one card for hover state:
- Box-shadow: 0 4px 12px rgba(0,0,0,0.15)
- Background: Slight blue tint
- Label: "Hover State"
```

---

### Screen 4: Candidate Profile Modal

**Page**: `Profile Modal`  
**Frame**: `Profile Modal - Desktop` (600 × 800)

#### Step 1: Create Modal Header
```
1. Rectangle: 600 × 100px
   - Background: White
   - Border-bottom: 1px #E0E0E0
   - Padding: 16px

   Content (horizontal layout):
   - Avatar: 80×80px circle
     - Placeholder: Initial "JD" or image
   - Info section (right of avatar):
     - Name: "John Doe" (Heading 2)
     - Role: "Senior Engineer" (Body)
     - Department: "Frontend Team" (BodySmall)
   - Close button: [X] (top-right corner)
```

#### Step 2: Create Tab Navigation
```
1. Rectangle: 600 × 50px
   - Background: White
   - Border-bottom: 2px #E0E0E0

2. Tab items (horizontal):
   - "Overview" (active, underline: 2px #1976D2, bold)
   - "Skills & Certifications"
   - "Project History"
   - "Recommendations"
   - Padding: 12px 16px
   - Text: Body style
```

#### Step 3: Create Overview Tab Content
```
1. Scrollable content area: 600 × 650px

   Subsection 1: Key Metrics
   - 3 metric cards in grid (200px each)
   - Utilization: "65%"
   - Avg Duration: "6 months"
   - Last Allocated: "2 weeks ago"
   - Background: #ECEFF1
   - Border-radius: 8px
   - Centered text

   Subsection 2: Skills Matrix
   - List of skills with proficiency stars
   - Layout: Skill name (left) | Stars (right)
   - Example:
     React       ⭐⭐⭐⭐⭐
     TypeScript  ⭐⭐⭐⭐
     AWS         ⭐⭐⭐⭐
   - Padding: 12px between rows

   Subsection 3: Recommendation Reasoning
   - Background: #E3F2FD (light blue)
   - Border-left: 4px #1976D2
   - Padding: 16px
   - Title: "Why recommended for this role:"
   - Bullet list:
     ✅ 3 years React experience
     ✅ Recently worked on similar AWS architecture
     ⚠️ Limited Python skills
```

#### Step 4: Create Action Buttons
```
1. Rectangle: 600 × 60px
   - Background: White
   - Border-top: 1px #E0E0E0
   - Padding: 16px
   - Sticky to bottom

   Buttons (horizontal layout, right-aligned):
   - [Cancel] - Outline button (100px)
   - [Recommend] - Secondary button (120px)
   - [Assign Now] - Primary button (120px)
   - Spacing: 8px between buttons
```

---

### Screen 5: Settings

**Page**: `Settings Screen`  
**Frame**: `Settings - Desktop` (1920 × 1080)

#### Step 1: Create Tab Navigation
```
Header + tabs (same as other screens):
- General | Skills | Data | Notifications
- Active tab underlined in blue
```

#### Step 2: General Settings Tab
```
Content area:
- Title: "Theme"
  - Radio buttons: Light (selected) | Dark
  - Spacing: 16px
  
- Title: "Default View"
  - Radio buttons: Dashboard | Chat (selected)
  
- Title: "Show Tooltips"
  - Checkbox: Enabled ✓

- Buttons: [Save] [Reset to Default]
```

#### Step 3: Skills Tab
```
Table:
- Header: Skill | Category | Usage | Actions
- 8 sample rows
- Each row: Skill name | Category dropdown | Count | [Edit] [Delete]
- Add button: [+ Add Skill]
- Border: 1px #E0E0E0
```

#### Step 4: Data Management Tab
```
Upload section:
- Title: "Upload Datasets"
- 3 upload areas:
  - Employee Data
  - Projects Data
  - Allocations History
- Each: Drag-drop zone or [Browse] button

Info boxes:
- Last updated: [Date]
- Row count: [Number]
- [Refresh] button
- [Export Data] button
```

---

## Component Library Creation

### Step 1: Create Reusable Components

**Page**: `Components`

#### Button Component
```
Create 4 variants:
1. Primary Button
   - Rectangle: 100×48px, rounded 4px
   - Background: #1976D2
   - Text: "Button" (Typography/Button, white)
   - Create component: Name it "Button/Primary"

2. Secondary Button
   - Rectangle: 100×48px, rounded 4px
   - Border: 1px #1976D2
   - Background: Transparent
   - Text: "Button" (Typography/Button, #1976D2)
   - Create component: "Button/Secondary"

3. Danger Button
   - Same structure as Primary but fill: #F44336
   - Create component: "Button/Danger"

4. Ghost Button
   - Background: Transparent
   - Text: #1976D2
   - Create component: "Button/Ghost"
```

#### Card Component
```
1. Rectangle: 400×200px
   - Fill: White
   - Border: 1px #E0E0E0
   - Border-radius: 8px
   - Padding: 16px
   - Shadow: None (add on hover variant)

2. Create component: "Card/Default"
3. Create variant: "Card/Hover" with shadow 0 4px 12px rgba(0,0,0,0.15)
```

#### Badge/Pill Component
```
1. Rectangle (rounded pill): 80×28px
   - Background: #4CAF50
   - Text: "Success" (BodySmall, white)
   - Padding: 6px 12px

2. Create variants:
   - "Badge/Success" (#4CAF50)
   - "Badge/Warning" (#FF9800)
   - "Badge/Danger" (#F44336)
   - "Badge/Info" (#1976D2)
```

#### Input Component
```
1. Rectangle: 300×44px
   - Border: 1px #E0E0E0
   - Border-radius: 4px
   - Padding: 8px 12px
   - Background: White

2. Text: "Placeholder text" (BodySmall, #757575)
3. Create component: "Input/Default"
4. Variant: "Input/Focused" (border: 2px #1976D2)
```

#### Progress Bar Component
```
1. Container rectangle: 300×8px
   - Fill: #ECEFF1
   - Border-radius: 4px

2. Fill rectangle: 240×8px (80% of width)
   - Fill: #4CAF50
   - Border-radius: 4px

3. Create component: "ProgressBar/Default"
```

#### Metric Card Component
```
1. Container: 180×150px
   - Background: #ECEFF1
   - Border-radius: 8px
   - Padding: 16px
   - Center-aligned

   Content:
   - Large number (32px, bold, color-coded)
   - Subtitle (12px, gray)

2. Create component: "MetricCard/Default"
```

---

## Linking & Prototyping

### Step 1: Create Prototype Flows

1. On Dashboard screen:
   - Chat button → Chat Screen
   - Recommendations button → Recommendations Screen
   - Settings button → Settings Screen

2. On Chat screen:
   - [Assign] button on recommendation → Profile Modal

3. On Recommendations:
   - Candidate card → Profile Modal

### Step 2: Add Interactions

**How to set up prototyping:**
1. Select element (e.g., button)
2. Click **Prototype** tab (right panel)
3. Click **+ Interaction**
4. Choose:
   - **Trigger**: On click
   - **Action**: Navigate to
   - **Destination**: Chat Screen
   - **Animation**: Fade or Move in

---

## Export & Handoff

### Step 1: Prepare for Developer Handoff

1. **Organize components**:
   - Group all components in `Components` page
   - Name components consistently: `ComponentName/Variant`

2. **Add documentation**:
   - Create notes on each screen describing intent
   - Add interaction descriptions

3. **Export assets**:
   - Select all components
   - Right-click → **Export** → PNG @ 2x

### Step 2: Share with Team

1. Right-click Figma file → **Share**
2. Set permissions: "Can view" for developers
3. Share link with dev team

### Step 3: Generate Specs for Developers

Use **Figma's Inspect Mode** (right panel):
1. Select any element
2. Click **Inspect** tab
3. Developers can see:
   - Dimensions, spacing, positions
   - Colors, typography
   - Shadows and effects
   - Export options

### Step 4: Optional - Use Design-to-Code Plugin

Install "Figma to Code" plugin:
1. Select component
2. Right-click → **Figma to Code**
3. Generate React/HTML/CSS code
4. Developers use as starting point

---

## Tips & Best Practices

### Organization
- Use consistent naming: `PageName/ComponentName/Variant`
- Group related elements: Cmd+G (Mac) or Ctrl+G (Windows)
- Use frames for better organization and responsiveness

### Reusability
- Create components early (right-click → "Create component")
- Use component instances across screens
- Leverage component variants for different states

### Collaboration
- Leave comments on tricky sections
- Use Figma's version history for tracking changes
- Assign review tasks to team members

### Performance
- Keep file size manageable (archive unused pages)
- Use component instances instead of duplicates
- Flatten groups when done designing

### Accessibility
- Add alt text to images
- Use sufficient color contrast (check with Stark plugin)
- Include keyboard navigation flows in prototype

---

## Checklist: Before Handoff

- [ ] All 5 screens completed
- [ ] Component library created with variants
- [ ] Colors and typography styles applied
- [ ] Responsive states documented
- [ ] Prototype interactions set up
- [ ] Accessibility check (Stark plugin)
- [ ] File organized and cleaned up
- [ ] Comments added for dev team
- [ ] Specs exported and shared
- [ ] Design tokens documented

---

**Document End**

Once you've built the Figma design, share the link with Copilot Chat to test the MCP integration! 🎨
