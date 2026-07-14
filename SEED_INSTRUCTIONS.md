# How to Seed Sample Data

You have **two options** to add the Richmond, TX sample data to your database.

---

## Option 1: Use the TypeScript Seed Script (Faster)

### Prerequisites
1. Your `.env.local` file must be configured with Supabase credentials
2. Dependencies must be installed (`npm install`)

### Steps

1. **Run the seed script:**
   ```bash
   npm run seed
   ```

2. **Expected output:**
   ```
   ✅ Environment variables loaded
   📡 Connecting to Supabase at https://xxxxx...
   🌱 Starting seed process...
   📁 Found 5 categories
   🗑️  Clearing existing seed data...
   📝 Creating project W-1...
   ✅ Created project W-1 with 3 buckets
   📝 Creating project W-11...
   ✅ Created project W-11 with 3 buckets
   📝 Creating project W-12...
   ✅ Created project W-12 with 3 buckets
   📝 Creating project W-17...
   ✅ Created project W-17 with 3 buckets
   📝 Creating project W-19...
   ✅ Created project W-19 with 3 buckets
   🎉 Seed process completed successfully!
   📊 Created 5 projects with funding data
   ```

3. **Verify in the app:**
   - Open http://localhost:3000
   - You should see 5 projects in the table
   - W-1 should have costs from 2026-2035
   - W-11 should have costs in 2026-2027
   - etc.

### Troubleshooting

**Error: "Missing Supabase environment variables"**
- Check that `.env.local` exists in the project root (not in `scripts/`)
- Verify it contains:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-key-here
  ```
- Make sure there are no quotes around the values
- Make sure there are no spaces before or after the `=`

**Error: "Cannot find module 'dotenv'"**
- Run: `npm install --save-dev dotenv tsx`

---

## Option 2: Manual SQL Insertion (More Reliable)

If the TypeScript script doesn't work, you can insert the data directly via SQL.

### Steps

1. **Open Supabase Dashboard**
   - Go to https://supabase.com
   - Select your project
   - Click **SQL Editor** in the left sidebar

2. **Copy the SQL**
   - Open the file: `scripts/MANUAL_SEED.sql`
   - Copy **all** the contents (it's a long file)

3. **Paste and Run**
   - Paste into the Supabase SQL Editor
   - Click **RUN** (or press Ctrl+Enter)

4. **Verify**
   - Scroll to the bottom of the SQL file
   - You'll see verification queries
   - Check that:
     - 5 projects were inserted
     - 15 buckets were created (3 per project)

5. **Check the app**
   - Refresh http://localhost:3000
   - All 5 projects should appear

---

## What Data Gets Inserted

| Project ID | Name | Category | Funding Years |
|------------|------|----------|---------------|
| **W-1** | Surface Water Treatment Plant Membrane Replacement | Facility Rehabilitation | Issued/Cash: 2026-2035 |
| **W-11** | Waterline Rehab — Zone A | Distribution System Rehab | New Debt: 2026-2027 |
| **W-12** | Waterline Rehab — Zone C and D Design | Distribution System Rehab | New Debt: 2028-2031 |
| **W-17** | Surface Water Treatment Plant Expansion to 4 MGD | Facility Expansion | New Debt: 2028, Impact Fees: 2028-2030 |
| **W-19** | New Elevated Storage Tank along FM 762 | Facility Expansion | Impact Fees: 2027-2028 |

Each project gets **3 funding buckets**:
1. Issued/Cash
2. New Debt
3. Impact Fees

Empty buckets are still created (with `year_costs: {}`).

---

## Re-running the Seed

Both methods will **delete existing projects** with these IDs before inserting:
- W-1, W-11, W-12, W-17, W-19

This allows you to re-run the seed script multiple times without duplicates.

---

## Testing the Seed Data

After seeding, test these features:

### 1. View Projects
- ✅ All 5 projects appear in their correct categories
- ✅ Category totals are calculated correctly
- ✅ Grand total is accurate

### 2. Edit Year Costs
- Click a cell in the W-1 Issued/Cash row
- Change the 2026 value from 104000 to 200000
- Press Enter
- ✅ Present cost updates
- ✅ Inflated cost updates
- ✅ Totals recalculate

### 3. Toggle Projects
- Toggle W-1 off
- ✅ Project dims
- ✅ Drops out of totals
- Toggle back on
- ✅ Re-enters totals

### 4. Edit Project
- Hover over W-1
- Click pencil icon
- Change name to "W-1: Membrane Replacement (Updated)"
- Save
- ✅ Name updates immediately

### 5. Export
- Click Export
- Download file
- Open in Excel
- ✅ All 5 projects present
- ✅ Year columns correct
- ✅ Totals accurate

### 6. Summary
- Go to Summary page
- ✅ Bar chart shows year distribution
- ✅ Category breakdown shows 2 categories with data
- ✅ Grand totals match Projects page

---

## Need Help?

If neither method works:

1. **Check Supabase Schema**
   - Make sure you ran `supabase-schema.sql` first
   - Verify tables exist: `project_categories`, `projects`, `project_buckets`
   - Verify categories exist: Run `SELECT * FROM project_categories;`

2. **Check Console Logs**
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Look for Supabase connection errors

3. **Manual Entry**
   - As a last resort, you can manually add projects via the "Add Project" button in the app
   - Then click year cells to add values

All data values are in the `MANUAL_SEED.sql` file if you need to reference them.
