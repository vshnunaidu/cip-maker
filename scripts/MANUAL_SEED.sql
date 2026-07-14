-- Manual Seed Data for CIP Tracker
-- Run this SQL directly in your Supabase SQL Editor
-- This will insert 5 Richmond, TX water projects with all funding data

-- ==================================================
-- STEP 1: Get category IDs
-- ==================================================
-- First, let's verify the categories exist and get their IDs
-- You'll need these IDs for the next steps

-- Run this query to see your category IDs:
-- SELECT id, name FROM project_categories ORDER BY sort_order;

-- Expected categories (created by supabase-schema.sql):
-- 1. Facility Rehabilitation
-- 2. Distribution System Rehabilitation
-- 3. Water Accounting Projects
-- 4. Facility Expansion
-- 5. Distribution System Expansion

-- ==================================================
-- STEP 2: Delete existing seed data (if re-seeding)
-- ==================================================
DELETE FROM projects WHERE project_id_label IN ('W-1', 'W-11', 'W-12', 'W-17', 'W-19');

-- ==================================================
-- STEP 3: Insert Projects
-- ==================================================
-- NOTE: Replace the category_id values below with the actual UUIDs from your database
-- You can get them by running: SELECT id, name FROM project_categories;

-- W-1: Surface Water Treatment Plant Membrane Replacement
INSERT INTO projects (project_id_label, name, description, category_id, enabled, sort_order)
VALUES (
  'W-1',
  'Surface Water Treatment Plant Membrane Replacement',
  NULL,
  (SELECT id FROM project_categories WHERE name = 'Facility Rehabilitation'),
  true,
  1
);

-- W-11: Waterline Rehab — Zone A
INSERT INTO projects (project_id_label, name, description, category_id, enabled, sort_order)
VALUES (
  'W-11',
  'Waterline Rehab — Zone A',
  NULL,
  (SELECT id FROM project_categories WHERE name = 'Distribution System Rehabilitation'),
  true,
  2
);

-- W-12: Waterline Rehab — Zone C and D Design
INSERT INTO projects (project_id_label, name, description, category_id, enabled, sort_order)
VALUES (
  'W-12',
  'Waterline Rehab — Zone C and D Design',
  NULL,
  (SELECT id FROM project_categories WHERE name = 'Distribution System Rehabilitation'),
  true,
  3
);

-- W-17: Surface Water Treatment Plant Expansion to 4 MGD
INSERT INTO projects (project_id_label, name, description, category_id, enabled, sort_order)
VALUES (
  'W-17',
  'Surface Water Treatment Plant Expansion to 4 MGD',
  NULL,
  (SELECT id FROM project_categories WHERE name = 'Facility Expansion'),
  true,
  4
);

-- W-19: New Elevated Storage Tank along FM 762
INSERT INTO projects (project_id_label, name, description, category_id, enabled, sort_order)
VALUES (
  'W-19',
  'New Elevated Storage Tank along FM 762',
  NULL,
  (SELECT id FROM project_categories WHERE name = 'Facility Expansion'),
  true,
  5
);

-- ==================================================
-- STEP 4: Insert Funding Buckets for W-1
-- ==================================================
-- W-1: Issued Debt/Cash bucket (2026-2035)
INSERT INTO project_buckets (project_id, bucket_type, year_costs)
VALUES (
  (SELECT id FROM projects WHERE project_id_label = 'W-1'),
  'issued_debt_cash',
  '{
    "2026": 104000,
    "2027": 108000,
    "2028": 112000,
    "2029": 117000,
    "2030": 122000,
    "2031": 127000,
    "2032": 132000,
    "2033": 137000,
    "2034": 142000,
    "2035": 148000
  }'::jsonb
);

-- W-1: New Debt bucket (empty)
INSERT INTO project_buckets (project_id, bucket_type, year_costs)
VALUES (
  (SELECT id FROM projects WHERE project_id_label = 'W-1'),
  'new_debt',
  '{}'::jsonb
);

-- W-1: Impact Fees bucket (empty)
INSERT INTO project_buckets (project_id, bucket_type, year_costs)
VALUES (
  (SELECT id FROM projects WHERE project_id_label = 'W-1'),
  'impact_fees',
  '{}'::jsonb
);

-- ==================================================
-- STEP 5: Insert Funding Buckets for W-11
-- ==================================================
-- W-11: Issued Debt/Cash bucket (empty)
INSERT INTO project_buckets (project_id, bucket_type, year_costs)
VALUES (
  (SELECT id FROM projects WHERE project_id_label = 'W-11'),
  'issued_debt_cash',
  '{}'::jsonb
);

