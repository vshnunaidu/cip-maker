'use client'
import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Project } from '@/types'
import { Toggle } from '@/components/ui/Toggle'
import { usePlan } from '@/context/PlanContext'
import { formatCost, projectPresentTotal, projectInflatedTotal } from '@/lib/calculations'

interface ProjectRowProps {
  project: Project
  onToggle: (enabled: boolean) => void
  onEdit: () => void
}

export function ProjectRow({ project, onToggle, onEdit }: ProjectRowProps) {
  const { settings, years } = usePlan()
  const [isHovered, setIsHovered] = useState(false)

  const presentTotal = projectPresentTotal(project.buckets, years)
  const inflatedTotal = projectInflatedTotal(
    project.buckets,
    years,
    settings.base_year,
    settings.inflation_rate
  )

  return (
    <tr
      className={`border-b border-slate-200 bg-white hover:bg-slate-50 transition-colors ${!project.enabled ? 'opacity-50' : ''} group`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <td className="px-4 py-3.5 font-medium">
        <div className="flex items-center gap-3">
          <Toggle enabled={project.enabled} onChange={onToggle} />
          <span className="text-slate-700 text-sm font-bold bg-slate-100 px-2.5 py-1 rounded-md">
            {project.project_id_label || '—'}
          </span>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <div className="font-semibold text-slate-900">{project.name}</div>
            {project.description && (
              <div className="text-sm text-slate-600 mt-1">{project.description}</div>
            )}
          </div>
          {isHovered && (
            <button
              onClick={onEdit}
              className="opacity-0 group-hover:opacity-100 p-2 hover:bg-blue-100 rounded-lg transition-all text-blue-600"
              title="Edit project"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
      <td className="px-4 py-3.5 text-right font-bold text-slate-900">{formatCost(presentTotal)}</td>
      <td className="px-4 py-3.5 text-right font-bold text-cyan-600">
        {formatCost(inflatedTotal)}
      </td>
      {years.map((year) => (
        <td key={year} className="px-2 py-3.5 border-l border-slate-100"></td>
      ))}
    </tr>
  )
}
