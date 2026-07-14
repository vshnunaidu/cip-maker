import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Please ensure .env.local exists with:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL=your_url')
  console.error('  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key')
  process.exit(1)
}

console.log('✅ Environment variables loaded')
console.log(`📡 Connecting to Supabase at ${supabaseUrl.substring(0, 30)}...`)

const supabase = createClient(supabaseUrl, supabaseKey)

interface ProjectData {
  project_id_label: string
  name: string
  category_name: string
  buckets: {
    bucket_type: 'issued_debt_cash' | 'new_debt' | 'impact_fees'
    year_costs: Record<string, number>
  }[]
}

const projectsData: ProjectData[] = [
  {
    project_id_label: 'W-1',
    name: 'Surface Water Treatment Plant Membrane Replacement',
    category_name: 'Facility Rehabilitation',
    buckets: [
      {
        bucket_type: 'issued_debt_cash',
        year_costs: {
          '2026': 104000,
          '2027': 108000,
          '2028': 112000,
          '2029': 117000,
          '2030': 122000,
          '2031': 127000,
          '2032': 132000,
          '2033': 137000,
          '2034': 142000,
          '2035': 148000,
        },
      },
      {
        bucket_type: 'new_debt',
        year_costs: {},
      },
      {
        bucket_type: 'impact_fees',
        year_costs: {},
      },
    ],
  },
  {
    project_id_label: 'W-11',
    name: 'Waterline Rehab — Zone A',
    category_name: 'Distribution System Rehabilitation',
    buckets: [
      {
        bucket_type: 'issued_debt_cash',
        year_costs: {},
      },
      {
        bucket_type: 'new_debt',
        year_costs: {
          '2026': 372000,
          '2027': 2194000,
        },
      },
      {
        bucket_type: 'impact_fees',
        year_costs: {},
      },
    ],
  },
  {
    project_id_label: 'W-12',
    name: 'Waterline Rehab — Zone C and D Design',
    category_name: 'Distribution System Rehabilitation',
    buckets: [
      {
        bucket_type: 'issued_debt_cash',
        year_costs: {},
      },
      {
        bucket_type: 'new_debt',
        year_costs: {
          '2028': 202000,
          '2029': 1955000,
          '2030': 304000,
          '2031': 2114000,
        },
      },
      {
        bucket_type: 'impact_fees',
        year_costs: {},
      },
    ],
  },
  {
    project_id_label: 'W-17',
    name: 'Surface Water Treatment Plant Expansion to 4 MGD',
    category_name: 'Facility Expansion',
    buckets: [
      {
        bucket_type: 'issued_debt_cash',
        year_costs: {},
      },
      {
        bucket_type: 'new_debt',
        year_costs: {
          '2028': 3916090,
        },
      },
      {
        bucket_type: 'impact_fees',
        year_costs: {
          '2028': 2940000,
          '2029': 8662000,
          '2030': 9009000,
        },
      },
    ],
  },
  {
    project_id_label: 'W-19',
    name: 'New Elevated Storage Tank along FM 762',
    category_name: 'Facility Expansion',
    buckets: [
      {
        bucket_type: 'issued_debt_cash',
        year_costs: {},
      },
      {
        bucket_type: 'new_debt',
        year_costs: {},
      },
      {
        bucket_type: 'impact_fees',
        year_costs: {
          '2027': 672000,
          '2028': 3959000,
        },
      },
    ],
  },
]

async function seed() {
  console.log('🌱 Starting seed process...')

  try {
    // Fetch categories
    const { data: categories, error: catError } = await supabase
      .from('project_categories')
      .select('id, name')

    if (catError) throw catError
    if (!categories) throw new Error('No categories found')

    console.log(`📁 Found ${categories.length} categories`)

    // Create a map of category names to IDs
    const categoryMap = new Map(categories.map((cat) => [cat.name, cat.id]))

    // Delete existing projects to allow re-seeding
    console.log('🗑️  Clearing existing seed data...')
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .in('project_id_label', projectsData.map((p) => p.project_id_label))

    if (deleteError) console.warn('Note: Could not delete existing projects:', deleteError.message)

    // Insert projects and their buckets
    for (const projectData of projectsData) {
      const categoryId = categoryMap.get(projectData.category_name)
      if (!categoryId) {
        console.warn(`⚠️  Category not found: ${projectData.category_name}, skipping ${projectData.project_id_label}`)
        continue
      }

      console.log(`📝 Creating project ${projectData.project_id_label}...`)

      // Insert project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          project_id_label: projectData.project_id_label,
          name: projectData.name,
          description: null,
          category_id: categoryId,
          enabled: true,
          sort_order: 0,
        })
        .select()
        .single()

      if (projectError) {
        console.error(`❌ Failed to create project ${projectData.project_id_label}:`, projectError.message)
        continue
      }

      // Insert buckets
      for (const bucket of projectData.buckets) {
        const { error: bucketError } = await supabase
          .from('project_buckets')
          .insert({
            project_id: project.id,
            bucket_type: bucket.bucket_type,
            year_costs: bucket.year_costs,
          })

        if (bucketError) {
          console.error(`❌ Failed to create bucket for ${projectData.project_id_label}:`, bucketError.message)
        }
      }

      console.log(`✅ Created project ${projectData.project_id_label} with 3 buckets`)
    }

    console.log('🎉 Seed process completed successfully!')
    console.log(`📊 Created ${projectsData.length} projects with funding data`)
  } catch (error) {
    console.error('❌ Seed process failed:', error)
    process.exit(1)
  }
}

seed()
