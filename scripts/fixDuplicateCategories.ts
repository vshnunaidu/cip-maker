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

// Canonical subcategory names by funding category
const CANONICAL_NAMES: Record<string, string[]> = {
  'Water': [
    'Facility Rehabilitation Projects',
    'Distribution System Rehabilitation Projects',
    'Water Accounting Projects',
    'Facility Expansion Projects',
    'Distribution System Expansion Projects',
  ],
  'Wastewater': [
    'Facility Rehabilitation Projects',
    'Collection System Rehabilitation Projects',
    'Wastewater Accounting Projects',
    'Wastewater Permitting Projects',
    'Facility Expansion Projects',
    'Collection System Expansion Projects',
  ],
  'Reclaimed Water': [
    'Expansion Projects',
  ],
}

const CANONICAL_SORT_ORDER: Record<string, Record<string, number>> = {
  'Water': {
    'Facility Rehabilitation Projects': 1,
    'Distribution System Rehabilitation Projects': 2,
    'Water Accounting Projects': 3,
    'Facility Expansion Projects': 4,
    'Distribution System Expansion Projects': 5,
  },
  'Wastewater': {
    'Facility Rehabilitation Projects': 1,
    'Collection System Rehabilitation Projects': 2,
    'Wastewater Accounting Projects': 3,
    'Wastewater Permitting Projects': 4,
    'Facility Expansion Projects': 5,
    'Collection System Expansion Projects': 6,
  },
  'Reclaimed Water': {
    'Expansion Projects': 1,
  },
}

function normalizeSubcategoryName(name: string): string {
  return name
    .replace(/\s+projects$/i, '')
    .trim()
    .toLowerCase()
}

