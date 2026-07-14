'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { usePlan } from '@/context/PlanContext'
import { ProjectCategory, Project, ProjectBucket } from '@/types'
import {
  formatCost,
  projectPresentTotal,
  projectInflatedTotal,
  bucketRangeTotal,
  bucketInflatedTotal,
} from '@/lib/calculations'

export default function SummaryPage() {
  const { settings, years } = usePlan()
  const [categories, setCategories] = useState<ProjectCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setIsLoading(true)

    const { data: categoriesData } = await supabase
      .from('project_categories')
      .select('*')
      .order('sort_order')

    const { data: projectsData } = await supabase.from('projects').select('*').order('sort_order')

    const { data: bucketsData } = await supabase.from('project_buckets').select('*')

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Loading summary...</div>
      </div>
    )
  }

  const enabledProjects = categories.flatMap((cat) => cat.projects.filter((p) => p.enabled))

  // Calculate totals by year
  const yearTotals = years.map((year) => {
    const total = enabledProjects.reduce((sum, project) => {
      const yearTotal = project.buckets.reduce(
        (bucketSum, bucket) => bucketSum + (bucket.year_costs[String(year)] || 0),
        0
      )
      return sum + yearTotal
    }, 0)
    return { year, total }
  })

  // Calculate totals by category
  const categoryTotals = categories.map((cat) => {
    const catProjects = cat.projects.filter((p) => p.enabled)
    const presentTotal = catProjects.reduce(
      (sum, p) => sum + projectPresentTotal(p.buckets, years),
      0
    )
    const inflatedTotal = catProjects.reduce(
      (sum, p) =>
        sum + projectInflatedTotal(p.buckets, years, settings.base_year, settings.inflation_rate),
      0
    )
    return { name: cat.name, presentTotal, inflatedTotal }
  })

  const grandPresentTotal = enabledProjects.reduce(
    (sum, p) => sum + projectPresentTotal(p.buckets, years),
    0
  )
  const grandInflatedTotal = enabledProjects.reduce(
    (sum, p) =>
      sum + projectInflatedTotal(p.buckets, years, settings.base_year, settings.inflation_rate),
    0
  )

  const maxYearTotal = Math.max(...yearTotals.map((yt) => yt.total))

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Summary</h1>
        <p className="text-slate-600 mt-1">Comprehensive overview of project costs and distribution</p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Total Cost by Year</h2>
          <div className="space-y-3">
            {yearTotals.map((yt) => (
              <div key={yt.year} className="flex items-center gap-3">
                <div className="w-16 text-sm font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md text-center">{yt.year}</div>
                <div className="flex-1 bg-slate-100 rounded-full h-7 overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 h-full transition-all shadow-sm"
                    style={{ width: `${(yt.total / maxYearTotal) * 100}%` }}
                  ></div>
                </div>
                <div className="w-28 text-sm font-bold text-right text-slate-900">{formatCost(yt.total)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Cost by Category</h2>
          <div className="space-y-3">
            {categoryTotals.map((ct) => (
              <div key={ct.name} className="border-b-2 border-slate-100 pb-3 last:border-0">
                <div className="font-bold text-slate-900 mb-2">{ct.name}</div>
                <div className="flex items-center justify-between text-sm bg-slate-50 px-3 py-2 rounded-lg mb-1">
                  <span className="text-slate-600 font-medium">Present:</span>
                  <span className="font-bold text-slate-900">{formatCost(ct.presentTotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm bg-cyan-50 px-3 py-2 rounded-lg">
                  <span className="text-slate-600 font-medium">Inflated:</span>
                  <span className="font-bold text-cyan-700">
                    {formatCost(ct.inflatedTotal)}
                  </span>
                </div>
              </div>
            ))}
            <div className="border-t-4 border-slate-300 pt-4 mt-4 bg-gradient-to-br from-slate-50 to-blue-50 p-4 rounded-lg">
              <div className="font-bold text-slate-900 mb-3 text-lg">Grand Total</div>
              <div className="flex items-center justify-between bg-white px-4 py-2 rounded-lg mb-2 shadow-sm">
                <span className="text-slate-700 font-semibold">Present:</span>
                <span className="font-bold text-xl text-slate-900">{formatCost(grandPresentTotal)}</span>
              </div>
              <div className="flex items-center justify-between bg-white px-4 py-2 rounded-lg shadow-sm">
                <span className="text-slate-700 font-semibold">Inflated:</span>
                <span className="font-bold text-xl text-cyan-700">
                  {formatCost(grandInflatedTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Year Matrix</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-b from-slate-700 to-slate-800 border-b-2 border-slate-900">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-white uppercase tracking-wider text-xs">Category</th>
                {years.map((year) => (
                  <th key={year} className="px-4 py-3 text-right font-bold text-white uppercase tracking-wider text-xs border-l border-slate-600">
                    {year}
                  </th>
                ))}
                <th className="px-4 py-3 text-right font-bold text-cyan-300 uppercase tracking-wider text-xs border-l border-slate-600">Total</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, idx) => {
                const catProjects = cat.projects.filter((p) => p.enabled)
                const categoryYearTotals = years.map((year) => {
                  return catProjects.reduce((sum, project) => {
                    const yearTotal = project.buckets.reduce(
                      (bucketSum, bucket) => bucketSum + (bucket.year_costs[String(year)] || 0),
                      0
                    )
                    return sum + yearTotal
                  }, 0)
                })
                const categoryTotal = categoryYearTotals.reduce((sum, val) => sum + val, 0)

                return (
                  <tr key={cat.id} className={`border-b border-slate-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                    <td className="px-4 py-3 font-bold text-slate-900">{cat.name}</td>
                    {categoryYearTotals.map((total, idx) => (
                      <td key={idx} className="px-4 py-3 text-right font-medium text-slate-800 border-l border-slate-100">
                        {total > 0 ? formatCost(total) : '—'}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right font-bold text-slate-900 border-l border-slate-200">
                      {formatCost(categoryTotal)}
                    </td>
                  </tr>
                )
              })}
              <tr className="bg-gradient-to-r from-slate-800 to-slate-700 border-t-4 border-slate-900 text-white font-bold shadow-lg">
                <td className="px-4 py-4 text-lg uppercase tracking-wide">Grand Total</td>
                {yearTotals.map((yt) => (
                  <td key={yt.year} className="px-4 py-4 text-right text-base border-l border-slate-600">
                    {yt.total > 0 ? formatCost(yt.total) : '—'}
                  </td>
                ))}
                <td className="px-4 py-4 text-right text-lg text-cyan-300 border-l border-slate-600">{formatCost(grandPresentTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
