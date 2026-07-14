'use client'
import { ProjectBucket } from '@/types'
import { BucketBadge } from '@/components/ui/BucketBadge'
import { EditableCell } from '@/components/ui/EditableCell'
import { usePlan } from '@/context/PlanContext'
import { formatCost, bucketRangeTotal, bucketInflatedTotal } from '@/lib/calculations'

interface BucketRowProps {
  bucket: ProjectBucket
  onUpdateCost: (year: string, value: number) => void
  disabled?: boolean
}

export function BucketRow({ bucket, onUpdateCost, disabled = false }: BucketRowProps) {
  const { settings, years } = usePlan()

  const presentTotal = bucketRangeTotal(bucket.year_costs, years)
  const inflatedTotal = bucketInflatedTotal(
    bucket.year_costs,
    years,
    settings.base_year,
    settings.inflation_rate
  )

  const borderColor = {
    issued_debt_cash: 'border-l-emerald-500',
    new_debt: 'border-l-blue-500',
    impact_fees: 'border-l-violet-500',
  }[bucket.bucket_type]

  return (
    <tr className={`border-b border-slate-100 bg-slate-50/70 border-l-4 ${borderColor} ${disabled ? 'opacity-50' : ''}`}>
      <td className="px-4 py-2.5 pl-16">
        <BucketBadge type={bucket.bucket_type} />
      </td>
      <td className="px-4 py-2.5"></td>
      <td className="px-4 py-2.5 text-right font-semibold text-slate-700">{formatCost(presentTotal)}</td>
      <td className="px-4 py-2.5 text-right font-semibold text-cyan-600">
        {formatCost(inflatedTotal)}
      </td>
      {years.map((year) => (
        <td key={year} className="px-2 py-1.5 border-l border-slate-100">
          <EditableCell
            value={bucket.year_costs[String(year)] || 0}
            onChange={(value) => onUpdateCost(String(year), value)}
            disabled={disabled}
          />
        </td>
      ))}
    </tr>
  )
}
