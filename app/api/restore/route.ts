import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Define all funding categories
const FUNDING_CATEGORIES = [
  { code: 'W', name: 'Water', sort_order: 1 },
  { code: 'WW', name: 'Wastewater', sort_order: 2 },
  { code: 'RW', name: 'Reclaimed Water', sort_order: 3 },
]

// Define all subcategories
const SUBCATEGORIES = {
  W: [
    { name: 'Facility Rehabilitation Projects', sort_order: 1 },
    { name: 'Distribution System Rehabilitation Projects', sort_order: 2 },
    { name: 'Water Accounting Projects', sort_order: 3 },
    { name: 'Facility Expansion Projects', sort_order: 4 },
    { name: 'Distribution System Expansion Projects', sort_order: 5 },
  ],
  WW: [
    { name: 'Facility Rehabilitation Projects', sort_order: 1 },
    { name: 'Collection System Rehabilitation Projects', sort_order: 2 },
    { name: 'Wastewater Accounting Projects', sort_order: 3 },
    { name: 'Wastewater Permitting Projects', sort_order: 4 },
    { name: 'Facility Expansion Projects', sort_order: 5 },
    { name: 'Collection System Expansion Projects', sort_order: 6 },
  ],
  RW: [
    { name: 'Expansion Projects', sort_order: 1 },
  ],
}

