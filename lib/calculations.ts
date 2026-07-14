// Inflate a present-value cost to a future year
export function inflateCost(
  presentValue: number,
  year: number,
  baseYear: number,
  inflationRate: number
): number {
  return presentValue * Math.pow(1 + inflationRate / 100, year - baseYear)
}

// Get year range array from start to end inclusive
export function getYearRange(startYear: number, endYear: number): number[] {
  const years: number[] = []
  for (let y = startYear; y <= endYear; y++) years.push(y)
  return years
}

// Sum a bucket's year costs across a given year range
export function bucketRangeTotal(
  yearCosts: Record<string, number>,
  years: number[]
): number {
  return years.reduce((sum, y) => sum + (yearCosts[String(y)] ?? 0), 0)
}

// Inflated total for a bucket across a year range
export function bucketInflatedTotal(
  yearCosts: Record<string, number>,
  years: number[],
  baseYear: number,
  inflationRate: number
): number {
  return years.reduce((sum, y) => {
    const v = yearCosts[String(y)] ?? 0
    return sum + (v > 0 ? inflateCost(v, y, baseYear, inflationRate) : 0)
  }, 0)
}

// Present cost for a whole project (all 3 buckets summed)
export function projectPresentTotal(
  buckets: { year_costs: Record<string, number> }[],
  years: number[]
): number {
  return buckets.reduce((sum, b) => sum + bucketRangeTotal(b.year_costs, years), 0)
}

// Inflated cost for a whole project (all 3 buckets summed)
export function projectInflatedTotal(
  buckets: { year_costs: Record<string, number> }[],
  years: number[],
  baseYear: number,
  inflationRate: number
): number {
  return buckets.reduce(
    (sum, b) => sum + bucketInflatedTotal(b.year_costs, years, baseYear, inflationRate),
    0
  )
}

// Format a dollar value for display
export function formatCost(value: number): string {
  if (value === 0) return '—'
  if (Math.abs(value) >= 1_000_000)
    return '$' + (value / 1_000_000).toFixed(2) + 'M'
  if (Math.abs(value) >= 1_000)
    return '$' + Math.round(value / 1_000).toLocaleString() + 'K'
  return '$' + Math.round(value).toLocaleString()
}
