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

// Sort order mapping: project_id_label -> sort_order within category
const PROJECT_SORT_ORDER: Record<string, number> = {
  // W — Water, Facility Rehabilitation Projects
  'W-1': 1,
  'W-2': 2,
  'W-3': 3,
  'W-4': 4,
  'W-5': 5,
  'W-6': 6,
  'W-7': 7,
  'W-8': 8,
  'W-9': 9,
  'W-10': 10,

  // W — Water, Distribution System Rehabilitation Projects
  'W-11': 1,
  'W-12': 2,

  // W — Water, Water Accounting Projects
  'W-13': 1,
  'W-14': 2,
  'W-15': 3,

  // W — Water, Facility Expansion Projects
  'W-16': 1,
  'W-17': 2,
  'W-18': 3,
  'W-19': 4,
  'W-20': 5,
  'W-21': 6,
  'W-22': 7,
  'W-23': 8,

  // W — Water, Distribution System Expansion Projects
  'W-24': 1,
  'W-25': 2,
  'W-26': 3,
  'W-27': 4,
  'W-28': 5,
  'W-29': 6,
  'W-30': 7,
  'W-31': 8,

  // WW — Wastewater, Facility Rehabilitation Projects
  'WW-1': 1,
  'WW-2': 2,
  'WW-3': 3,
  'WW-4': 4,
  'WW-5': 5,
  'WW-6': 6,
  'WW-7': 7,
  'WW-8': 8,
  'WW-10': 9,

  // WW — Wastewater, Collection System Rehabilitation Projects
  'WW-9': 1,
  'WW-11': 2,
  'WW-12': 3,
  'WW-13R': 4,

  // WW — Wastewater, Wastewater Accounting Projects
  'WW-13': 1,
  'WW-13b': 2,

  // WW — Wastewater, Wastewater Permitting Projects
  'WW-14': 1,

  // WW — Wastewater, Facility Expansion Projects
  'WW-15': 1,
  'WW-16': 2,
  'WW-17': 3,
  'WW-18': 4,
  'WW-19': 5,

  // WW — Wastewater, Collection System Expansion Projects
  'WW-20': 1,
  'WW-21': 2,
  'WW-22': 3,

  // RW — Reclaimed Water, Expansion Projects
  'RW-1': 1,
  'RW-2': 2,
  'RW-3': 3,
}

async function fixSortOrder() {
  console.log('🔧 Fixing project sort_order\n')

  let updatedCount = 0
  let notFoundCount = 0
  let alreadyCorrect = 0

  for (const [label, targetSortOrder] of Object.entries(PROJECT_SORT_ORDER)) {
    // Find project by label
    const { data: projects, error: findError } = await supabase
      .from('projects')
      .select('id, sort_order, name')
      .eq('project_id_label', label)

    if (findError) {
      console.log(`❌ Error finding ${label}: ${findError.message}`)
      continue
    }

    if (!projects || projects.length === 0) {
      console.log(`⚠️  Project ${label} not found in database`)
      notFoundCount++
      continue
    }

    const project = projects[0]

    // Check if already correct
    if (project.sort_order === targetSortOrder) {
      alreadyCorrect++
      continue
    }

    // Update sort_order
    const { error: updateError } = await supabase
      .from('projects')
      .update({ sort_order: targetSortOrder })
      .eq('id', project.id)

    if (updateError) {
      console.log(`❌ Error updating ${label}: ${updateError.message}`)
    } else {
      console.log(`✅ ${label}: ${project.name} → sort_order: ${targetSortOrder} (was: ${project.sort_order})`)
      updatedCount++
    }
  }

  console.log('\n=== SUMMARY ===')
  console.log(`✅ Updated: ${updatedCount}`)
  console.log(`✓ Already correct: ${alreadyCorrect}`)
  console.log(`⚠️  Not found: ${notFoundCount}`)

  console.log('\n🔍 Verifying final order...\n')

  // Verify the final order
  const { data: allProjects } = await supabase
    .from('projects')
    .select('project_id_label, sort_order, category_id, name')
    .order('category_id, sort_order')

  const { data: categories } = await supabase
    .from('project_categories')
    .select('id, name, funding_category_id, sort_order')

  const { data: fundingCategories } = await supabase
    .from('funding_categories')
    .select('id, name')

  if (!allProjects || !categories || !fundingCategories) {
    console.log('❌ Error fetching verification data')
    return
  }

  // Group by funding category
  for (const fc of fundingCategories.sort((a, b) => a.name.localeCompare(b.name))) {
    console.log(`\n=== ${fc.name} ===`)

    const fcCategories = categories
      .filter(c => c.funding_category_id === fc.id)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))

    for (const cat of fcCategories) {
      const catProjects = allProjects
        .filter(p => p.category_id === cat.id)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))

      console.log(`\n  ${cat.name}:`)
      if (catProjects.length === 0) {
        console.log(`    (no projects)`)
      } else {
        catProjects.forEach(p => {
          console.log(`    ${p.sort_order}. ${p.project_id_label} - ${p.name}`)
        })
      }
    }
  }

  console.log('\n✅ Script completed!')
}

fixSortOrder().catch(console.error)
