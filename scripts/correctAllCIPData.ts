import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface ProjectData {
  label: string
  bucket_type: 'issued_debt_cash' | 'new_debt' | 'impact_fees'
  year_costs: Record<string, number>
  budget_ceiling?: number
}

// CORRECT PRESENT-VALUE DATA
const correctData: ProjectData[] = [
  // W — Water
  { label: 'W-1', bucket_type: 'issued_debt_cash', year_costs: {"2026":100000,"2027":100000,"2028":100000,"2029":100000,"2030":100000,"2031":100000,"2032":100000,"2033":100000,"2034":100000,"2035":100000} },
  { label: 'W-2', bucket_type: 'issued_debt_cash', year_costs: {"2026":1410000} },
  { label: 'W-3', bucket_type: 'issued_debt_cash', year_costs: {"2026":3295000} },
  { label: 'W-4', bucket_type: 'new_debt', year_costs: {"2026":736800,"2027":491200}, budget_ceiling: 1228000 },
  { label: 'W-5', bucket_type: 'issued_debt_cash', year_costs: {"2026":310000} },
  { label: 'W-6', bucket_type: 'new_debt', year_costs: {"2026":312000,"2027":4522000}, budget_ceiling: 4834000 },
  { label: 'W-7', bucket_type: 'issued_debt_cash', year_costs: {"2026":1125000} },
  { label: 'W-8', bucket_type: 'new_debt', year_costs: {"2027":95100,"2028":538900}, budget_ceiling: 634000 },
  { label: 'W-9', bucket_type: 'new_debt', year_costs: {"2028":86850,"2029":492150}, budget_ceiling: 579000 },
  { label: 'W-10', bucket_type: 'issued_debt_cash', year_costs: {"2026":900000} },
  { label: 'W-11', bucket_type: 'new_debt', year_costs: {"2026":357900,"2027":2028100}, budget_ceiling: 2386000 },
  { label: 'W-12', bucket_type: 'new_debt', year_costs: {"2028":180000,"2029":1671000,"2030":250000,"2031":1671000}, budget_ceiling: 3772000 },
  { label: 'W-13', bucket_type: 'issued_debt_cash', year_costs: {"2026":3100000} },
  { label: 'W-14', bucket_type: 'issued_debt_cash', year_costs: {"2026":250000} },
  { label: 'W-15', bucket_type: 'new_debt', year_costs: {"2028":30000} },
  { label: 'W-16', bucket_type: 'issued_debt_cash', year_costs: {"2026":50000} },
  { label: 'W-17', bucket_type: 'new_debt', year_costs: {"2028":2416200,"2029":6845900,"2030":6845900}, budget_ceiling: 16108000 },
  { label: 'W-17', bucket_type: 'impact_fees', year_costs: {} },
  { label: 'W-18', bucket_type: 'new_debt', year_costs: {"2029":466350,"2030":2642650}, budget_ceiling: 3109000 },
  { label: 'W-19', bucket_type: 'impact_fees', year_costs: {"2027":621150,"2028":3519850}, budget_ceiling: 4141000 },
  { label: 'W-20', bucket_type: 'impact_fees', year_costs: {"2028":1305350,"2029":6263650}, budget_ceiling: 7569000 },
  { label: 'W-21', bucket_type: 'impact_fees', year_costs: {"2032":677250,"2033":3837750}, budget_ceiling: 4515000 },
  { label: 'W-22', bucket_type: 'impact_fees', year_costs: {"2028":600000,"2032":3157050,"2033":8944975,"2034":8944975}, budget_ceiling: 21647000 },
  { label: 'W-23', bucket_type: 'new_debt', year_costs: {"2028":50000,"2029":200000,"2030":200000}, budget_ceiling: 450000 },
  { label: 'W-24', bucket_type: 'new_debt', year_costs: {"2029":508200,"2030":2879800}, budget_ceiling: 3388000 },
  { label: 'W-25', bucket_type: 'impact_fees', year_costs: {"2029":224850,"2030":1274150}, budget_ceiling: 1499000 },
  { label: 'W-26', bucket_type: 'impact_fees', year_costs: {"2026":191850,"2027":1087150}, budget_ceiling: 1279000 },
  { label: 'W-27', bucket_type: 'new_debt', year_costs: {"2026":539250,"2027":3055750}, budget_ceiling: 3595000 },
  { label: 'W-28', bucket_type: 'impact_fees', year_costs: {"2033":114600,"2034":649400}, budget_ceiling: 764000 },
  { label: 'W-29', bucket_type: 'impact_fees', year_costs: {"2028":455250,"2029":2579750}, budget_ceiling: 3035000 },
  { label: 'W-30', bucket_type: 'impact_fees', year_costs: {"2029":394200,"2030":2233800}, budget_ceiling: 2628000 },
  { label: 'W-31', bucket_type: 'issued_debt_cash', year_costs: {"2032":166500,"2033":943500}, budget_ceiling: 1110000 },

  // RW — Reclaimed Water
  { label: 'RW-1', bucket_type: 'new_debt', year_costs: {"2027":360600,"2028":2043400}, budget_ceiling: 2404000 },
  { label: 'RW-2', bucket_type: 'impact_fees', year_costs: {"2033":814350,"2034":4614650}, budget_ceiling: 5429000 },
  { label: 'RW-3', bucket_type: 'impact_fees', year_costs: {"2034":483300,"2035":2738700}, budget_ceiling: 3222000 },

  // WW — Wastewater
  { label: 'WW-1', bucket_type: 'issued_debt_cash', year_costs: {"2026":1307000} },
  { label: 'WW-2', bucket_type: 'new_debt', year_costs: {"2026":391350,"2027":2217650}, budget_ceiling: 2609000 },
  { label: 'WW-3', bucket_type: 'new_debt', year_costs: {"2033":422250,"2034":2392750}, budget_ceiling: 2815000 },
  { label: 'WW-4', bucket_type: 'issued_debt_cash', year_costs: {"2026":2080000} },
  { label: 'WW-5', bucket_type: 'new_debt', year_costs: {"2026":161250,"2027":913750}, budget_ceiling: 1075000 },
  { label: 'WW-6', bucket_type: 'new_debt', year_costs: {"2027":172950,"2028":980050}, budget_ceiling: 1153000 },
  { label: 'WW-7', bucket_type: 'new_debt', year_costs: {"2026":81000,"2027":459000}, budget_ceiling: 540000 },
  { label: 'WW-8', bucket_type: 'new_debt', year_costs: {"2032":652950,"2033":3700050}, budget_ceiling: 4353000 },
  { label: 'WW-10', bucket_type: 'issued_debt_cash', year_costs: {"2026":900000} }, // Municipal Facility
  { label: 'WW-9', bucket_type: 'new_debt', year_costs: {"2028":225000,"2029":1275000}, budget_ceiling: 1500000 },
  { label: 'WW-10', bucket_type: 'new_debt', year_costs: {"2030":225000,"2031":1275000} }, // Collection Rehab Phase 2
  { label: 'WW-11', bucket_type: 'new_debt', year_costs: {"2032":225000,"2033":1275000} },
  { label: 'WW-12', bucket_type: 'new_debt', year_costs: {"2034":225000,"2035":1275000} },
  { label: 'WW-13', bucket_type: 'issued_debt_cash', year_costs: {"2026":3100000} }, // AMI WW share
  { label: 'WW-13b', bucket_type: 'new_debt', year_costs: {"2028":150000} },
  { label: 'WW-14', bucket_type: 'new_debt', year_costs: {"2029":60000,"2034":60000} },
  { label: 'WW-15', bucket_type: 'impact_fees', year_costs: {"2026":1250000,"2027":1250000}, budget_ceiling: 2500000 },
  { label: 'WW-16', bucket_type: 'impact_fees', year_costs: {"2030":25437300,"2031":33916400,"2032":25437300}, budget_ceiling: 84791000 },
  { label: 'WW-17', bucket_type: 'impact_fees', year_costs: {"2031":576750,"2032":3268250}, budget_ceiling: 3845000 },
  { label: 'WW-18', bucket_type: 'impact_fees', year_costs: {"2026":200000} },
  { label: 'WW-19', bucket_type: 'new_debt', year_costs: {"2026":2650000} },
  { label: 'WW-20', bucket_type: 'impact_fees', year_costs: {"2026":1710000} },
  { label: 'WW-21', bucket_type: 'impact_fees', year_costs: {"2026":343950,"2027":1949050}, budget_ceiling: 2293000 },
  { label: 'WW-22', bucket_type: 'impact_fees', year_costs: {"2026":186000,"2027":1128000,"2028":409000}, budget_ceiling: 1723000 },
]

