'use client'
import { FundingCategory } from '@/types'
import { usePlan } from '@/context/PlanContext'
import { formatCost, projectPresentTotal, projectInflatedTotal } from '@/lib/calculations'
import { getCategoryColors } from '@/lib/categoryColors'

interface FundingCategoryHeaderProps {
  fundingCategory: FundingCategory
  isExpanded: boolean
  onToggle: () => void
}

export function FundingCategoryHeader({
  fundingCategory,
  isExpanded,
  onToggle,
}: FundingCategoryHeaderProps) {
  const { years, settings } = usePlan()

  // Calculate totals for this funding category
  const enabledProjects = fundingCategory.subcategories.flatMap((subcat) =>
    subcat.projects.filter((p) => p.enabled)
  )

  const presentTotal = enabledProjects.reduce(
    (sum, p) => sum + projectPresentTotal(p.buckets, years, settings.base_year, settings.inflation_rate),
    0
  )

  const inflatedTotal = enabledProjects.reduce(
    (sum, p) => sum + projectInflatedTotal(p.buckets, years),
    0
  )

  const colors = getCategoryColors(fundingCategory.code)

  return (
    <tr
      className="border-y-2 cursor-pointer transition-all"
      style={{
        background: colors.header,
        borderColor: colors.header,
      }}
      onClick={onToggle}
    >
      <td colSpan={2} className="px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold" style={{ color: colors.text }}>{isExpanded ? '▼' : '▶'}</span>
          <span className="text-base font-bold" style={{ color: colors.text }}>
            {fundingCategory.code} — {fundingCategory.name}
          </span>
        </div>
      </td>
      <td className="px-4 py-4 text-right">
        <span className="text-sm font-bold" style={{ color: colors.text }}>{formatCost(presentTotal)}</span>
      </td>
      <td className="px-4 py-4 text-right">
        <span className="text-sm font-bold" style={{ color: colors.text }}>{formatCost(inflatedTotal)}</span>
      </td>
      {years.map((year) => (
        <td key={year} className="border-l border-slate-700"></td>
      ))}
    </tr>
  )
}
