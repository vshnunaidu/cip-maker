'use client'
import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { ProjectCategory } from '@/types'
import { usePlan } from '@/context/PlanContext'
import { formatCost, projectPresentTotal, projectInflatedTotal } from '@/lib/calculations'

interface GroupHeaderProps {
  category: ProjectCategory
  yearCount: number
}

export function GroupHeader({ category, yearCount }: GroupHeaderProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const { settings, years } = usePlan()

  const enabledProjects = category.projects.filter((p) => p.enabled)
  const categoryPresentTotal = enabledProjects.reduce(
    (sum, p) => sum + projectPresentTotal(p.buckets, years, settings.base_year, settings.inflation_rate),
    0
  )
  const categoryInflatedTotal = enabledProjects.reduce(
    (sum, p) => sum + projectInflatedTotal(p.buckets, years),
    0
  )

  return (
    <tr className="bg-gray-200 border-y border-gray-300">
      <td colSpan={2} className="px-4 py-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 font-bold text-gray-900 hover:text-blue-600 transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
          {category.name}
          <span className="text-sm font-normal text-gray-600 ml-2">
            ({category.projects.length} project{category.projects.length !== 1 ? 's' : ''})
          </span>
        </button>
      </td>
      <td className="px-4 py-3 text-right font-bold">{formatCost(categoryPresentTotal)}</td>
      <td className="px-4 py-3 text-right font-bold text-blue-600">
        {formatCost(categoryInflatedTotal)}
      </td>
      {Array(yearCount)
        .fill(0)
        .map((_, i) => (
          <td key={i} className="border-l border-gray-300"></td>
        ))}
    </tr>
  )
}
