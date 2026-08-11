import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Please ensure .env.local exists with:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL=your_url')
  console.error('  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('✅ Environment variables loaded')
console.log(`📡 Connecting to Supabase at ${supabaseUrl.substring(0, 30)}...`)

// Stats tracking
const stats = {
  fundingCategoriesInserted: 0,
  fundingCategoriesSkipped: 0,
  subcategoriesInserted: 0,
  subcategoriesSkipped: 0,
  projectsInserted: 0,
  projectsSkipped: 0,
  bucketsUpserted: 0,
}

async function seedData() {
  console.log('🌱 Starting Richmond, TX CIP data seed...\n')

  // Step 1: Update plan settings
  console.log('📝 Updating plan settings...')
  const { error: settingsError } = await supabase
    .from('plan_settings')
    .upsert({
      id: 1,
      city_name: 'City of Richmond',
      plan_title: 'Utility Master Plan — Capital Improvement Program',
      base_year: 2025,
      inflation_rate: 3.0,
      start_year: 2026,
      end_year: 2035,
    })

  if (settingsError) {
    console.error('❌ Error updating plan settings:', settingsError.message)
  } else {
    console.log('✅ Plan settings updated\n')
  }

  // Step 2: Ensure funding categories exist
  console.log('📂 Ensuring funding categories exist...')
  const fundingCategories = [
    { code: 'W', name: 'Water', sort_order: 1 },
    { code: 'WW', name: 'Wastewater', sort_order: 2 },
    { code: 'RW', name: 'Reclaimed Water', sort_order: 3 },
  ]

  const fcMap: Record<string, string> = {}

  for (const fc of fundingCategories) {
    const { data: existing } = await supabase
      .from('funding_categories')
      .select('id')
      .eq('code', fc.code)
      .single()

    if (existing) {
      fcMap[fc.code] = existing.id
      stats.fundingCategoriesSkipped++
      console.log(`  ⏭️  Funding category ${fc.code} already exists`)
    } else {
      const { data: newFC, error } = await supabase
        .from('funding_categories')
        .insert(fc)
        .select('id')
        .single()

      if (error) {
        console.error(`  ❌ Error inserting ${fc.code}:`, error.message)
      } else {
        fcMap[fc.code] = newFC.id
        stats.fundingCategoriesInserted++
        console.log(`  ✅ Inserted funding category ${fc.code}`)
      }
    }
  }
  console.log()

  // Step 3: Ensure subcategories exist
  console.log('📁 Ensuring subcategories exist...')
  const subcategories = [
    // Water subcategories
    { name: 'Facility Rehabilitation Projects', funding_category_code: 'W', sort_order: 1 },
    { name: 'Distribution System Rehabilitation Projects', funding_category_code: 'W', sort_order: 2 },
    { name: 'Water Accounting Projects', funding_category_code: 'W', sort_order: 3 },
    { name: 'Facility Expansion Projects', funding_category_code: 'W', sort_order: 4 },
    { name: 'Distribution System Expansion Projects', funding_category_code: 'W', sort_order: 5 },
    // Wastewater subcategories
    { name: 'Facility Rehabilitation Projects', funding_category_code: 'WW', sort_order: 1 },
    { name: 'Collection System Rehabilitation Projects', funding_category_code: 'WW', sort_order: 2 },
    { name: 'Wastewater Accounting Projects', funding_category_code: 'WW', sort_order: 3 },
    { name: 'Wastewater Permitting Projects', funding_category_code: 'WW', sort_order: 4 },
    { name: 'Facility Expansion Projects', funding_category_code: 'WW', sort_order: 5 },
    { name: 'Collection System Expansion Projects', funding_category_code: 'WW', sort_order: 6 },
    // Reclaimed Water subcategories
    { name: 'Expansion Projects', funding_category_code: 'RW', sort_order: 1 },
  ]

  const subcatMap: Record<string, string> = {}

  for (const subcat of subcategories) {
    const fundingCategoryId = fcMap[subcat.funding_category_code]
    const key = `${subcat.funding_category_code}:${subcat.name}`

    const { data: existing } = await supabase
      .from('project_categories')
      .select('id')
      .eq('name', subcat.name)
      .eq('funding_category_id', fundingCategoryId)
      .single()

    if (existing) {
      subcatMap[key] = existing.id
      stats.subcategoriesSkipped++
      console.log(`  ⏭️  Subcategory "${subcat.name}" under ${subcat.funding_category_code} already exists`)
    } else {
      const { data: newSubcat, error } = await supabase
        .from('project_categories')
        .insert({
          name: subcat.name,
          funding_category_id: fundingCategoryId,
          sort_order: subcat.sort_order,
        })
        .select('id')
        .single()

      if (error) {
        console.error(`  ❌ Error inserting subcategory "${subcat.name}":`, error.message)
      } else {
        subcatMap[key] = newSubcat.id
        stats.subcategoriesInserted++
        console.log(`  ✅ Inserted subcategory "${subcat.name}" under ${subcat.funding_category_code}`)
      }
    }
  }
  console.log()

  // Step 4: Insert projects
  console.log('🏗️  Inserting projects...\n')

  const projects = [
    // W — Water projects
    {
      label: 'W-1',
      name: 'Surface Water Treatment Plant Membrane Replacement',
      description: 'Replace dual-media filters at WTP',
      category: 'W:Facility Rehabilitation Projects',
      buckets: [
        {
          type: 'issued_debt_cash',
          costs: { 2026: 104000, 2027: 108000, 2028: 112000, 2029: 117000, 2030: 122000, 2031: 127000, 2032: 132000, 2033: 137000, 2034: 142000, 2035: 148000 },
        },
      ],
    },
    {
      label: 'W-2',
      name: 'Surface Water Treatment Plant R/M',
      description: 'SW2503 — Surface water treatment plant rehabilitation and maintenance',
      category: 'W:Facility Rehabilitation Projects',
      buckets: [{ type: 'issued_debt_cash', costs: { 2026: 1466000 } }],
    },
    {
      label: 'W-3',
      name: 'New Well at Downtown WP',
      description: 'WA2502 — New production well at downtown water plant',
      category: 'W:Facility Rehabilitation Projects',
      buckets: [{ type: 'issued_debt_cash', costs: { 2026: 3427000 } }],
    },
    {
      label: 'W-4',
      name: 'Booster Pump Expansion at Downtown WP',
      description: 'Expand booster pump capacity at downtown water plant',
      category: 'W:Facility Rehabilitation Projects',
      buckets: [{ type: 'new_debt', costs: { 2026: 766000, 2027: 531000 } }],
    },
    {
      label: 'W-5',
      name: 'Well Rehabilitation at Richmond Parkway WP',
      description: 'WA2504 — Rehabilitate existing production wells at Richmond Parkway',
      category: 'W:Facility Rehabilitation Projects',
      buckets: [{ type: 'issued_debt_cash', costs: { 2026: 322000 } }],
    },
    {
      label: 'W-6',
      name: 'New Well at Richmond Parkway WP',
      description: 'New production well at Richmond Parkway water plant',
      category: 'W:Facility Rehabilitation Projects',
      buckets: [{ type: 'new_debt', costs: { 2026: 324000, 2027: 4891000 } }],
    },
    {
      label: 'W-7',
      name: 'Surface Water Treatment Plant Generator',
      description: 'SW2201 — Replacement generator for surface water treatment plant',
      category: 'W:Facility Rehabilitation Projects',
      buckets: [{ type: 'issued_debt_cash', costs: { 2026: 1170000 } }],
    },
    {
      label: 'W-8',
      name: 'Richmond Parkway GST 2 Rehabilitation',
      description: 'Rehabilitate ground storage tank 2 at Richmond Parkway',
      category: 'W:Facility Rehabilitation Projects',
      buckets: [{ type: 'new_debt', costs: { 2027: 103000, 2028: 606000 } }],
    },
    {
      label: 'W-9',
      name: 'Elevated Storage Tank (EST) Rehabilitation',
      description: 'Rehabilitate elevated storage tank',
      category: 'W:Facility Rehabilitation Projects',
      buckets: [{ type: 'new_debt', costs: { 2028: 98000, 2029: 576000 } }],
    },
    {
      label: 'W-10',
      name: 'Municipal Facility Renovations — Water Fund Share',
      description: 'MU2405 — Water fund share of municipal facility renovations',
      category: 'W:Facility Rehabilitation Projects',
      buckets: [{ type: 'issued_debt_cash', costs: { 2026: 936000 } }],
    },
    {
      label: 'W-11',
      name: 'Waterline Rehab — Zone A',
      description: 'Rehabilitate aging water mains in Zone A',
      category: 'W:Distribution System Rehabilitation Projects',
      buckets: [{ type: 'new_debt', costs: { 2026: 372000, 2027: 2194000 } }],
    },
    {
      label: 'W-12',
      name: 'Waterline Rehab — Zone C and D Design',
      description: 'Design phase for waterline rehabilitation in Zones C and D',
      category: 'W:Distribution System Rehabilitation Projects',
      buckets: [{ type: 'new_debt', costs: { 2028: 202000, 2029: 1955000, 2030: 304000, 2031: 2114000 } }],
    },
    {
      label: 'W-13',
      name: 'Advanced Metering Infrastructure (AMI) — Water Fund Share',
      description: 'MU2403 — Water fund share of AMI system upgrade',
      category: 'W:Water Accounting Projects',
      buckets: [{ type: 'issued_debt_cash', costs: { 2026: 3224000 } }],
    },
    {
      label: 'W-14',
      name: 'Wholesale / MUD Master Meters',
      description: 'WA2503 — Install master meters for wholesale and MUD connections',
      category: 'W:Water Accounting Projects',
      buckets: [{ type: 'issued_debt_cash', costs: { 2026: 260000 } }],
    },
    {
      label: 'W-15',
      name: 'Water Plant Pump Testing',
      description: 'Performance testing for water plant pumps',
      category: 'W:Water Accounting Projects',
      buckets: [{ type: 'new_debt', costs: { 2028: 34000 } }],
    },
    {
      label: 'W-16',
      name: 'Surface Water Treatment Plant Expansion PER',
      description: 'Preliminary engineering report for SWTP expansion',
      category: 'W:Facility Expansion Projects',
      buckets: [{ type: 'issued_debt_cash', costs: { 2026: 52000 } }],
    },
    {
      label: 'W-17',
      name: 'Surface Water Treatment Plant Expansion to 4 MGD',
      description: 'Expand surface water treatment plant capacity to 4 million gallons per day',
      category: 'W:Facility Expansion Projects',
      buckets: [
        { type: 'new_debt', costs: { 2028: 3916090 } },
        { type: 'impact_fees', costs: { 2028: 2940000, 2029: 8662000, 2030: 9009000 } },
      ],
    },
    {
      label: 'W-18',
      name: 'Surface Water Treatment Plant Solids Handling',
      description: 'Solids handling improvements at surface water treatment plant',
      category: 'W:Facility Expansion Projects',
      buckets: [{ type: 'new_debt', costs: { 2031: 590000, 2032: 3478000 } }],
    },
    {
      label: 'W-19',
      name: 'New Elevated Storage Tank along FM 762',
      description: 'New 1.5 MG elevated storage tank along FM 762',
      category: 'W:Facility Expansion Projects',
      buckets: [{ type: 'impact_fees', costs: { 2027: 672000, 2028: 3959000 } }],
    },
    {
      label: 'W-20',
      name: 'New Well at Edgar WP',
      description: 'New production well at Edgar water plant',
      category: 'W:Facility Expansion Projects',
      buckets: [{ type: 'impact_fees', costs: { 2028: 1468000, 2029: 7328000 } }],
    },
    {
      label: 'W-21',
      name: 'Edgar WP Expansion',
      description: 'Expand treatment capacity at Edgar water plant',
      category: 'W:Facility Expansion Projects',
      buckets: [{ type: 'impact_fees', costs: { 2031: 891000, 2032: 5252000 } }],
    },
    {
      label: 'W-22',
      name: 'Rabbs Bayou Water Plant',
      description: 'New surface water treatment plant at Rabbs Bayou',
      category: 'W:Facility Expansion Projects',
      buckets: [{ type: 'impact_fees', costs: { 2028: 675000, 2032: 4154000, 2033: 12242000, 2034: 12731000 } }],
    },
    {
      label: 'W-23',
      name: 'Update Utility Master Plan',
      description: "Update the city's utility master plan document",
      category: 'W:Facility Expansion Projects',
      buckets: [{ type: 'new_debt', costs: { 2028: 56000, 2029: 234000, 2030: 243000 } }],
    },
    {
      label: 'W-24',
      name: 'New Transmission Line (SWTP to Downtown)',
      description: 'New transmission main from surface water treatment plant to downtown',
      category: 'W:Distribution System Expansion Projects',
      buckets: [{ type: 'new_debt', costs: { 2031: 643000, 2032: 3790000 } }],
    },
    {
      label: 'W-25',
      name: 'Alt 90 Waterline Extension Upsizing',
      description: 'Upsize waterline extension along Alt 90',
      category: 'W:Distribution System Expansion Projects',
      buckets: [{ type: 'impact_fees', costs: { 2029: 263000, 2030: 1550000 } }],
    },
    {
      label: 'W-26',
      name: 'New Transmission Line (River Pointe Area)',
      description: 'New transmission main serving River Pointe development area',
      category: 'W:Distribution System Expansion Projects',
      buckets: [{ type: 'impact_fees', costs: { 2026: 200000, 2027: 1176000 } }],
    },
    {
      label: 'W-27',
      name: 'Williams Way Waterline Loop',
      description: 'New waterline loop along Williams Way',
      category: 'W:Distribution System Expansion Projects',
      buckets: [{ type: 'new_debt', costs: { 2026: 561000, 2027: 3305000 } }],
    },
    {
      label: 'W-28',
      name: 'New Waterline to FM 762',
      description: 'New waterline extension to FM 762 corridor',
      category: 'W:Distribution System Expansion Projects',
      buckets: [{ type: 'impact_fees', costs: { 2033: 157000, 2034: 924000 } }],
    },
    {
      label: 'W-29',
      name: 'New Waterline (US-59 Eastbound Frontage)',
      description: 'New waterline along US-59 eastbound frontage road',
      category: 'W:Distribution System Expansion Projects',
      buckets: [{ type: 'impact_fees', costs: { 2028: 512000, 2029: 3018000 } }],
    },
    {
      label: 'W-30',
      name: 'New Waterline (MUD 207 and WR MUD 1)',
      description: 'New waterline serving MUD 207 and WR MUD 1',
      category: 'W:Distribution System Expansion Projects',
      buckets: [{ type: 'impact_fees', costs: { 2030: 480000, 2031: 2826000 } }],
    },
    {
      label: 'W-31',
      name: 'New Waterline along FM 359',
      description: 'WA2405 — New waterline extension along FM 359',
      category: 'W:Distribution System Expansion Projects',
      buckets: [{ type: 'issued_debt_cash', costs: { 2033: 219000, 2034: 1291000 } }],
    },

    // WW — Wastewater projects
    {
      label: 'WW-1',
      name: 'Regional WWTP Solids Handling',
      description: 'WW2503 — Solids handling improvements at regional wastewater treatment plant',
      category: 'WW:Facility Rehabilitation Projects',
      buckets: [{ type: 'issued_debt_cash', costs: { 2026: 1359000 } }],
    },
    {
      label: 'WW-2',
      name: 'Regional WWTP Rehabilitation',
      description: 'General rehabilitation of regional wastewater treatment plant',
      category: 'WW:Facility Rehabilitation Projects',
      buckets: [{ type: 'new_debt', costs: { 2026: 407000, 2027: 2399000 } }],
    },
    {
      label: 'WW-3',
      name: 'South WWTP Solids Handling',
      description: 'Solids handling improvements at south wastewater treatment plant',
      category: 'WW:Facility Rehabilitation Projects',
      buckets: [{ type: 'new_debt', costs: { 2032: 578000, 2033: 3406000 } }],
    },
    {
      label: 'WW-4',
      name: 'North 2nd Lift Station Rehab and Expansion',
      description: 'WW2301 — Rehabilitate and expand north 2nd lift station (GLO Grant)',
      category: 'WW:Facility Rehabilitation Projects',
      buckets: [{ type: 'issued_debt_cash', costs: { 2026: 2163000 } }],
    },
    {
      label: 'WW-5',
      name: 'Greenwood Lift Station Rehab',
      description: 'Rehabilitate Greenwood lift station',
      category: 'WW:Facility Rehabilitation Projects',
      buckets: [{ type: 'new_debt', costs: { 2026: 168000, 2027: 988000 } }],
    },
    {
      label: 'WW-6',
      name: '7th Street Lift Station Rehab',
      description: 'Rehabilitate 7th Street lift station',
      category: 'WW:Facility Rehabilitation Projects',
      buckets: [{ type: 'new_debt', costs: { 2026: 187000, 2027: 1102000 } }],
    },
    {
      label: 'WW-7',
      name: 'George Park Lift Station Rehab and New Force Main',
      description: 'Rehabilitate George Park lift station and install new force main',
      category: 'WW:Facility Rehabilitation Projects',
      buckets: [{ type: 'new_debt', costs: { 2026: 84000, 2027: 496000 } }],
    },
    {
      label: 'WW-8',
      name: 'Brazos River Rehabilitation and Force Main Reversal',
      description: 'Rehabilitate Brazos River crossing and reverse force main flow direction',
      category: 'WW:Facility Rehabilitation Projects',
      buckets: [{ type: 'new_debt', costs: { 2033: 859000, 2034: 5064000 } }],
    },
    {
      label: 'WW-10',
      name: 'Municipal Facility Renovations — Wastewater Fund Share',
      description: 'MU2405 — Wastewater fund share of municipal facility renovations',
      category: 'WW:Facility Rehabilitation Projects',
      buckets: [{ type: 'issued_debt_cash', costs: { 2026: 936000 } }],
    },
    {
      label: 'WW-9',
      name: 'Collection System Rehabilitation — Phase 1',
      description: 'Rehabilitate deteriorated collection system infrastructure, Phase 1',
      category: 'WW:Collection System Rehabilitation Projects',
      buckets: [{ type: 'new_debt', costs: { 2028: 253000, 2029: 1492000 } }],
    },
    {
      label: 'WW-11',
      name: 'Collection System Rehabilitation — Phase 2',
      description: 'Rehabilitate deteriorated collection system infrastructure, Phase 2',
      category: 'WW:Collection System Rehabilitation Projects',
      buckets: [{ type: 'new_debt', costs: { 2030: 274000, 2031: 1613000 } }],
    },
    {
      label: 'WW-12',
      name: 'Collection System Rehabilitation — Phase 3',
      description: 'Rehabilitate deteriorated collection system infrastructure, Phase 3',
      category: 'WW:Collection System Rehabilitation Projects',
      buckets: [{ type: 'new_debt', costs: { 2031: 296000, 2032: 1745000 } }],
    },
    {
      label: 'WW-13R',
      name: 'Collection System Rehabilitation — Phase 4',
      description: 'Rehabilitate deteriorated collection system infrastructure, Phase 4',
      category: 'WW:Collection System Rehabilitation Projects',
      buckets: [{ type: 'new_debt', costs: { 2033: 320000, 2034: 1887000 } }],
    },
    {
      label: 'WW-13',
      name: 'Automatic Meter Infrastructure (AMI) — Wastewater Fund Share',
      description: 'MU2403 — Wastewater fund share of AMI system upgrade',
      category: 'WW:Wastewater Accounting Projects',
      buckets: [{ type: 'issued_debt_cash', costs: { 2026: 3224000 } }],
    },
    {
      label: 'WW-13b',
      name: 'Collection System Flow Monitoring',
      description: 'Install flow monitoring throughout the collection system',
      category: 'WW:Wastewater Accounting Projects',
      buckets: [{ type: 'new_debt', costs: { 2028: 169000 } }],
    },
    {
      label: 'WW-14',
      name: 'Regional and South WWTP Permit Renewals',
      description: 'Renew operating permits for regional and south wastewater treatment plants',
      category: 'WW:Wastewater Permitting Projects',
      buckets: [{ type: 'new_debt', costs: { 2029: 70000, 2031: 85000 } }],
    },
    {
      label: 'WW-15',
      name: 'East WWTP Design',
      description: 'Design for new east wastewater treatment plant',
      category: 'WW:Facility Expansion Projects',
      buckets: [{ type: 'impact_fees', costs: { 2026: 1300000, 2027: 1352000 } }],
    },
    {
      label: 'WW-16',
      name: 'East WWTP and Outfall Construction',
      description: 'Construct new east wastewater treatment plant and outfall',
      category: 'WW:Facility Expansion Projects',
      buckets: [{ type: 'impact_fees', costs: { 2030: 30948000, 2031: 42915000, 2032: 33474000 } }],
    },
    {
      label: 'WW-17',
      name: 'FM 359 Lift Station Capacity Expansion and New Force Main',
      description: 'Expand FM 359 lift station capacity and install new force main',
      category: 'WW:Facility Expansion Projects',
      buckets: [{ type: 'impact_fees', costs: { 2031: 730000, 2032: 4301000 } }],
    },
    {
      label: 'WW-18',
      name: 'Regional WWTP Re-Rate and Expansion Evaluation',
      description: 'Evaluate re-rating and expansion options for regional WWTP',
      category: 'WW:Facility Expansion Projects',
      buckets: [{ type: 'impact_fees', costs: { 2026: 208000 } }],
    },
    {
      label: 'WW-19',
      name: 'South WWTP Master Lift Station',
      description: 'WW2510 — New master lift station at south WWTP',
      category: 'WW:Facility Expansion Projects',
      buckets: [{ type: 'new_debt', costs: { 2026: 2756000 } }],
    },
    {
      label: 'WW-20',
      name: 'FM 359 North Lift Station',
      description: 'New lift station on FM 359 north corridor',
      category: 'WW:Collection System Expansion Projects',
      buckets: [{ type: 'impact_fees', costs: { 2026: 1778000 } }],
    },
    {
      label: 'WW-21',
      name: 'Del Webb Lift Station Expansion',
      description: 'Expand Del Webb lift station capacity',
      category: 'WW:Collection System Expansion Projects',
      buckets: [{ type: 'impact_fees', costs: { 2026: 358000, 2027: 2108000 } }],
    },
    {
      label: 'WW-22',
      name: 'South WWTP Collector',
      description: 'New gravity collector main to south WWTP',
      category: 'WW:Collection System Expansion Projects',
      buckets: [{ type: 'impact_fees', costs: { 2026: 193000, 2027: 1220000, 2028: 460000 } }],
    },

    // RW — Reclaimed Water projects
    {
      label: 'RW-1',
      name: 'Regional WWTP 2nd Filter Train',
      description: 'Install second filter train at regional WWTP for reclaimed water production',
      category: 'RW:Expansion Projects',
      buckets: [{ type: 'new_debt', costs: { 2027: 390000, 2028: 2299000 } }],
    },
    {
      label: 'RW-2',
      name: 'East WWTP Reclaimed Water System',
      description: 'Reclaimed water distribution system at east WWTP',
      category: 'RW:Expansion Projects',
      buckets: [{ type: 'impact_fees', costs: { 2033: 1114000, 2034: 6568000 } }],
    },
    {
      label: 'RW-3',
      name: 'East Reclaimed Water Trunk Line',
      description: 'New reclaimed water trunk line from east WWTP',
      category: 'RW:Expansion Projects',
      buckets: [{ type: 'impact_fees', costs: { 2034: 688000, 2035: 4054000 } }],
    },
  ]

  let totalInflatedCost = 0

  for (const project of projects) {
    const categoryId = subcatMap[project.category]
    if (!categoryId) {
      console.error(`  ❌ Category not found: ${project.category}`)
      continue
    }

    // Check if project exists
    const { data: existing } = await supabase
      .from('projects')
      .select('id')
      .eq('project_id_label', project.label)
      .single()

    let projectId: string

    if (existing) {
      projectId = existing.id
      stats.projectsSkipped++
      console.log(`  ⏭️  Project ${project.label} already exists, updating buckets...`)
    } else {
      const { data: newProject, error } = await supabase
        .from('projects')
        .insert({
          project_id_label: project.label,
          name: project.name,
          description: project.description,
          category_id: categoryId,
          enabled: true,
          sort_order: 999,
        })
        .select('id')
        .single()

      if (error) {
        console.error(`  ❌ Error inserting project ${project.label}:`, error.message)
        continue
      }

      projectId = newProject.id
      stats.projectsInserted++
      console.log(`  ✅ Inserted project ${project.label}: ${project.name}`)
    }

    // Upsert buckets
    for (const bucket of project.buckets) {
      const yearCosts: Record<string, number> = {}
      for (const [year, cost] of Object.entries(bucket.costs)) {
        yearCosts[year] = cost
        totalInflatedCost += cost
      }

      // Check if bucket exists
      const { data: existingBucket } = await supabase
        .from('project_buckets')
        .select('id')
        .eq('project_id', projectId)
        .eq('bucket_type', bucket.type)
        .single()

      if (existingBucket) {
        // Update existing bucket
        const { error } = await supabase
          .from('project_buckets')
          .update({ year_costs: yearCosts })
          .eq('id', existingBucket.id)

        if (error) {
          console.error(`    ❌ Error updating bucket ${bucket.type} for ${project.label}:`, error.message)
        } else {
          stats.bucketsUpserted++
          console.log(`    🔄 Updated bucket ${bucket.type} for ${project.label}`)
        }
      } else {
        // Insert new bucket
        const { error } = await supabase.from('project_buckets').insert({
          project_id: projectId,
          bucket_type: bucket.type,
          year_costs: yearCosts,
        })

        if (error) {
          console.error(`    ❌ Error inserting bucket ${bucket.type} for ${project.label}:`, error.message)
        } else {
          stats.bucketsUpserted++
          console.log(`    ➕ Inserted bucket ${bucket.type} for ${project.label}`)
        }
      }
    }

    // Insert empty buckets for the other two bucket types if they don't exist
    const allBucketTypes = ['issued_debt_cash', 'new_debt', 'impact_fees']
    const usedBucketTypes = project.buckets.map((b) => b.type)
    const emptyBucketTypes = allBucketTypes.filter((t) => !usedBucketTypes.includes(t))

    for (const bucketType of emptyBucketTypes) {
      const { data: existingBucket } = await supabase
        .from('project_buckets')
        .select('id')
        .eq('project_id', projectId)
        .eq('bucket_type', bucketType)
        .single()

      if (!existingBucket) {
        await supabase.from('project_buckets').insert({
          project_id: projectId,
          bucket_type: bucketType,
          year_costs: {},
        })
      }
    }
  }

  console.log('\n📊 Seed Summary:')
  console.log(`  Funding Categories: ${stats.fundingCategoriesInserted} inserted, ${stats.fundingCategoriesSkipped} skipped`)
  console.log(`  Subcategories: ${stats.subcategoriesInserted} inserted, ${stats.subcategoriesSkipped} skipped`)
  console.log(`  Projects: ${stats.projectsInserted} inserted, ${stats.projectsSkipped} skipped`)
  console.log(`  Buckets: ${stats.bucketsUpserted} upserted`)
  console.log(`  Grand Total Inflated Cost: $${(totalInflatedCost / 1000000).toFixed(2)}M`)

  if (totalInflatedCost < 200000000 || totalInflatedCost > 270000000) {
    console.log('\n⚠️  WARNING: Grand total is outside expected range of $200M-$270M')
    console.log('  Please verify the data entry')
  } else {
    console.log('\n✅ Grand total looks correct (within expected range)')
  }

  console.log('\n🎉 Seed completed successfully!')
}

seedData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  })
