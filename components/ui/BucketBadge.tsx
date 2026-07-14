import { BucketType, BUCKET_LABELS } from '@/types'

interface BucketBadgeProps {
  type: BucketType
}

const BUCKET_COLORS: Record<BucketType, string> = {
  issued_debt_cash: 'bg-emerald-100 text-emerald-900 border-emerald-400',
  new_debt: 'bg-blue-100 text-blue-900 border-blue-400',
  impact_fees: 'bg-violet-100 text-violet-900 border-violet-400',
}

export function BucketBadge({ type }: BucketBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold border-2 ${BUCKET_COLORS[type]}`}
    >
      {BUCKET_LABELS[type]}
    </span>
  )
}
