# Preventing Supabase Auto-Pause

Supabase free plan pauses after 7 days of inactivity. This project includes a GitHub Action that automatically pings the database every 6 days to keep it active.

## Setup Instructions

### 1. Add GitHub Secrets

Go to your repository on GitHub:
1. Click **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add these two secrets:

**Secret 1:**
- Name: `NEXT_PUBLIC_SUPABASE_URL`
- Value: Your Supabase URL (from `.env.local`)

**Secret 2:**
- Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Value: Your Supabase anon key (from `.env.local`)

### 2. Enable GitHub Actions

The workflow file is already in `.github/workflows/keep-supabase-active.yml`

Once you push this file and add the secrets, the action will:
- Run automatically every 6 days
- Ping the database with a simple query
- Keep your database active (prevents auto-pause)

### 3. Verify It's Working

After pushing, you can:
- Go to **Actions** tab in GitHub
- Click **Keep Supabase Active**
- Click **Run workflow** to test it manually
- Check the logs to confirm it succeeded

## Alternative Options

### Option A: Manual Resume
- Just resume the database when needed (what you did today)
- Free, but requires manual action every 7 days

### Option B: Upgrade to Pro
- Cost: $25/month
- No auto-pause
- Better performance and features
- https://supabase.com/pricing

### Option C: External Cron Service
If GitHub Actions don't work, use:
- https://cron-job.org (free)
- Set up weekly GET request to: `https://cip-maker.vercel.app/api/health`
- Create a simple health check API route

## What Happens When Paused

When Supabase pauses:
- Database is offline
- All queries fail/timeout
- Website shows "No projects yet"
- **Data is NOT deleted** - just unavailable
- Resume button appears in Supabase dashboard

Resuming takes ~30 seconds and restores full functionality.
