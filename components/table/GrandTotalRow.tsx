'use client'
import { FundingCategory } from '@/types'
import { usePlan } from '@/context/PlanContext'
import { formatCost, projectPresentTotal, projectInflatedTotal } from '@/lib/calculations'

interface GrandTotalRowProps {
  fundingCategories: FundingCategory[]
  yearCount: number
}

export function GrandTotalRow({ fundingCategories, yearCount }: GrandTotalRowProps) {
  const { settings, years } = usePlan()

  const allEnabledProjects = fundingCategories.flatMap((fc) =>
    fc.subcategories.flatMap((cat) => cat.projects.filter((p) => p.enabled))
  )

  const grandPresentTotal = allEnabledProjects.reduce(
    (sum, p) => sum + projectPresentTotal(p.buckets, years, settings.base_year, settings.inflation_rate),
    0
  )
  const grandInflatedTotal = allEnabledProjects.reduce(
    (sum, p) => sum + projectInflatedTotal(p.buckets, years),
    0
  )

  return (
    <tr className="bg-gradient-to-r from-slate-800 to-slate-700 text-white border-y-4 border-slate-900 shadow-lg">
      <td colSpan={2} className="px-4 py-4 font-bold text-lg uppercase tracking-wide">
        Grand Total
      </td>
      <td className="px-4 py-4 text-right font-bold text-xl">{formatCost(grandPresentTotal)}</td>
      <td className="px-4 py-4 text-right font-bold text-xl text-cyan-300">
        {formatCost(grandInflatedTotal)}
      </td>
      {Array(yearCount)
        .fill(0)
        .map((_, i) => (
          <td key={i} className="border-l border-slate-600"></td>
        ))}
    </tr>
  )
}