// Define all projects with their data
const PROJECTS = [
  // W — Facility Rehabilitation Projects
  {
    fundingCategory: 'W',
    subcategory: 'Facility Rehabilitation Projects',
    project_id_label: 'W-1',
    name: 'Surface Water Treatment Plant Membrane Replacement',
    description: 'Replacement of membrane filtration system at WTP',
    sort_order: 1,
    budget_ceiling: 1000000,
    buckets: {
      issued_debt_cash: {"2026":100000,"2027":100000,"2028":100000,"2029":100000,"2030":100000,"2031":100000,"2032":100000,"2033":100000,"2034":100000,"2035":100000},
      new_debt: {},
      impact_fees: {},
    },
  },
  {
    fundingCategory: 'W',
    subcategory: 'Facility Rehabilitation Projects',
    project_id_label: 'W-2',
    name: 'Surface Water Treatment Plant R/M',
    description: 'SW2503 — Routine maintenance and rehabilitation',
    sort_order: 2,
    budget_ceiling: 1410000,
    buckets: {
      issued_debt_cash: {"2026":1410000},
      new_debt: {},
      impact_fees: {},
    },
  },
  {
    fundingCategory: 'W',
    subcategory: 'Facility Rehabilitation Projects',
    project_id_label: 'W-3',
    name: 'New Well at Downtown WP',
    description: 'WA2502 — New production well at downtown water plant',
    sort_order: 3,
    budget_ceiling: 3295000,
    buckets: {
      issued_debt_cash: {"2026":3295000},
      new_debt: {},
      impact_fees: {},
    },
  },
  {
    fundingCategory: 'W',
    subcategory: 'Facility Rehabilitation Projects',
    project_id_label: 'W-4',
    name: 'Booster Pump Expansion at Downtown WP',
    description: 'Expand booster pump capacity',
    sort_order: 4,
    budget_ceiling: 1228000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {"2026":736800,"2027":491200},
      impact_fees: {},
    },
  },
  {
    fundingCategory: 'W',
    subcategory: 'Facility Rehabilitation Projects',
    project_id_label: 'W-5',
    name: 'Well Rehabilitation at Richmond Parkway WP',
    description: 'WA2504 — Rehabilitate existing production wells',
    sort_order: 5,
    budget_ceiling: 310000,
    buckets: {
      issued_debt_cash: {"2026":310000},
      new_debt: {},
      impact_fees: {},
    },
  },
  {
    fundingCategory: 'W',
    subcategory: 'Facility Rehabilitation Projects',
    project_id_label: 'W-6',
    name: 'New Well at Richmond Parkway WP',
    description: 'New production well at Richmond Parkway',
    sort_order: 6,
    budget_ceiling: 4834000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {"2026":312000,"2027":4522000},
      impact_fees: {},
    },
  },
  {
    fundingCategory: 'W',
    subcategory: 'Facility Rehabilitation Projects',
    project_id_label: 'W-7',
    name: 'Surface Water Treatment Plant Generator',
    description: 'SW2201 — Replacement generator for SWTP',
    sort_order: 7,
    budget_ceiling: 1125000,
    buckets: {
      issued_debt_cash: {"2026":1125000},
      new_debt: {},
      impact_fees: {},
    },
  },
  {
    fundingCategory: 'W',
    subcategory: 'Facility Rehabilitation Projects',
    project_id_label: 'W-8',
    name: 'Richmond Parkway GST 2 Rehabilitation',
    description: 'Rehabilitate ground storage tank 2',
    sort_order: 8,
    budget_ceiling: 634000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {"2027":95100,"2028":538900},
      impact_fees: {},
    },
  },
  {
    fundingCategory: 'W',
    subcategory: 'Facility Rehabilitation Projects',
    project_id_label: 'W-9',
    name: 'Elevated Storage Tank (EST) Rehabilitation',
    description: 'Rehabilitate elevated storage tank',
    sort_order: 9,
    budget_ceiling: 579000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {"2028":86850,"2029":492150},
      impact_fees: {},
    },
  },
  {
    fundingCategory: 'W',
    subcategory: 'Facility Rehabilitation Projects',
    project_id_label: 'W-10',
    name: 'Municipal Facility Renovations — Water Fund Share',
    description: 'MU2405 — Water fund share',
    sort_order: 10,
    budget_ceiling: 900000,
    buckets: {
      issued_debt_cash: {"2026":900000},
      new_debt: {},
      impact_fees: {},
    },
  },

  // W — Distribution System Rehabilitation Projects
  {
    fundingCategory: 'W',
    subcategory: 'Distribution System Rehabilitation Projects',
    project_id_label: 'W-11',
    name: 'Waterline Rehab — Zone A',
    description: 'Replacement of small-diameter lines for system reliability',
    sort_order: 11,
    budget_ceiling: 2386000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {"2026":357900,"2027":2028100},
      impact_fees: {},
    },
  },
  {
    fundingCategory: 'W',
    subcategory: 'Distribution System Rehabilitation Projects',
    project_id_label: 'W-12',
    name: 'Waterline Rehab — Zone C and D Design',
    description: 'Design phase for Zones C and D rehabilitation',
    sort_order: 12,
    budget_ceiling: 3772000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {"2028":180000,"2029":1671000,"2030":250000,"2031":1671000},
      impact_fees: {},
    },
  },

  // W — Water Accounting Projects
  {
    fundingCategory: 'W',
    subcategory: 'Water Accounting Projects',
    project_id_label: 'W-13',
    name: 'Advanced Metering Infrastructure (AMI) — Water Fund Share',
    description: 'MU2403 — AMI water share',
    sort_order: 13,
    budget_ceiling: 3100000,
    buckets: {
      issued_debt_cash: {"2026":3100000},
      new_debt: {},
      impact_fees: {},
    },
  },
  {
    fundingCategory: 'W',
    subcategory: 'Water Accounting Projects',
    project_id_label: 'W-14',
    name: 'Wholesale / MUD Master Meters',
    description: 'WA2503 — Master meters for wholesale connections',
    sort_order: 14,
    budget_ceiling: 250000,
    buckets: {
      issued_debt_cash: {"2026":250000},
      new_debt: {},
      impact_fees: {},
    },
  },
  {
    fundingCategory: 'W',
    subcategory: 'Water Accounting Projects',
    project_id_label: 'W-15',
    name: 'Water Plant Pump Testing',
    description: 'Performance testing for water plant pumps',
    sort_order: 15,
    budget_ceiling: 30000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {"2028":30000},
      impact_fees: {},
    },
  },

  // W — Facility Expansion Projects
  {
    fundingCategory: 'W',
    subcategory: 'Facility Expansion Projects',
    project_id_label: 'W-16',
    name: 'Surface Water Treatment Plant Expansion PER',
    description: 'Preliminary engineering report for SWTP expansion',
    sort_order: 16,
    budget_ceiling: 50000,
    buckets: {
      issued_debt_cash: {"2026":50000},
      new_debt: {},
      impact_fees: {},
    },
  },
  {
    fundingCategory: 'W',
    subcategory: 'Facility Expansion Projects',
    project_id_label: 'W-17',
    name: 'Surface Water Treatment Plant Expansion to 4 MGD',
    description: 'Expand SWTP capacity to 4 MGD',
    sort_order: 17,
    budget_ceiling: 16108000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {"2028":2416200,"2029":6845900,"2030":6845900},
      impact_fees: {},
    },
  },
  {
    fundingCategory: 'W',
    subcategory: 'Facility Expansion Projects',
    project_id_label: 'W-18',
    name: 'Surface Water Treatment Plant Solids Handling',
    description: 'Solids handling improvements at SWTP',
    sort_order: 18,
    budget_ceiling: 3109000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {"2029":466350,"2030":2642650},
      impact_fees: {},
    },
  },
  {
    fundingCategory: 'W',
    subcategory: 'Facility Expansion Projects',
    project_id_label: 'W-19',
    name: 'New Elevated Storage Tank along FM 762',
    description: 'New 1.5 MG elevated storage tank',
    sort_order: 19,
    budget_ceiling: 4141000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {},
      impact_fees: {"2027":621150,"2028":3519850},
    },
  },
  {
    fundingCategory: 'W',
    subcategory: 'Facility Expansion Projects',
    project_id_label: 'W-20',
    name: 'New Well at Edgar WP',
    description: 'New production well at Edgar water plant',
    sort_order: 20,
    budget_ceiling: 7569000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {},
      impact_fees: {"2028":1305350,"2029":6263650},
    },
  },
  {
    fundingCategory: 'W',
    subcategory: 'Facility Expansion Projects',
    project_id_label: 'W-21',
    name: 'Edgar WP Expansion',
    description: 'Expand treatment capacity at Edgar water plant',
    sort_order: 21,
    budget_ceiling: 4515000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {},
      impact_fees: {"2032":677250,"2033":3837750},
    },
  },
  {
    fundingCategory: 'W',
    subcategory: 'Facility Expansion Projects',
    project_id_label: 'W-22',
    name: 'Rabbs Bayou Water Plant',
    description: 'New surface water treatment plant at Rabbs Bayou',
    sort_order: 22,
    budget_ceiling: 21647000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {},
      impact_fees: {"2028":600000,"2032":3157050,"2033":8944975,"2034":8944975},
    },
  },
  {
    fundingCategory: 'W',
    subcategory: 'Facility Expansion Projects',
    project_id_label: 'W-23',
    name: 'Update Utility Master Plan',
    description: 'Update the city utility master plan document',
    sort_order: 23,
    budget_ceiling: 450000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {"2028":50000,"2029":200000,"2030":200000},
      impact_fees: {},
    },
  },

  // W — Distribution System Expansion Projects
  {
    fundingCategory: 'W',
    subcategory: 'Distribution System Expansion Projects',
    project_id_label: 'W-24',
    name: 'New Transmission Line (SWTP to Downtown)',
    description: 'New transmission main from SWTP to downtown',
    sort_order: 24,
    budget_ceiling: 3388000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {"2029":508200,"2030":2879800},
      impact_fees: {},
    },
  },
  {
    fundingCategory: 'W',
    subcategory: 'Distribution System Expansion Projects',
    project_id_label: 'W-25',
    name: 'Alt 90 Waterline Extension Upsizing',
    description: 'Upsize waterline extension along Alt 90',
    sort_order: 25,
    budget_ceiling: 1499000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {},
      impact_fees: {"2029":224850,"2030":1274150},
    },
  },
  {
    fundingCategory: 'W',
    subcategory: 'Distribution System Expansion Projects',
    project_id_label: 'W-26',
    name: 'New Transmission Line (River Pointe Area)',
    description: 'New transmission main for River Pointe area',
    sort_order: 26,
    budget_ceiling: 1279000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {},
      impact_fees: {"2026":191850,"2027":1087150},
    },
  },
  {
    fundingCategory: 'W',
    subcategory: 'Distribution System Expansion Projects',
    project_id_label: 'W-27',
    name: 'Williams Way Waterline Loop',
    description: 'New waterline loop along Williams Way',
    sort_order: 27,
    budget_ceiling: 3595000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {"2026":539250,"2027":3055750},
      impact_fees: {},
    },
  },
  {
    fundingCategory: 'W',
    subcategory: 'Distribution System Expansion Projects',
    project_id_label: 'W-28',
    name: 'New Waterline to FM 762',
    description: 'New waterline extension to FM 762 corridor',
    sort_order: 28,
    budget_ceiling: 764000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {},
      impact_fees: {"2033":114600,"2034":649400},
    },
  },
  {
    fundingCategory: 'W',
    subcategory: 'Distribution System Expansion Projects',
    project_id_label: 'W-29',
    name: 'New Waterline (US-59 Eastbound Frontage)',
    description: 'Waterline along US-59 eastbound frontage road',
    sort_order: 29,
    budget_ceiling: 3035000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {},
      impact_fees: {"2028":455250,"2029":2579750},
    },
  },
  {
    fundingCategory: 'W',
    subcategory: 'Distribution System Expansion Projects',
    project_id_label: 'W-30',
    name: 'New Waterline (MUD 207 and WR MUD 1)',
    description: 'New waterline serving MUD 207 and WR MUD 1',
    sort_order: 30,
    budget_ceiling: 2628000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {},
      impact_fees: {"2029":394200,"2030":2233800},
    },
  },
  {
    fundingCategory: 'W',
    subcategory: 'Distribution System Expansion Projects',
    project_id_label: 'W-31',
    name: 'New Waterline along FM 359',
    description: 'WA2405 — New waterline along FM 359',
    sort_order: 31,
    budget_ceiling: 1110000,
    buckets: {
      issued_debt_cash: {"2032":166500,"2033":943500},
      new_debt: {},
      impact_fees: {},
    },
  },

  // RW — Expansion Projects
  {
    fundingCategory: 'RW',
    subcategory: 'Expansion Projects',
    project_id_label: 'RW-1',
    name: 'Regional WWTP 2nd Filter Train',
    description: 'Second filter train at regional WWTP for reclaimed water',
    sort_order: 1,
    budget_ceiling: 2404000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {"2027":360600,"2028":2043400},
      impact_fees: {},
    },
  },
  {
    fundingCategory: 'RW',
    subcategory: 'Expansion Projects',
    project_id_label: 'RW-2',
    name: 'East WWTP Reclaimed Water System',
    description: 'Reclaimed water system at east WWTP',
    sort_order: 2,
    budget_ceiling: 5429000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {},
      impact_fees: {"2033":814350,"2034":4614650},
    },
  },
  {
    fundingCategory: 'RW',
    subcategory: 'Expansion Projects',
    project_id_label: 'RW-3',
    name: 'East Reclaimed Water Trunk Line',
    description: 'New reclaimed water trunk line from east WWTP',
    sort_order: 3,
    budget_ceiling: 3222000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {},
      impact_fees: {"2034":483300,"2035":2738700},
    },
  },

  // WW — Facility Rehabilitation Projects
  {
    fundingCategory: 'WW',
    subcategory: 'Facility Rehabilitation Projects',
    project_id_label: 'WW-1',
    name: 'Regional WWTP Solids Handling',
    description: 'WW2503 — Solids handling at regional WWTP',
    sort_order: 1,
    budget_ceiling: 1307000,
    buckets: {
      issued_debt_cash: {"2026":1307000},
      new_debt: {},
      impact_fees: {},
    },
  },
  {
    fundingCategory: 'WW',
    subcategory: 'Facility Rehabilitation Projects',
    project_id_label: 'WW-2',
    name: 'Regional WWTP Rehabilitation',
    description: 'General rehabilitation of regional WWTP',
    sort_order: 2,
    budget_ceiling: 2609000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {"2026":391350,"2027":2217650},
      impact_fees: {},
    },
  },
  {
    fundingCategory: 'WW',
    subcategory: 'Facility Rehabilitation Projects',
    project_id_label: 'WW-3',
    name: 'South WWTP Solids Handling',
    description: 'Solids handling improvements at south WWTP',
    sort_order: 3,
    budget_ceiling: 2815000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {"2033":422250,"2034":2392750},
      impact_fees: {},
    },
  },
  {
    fundingCategory: 'WW',
    subcategory: 'Facility Rehabilitation Projects',
    project_id_label: 'WW-4',
    name: 'North 2nd Lift Station Rehab and Expansion',
    description: 'WW2301 — GLO Grant funded',
    sort_order: 4,
    budget_ceiling: 2080000,
    buckets: {
      issued_debt_cash: {"2026":2080000},
      new_debt: {},
      impact_fees: {},
    },
  },
  {
    fundingCategory: 'WW',
    subcategory: 'Facility Rehabilitation Projects',
    project_id_label: 'WW-5',
    name: 'Greenwood Lift Station Rehab',
    description: 'Rehabilitate Greenwood lift station',
    sort_order: 5,
    budget_ceiling: 1075000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {"2026":161250,"2027":913750},
      impact_fees: {},
    },
  },
  {
    fundingCategory: 'WW',
    subcategory: 'Facility Rehabilitation Projects',
    project_id_label: 'WW-6',
    name: '7th Street Lift Station Rehab',
    description: 'Rehabilitate 7th Street lift station',
    sort_order: 6,
    budget_ceiling: 1153000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {"2027":172950,"2028":980050},
      impact_fees: {},
    },
  },
  {
    fundingCategory: 'WW',
    subcategory: 'Facility Rehabilitation Projects',
    project_id_label: 'WW-7',
    name: 'George Park Lift Station Rehab and New Force Main',
    description: 'Rehab and new force main',
    sort_order: 7,
    budget_ceiling: 540000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {"2026":81000,"2027":459000},
      impact_fees: {},
    },
  },
  {
    fundingCategory: 'WW',
    subcategory: 'Facility Rehabilitation Projects',
    project_id_label: 'WW-8',
    name: 'Brazos River Rehabilitation and Force Main Reversal',
    description: 'Rehab and force main reversal',
    sort_order: 8,
    budget_ceiling: 4353000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {"2032":652950,"2033":3700050},
      impact_fees: {},
    },
  },
  {
    fundingCategory: 'WW',
    subcategory: 'Facility Rehabilitation Projects',
    project_id_label: 'WW-10',
    name: 'Municipal Facility Renovations — Wastewater Fund Share',
    description: 'MU2405 — WW fund share',
    sort_order: 10,
    budget_ceiling: 900000,
    buckets: {
      issued_debt_cash: {"2026":900000},
      new_debt: {},
      impact_fees: {},
    },
  },

  // WW — Collection System Rehabilitation Projects
  {
    fundingCategory: 'WW',
    subcategory: 'Collection System Rehabilitation Projects',
    project_id_label: 'WW-9',
    name: 'Collection System Rehabilitation — Phase 1',
    description: 'Rehabilitate deteriorated collection system',
    sort_order: 9,
    budget_ceiling: 1500000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {"2028":225000,"2029":1275000},
      impact_fees: {},
    },
  },
  {
    fundingCategory: 'WW',
    subcategory: 'Collection System Rehabilitation Projects',
    project_id_label: 'WW-10C',
    name: 'Collection System Rehabilitation — Phase 2',
    description: 'Phase 2 collection system rehabilitation',
    sort_order: 10,
    budget_ceiling: 1500000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {"2030":225000,"2031":1275000},
      impact_fees: {},
    },
  },
  {
    fundingCategory: 'WW',
    subcategory: 'Collection System Rehabilitation Projects',
    project_id_label: 'WW-11',
    name: 'Collection System Rehabilitation — Phase 3',
    description: 'Phase 3 collection system rehabilitation',
    sort_order: 11,
    budget_ceiling: 1500000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {"2032":225000,"2033":1275000},
      impact_fees: {},
    },
  },
  {
    fundingCategory: 'WW',
    subcategory: 'Collection System Rehabilitation Projects',
    project_id_label: 'WW-12',
    name: 'Collection System Rehabilitation — Phase 4',
    description: 'Phase 4 collection system rehabilitation',
    sort_order: 12,
    budget_ceiling: 1500000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {"2034":225000,"2035":1275000},
      impact_fees: {},
    },
  },

  // WW — Wastewater Accounting Projects
  {
    fundingCategory: 'WW',
    subcategory: 'Wastewater Accounting Projects',
    project_id_label: 'W-13',
    name: 'AMI — Wastewater Fund Share',
    description: 'MU2403 — WW fund share of AMI',
    sort_order: 13,
    budget_ceiling: 3100000,
    buckets: {
      issued_debt_cash: {"2026":3100000},
      new_debt: {},
      impact_fees: {},
    },
  },
  {
    fundingCategory: 'WW',
    subcategory: 'Wastewater Accounting Projects',
    project_id_label: 'WW-13',
    name: 'Collection System Flow Monitoring',
    description: 'Flow monitoring throughout collection system',
    sort_order: 14,
    budget_ceiling: 150000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {"2028":150000},
      impact_fees: {},
    },
  },

  // WW — Wastewater Permitting Projects
  {
    fundingCategory: 'WW',
    subcategory: 'Wastewater Permitting Projects',
    project_id_label: 'WW-14',
    name: 'Regional and South WWTP Permit Renewals',
    description: 'Renew operating permits for WWTPs',
    sort_order: 14,
    budget_ceiling: 120000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {"2029":60000,"2034":60000},
      impact_fees: {},
    },
  },

  // WW — Facility Expansion Projects
  {
    fundingCategory: 'WW',
    subcategory: 'Facility Expansion Projects',
    project_id_label: 'WW-15',
    name: 'East WWTP Design',
    description: 'Design for new east wastewater treatment plant',
    sort_order: 15,
    budget_ceiling: 2500000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {},
      impact_fees: {"2026":1250000,"2027":1250000},
    },
  },
  {
    fundingCategory: 'WW',
    subcategory: 'Facility Expansion Projects',
    project_id_label: 'WW-16',
    name: 'East WWTP and Outfall Construction',
    description: 'Construct new east WWTP and outfall',
    sort_order: 16,
    budget_ceiling: 84791000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {},
      impact_fees: {"2030":25437300,"2031":33916400,"2032":25437300},
    },
  },
  {
    fundingCategory: 'WW',
    subcategory: 'Facility Expansion Projects',
    project_id_label: 'WW-17',
    name: 'FM 359 Lift Station Capacity Expansion and New Force Main',
    description: 'Expand FM 359 lift station',
    sort_order: 17,
    budget_ceiling: 3845000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {},
      impact_fees: {"2031":576750,"2032":3268250},
    },
  },
  {
    fundingCategory: 'WW',
    subcategory: 'Facility Expansion Projects',
    project_id_label: 'WW-18',
    name: 'Regional WWTP Re-Rate and Expansion Evaluation',
    description: 'Evaluate re-rating options',
    sort_order: 18,
    budget_ceiling: 200000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {},
      impact_fees: {"2026":200000},
    },
  },
  {
    fundingCategory: 'WW',
    subcategory: 'Facility Expansion Projects',
    project_id_label: 'WW-19',
    name: 'South WWTP Master Lift Station',
    description: 'WW2510 — New master lift station at south WWTP',
    sort_order: 19,
    budget_ceiling: 2650000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {"2026":2650000},
      impact_fees: {},
    },
  },

  // WW — Collection System Expansion Projects
  {
    fundingCategory: 'WW',
    subcategory: 'Collection System Expansion Projects',
    project_id_label: 'WW-20',
    name: 'FM 359 North Lift Station',
    description: 'New lift station on FM 359 north corridor',
    sort_order: 20,
    budget_ceiling: 1710000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {},
      impact_fees: {"2026":1710000},
    },
  },
  {
    fundingCategory: 'WW',
    subcategory: 'Collection System Expansion Projects',
    project_id_label: 'WW-21',
    name: 'Del Webb Lift Station Expansion',
    description: 'Expand Del Webb lift station capacity',
    sort_order: 21,
    budget_ceiling: 2293000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {},
      impact_fees: {"2026":343950,"2027":1949050},
    },
  },
  {
    fundingCategory: 'WW',
    subcategory: 'Collection System Expansion Projects',
    project_id_label: 'WW-22',
    name: 'South WWTP Collector',
    description: 'New gravity collector main to south WWTP',
    sort_order: 22,
    budget_ceiling: 1723000,
    buckets: {
      issued_debt_cash: {},
      new_debt: {},
      impact_fees: {"2026":186000,"2027":1128000,"2028":409000},
    },
  },
]