async function fixDuplicateCategories() {
  console.log('🔍 Step 1: Detecting duplicate subcategories\n')

  // Get all funding categories
  const { data: fundingCategories } = await supabase
    .from('funding_categories')
    .select('id, name')
    .order('name')

  if (!fundingCategories) {
    console.error('❌ Failed to fetch funding categories')
    return
  }

  console.log('Funding categories:')
  fundingCategories.forEach(fc => console.log(`  - ${fc.name} (${fc.id})`))

  // Get all project categories
  const { data: projectCategories } = await supabase
    .from('project_categories')
    .select('id, name, funding_category_id, sort_order')
    .order('funding_category_id, name')

  if (!projectCategories) {
    console.error('❌ Failed to fetch project categories')
    return
  }

  console.log(`\n📊 Total project categories: ${projectCategories.length}\n`)

  // Group by funding category
  const categoriesByFunding = new Map<string, typeof projectCategories>()
  for (const fc of fundingCategories) {
    const cats = projectCategories.filter(pc => pc.funding_category_id === fc.id)
    categoriesByFunding.set(fc.name, cats)
  }

  let totalDuplicatesFound = 0
  let totalProjectsReassigned = 0
  let totalCategoriesDeleted = 0

  // Process each funding category
  for (const [fundingName, categories] of categoriesByFunding) {
    console.log(`\n=== ${fundingName} ===`)
    console.log(`Subcategories found: ${categories.length}`)
    categories.forEach(cat => console.log(`  - "${cat.name}" (ID: ${cat.id})`))

    const canonicalNames = CANONICAL_NAMES[fundingName] || []
    const normalizedToCanonical = new Map<string, string>()
    for (const canonical of canonicalNames) {
      const normalized = normalizeSubcategoryName(canonical)
      normalizedToCanonical.set(normalized, canonical)
    }

    // Find duplicates
    const duplicateGroups = new Map<string, typeof categories>()
    for (const cat of categories) {
      const normalized = normalizeSubcategoryName(cat.name)
      if (!duplicateGroups.has(normalized)) {
        duplicateGroups.set(normalized, [])
      }
      duplicateGroups.get(normalized)!.push(cat)
    }

    // Process each duplicate group
    for (const [normalized, group] of duplicateGroups) {
      if (group.length > 1) {
        console.log(`\n🔍 Found duplicates for "${normalized}":`)
        group.forEach(cat => console.log(`   - "${cat.name}" (ID: ${cat.id})`))
        totalDuplicatesFound += group.length - 1

        // Find canonical version
        const canonicalName = normalizedToCanonical.get(normalized)
        if (!canonicalName) {
          console.log(`   ⚠️  No canonical name defined for "${normalized}", skipping...`)
          continue
        }

        // Find which one matches canonical name exactly
        let canonicalCat = group.find(cat => cat.name === canonicalName)

        // If no exact match, use the one with most projects or first one
        if (!canonicalCat) {
          console.log(`   ℹ️  No exact match for "${canonicalName}", will rename one`)
          canonicalCat = group[0]

          // Rename to canonical
          const { error: renameError } = await supabase
            .from('project_categories')
            .update({ name: canonicalName })
            .eq('id', canonicalCat.id)

          if (renameError) {
            console.log(`   ❌ Error renaming category: ${renameError.message}`)
            continue
          } else {
            console.log(`   ✅ Renamed "${canonicalCat.name}" to "${canonicalName}"`)
            canonicalCat.name = canonicalName
          }
        }

        console.log(`   ✅ Canonical version: "${canonicalCat.name}" (ID: ${canonicalCat.id})`)

        // Merge duplicates into canonical
        const duplicates = group.filter(cat => cat.id !== canonicalCat!.id)
        for (const dup of duplicates) {
          // Get projects in duplicate category
          const { data: projects } = await supabase
            .from('projects')
            .select('id, project_id_label')
            .eq('category_id', dup.id)

          if (projects && projects.length > 0) {
            console.log(`   📦 Moving ${projects.length} projects from "${dup.name}" to "${canonicalCat.name}"`)

            // Move projects
            const { error: moveError } = await supabase
              .from('projects')
              .update({ category_id: canonicalCat.id })
              .eq('category_id', dup.id)

            if (moveError) {
              console.log(`   ❌ Error moving projects: ${moveError.message}`)
              continue
            } else {
              console.log(`   ✅ Moved ${projects.length} projects`)
              totalProjectsReassigned += projects.length
            }
          }

          // Delete duplicate category
          const { error: deleteError } = await supabase
            .from('project_categories')
            .delete()
            .eq('id', dup.id)

          if (deleteError) {
            console.log(`   ❌ Error deleting duplicate category: ${deleteError.message}`)
          } else {
            console.log(`   ✅ Deleted duplicate category "${dup.name}"`)
            totalCategoriesDeleted++
          }
        }
      }
    }
  }

  console.log('\n\n🔧 Step 3: Fixing subcategory sort_order\n')

  // Re-fetch categories after merges
  const { data: updatedCategories } = await supabase
    .from('project_categories')
    .select('id, name, funding_category_id')

  if (!updatedCategories) {
    console.error('❌ Failed to fetch updated categories')
    return
  }

  for (const fc of fundingCategories) {
    const sortOrderMap = CANONICAL_SORT_ORDER[fc.name]
    if (!sortOrderMap) continue

    const cats = updatedCategories.filter(pc => pc.funding_category_id === fc.id)

    for (const cat of cats) {
      const targetSortOrder = sortOrderMap[cat.name]
      if (targetSortOrder !== undefined) {
        const { error } = await supabase
          .from('project_categories')
          .update({ sort_order: targetSortOrder })
          .eq('id', cat.id)

        if (error) {
          console.log(`❌ Error updating sort_order for "${cat.name}": ${error.message}`)
        } else {
          console.log(`✅ ${fc.name} → "${cat.name}" → sort_order: ${targetSortOrder}`)
        }
      }
    }
  }

  console.log('\n\n📊 Step 4: Verification\n')

  // Final verification
  const { data: finalCategories } = await supabase
    .from('project_categories')
    .select('id, name, funding_category_id, sort_order')
    .order('funding_category_id, sort_order')

  const { data: allProjects } = await supabase
    .from('projects')
    .select('category_id')

  console.log('=== SUMMARY ===')
  console.log(`✅ Duplicates found and merged: ${totalDuplicatesFound}`)
  console.log(`✅ Projects re-assigned: ${totalProjectsReassigned}`)
  console.log(`✅ Categories deleted: ${totalCategoriesDeleted}`)

  console.log('\n=== FINAL SUBCATEGORIES ===')
  for (const fc of fundingCategories) {
    const cats = finalCategories?.filter(pc => pc.funding_category_id === fc.id) || []
    console.log(`\n${fc.name}:`)
    for (const cat of cats) {
      const projectCount = allProjects?.filter(p => p.category_id === cat.id).length || 0
      console.log(`  ${cat.sort_order}. ${cat.name} (${projectCount} projects)`)

      if (projectCount === 0) {
        console.log(`     ⚠️  WARNING: This category has 0 projects!`)
      }
    }
  }

  console.log('\n✅ Script completed!')
}

fixDuplicateCategories().catch(console.error)
