'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { FundingCategory, ProjectCategory, Project, ProjectBucket } from '@/types'
import { ProjectsTable } from '@/components/table/ProjectsTable'
import { TopBar } from '@/components/layout/TopBar'

export default function ProjectsPage() {
  const [fundingCategories, setFundingCategories] = useState<FundingCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)

    // Fetch funding categories
    const { data: fundingCategoriesData } = await supabase
      .from('funding_categories')
      .select('*')
      .order('sort_order')

    // Fetch project categories (subcategories)
    const { data: categoriesData } = await supabase
      .from('project_categories')
      .select('*')
      .order('sort_order')

    // Fetch projects
    const { data: projectsData } = await supabase
      .from('projects')
      .select('*')
      .order('sort_order')

    // Fetch buckets
    const { data: bucketsData } = await supabase
      .from('project_buckets')
      .select('*')

    // Assemble 3-level nested structure: funding categories → subcategories → projects → buckets
    const fundingCategoriesWithData: FundingCategory[] = (fundingCategoriesData || []).map((fundingCat) => {
      const subcategories: ProjectCategory[] = (categoriesData || [])
        .filter((cat) => cat.funding_category_id === fundingCat.id)
        .map((cat) => {
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

      return {
        ...fundingCat,
        subcategories,
      }
    })

    setFundingCategories(fundingCategoriesWithData)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-slate-50">
        <TopBar />
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading projects...</p>
          </div>
        </div>
      </div>
    )
  }

  const totalProjects = fundingCategories.reduce(
    (sum, fundingCat) =>
      sum + fundingCat.subcategories.reduce((subSum, cat) => subSum + cat.projects.length, 0),
    0
  )

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <TopBar />
      <div className="p-4 md:p-6 overflow-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-600 mt-1">Manage and track capital improvement projects</p>
        </div>
        {totalProjects > 0 ? (
          <div className="bg-white rounded-xl shadow-lg overflow-auto border border-slate-200">
            <ProjectsTable fundingCategories={fundingCategories} onDataChange={fetchData} />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-slate-200">
            <div className="text-slate-400 mb-4">
              <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No projects yet</h3>
            <p className="text-slate-600 mb-6">
              Get started by adding your first capital improvement project
            </p>
            <button
              onClick={() => {/* This will be handled by the table component */}}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all font-semibold shadow-lg shadow-blue-500/30"
            >
              Add Your First Project
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
