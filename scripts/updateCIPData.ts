import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface BucketUpdate {
  label: string
  name?: string
  bucket: 'issued_debt_cash' | 'new_debt' | 'impact_fees'
  year_costs: Record<string, number>
  note?: string
}

// All project updates (CHANGED + UNCHANGED for verification)
const projectUpdates: BucketUpdate[] = [
  // CHANGED PROJECTS - Water
  {
    label: 'W-17',
    name: 'Surface Water Treatment Plant Expansion to 4 MGD',
    bucket: 'new_debt',
    year_costs: { "2028": 2718000, "2029": 8009000, "2030": 8329000 },
    note: 'CHANGED - updated year distribution'
  },
  {
    label: 'W-17',
    bucket: 'impact_fees',
    year_costs: {},
    note: 'CHANGED - cleared impact_fees (was previously populated)'
  },
  {
    label: 'W-18',
    name: 'Surface Water Treatment Plant Solids Handling',
    bucket: 'new_debt',
    year_costs: { "2030": 546000, "2031": 3215000 },
    note: 'CHANGED - different year distribution'
  },
  {
    label: 'W-24',
    name: 'New Transmission Line (SWTP to Downtown)',
    bucket: 'new_debt',
    year_costs: { "2029": 595000, "2030": 3504000 },
    note: 'CHANGED - years shifted earlier from 2031-2032'
  },
  {
    label: 'W-30',
    name: 'New Waterline (MUD 207 and WR MUD 1)',
    bucket: 'impact_fees',
    year_costs: { "2030": 461000, "2031": 2718000 },
    note: 'CHANGED - values updated'
  },

  // UNCHANGED PROJECTS - Water (for verification)
  { label: 'W-1', bucket: 'issued_debt_cash', year_costs: { "2026": 104000, "2027": 108000, "2028": 112000, "2029": 117000, "2030": 122000, "2031": 127000, "2032": 132000, "2033": 137000, "2034": 142000, "2035": 148000 } },
  { label: 'W-2', bucket: 'issued_debt_cash', year_costs: { "2026": 1466000 } },
  { label: 'W-3', bucket: 'issued_debt_cash', year_costs: { "2026": 3427000 } },
  { label: 'W-4', bucket: 'new_debt', year_costs: { "2026": 766000, "2027": 531000 } },
  { label: 'W-5', bucket: 'issued_debt_cash', year_costs: { "2026": 322000 } },
  { label: 'W-6', bucket: 'new_debt', year_costs: { "2026": 324000, "2027": 4891000 } },
  { label: 'W-7', bucket: 'issued_debt_cash', year_costs: { "2026": 1170000 } },
  { label: 'W-8', bucket: 'new_debt', year_costs: { "2027": 103000, "2028": 606000 } },
  { label: 'W-9', bucket: 'new_debt', year_costs: { "2028": 98000, "2029": 576000 } },
  { label: 'W-10', bucket: 'issued_debt_cash', year_costs: { "2026": 936000 } },
  { label: 'W-11', bucket: 'new_debt', year_costs: { "2026": 372000, "2027": 2194000 } },
  { label: 'W-12', bucket: 'new_debt', year_costs: { "2028": 202000, "2029": 1955000, "2030": 304000, "2031": 2114000 } },
  { label: 'W-13', bucket: 'issued_debt_cash', year_costs: { "2026": 3224000 } },
  { label: 'W-14', bucket: 'issued_debt_cash', year_costs: { "2026": 260000 } },
  { label: 'W-15', bucket: 'new_debt', year_costs: { "2028": 34000 } },
  { label: 'W-16', bucket: 'issued_debt_cash', year_costs: { "2026": 52000 } },
  { label: 'W-19', bucket: 'impact_fees', year_costs: { "2027": 672000, "2028": 3959000 } },
  { label: 'W-20', bucket: 'impact_fees', year_costs: { "2028": 1468000, "2029": 7328000 } },
  { label: 'W-21', bucket: 'impact_fees', year_costs: { "2031": 891000, "2032": 5252000 } },
  { label: 'W-22', bucket: 'impact_fees', year_costs: { "2028": 675000, "2032": 4154000, "2033": 12242000, "2034": 12731000 } },
  { label: 'W-23', bucket: 'new_debt', year_costs: { "2028": 56000, "2029": 234000, "2030": 243000 } },
  { label: 'W-25', bucket: 'impact_fees', year_costs: { "2029": 263000, "2030": 1550000 } },
  { label: 'W-26', bucket: 'impact_fees', year_costs: { "2026": 200000, "2027": 1176000 } },
  { label: 'W-27', bucket: 'new_debt', year_costs: { "2026": 561000, "2027": 3305000 } },
  { label: 'W-28', bucket: 'impact_fees', year_costs: { "2033": 157000, "2034": 924000 } },
  { label: 'W-29', bucket: 'impact_fees', year_costs: { "2028": 512000, "2029": 3018000 } },
  { label: 'W-31', bucket: 'issued_debt_cash', year_costs: { "2033": 219000, "2034": 1291000 } },

  // WASTEWATER - all unchanged, verify only
  { label: 'WW-1', bucket: 'issued_debt_cash', year_costs: { "2026": 1359000 } },
  { label: 'WW-2', bucket: 'new_debt', year_costs: { "2026": 407000, "2027": 2399000 } },
  { label: 'WW-3', bucket: 'new_debt', year_costs: { "2032": 578000, "2033": 3406000 } },
  { label: 'WW-4', bucket: 'issued_debt_cash', year_costs: { "2026": 2163000 } },
  { label: 'WW-5', bucket: 'new_debt', year_costs: { "2026": 168000, "2027": 988000 } },
  { label: 'WW-6', bucket: 'new_debt', year_costs: { "2026": 187000, "2027": 1102000 } },
  { label: 'WW-7', bucket: 'new_debt', year_costs: { "2026": 84000, "2027": 496000 } },
  { label: 'WW-8', bucket: 'new_debt', year_costs: { "2033": 859000, "2034": 5064000 } },
  { label: 'WW-9', bucket: 'new_debt', year_costs: { "2028": 253000, "2029": 1492000 } },
  { label: 'WW-10', bucket: 'issued_debt_cash', year_costs: { "2026": 936000 } },
  { label: 'WW-11', bucket: 'new_debt', year_costs: { "2030": 274000, "2031": 1613000 } },
  { label: 'WW-12', bucket: 'new_debt', year_costs: { "2031": 296000, "2032": 1745000 } },
  { label: 'WW-13R', bucket: 'new_debt', year_costs: { "2033": 320000, "2034": 1887000 } },
  { label: 'WW-13', bucket: 'issued_debt_cash', year_costs: { "2026": 3224000 } },
  { label: 'WW-13b', bucket: 'new_debt', year_costs: { "2028": 169000 } },
  { label: 'WW-14', bucket: 'new_debt', year_costs: { "2029": 70000, "2031": 85000 } },
  { label: 'WW-15', bucket: 'impact_fees', year_costs: { "2026": 1300000, "2027": 1352000 } },
  { label: 'WW-16', bucket: 'impact_fees', year_costs: { "2030": 30948000, "2031": 42915000, "2032": 33474000 } },
  { label: 'WW-17', bucket: 'impact_fees', year_costs: { "2031": 730000, "2032": 4301000 } },
  { label: 'WW-18', bucket: 'impact_fees', year_costs: { "2026": 208000 } },
  { label: 'WW-19', bucket: 'new_debt', year_costs: { "2026": 2756000 } },
  { label: 'WW-20', bucket: 'impact_fees', year_costs: { "2026": 1778000 } },
  { label: 'WW-21', bucket: 'impact_fees', year_costs: { "2026": 358000, "2027": 2108000 } },
  { label: 'WW-22', bucket: 'impact_fees', year_costs: { "2026": 193000, "2027": 1220000, "2028": 460000 } },

  // RECLAIMED WATER - all unchanged, verify only
  { label: 'RW-1', bucket: 'new_debt', year_costs: { "2027": 390000, "2028": 2299000 } },
  { label: 'RW-2', bucket: 'impact_fees', year_costs: { "2033": 1114000, "2034": 6568000 } },
  { label: 'RW-3', bucket: 'impact_fees', year_costs: { "2034": 688000, "2035": 4054000 } },
]

