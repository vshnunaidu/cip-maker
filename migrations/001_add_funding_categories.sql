-- Migration: Add funding categories as parent level above project categories
-- Run this SQL in the Supabase SQL editor

-- Create funding_categories table
create table funding_categories (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,  -- 'W', 'RW', 'WW'
  name text not null,         -- 'Water', 'Reclaimed Water', 'Wastewater'
  sort_order integer not null default 0,
  created_at timestamptz default now()
);

-- Add funding_category_id to project_categories
alter table project_categories
  add column funding_category_id uuid references funding_categories(id) on delete set null;

-- Seed the three funding categories
insert into funding_categories (code, name, sort_order) values
  ('W', 'Water', 1),
  ('RW', 'Reclaimed Water', 2),
  ('WW', 'Wastewater', 3);

-- Update existing project_categories to belong to 'W' (Water) by default
update project_categories
set funding_category_id = (select id from funding_categories where code = 'W');
