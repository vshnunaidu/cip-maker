'use client'
import { useState, Fragment } from 'react'
import { Plus } from 'lucide-react'
import { ProjectCategory, Project, ProjectBucket } from '@/types'
import { usePlan } from '@/context/PlanContext'
import { supabase } from '@/lib/supabase'
import { GroupHeader } from './GroupHeader'
import { ProjectRow } from './ProjectRow'
import { BucketRow } from './BucketRow'
import { SubtotalRow } from './SubtotalRow'
import { GrandTotalRow } from './GrandTotalRow'
import { AddProjectModal } from '@/components/modals/AddProjectModal'
import { EditProjectModal } from '@/components/modals/EditProjectModal'

interface ProjectsTableProps {
  categories: ProjectCategory[]
  onDataChange: () => void
}

export function ProjectsTable({ categories, onDataChange }: ProjectsTableProps) {
  const { years } = usePlan()
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(categories.map((c) => c.id))
  )
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  const handleToggleProject = async (projectId: string, enabled: boolean) => {
    await supabase.from('projects').update({ enabled }).eq('id', projectId)
    onDataChange()
  }

  const handleUpdateBucketCost = async (
    bucketId: string,
    yearCosts: Record<string, number>,
    year: string,
    value: number
  ) => {
    const updated = { ...yearCosts, [year]: value }
    await supabase
      .from('project_buckets')
      .update({ year_costs: updated })
      .eq('id', bucketId)
    onDataChange()
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse bg-white">
        <thead className="sticky top-0 bg-gradient-to-b from-slate-700 to-slate-800 border-b-2 border-slate-900 z-10 shadow-lg">
          <tr>
            <th className="px-4 py-3.5 text-left text-xs font-bold text-white uppercase tracking-wider w-40">
              Project ID
            </th>
            <th className="px-4 py-3.5 text-left text-xs font-bold text-white uppercase tracking-wider min-w-64">
              Project Name
            </th>
            <th className="px-4 py-3.5 text-right text-xs font-bold text-white uppercase tracking-wider w-32">
              Present Cost
            </th>
            <th className="px-4 py-3.5 text-right text-xs font-bold text-cyan-300 uppercase tracking-wider w-32">
              Inflated Cost
            </th>
            {years.map((year) => (
              <th
                key={year}
                className="px-4 py-3.5 text-center text-xs font-bold text-white uppercase tracking-wider border-l border-slate-600 w-28"
              >
                {year}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.map((category, categoryIndex) => {
            const isExpanded = expandedCategories.has(category.id)

            // Assign colors to categories in a rotating pattern
            const categoryColors = [
              'border-l-blue-500 bg-blue-50/30',
              'border-l-emerald-500 bg-emerald-50/30',
              'border-l-violet-500 bg-violet-50/30',
              'border-l-amber-500 bg-amber-50/30',
              'border-l-cyan-500 bg-cyan-50/30',
            ]
            const categoryColor = categoryColors[categoryIndex % categoryColors.length]

            return (
              <Fragment key={category.id}>
                <tr
                  className={`bg-gradient-to-r from-slate-100 to-slate-50 border-y-2 border-slate-300 border-l-4 ${categoryColor} cursor-pointer hover:from-slate-200 hover:to-slate-100 transition-all`}
                  onClick={() => toggleCategory(category.id)}
                >
                  <td colSpan={2} className="px-4 py-3.5">
                    <div className="flex items-center gap-3 font-bold text-slate-900">
                      <span className="text-sm text-blue-600">{isExpanded ? '▼' : '▶'}</span>
                      <span className="text-base">{category.name}</span>
                      <span className="text-xs font-semibold text-slate-500 bg-slate-200 px-2 py-1 rounded-full ml-2">
                        {category.projects.length} project
                        {category.projects.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5"></td>
                  <td className="px-4 py-3.5"></td>
                  {years.map((year) => (
                    <td key={year} className="border-l border-slate-200"></td>
                  ))}
                </tr>

                {isExpanded &&
                  category.projects.map((project) => (
                    <Fragment key={project.id}>
                      <ProjectRow
                        project={project}
                        onToggle={(enabled) => handleToggleProject(project.id, enabled)}
                        onEdit={() => setEditingProject(project)}
                      />
                      {project.buckets.map((bucket) => (
                        <BucketRow
                          key={bucket.id}
                          bucket={bucket}
                          onUpdateCost={(year, value) =>
                            handleUpdateBucketCost(bucket.id, bucket.year_costs, year, value)
                          }
                          disabled={!project.enabled}
                        />
                      ))}
                    </Fragment>
                  ))}

                {isExpanded && <SubtotalRow category={category} yearCount={years.length} />}
              </Fragment>
            )
          })}

          <GrandTotalRow categories={categories} yearCount={years.length} />

          <tr className="border-t-2 border-slate-300 bg-slate-50">
            <td colSpan={2} className="px-4 py-4">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all shadow-sm hover:shadow-md"
              >
                <Plus className="w-5 h-5" />
                Add Project
              </button>
            </td>
            <td colSpan={2 + years.length}></td>
          </tr>
        </tbody>
      </table>

      {showAddModal && (
        <AddProjectModal
          categories={categories}
          onClose={() => setShowAddModal(false)}
          onSuccess={onDataChange}
        />
      )}

      {editingProject && (
        <EditProjectModal
          project={editingProject}
          categories={categories}
          onClose={() => setEditingProject(null)}
          onSuccess={onDataChange}
        />
      )}
    </div>
  )
}
