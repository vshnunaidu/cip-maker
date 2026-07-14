# CIP Maker

Capital Improvement Plan (CIP) maker tool for municipal water projects.

## 🎉 Implementation Complete!

All core features have been implemented according to the specification. The application is ready to use once you configure Supabase.

### ✅ Completed Features

**Core Infrastructure:**
- ✅ Next.js project with TypeScript and Tailwind CSS
- ✅ All dependencies installed (@supabase/supabase-js, @tanstack/react-table, react-hook-form, xlsx, lucide-react)
- ✅ Database schema created (`supabase-schema.sql`)
- ✅ Type definitions (`types/index.ts`)
- ✅ Utility libraries (`lib/supabase.ts`, `lib/calculations.ts`, `lib/export.ts`)
- ✅ PlanContext provider for global state management

**UI Components:**
- ✅ Sidebar navigation
- ✅ TopBar with inflation rate, base year, and year range controls
- ✅ StatsBar with 4 summary stat cards
- ✅ Toggle component for enable/disable
- ✅ EditableCell component for inline year cost editing
- ✅ BucketBadge component for funding type labels

**Table Components:**
- ✅ ProjectsTable - main table with TanStack Table integration
- ✅ GroupHeader - collapsible category group rows
- ✅ ProjectRow - project summary with enable toggle
- ✅ BucketRow - funding bucket sub-rows with editable cells
- ✅ SubtotalRow - per-category totals
- ✅ GrandTotalRow - overall totals

**Pages:**
- ✅ Projects page - full interactive data table
- ✅ Summary page - charts and year matrix
- ✅ Settings page - plan configuration and category management
- ✅ Export page - Excel export functionality

**Key Features:**
- ✅ Editable year cost cells with Tab navigation
- ✅ Automatic recalculation of present and inflated costs
- ✅ Enable/disable toggle for projects
- ✅ Add new projects with modal
- ✅ Excel export matching CIP format
- ✅ Dynamic year range configuration
- ✅ Inflation rate adjustments
- ✅ Optimistic updates for better UX

### 🚀 Setup Instructions

**Before continuing, you need to set up Supabase:**

1. **Create a Supabase project** at https://supabase.com
2. **Run the schema SQL**:
   - Open your Supabase project
   - Go to SQL Editor
   - Copy and paste the contents of `supabase-schema.sql`
   - Run the SQL to create all tables and seed initial data
3. **Update environment variables**:
   - Get your Supabase URL and anon key from Settings > API
   - Update `.env.local` with your actual credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
     ```

4. **Seed some test data** (optional):
   - You can manually add projects via the UI using the "Add Project" button
   - Or insert test data via SQL in your Supabase SQL Editor

5. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 to see the app

### 📱 How to Use

**Projects Page:**
- View all projects organized by category
- Click category headers to expand/collapse groups
- Toggle projects on/off using the switch on each project row
- Click any year cell to edit the cost (press Tab to move to next cell, Enter to save)
- All totals recalculate automatically as you edit

**Summary Page:**
- View cost distribution by year (bar chart visualization)
- See cost breakdown by category
- Year matrix showing all categories and years in a grid

**Settings Page:**
- Edit city name and plan title
- Adjust base year and inflation rate
- Change year range (start and end years)
- Manage project categories (add/delete)

**Export Page:**
- Export all data to Excel in CIP format
- File includes all enabled projects with category groupings
- Automatic totals and subtotals included

## Project Structure

```
app/
  layout.tsx          — Root layout with PlanProvider and Sidebar
  page.tsx            — Redirects to /projects
  projects/page.tsx   — Main projects table with full interactivity
  summary/page.tsx    — Summary charts and year matrix
  settings/page.tsx   — Plan settings and category management
  export/page.tsx     — Excel export page

components/
  layout/
    Sidebar.tsx       — Navigation sidebar
    TopBar.tsx        — Controls bar with inflation, base year, year range
    StatsBar.tsx      — Summary statistics cards
  table/
    ProjectsTable.tsx — Main table component
    GroupHeader.tsx   — Category group header rows
    ProjectRow.tsx    — Project summary rows
    BucketRow.tsx     — Funding bucket rows with editable cells
    SubtotalRow.tsx   — Category subtotal rows
    GrandTotalRow.tsx — Grand total row
  ui/
    Toggle.tsx        — Enable/disable toggle switch
    EditableCell.tsx  — Click-to-edit cell component
    BucketBadge.tsx   — Funding type badge
  modals/
    AddProjectModal.tsx — Add new project modal

context/
  PlanContext.tsx     — Global plan settings and year range

lib/
  supabase.ts         — Supabase client
  calculations.ts     — Cost calculation utilities
  export.ts           — Excel export logic

types/
  index.ts            — TypeScript type definitions
```

## Technical Highlights

- **Optimistic Updates**: All edits update the UI immediately while persisting to Supabase in the background
- **Real-time Calculations**: All cost totals recalculate automatically based on live data
- **City-Agnostic**: Fully configurable for any municipality
- **No Hardcoded Years**: Year columns are dynamically generated from settings
- **No Auth (v1)**: Designed to add authentication later without refactoring
- **Type-Safe**: Full TypeScript coverage with strict mode

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Supabase (PostgreSQL + JSONB)
- Tailwind CSS
- TanStack Table v8
- React Hook Form
- xlsx (SheetJS)
- Lucide React