-- W-11: New Debt bucket (2026-2027)
INSERT INTO project_buckets (project_id, bucket_type, year_costs)
VALUES (
  (SELECT id FROM projects WHERE project_id_label = 'W-11'),
  'new_debt',
  '{
    "2026": 372000,
    "2027": 2194000
  }'::jsonb
);

-- W-11: Impact Fees bucket (empty)
INSERT INTO project_buckets (project_id, bucket_type, year_costs)
VALUES (
  (SELECT id FROM projects WHERE project_id_label = 'W-11'),
  'impact_fees',
  '{}'::jsonb
);

-- ==================================================
-- STEP 6: Insert Funding Buckets for W-12
-- ==================================================
-- W-12: Issued Debt/Cash bucket (empty)
INSERT INTO project_buckets (project_id, bucket_type, year_costs)
VALUES (
  (SELECT id FROM projects WHERE project_id_label = 'W-12'),
  'issued_debt_cash',
  '{}'::jsonb
);

-- W-12: New Debt bucket (2028-2031)
INSERT INTO project_buckets (project_id, bucket_type, year_costs)
VALUES (
  (SELECT id FROM projects WHERE project_id_label = 'W-12'),
  'new_debt',
  '{
    "2028": 202000,
    "2029": 1955000,
    "2030": 304000,
    "2031": 2114000
  }'::jsonb
);

-- W-12: Impact Fees bucket (empty)
INSERT INTO project_buckets (project_id, bucket_type, year_costs)
VALUES (
  (SELECT id FROM projects WHERE project_id_label = 'W-12'),
  'impact_fees',
  '{}'::jsonb
);

-- ==================================================
-- STEP 7: Insert Funding Buckets for W-17
-- ==================================================
-- W-17: Issued Debt/Cash bucket (empty)
INSERT INTO project_buckets (project_id, bucket_type, year_costs)
VALUES (
  (SELECT id FROM projects WHERE project_id_label = 'W-17'),
  'issued_debt_cash',
  '{}'::jsonb
);

-- W-17: New Debt bucket (2028)
INSERT INTO project_buckets (project_id, bucket_type, year_costs)
VALUES (
  (SELECT id FROM projects WHERE project_id_label = 'W-17'),
  'new_debt',
  '{
    "2028": 3916090
  }'::jsonb
);

-- W-17: Impact Fees bucket (2028-2030)
INSERT INTO project_buckets (project_id, bucket_type, year_costs)
VALUES (
  (SELECT id FROM projects WHERE project_id_label = 'W-17'),
  'impact_fees',
  '{
    "2028": 2940000,
    "2029": 8662000,
    "2030": 9009000
  }'::jsonb
);

-- ==================================================
-- STEP 8: Insert Funding Buckets for W-19
-- ==================================================
-- W-19: Issued Debt/Cash bucket (empty)
INSERT INTO project_buckets (project_id, bucket_type, year_costs)
VALUES (
  (SELECT id FROM projects WHERE project_id_label = 'W-19'),
  'issued_debt_cash',
  '{}'::jsonb
);

-- W-19: New Debt bucket (empty)
INSERT INTO project_buckets (project_id, bucket_type, year_costs)
VALUES (
  (SELECT id FROM projects WHERE project_id_label = 'W-19'),
  'new_debt',
  '{}'::jsonb
);

-- W-19: Impact Fees bucket (2027-2028)
INSERT INTO project_buckets (project_id, bucket_type, year_costs)
VALUES (
  (SELECT id FROM projects WHERE project_id_label = 'W-19'),
  'impact_fees',
  '{
    "2027": 672000,
    "2028": 3959000
  }'::jsonb
);

-- ==================================================
-- VERIFICATION
-- ==================================================
-- Run these queries to verify the data was inserted correctly:

-- Check projects
SELECT project_id_label, name, enabled
FROM projects
WHERE project_id_label IN ('W-1', 'W-11', 'W-12', 'W-17', 'W-19')
ORDER BY project_id_label;

-- Check buckets (should be 15 total - 3 per project)
SELECT p.project_id_label, pb.bucket_type, pb.year_costs
FROM project_buckets pb
JOIN projects p ON pb.project_id = p.id
WHERE p.project_id_label IN ('W-1', 'W-11', 'W-12', 'W-17', 'W-19')
ORDER BY p.project_id_label, pb.bucket_type;

-- Success message
SELECT
  '✅ Seed data inserted successfully!' as message,
  COUNT(DISTINCT p.id) as total_projects,
  COUNT(pb.id) as total_buckets
FROM projects p
LEFT JOIN project_buckets pb ON p.id = pb.project_id
WHERE p.project_id_label IN ('W-1', 'W-11', 'W-12', 'W-17', 'W-19');
