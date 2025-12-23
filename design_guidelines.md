# ZFORCE DMS - Design Guidelines

## Design Approach: Material Design System (Enterprise)

**Rationale**: Enterprise DMS requires robust data visualization, clear hierarchy, and scalable component patterns. Material Design provides the necessary structure for complex workflows while maintaining visual clarity.

---

## Core Design Principles

1. **Clarity Over Decoration** - Information density without visual clutter
2. **Role-Based Hierarchy** - Clear visual distinction between user permission levels
3. **Action-Oriented** - Buttons and CTAs prominently placed for workflow efficiency
4. **Data-First** - Tables, charts, and metrics take visual priority

---

## Typography System

**Primary Font**: Inter (via Google Fonts)
**Secondary Font**: Roboto Mono (for VIN, invoice numbers, technical data)

**Hierarchy**:
- Page Titles: text-3xl font-semibold
- Section Headers: text-xl font-semibold
- Card Titles: text-lg font-medium
- Body Text: text-base font-normal
- Labels: text-sm font-medium uppercase tracking-wide
- Technical Data: font-mono text-sm
- Metadata/Timestamps: text-xs text-gray-500

---

## Layout & Spacing System

**Tailwind Units**: Standardize on 4, 6, 8, 12, 16 for consistency

**Application Structure**:
- Sidebar: Fixed 256px (w-64), collapsible to 64px (w-16) icon-only
- Top Bar: h-16, sticky with shadow on scroll
- Main Content: max-w-7xl with px-6 py-8 padding
- Cards: p-6 with rounded-lg borders
- Tables: Tight spacing (px-4 py-3) for data density
- Forms: Generous spacing (space-y-6) for clarity

**Grid System**:
- Dashboard KPIs: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Module Cards: grid-cols-1 lg:grid-cols-2 xl:grid-cols-3
- Data Tables: Full-width with horizontal scroll on mobile

---

## Component Library

### Navigation
- **Sidebar**: Icon + label, active state with left border accent, grouped by module
- **Top Bar**: Breadcrumbs, search, notifications bell, user menu
- **Tabs**: Underline style for sub-navigation within modules

### Data Display
- **Tables**: Striped rows, sticky headers, sortable columns, row actions menu
- **KPI Cards**: Large metric number, trend indicator, sparkline chart, comparison text
- **Status Badges**: Pill-shaped, color-coded (Pending/Approved/Rejected/Processing)
- **Charts**: Recharts with muted backgrounds, clear legends, tooltips on hover

### Forms & Inputs
- **Text Inputs**: Outlined style with floating labels, helper text below
- **Dropdowns**: Search-enabled for long lists (dealers, parts)
- **Date Pickers**: Calendar with range selection
- **File Upload**: Drag-and-drop zone with preview thumbnails
- **Multi-step Forms**: Stepper component with progress indicator

### Actions & Feedback
- **Primary Button**: Solid fill, medium size (px-6 py-2.5)
- **Secondary Button**: Outlined with hover fill
- **Icon Buttons**: For table actions, compact spacing
- **Loading States**: Skeleton loaders for tables, spinner for buttons
- **Toasts**: Top-right positioned, auto-dismiss with action option

### Modals & Overlays
- **Dialogs**: Center-screen with backdrop blur, max-w-2xl
- **Drawers**: Right-side slide-in for forms (w-96 to w-1/2)
- **Confirmation**: Compact modal with clear destructive action styling

---

## Page Templates

### Dashboard Layout
- Top KPI row (4 cards)
- Charts section (2-column: sales trends + service metrics)
- Quick actions panel (right sidebar)
- Recent activity feed (full-width table)

### List/Table View
- Search + filters bar (sticky)
- Action buttons (Export, Add New) top-right
- Paginated data table with bulk actions
- Empty state with illustration + CTA

### Detail/Form View
- Two-column layout (60/40 split)
- Main content left (form fields, timeline)
- Context panel right (related data, history, attachments)
- Sticky save/cancel actions at bottom

### Role-Specific Dashboards
- **HO**: System-wide metrics, dealer comparisons, approval queues
- **Dealer**: Location-specific sales/service, pending actions, team performance
- **Technician**: Assigned job cards, service timeline, parts requests

---

## Visual Hierarchy Rules

1. **Elevation**: Use subtle shadows, not borders, to separate sections (shadow-sm, shadow-md)
2. **Contrast**: High contrast for actionable items, muted for metadata
3. **Density**: Tables and lists are compact; forms and creation flows have breathing room
4. **Focus States**: Clear outline on keyboard navigation (ring-2 ring-offset-2)

---

## Mobile Considerations

- Sidebar collapses to bottom navigation (4-5 primary items)
- Tables scroll horizontally with sticky first column
- Forms stack single-column with full-width inputs
- Charts adapt to portrait orientation
- Search and filters slide up as modal sheets

---

## Accessibility Standards

- WCAG 2.1 AA compliance minimum
- Keyboard navigation throughout
- Screen reader labels for icon-only buttons
- Focus visible on all interactive elements
- Color is never the only indicator (use icons + text)

---

This system prioritizes **operational efficiency** while maintaining **visual professionalism** appropriate for enterprise EV dealership management.