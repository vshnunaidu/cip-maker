import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function diagnose() {
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 20) + '...')

  const { data: cats, error: catsErr } = await supabase.from('funding_categories').select('*')
  console.log('Funding categories:', cats?.length, cats?.map(c => c.code))
  if (catsErr) console.error('Funding categories error:', catsErr)

  const { data: subcats, error: subcatsErr } = await supabase.from('project_categories').select('*')
  console.log('Subcategories:', subcats?.length)
  if (subcatsErr) console.error('Subcategories error:', subcatsErr)

  const { data: projects, error: projectsErr } = await supabase.from('projects').select('*')
  console.log('Projects:', projects?.length, projects?.map(p => p.project_id_label))
  if (projectsErr) console.error('Projects error:', projectsErr)

  const { data: buckets, error: bucketsErr } = await supabase.from('project_buckets').select('*')
  console.log('Bucket rows:', buckets?.length)
  if (bucketsErr) console.error('Buckets error:', bucketsErr)

  const nonEmpty = buckets?.filter(b => Object.keys(b.year_costs || {}).length > 0)
  console.log('Buckets with data:', nonEmpty?.length)

  const { data: settings, error: settingsErr } = await supabase.from('plan_settings').select('*').single()
  console.log('Settings:', settings)
  if (settingsErr) console.error('Settings error:', settingsErr)
}
diagnose()
