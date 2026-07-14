'use client'
import { useState, useEffect } from 'react'
import { Download, FileSpreadsheet } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { usePlan } from '@/context/PlanContext'
import { ProjectCategory, Project, ProjectBucket } from '@/types'
import { exportToExcel } from '@/lib/export'

export default function ExportPage() {
  const { settings, years } = usePlan()
  const [categories, setCategories] = useState<ProjectCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setIsLoading(true)

    // Fetch categories
    const { data: categoriesData } = await supabase
      .from('project_categories')
      .select('*')
      .order('sort_order')

    // Fetch projects
    const { data: projectsData } = await supabase.from('projects').select('*').order('sort_order')

    // Fetch buckets
    const { data: bucketsData } = await supabase.from('project_buckets').select('*')

    // Assemble nested structure
    const categoriesWithProjects: ProjectCategory[] = (categoriesData || []).map((cat) => {
      const categoryProjects = (projectsData || [])
        .filter((p) => p.category_id === cat.id)
        .map((proj): Project => ({
          ...proj,
          buckets: (bucketsData || [])
            .filter((b) => b.project_id === proj.id)
            .map((b): ProjectBucket => ({
              id: b.id,
              project_id: b.project_id,
              bucket_type: b.bucket_type,
              year_costs: b.year_costs || {},
            })),
        }))

      return {
        ...cat,
        projects: categoryProjects,
      }
    })

    setCategories(categoriesWithProjects)
    setIsLoading(false)
  }

  function handleExport() {
    exportToExcel({
      categories,
      years,
      baseYear: settings.base_year,
      inflationRate: settings.inflation_rate,
      cityName: settings.city_name,
      planTitle: settings.plan_title,
    })
  }

  const totalProjects = categories.reduce((sum, cat) => sum + cat.projects.length, 0)
  const enabledProjects = categories.flatMap((cat) => cat.projects.filter((p) => p.enabled)).length

  return (
    <div className="p-6 max-w-4xl bg-slate-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Export CIP Data</h1>
        <p className="text-slate-600 mt-1">Download your capital improvement plan in Excel format</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-slate-200">
        <div className="flex items-start gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl border-2 border-blue-300">
            <FileSpreadsheet className="w-10 h-10 text-blue-700" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Excel Export</h2>
            <p className="text-slate-700 mb-4 leading-relaxed">
              Export your Capital Improvement Plan to Excel format. The exported file will include
              all enabled projects, organized by category, with year-by-year cost breakdowns.
            </p>

            <div className="bg-slate-50 rounded-lg p-4 mb-4 border border-slate-200">
              <h3 className="font-semibold text-sm text-slate-900 mb-2">Export includes:</h3>
              <ul className="text-sm text-slate-700 space-y-1">
                <li>• Projects grouped by category</li>
                <li>• Three funding bucket rows per project</li>
                <li>• Present and inflated cost calculations</li>
                <li>• Year-by-year cost breakdown ({years.length} years)</li>
                <li>• Category subtotals and grand totals</li>
              </ul>
            </div>

            {!isLoading && (
              <div className="flex items-center gap-6 mb-4 text-sm">
                <div className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                  <span className="text-slate-600">Total Projects:</span>{' '}
                  <span className="font-bold text-slate-900">{totalProjects}</span>
                </div>
                <div className="bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                  <span className="text-slate-600">Enabled:</span>{' '}
                  <span className="font-bold text-emerald-700">{enabledProjects}</span>
                </div>
                <div className="bg-violet-50 px-3 py-2 rounded-lg border border-violet-200">
                  <span className="text-slate-600">Categories:</span>{' '}
                  <span className="font-bold text-slate-900">{categories.length}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleExport}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all disabled:opacity-50 font-semibold shadow-lg shadow-blue-500/30"
            >
              <Download className="w-5 h-5" />
              {isLoading ? 'Loading...' : 'Export to Excel'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-4 text-lg">Export Settings</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-white/70 p-3 rounded-lg">
            <span className="text-slate-600 font-medium">City:</span>{' '}
            <span className="font-bold text-slate-900">{settings.city_name}</span>
          </div>
          <div className="bg-white/70 p-3 rounded-lg">
            <span className="text-slate-600 font-medium">Plan Title:</span>{' '}
            <span className="font-bold text-slate-900">{settings.plan_title}</span>
          </div>
          <div className="bg-white/70 p-3 rounded-lg">
            <span className="text-slate-600 font-medium">Base Year:</span>{' '}
            <span className="font-bold text-slate-900">{settings.base_year}</span>
          </div>
          <div className="bg-white/70 p-3 rounded-lg">
            <span className="text-slate-600 font-medium">Inflation Rate:</span>{' '}
            <span className="font-bold text-slate-900">{settings.inflation_rate}%</span>
          </div>
          <div className="bg-white/70 p-3 rounded-lg col-span-2">
            <span className="text-slate-600 font-medium">Year Range:</span>{' '}
            <span className="font-bold text-slate-900">
              {settings.start_year} - {settings.end_year}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