function areYearCostsEqual(a: Record<string, number>, b: Record<string, number>): boolean {
  const keysA = Object.keys(a).sort()
  const keysB = Object.keys(b).sort()

  if (keysA.length !== keysB.length) return false

  for (let i = 0; i < keysA.length; i++) {
    if (keysA[i] !== keysB[i]) return false
    if (a[keysA[i]] !== b[keysB[i]]) return false
  }

  return true
}

async function updateSettings() {
  console.log('\n=== UPDATING PLAN SETTINGS ===')

  const { error } = await supabase
    .from('plan_settings')
    .update({
      city_name: 'City of Richmond',
      plan_title: 'Utility Master Plan — Capital Improvement Program',
      base_year: 2025,
      inflation_rate: 3.0,
      start_year: 2026,
      end_year: 2035,
    })
    .eq('id', 1)

  if (error) {
    console.error('❌ Error updating settings:', error)
  } else {
    console.log('✅ Settings updated successfully')
  }
}

async function updateProjects() {
  console.log('\n=== UPDATING PROJECT DATA ===')

  let updatedCount = 0
  let verifiedCount = 0
  let insertedCount = 0
  let errors: string[] = []

  for (const update of projectUpdates) {
    try {
      // Find project by label
      const { data: projects, error: projectError } = await supabase
        .from('projects')
        .select('id, name')
        .eq('project_id_label', update.label)

      if (projectError) {
        errors.push(`Error finding project ${update.label}: ${projectError.message}`)
        continue
      }

      if (!projects || projects.length === 0) {
        console.log(`⚠️  Project ${update.label} not found - would need to be inserted`)
        insertedCount++
        continue
      }

      const project = projects[0]

      // Find the bucket for this project
      const { data: buckets, error: bucketError } = await supabase
        .from('project_buckets')
        .select('id, year_costs')
        .eq('project_id', project.id)
        .eq('bucket_type', update.bucket)

      if (bucketError) {
        errors.push(`Error finding bucket for ${update.label}: ${bucketError.message}`)
        continue
      }

      if (!buckets || buckets.length === 0) {
        errors.push(`Bucket ${update.bucket} not found for ${update.label}`)
        continue
      }

      const bucket = buckets[0]
      const currentYearCosts = bucket.year_costs || {}

      // Check if update is needed
      if (areYearCostsEqual(currentYearCosts, update.year_costs)) {
        console.log(`✓ VERIFIED ${update.label} (${update.bucket}) - already correct`)
        verifiedCount++
      } else {
        // Update the bucket
        const { error: updateError } = await supabase
          .from('project_buckets')
          .update({ year_costs: update.year_costs })
          .eq('id', bucket.id)

        if (updateError) {
          errors.push(`Error updating ${update.label}: ${updateError.message}`)
        } else {
          const note = update.note ? ` [${update.note}]` : ''
          console.log(`✅ UPDATED ${update.label} (${update.bucket})${note}`)
          updatedCount++
        }
      }
    } catch (err) {
      errors.push(`Exception processing ${update.label}: ${err}`)
    }
  }

  console.log('\n=== UPDATE SUMMARY ===')
  console.log(`✅ Updated: ${updatedCount}`)
  console.log(`✓ Verified (no change needed): ${verifiedCount}`)
  console.log(`⚠️  Inserted (new): ${insertedCount}`)
  if (errors.length > 0) {
    console.log(`❌ Errors: ${errors.length}`)
    errors.forEach(e => console.log(`   - ${e}`))
  }
}

