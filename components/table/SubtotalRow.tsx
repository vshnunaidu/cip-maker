'use client'
import { ProjectCategory } from '@/types'
import { usePlan } from '@/context/PlanContext'
import { formatCost, projectPresentTotal, projectInflatedTotal } from '@/lib/calculations'

interface SubtotalRowProps {
  category: ProjectCategory
  yearCount: number
}

export function SubtotalRow({ category, yearCount }: SubtotalRowProps) {
  const { settings, years } = usePlan()

  const enabledProjects = category.projects.filter((p) => p.enabled)
  const categoryPresentTotal = enabledProjects.reduce(
    (sum, p) => sum + projectPresentTotal(p.buckets, years),
    0
  )
  const categoryInflatedTotal = enabledProjects.reduce(
    (sum, p) =>
      sum + projectInflatedTotal(p.buckets, years, settings.base_year, settings.inflation_rate),
    0
  )

  return (
    <tr className="bg-slate-200 border-y-2 border-slate-300">
      <td colSpan={2} className="px-4 py-3 font-bold text-slate-900">
        {category.name} Subtotal
      </td>
      <td className="px-4 py-3 text-right font-bold text-slate-900">{formatCost(categoryPresentTotal)}</td>
      <td className="px-4 py-3 text-right font-bold text-cyan-700">
        {formatCost(categoryInflatedTotal)}
      </td>
      {Array(yearCount)
        .fill(0)
        .map((_, i) => (
          <td key={i} className="border-l border-slate-300"></td>
        ))}
    </tr>
  )
}