async function correctAllCIPData() {
  console.log('🔧 Starting CIP data correction...\n')

  let updatedCount = 0
  let notFoundCount = 0
  const notFoundProjects: string[] = []

  // Update inflation rate to 4.0
  console.log('📊 Updating inflation rate to 4.0%...')
  const { error: settingsError } = await supabase
    .from('plan_settings')
    .update({ inflation_rate: 4.0 })
    .eq('id', 1)

  if (settingsError) {
    console.error('❌ Failed to update inflation rate:', settingsError)
  } else {
    console.log('✅ Inflation rate updated to 4.0%\n')
  }

  // Process each project
  for (const projectData of correctData) {
    // Find project by label
    const { data: projects, error: findError } = await supabase
      .from('projects')
      .select('id, name, project_id_label')
      .eq('project_id_label', projectData.label)

    if (findError || !projects || projects.length === 0) {
      console.log(`❌ NOT FOUND: ${projectData.label} (${projectData.bucket_type})`)
      notFoundCount++
      notFoundProjects.push(`${projectData.label} (${projectData.bucket_type})`)
      continue
    }

    // Handle multiple WW-10 projects - find the right one by bucket type
    let targetProject = projects[0]
    if (projects.length > 1) {
      // For WW-10, check which one should get which bucket
      // Municipal Facility should have issued_debt_cash
      // Collection Rehab should have new_debt
      for (const proj of projects) {
        const { data: buckets } = await supabase
          .from('project_buckets')
          .select('bucket_type')
          .eq('project_id', proj.id)
          .eq('bucket_type', projectData.bucket_type)

        if (buckets && buckets.length > 0) {
          targetProject = proj
          break
        }
      }
    }

    const projectId = targetProject.id

    // Find the bucket
    const { data: buckets, error: bucketError } = await supabase
      .from('project_buckets')
      .select('id')
      .eq('project_id', projectId)
      .eq('bucket_type', projectData.bucket_type)

    if (bucketError || !buckets || buckets.length === 0) {
      console.log(`❌ BUCKET NOT FOUND: ${projectData.label} (${projectData.bucket_type})`)
      notFoundCount++
      notFoundProjects.push(`${projectData.label} (${projectData.bucket_type})`)
      continue
    }

    const bucketId = buckets[0].id

    // Update bucket with correct year_costs
    const { error: updateError } = await supabase
      .from('project_buckets')
      .update({ year_costs: projectData.year_costs })
      .eq('id', bucketId)

    if (updateError) {
      console.log(`❌ UPDATE FAILED: ${projectData.label} (${projectData.bucket_type})`)
      console.error(updateError)
      notFoundCount++
      continue
    }

    // Update budget_ceiling if provided
    if (projectData.budget_ceiling !== undefined) {
      const { error: budgetError } = await supabase
        .from('projects')
        .update({ budget_ceiling: projectData.budget_ceiling })
        .eq('id', projectId)

      if (budgetError) {
        console.log(`⚠️  Budget ceiling update failed for ${projectData.label}`)
      }
    }

    const presentCost = Object.values(projectData.year_costs).reduce((sum, val) => sum + val, 0)
    console.log(`✅ UPDATED: ${projectData.label} (${projectData.bucket_type}) - Present cost: $${presentCost.toLocaleString()}`)
    updatedCount++
  }

  console.log(`\n📊 Summary:`)
  console.log(`   Updated: ${updatedCount}`)
  console.log(`   Not found: ${notFoundCount}`)

  if (notFoundProjects.length > 0) {
    console.log('\n❌ Projects not found:')
    notFoundProjects.forEach(p => console.log(`   - ${p}`))
  }

  // VERIFICATION
  console.log('\n\n🔍 VERIFICATION\n')

  // Verify W-1
  const { data: w1Project } = await supabase
    .from('projects')
    .select('id, name')
    .eq('project_id_label', 'W-1')
    .single()

  if (w1Project) {
    const { data: w1Bucket } = await supabase
      .from('project_buckets')
      .select('year_costs')
      .eq('project_id', w1Project.id)
      .eq('bucket_type', 'issued_debt_cash')
      .single()

    if (w1Bucket) {
      const w1Present = Object.values(w1Bucket.year_costs).reduce((sum: number, val) => sum + (val as number), 0)
      console.log(`W-1 Present Cost: $${w1Present.toLocaleString()} (expected: $1,000,000)`)

      // Calculate inflated total
      let w1Inflated = 0
      for (const [year, amount] of Object.entries(w1Bucket.year_costs)) {
        const yearsOut = parseInt(year) - 2025
        const inflated = (amount as number) * Math.pow(1.04, yearsOut)
        w1Inflated += inflated
      }
      console.log(`W-1 Inflated Cost: $${Math.round(w1Inflated).toLocaleString()} (expected: ~$1,249,000)`)
    }
  }

  // Calculate grand totals
  const systems = ['W', 'RW', 'WW']
  let grandTotal = 0

  for (const system of systems) {
    const { data: projects } = await supabase
      .from('projects')
      .select('id, project_id_label')
      .like('project_id_label', `${system}-%`)

    if (!projects) continue

    let systemTotal = 0

    for (const project of projects) {
      const { data: buckets } = await supabase
        .from('project_buckets')
        .select('year_costs')
        .eq('project_id', project.id)

      if (buckets) {
        for (const bucket of buckets) {
          const bucketTotal = Object.values(bucket.year_costs).reduce((sum: number, val) => sum + (val as number), 0)
          systemTotal += bucketTotal
        }
      }
    }

    console.log(`\n${system} Total Present Cost: $${systemTotal.toLocaleString()}`)
    grandTotal += systemTotal
  }

  console.log(`\n🎯 GRAND TOTAL Present Cost: $${grandTotal.toLocaleString()}`)
  console.log(`   Expected: $234,629,000`)
  console.log(`   Match: ${Math.abs(grandTotal - 234629000) < 1000 ? '✅' : '❌'}`)

  console.log('\n✅ CIP data correction complete!')
}

correctAllCIPData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
