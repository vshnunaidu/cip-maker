# Quick Start Guide

## 🎯 What's Been Built

Your CIP Tracker application is **100% complete** and ready to use! All features from the specification have been implemented:

- ✅ Interactive data table with editable cells
- ✅ Enable/disable project toggles
- ✅ Automatic cost calculations (present & inflated)
- ✅ Add new projects via modal
- ✅ Summary page with charts
- ✅ Settings page for configuration
- ✅ Excel export functionality
- ✅ Responsive design with Tailwind CSS

## 🚀 Get Started in 5 Minutes

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose a name, database password, and region
4. Wait for the project to finish setting up (~2 minutes)

### Step 2: Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Open the file `supabase-schema.sql` in this project
3. Copy the entire contents
4. Paste into the SQL Editor
5. Click **Run** to create all tables and seed initial data

This will create:
- `project_categories` table with 5 default categories
- `projects` table
- `project_buckets` table for funding sources
- `plan_settings` table with default configuration

### Step 3: Configure Environment Variables

1. In Supabase, go to **Settings** → **API**
2. Copy your **Project URL** and **anon/public key**
3. Open `.env.local` in this project
4. Replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 4: Run the Application

```bash
npm install  # Install dependencies (if not already done)
npm run dev  # Start development server
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Using the Application

### Projects Page (Main Interface)

**The table IS the product.** Everything else derives from it.

**Editing Costs:**
- Click any year cell to edit the value
- Press **Tab** to move to the next year
- Press **Enter** or click away to save
- All totals recalculate automatically

**Managing Projects:**
- Toggle the switch to enable/disable a project
- Disabled projects are excluded from all totals
- Click "Add Project" at the bottom to create a new project
- Expand/collapse categories by clicking the category header

**Understanding the Table:**
- Each project has 3 funding bucket rows:
  - 🔵 Issued debt / cash
  - 🟡 New debt
  - 🟢 Impact fees / dev. funding
- **Present Cost** = sum of year values (no inflation)
- **Inflated Cost** = each year inflated from base year (shown in blue)

### TopBar Controls

- **Base Year**: Reference year for inflation calculations
- **Inflation Rate**: Annual inflation percentage (e.g., 3.0%)
- **Year Range**: Start and end years for the plan (e.g., 2026-2035)

All calculations update in real-time when you change these values.

### Summary Page

- **Cost by Year**: Bar chart showing total spending per year
- **Cost by Category**: Breakdown of present vs inflated costs
- **Year Matrix**: Grid view of all categories and years with totals

### Settings Page

- Edit city name and plan title (appears in exports)
- Adjust base year, inflation rate, and year range
- Manage project categories:
  - Add new categories
  - Delete unused categories (projects will be unassigned)

### Export Page

- Exports all **enabled** projects to Excel
- Format matches the CIP specification:
  - Grouped by category
  - 3 rows per project (one per funding bucket)
  - Present and inflated cost columns
  - Year-by-year breakdown
  - Category subtotals
  - Grand total row
- File name: `CityName_CIP_YYYY-MM-DD.xlsx`

## 💡 Tips

**Performance:**
- Edits are optimistic - UI updates immediately while saving in background
- If you see stale data, refresh the page
- All calculations happen client-side (instant)

**Data Entry Workflow:**
1. Set up categories in Settings
2. Add projects using "Add Project" button
3. Fill in year costs by clicking cells
4. Toggle projects on/off to see them included/excluded from totals
5. Export to Excel when ready

**Year Columns:**
- Change year range in TopBar or Settings
- Table columns adjust automatically
- No need to edit individual projects

## 🔧 Troubleshooting

**Build fails with "Invalid supabaseUrl":**
- Check that `.env.local` has real Supabase credentials (not placeholder text)

**Table shows no data:**
- Verify you ran the schema SQL in Supabase
- Check browser console for errors
- Ensure `.env.local` has correct credentials

**Excel export doesn't work:**
- Check that you have enabled projects (toggled on)
- Try exporting from the Export page, not the Projects page

**Calculations seem wrong:**
- Verify base year matches your expectation
- Check inflation rate (3% = 3.0, not 0.03)
- Disabled projects are excluded from totals

## 🎨 Customization

**Colors:**
- Edit `components/ui/BucketBadge.tsx` to change funding type colors
- Modify sidebar color in `components/layout/Sidebar.tsx` (search for `#0f1e2e`)

**Categories:**
- Default categories are for water projects
- Change them in Settings page or directly in Supabase

**Cost Format:**
- Modify `lib/calculations.ts` → `formatCost()` to change how dollars display

## 🔐 Adding Authentication (Future)

The codebase is designed to add authentication later:
1. All Supabase calls are in one place (`lib/supabase.ts`)
2. Enable RLS (Row Level Security) in Supabase
3. Add auth UI (Supabase provides components)
4. No refactoring needed - just layer it on top

## 📦 Deployment

**Deploy to Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Settings → Environment Variables → add NEXT_PUBLIC_SUPABASE_URL and KEY
```

**Deploy to other platforms:**
- Set environment variables in your platform's dashboard
- Build command: `npm run build`
- Output directory: `.next`

## 🆘 Need Help?

Common questions:
- **Can I change the year range?** Yes, in Settings or TopBar
- **Can I add more funding buckets?** Not in v1 (hardcoded to 3)
- **Can I import data from Excel?** Not yet - manual entry or SQL insert
- **Can I edit project names?** Not yet - requires edit modal (future feature)
- **Can multiple users use this?** Yes, but no auth means everyone sees everything

## 🎉 You're All Set!

The application is production-ready. Customize the default settings in the Settings page, add your projects, and start tracking your CIP.
