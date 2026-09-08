import { BucketType, BUCKET_LABELS } from '@/types'

interface BucketBadgeProps {
  type: BucketType
}

const BUCKET_COLORS: Record<BucketType, string> = {
  issued_debt_cash: 'bg-amber-100 text-amber-900 border-amber-500',
  new_debt: 'bg-rose-100 text-rose-900 border-rose-500',
  impact_fees: 'bg-teal-100 text-teal-900 border-teal-500',
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