async function verifyTotals() {
  console.log('\n=== VERIFICATION ===')

  // Get all projects
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('*')

  if (projectsError || !projects) {
    console.error('❌ Error fetching projects:', projectsError)
    return
  }

  // Get all buckets
  const { data: buckets, error: bucketsError } = await supabase
    .from('project_buckets')
    .select('*')

  if (bucketsError || !buckets) {
    console.error('❌ Error fetching buckets:', bucketsError)
    return
  }

  console.log(`📊 Total projects in database: ${projects.length}`)
  console.log(`📊 Total bucket rows in database: ${buckets.length}`)

  // Calculate totals by funding category
  let wTotal = 0
  let wwTotal = 0
  let rwTotal = 0
  let grandTotal = 0

  const largeBuckets: Array<{label: string, bucket: string, total: number}> = []

  for (const project of projects) {
    const projectBuckets = buckets.filter(b => b.project_id === project.id)
    let projectTotal = 0

    for (const bucket of projectBuckets) {
      const yearCosts = bucket.year_costs || {}
      const bucketTotal = Object.values(yearCosts).reduce((sum: number, val) => sum + (val as number), 0)
      projectTotal += bucketTotal

      if (bucketTotal > 5000000) {
        largeBuckets.push({
          label: project.project_id_label || project.id,
          bucket: bucket.bucket_type,
          total: bucketTotal
        })
      }
    }

    grandTotal += projectTotal

    // Categorize by funding category
    const label = project.project_id_label || ''
    if (label.startsWith('W-')) {
      wTotal += projectTotal
    } else if (label.startsWith('WW-')) {
      wwTotal += projectTotal
    } else if (label.startsWith('RW-')) {
      rwTotal += projectTotal
    }
  }

  console.log('\n💰 TOTALS (Present Value):')
  console.log(`   Water (W):           $${(wTotal / 1000000).toFixed(2)}M`)
  console.log(`   Wastewater (WW):     $${(wwTotal / 1000000).toFixed(2)}M`)
  console.log(`   Reclaimed Water (RW): $${(rwTotal / 1000000).toFixed(2)}M`)
  console.log(`   GRAND TOTAL:         $${(grandTotal / 1000000).toFixed(2)}M`)

  // Check against expected values (calculated from update script data)
  const expectedW = 120.35
  const expectedWW = 155.72
  const expectedRW = 15.11
  const expectedGrand = 291.19

  const wDiff = Math.abs(wTotal / 1000000 - expectedW) / expectedW * 100
  const wwDiff = Math.abs(wwTotal / 1000000 - expectedWW) / expectedWW * 100
  const rwDiff = Math.abs(rwTotal / 1000000 - expectedRW) / expectedRW * 100
  const grandDiff = Math.abs(grandTotal / 1000000 - expectedGrand) / expectedGrand * 100

  console.log('\n📈 Variance from Expected:')
  console.log(`   Water:           ${wDiff > 5 ? '❌' : '✅'} ${wDiff.toFixed(1)}% ${wDiff > 5 ? '(OFF BY >5%)' : ''}`)
  console.log(`   Wastewater:      ${wwDiff > 5 ? '❌' : '✅'} ${wwDiff.toFixed(1)}% ${wwDiff > 5 ? '(OFF BY >5%)' : ''}`)
  console.log(`   Reclaimed Water: ${rwDiff > 5 ? '❌' : '✅'} ${rwDiff.toFixed(1)}% ${rwDiff > 5 ? '(OFF BY >5%)' : ''}`)
  console.log(`   Grand Total:     ${grandDiff > 5 ? '❌' : '✅'} ${grandDiff.toFixed(1)}% ${grandDiff > 5 ? '(OFF BY >5%)' : ''}`)

  if (largeBuckets.length > 0) {
    console.log('\n🔍 Large Buckets (>$5M):')
    largeBuckets
      .sort((a, b) => b.total - a.total)
      .forEach(item => {
        console.log(`   ${item.label} (${item.bucket}): $${(item.total / 1000000).toFixed(2)}M`)
      })
  }
}

async function main() {
  console.log('🚀 Starting CIP Data Update Script (7/20/2026 revision)')
  console.log('===================================================')

  await updateSettings()
  await updateProjects()
  await verifyTotals()

  console.log('\n✅ Script completed!')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
