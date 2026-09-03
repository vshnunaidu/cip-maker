import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Expected present costs from the Master CIP table
const EXPECTED_COSTS: Record<string, number> = {
  'W-1': 1249000,
  'W-4': 1297000,
  'W-11': 2566000,
  'W-12': 4575000,
  'W-17': 19056000,
  'W-22': 29802000,
  'WW-16': 107337000,
}

async function verifyPresentCosts() {
  console.log('🔍 Verifying Present Cost Calculations\n')

  // Get plan settings to determine year range
  const { data: settings } = await supabase
    .from('plan_settings')
    .select('*')
    .single()

  if (!settings) {
    console.error('❌ Failed to fetch plan settings')
    return
  }

  console.log(`Year range: ${settings.start_year} - ${settings.end_year}`)
  const years = []
  for (let y = settings.start_year; y <= settings.end_year; y++) {
    years.push(y)
  }
  console.log(`Years: ${years.join(', ')}\n`)

  let allPassed = true

  for (const [projectLabel, expectedCost] of Object.entries(EXPECTED_COSTS)) {
    // Get project
    const { data: projects } = await supabase
      .from('projects')
      .select('id, name')
      .eq('project_id_label', projectLabel)

    if (!projects || projects.length === 0) {
      console.log(`❌ ${projectLabel}: NOT FOUND`)
      allPassed = false
      continue
    }

    const project = projects[0]

    // Get all buckets for this project
    const { data: buckets } = await supabase
      .from('project_buckets')
      .select('*')
      .eq('project_id', project.id)

    if (!buckets) {
      console.log(`❌ ${projectLabel}: No buckets found`)
      allPassed = false
      continue
    }

    // Calculate present total across all buckets and years
    let presentTotal = 0
    const bucketBreakdown: Record<string, number> = {}

    for (const bucket of buckets) {
      const yearCosts = bucket.year_costs || {}
      let bucketTotal = 0

      for (const year of years) {
        const cost = yearCosts[String(year)] || 0
        bucketTotal += cost
      }

      if (bucketTotal > 0) {
        bucketBreakdown[bucket.bucket_type] = bucketTotal
      }
      presentTotal += bucketTotal
    }

    const difference = presentTotal - expectedCost
    const match = Math.abs(difference) < 1 // Allow for rounding to nearest dollar

    if (match) {
      console.log(`✅ ${projectLabel}: $${presentTotal.toLocaleString()} (expected: $${expectedCost.toLocaleString()})`)
    } else {
      console.log(`❌ ${projectLabel}: $${presentTotal.toLocaleString()} (expected: $${expectedCost.toLocaleString()}, diff: ${difference > 0 ? '+' : ''}$${difference.toLocaleString()})`)
      allPassed = false
    }

    // Show bucket breakdown
    if (Object.keys(bucketBreakdown).length > 0) {
      console.log(`   Buckets:`)
      for (const [bucketType, total] of Object.entries(bucketBreakdown)) {
        console.log(`     - ${bucketType}: $${total.toLocaleString()}`)
      }
    }
    console.log()
  }

  console.log('=== SUMMARY ===')
  if (allPassed) {
    console.log('✅ All present cost calculations are CORRECT!')
  } else {
    console.log('❌ Some present cost calculations are INCORRECT')
    console.log('\nPlease check:')
    console.log('1. Are all years in the range being included in the sum?')
    console.log('2. Is any inflation being applied (should be raw values only)?')
    console.log('3. Are all three buckets being included in the total?')
  }
}

verifyPresentCosts().catch(console.error)
