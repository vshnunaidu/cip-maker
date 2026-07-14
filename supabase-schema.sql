-- CIP Tracker Database Schema
-- Run this SQL in the Supabase SQL editor

-- Project categories (e.g. "Facility Rehabilitation", "Distribution System")
create table project_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz default now()
);

-- Projects
create table projects (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references project_categories(id) on delete set null,
  project_id_label text,              -- display ID like "W-1", "W-17"
  name text not null,
  description text,
  enabled boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- One row per funding bucket per project (3 rows per project max)
-- bucket_type: 'issued_debt_cash' | 'new_debt' | 'impact_fees'
-- year_costs: JSONB object like { "2026": 372000, "2027": 2194000 }
create table project_buckets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  bucket_type text not null check (bucket_type in ('issued_debt_cash','new_debt','impact_fees')),
  year_costs jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(project_id, bucket_type)
);

-- Global plan settings (one row, upserted)
create table plan_settings (
  id integer primary key default 1,
  city_name text not null default 'City Name',
  plan_title text not null default 'Water Capital Improvement Program',
  base_year integer not null default 2025,
  inflation_rate numeric(5,2) not null default 3.00,
  start_year integer not null default 2026,
  end_year integer not null default 2035,
  constraint single_row check (id = 1)
);

-- Insert default settings
insert into plan_settings (id) values (1) on conflict do nothing;

-- Seed categories
insert into project_categories (name, sort_order) values
  ('Facility Rehabilitation', 1),
  ('Distribution System Rehabilitation', 2),
  ('Water Accounting Projects', 3),
  ('Facility Expansion', 4),
  ('Distribution System Expansion', 5);
