# Seed Script

This script seeds the database with sample Richmond, TX water project data.

## Method 1: TypeScript Seed Script (Recommended)

Make sure your `.env.local` file has the correct Supabase credentials, then run:

```bash
npx tsx scripts/seed.ts
```

### Troubleshooting

If you get "Missing Supabase environment variables":

1. **Verify `.env.local` exists** in the project root
2. **Check it has the correct format**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```
3. **Make sure dotenv is installed**:
   ```bash
   npm install --save-dev dotenv tsx
   ```

## Method 2: Manual SQL Insertion (Alternative)

If the TypeScript script doesn't work, you can manually insert the data:

1. Open **Supabase Dashboard** → **SQL Editor**
2. Open the file `scripts/MANUAL_SEED.sql`
3. Copy and paste the entire contents
4. Click **Run**
5. Verify with the queries at the bottom of the file

## What it does

- Inserts 5 water infrastructure projects from Richmond, TX
- Each project has 3 funding buckets (Issued/Cash, New Debt, Impact Fees)
- Year-by-year cost data is populated based on real CIP values
- If projects already exist with the same IDs, they will be deleted and recreated

## Projects included

1. **W-1**: Surface Water Treatment Plant Membrane Replacement (Facility Rehabilitation)
2. **W-11**: Waterline Rehab — Zone A (Distribution System Rehabilitation)
3. **W-12**: Waterline Rehab — Zone C and D Design (Distribution System Rehabilitation)
4. **W-17**: Surface Water Treatment Plant Expansion to 4 MGD (Facility Expansion)
5. **W-19**: New Elevated Storage Tank along FM 762 (Facility Expansion)