export async function GET() {
  try {
    const logs: string[] = []
    let projectsUpserted = 0
    let bucketsUpserted = 0
    let totalPresentValue = 0
    const errors: string[] = []

    logs.push('Starting data restoration...')

    // Step 1: Upsert funding categories
    logs.push('Step 1: Upserting funding categories...')
    for (const fc of FUNDING_CATEGORIES) {
      const { error } = await supabase
        .from('funding_categories')
        .upsert({ code: fc.code, name: fc.name, sort_order: fc.sort_order }, { onConflict: 'code' })
      if (error) {
        errors.push(`Error upserting funding category ${fc.code}: ${error.message}`)
      } else {
        logs.push(`  ✓ ${fc.code} - ${fc.name}`)
      }
    }

    // Step 2: Upsert subcategories
    logs.push('Step 2: Upserting subcategories...')
    for (const [fcCode, subcats] of Object.entries(SUBCATEGORIES)) {
      const { data: fc } = await supabase
        .from('funding_categories')
        .select('id')
        .eq('code', fcCode)
        .single()

      if (!fc) {
        errors.push(`Funding category ${fcCode} not found!`)
        continue
      }

      for (const subcat of subcats) {
        const { error } = await supabase
          .from('project_categories')
          .upsert(
            {
              funding_category_id: fc.id,
              name: subcat.name,
              sort_order: subcat.sort_order,
            },
            { onConflict: 'funding_category_id,name' }
          )
        if (error) {
          errors.push(`Error upserting subcategory ${subcat.name}: ${error.message}`)
        } else {
          logs.push(`  ✓ ${fcCode} → ${subcat.name}`)
        }
      }
    }

    // Step 3: Upsert projects and their buckets
    logs.push('Step 3: Upserting projects and buckets...')
    for (const proj of PROJECTS) {
      // Find funding category
      const { data: fc } = await supabase
        .from('funding_categories')
        .select('id')
        .eq('code', proj.fundingCategory)
        .single()

      if (!fc) {
        errors.push(`Funding category ${proj.fundingCategory} not found for project ${proj.project_id_label}`)
        continue
      }

      // Find subcategory
      const { data: subcat } = await supabase
        .from('project_categories')
        .select('id')
        .eq('funding_category_id', fc.id)
        .eq('name', proj.subcategory)
        .single()

      if (!subcat) {
        errors.push(`Subcategory ${proj.subcategory} not found for project ${proj.project_id_label}`)
        continue
      }

      // Upsert project
      const { error: projectError } = await supabase
        .from('projects')
        .upsert(
          {
            project_id_label: proj.project_id_label,
            category_id: subcat.id,
            name: proj.name,
            description: proj.description,
            sort_order: proj.sort_order,
            budget_ceiling: proj.budget_ceiling,
          },
          { onConflict: 'project_id_label' }
        )

      if (projectError) {
        errors.push(`Error upserting project ${proj.project_id_label}: ${projectError.message}`)
        continue
      }

      projectsUpserted++
      logs.push(`  ✓ ${proj.project_id_label} - ${proj.name}`)

      // Get the project ID
      const { data: existingProject } = await supabase
        .from('projects')
        .select('id')
        .eq('project_id_label', proj.project_id_label)
        .single()

      if (!existingProject) {
        errors.push(`Could not find project ${proj.project_id_label} after upsert`)
        continue
      }

      // Upsert buckets
      const bucketTypes = ['issued_debt_cash', 'new_debt', 'impact_fees'] as const
      for (const bucketType of bucketTypes) {
        const yearCosts = proj.buckets[bucketType]

        // Calculate present value for this bucket
        const bucketPV = Object.values(yearCosts).reduce((sum, val) => sum + val, 0)
        totalPresentValue += bucketPV

        const { error: bucketError } = await supabase
          .from('project_buckets')
          .upsert(
            {
              project_id: existingProject.id,
              bucket_type: bucketType,
              year_costs: yearCosts,
            },
            { onConflict: 'project_id,bucket_type' }
          )

        if (bucketError) {
          errors.push(`Error upserting ${bucketType} bucket for ${proj.project_id_label}: ${bucketError.message}`)
        } else {
          bucketsUpserted++
        }
      }
    }

    // Step 4: Update plan settings
    logs.push('Step 4: Updating plan settings...')
    const { error: settingsError } = await supabase
      .from('plan_settings')
      .update({
        city_name: 'City of Richmond',
        plan_title: 'Utility Master Plan — Capital Improvement Program',
        inflation_rate: 4.0,
        start_year: 2026,
        end_year: 2035,
      })
      .eq('id', 1)

    if (settingsError) {
      errors.push(`Error updating plan settings: ${settingsError.message}`)
    } else {
      logs.push('  ✓ Plan settings updated')
    }

    // Return results
    return NextResponse.json({
      success: errors.length === 0,
      summary: {
        projectsUpserted,
        bucketsUpserted,
        totalPresentValue,
      },
      logs,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
