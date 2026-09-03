// Inflate a present-value cost to a future year
// Base year is always 2025
export function inflateCost(
  presentValue: number,
  year: number,
  inflationRate: number
): number {
  const yearsAhead = year - 2025
  if (yearsAhead <= 0) return presentValue
  return presentValue * Math.pow(1 + inflationRate / 100, yearsAhead)
}

// Get year range array from start to end inclusive
export function getYearRange(startYear: number, endYear: number): number[] {
  const years: number[] = []
  for (let y = startYear; y <= endYear; y++) years.push(y)
  return years
}

// Present cost = raw sum of entered values, no math
export function bucketPresentTotal(
  yearCosts: Record<string, number>,
  years: number[]
): number {
  return years.reduce((sum, y) => sum + (yearCosts[String(y)] ?? 0), 0)
}

// Inflated cost = inflate each year value forward from 2025, then sum
export function bucketInflatedTotal(
  yearCosts: Record<string, number>,
  years: number[],
  inflationRate: number
): number {
  return years.reduce((sum, y) => {
    const v = yearCosts[String(y)] ?? 0
    return sum + (v > 0 ? inflateCost(v, y, inflationRate) : 0)
  }, 0)
}

// Project present total (sum all buckets, raw values)
export function projectPresentTotal(
  buckets: { year_costs: Record<string, number> }[],
  years: number[]
): number {
  return buckets.reduce((sum, b) => sum + bucketPresentTotal(b.year_costs, years), 0)
}

// Project inflated total (inflate each year value, sum all buckets)
export function projectInflatedTotal(
  buckets: { year_costs: Record<string, number> }[],
  years: number[],
  inflationRate: number
): number {
  return buckets.reduce(
    (sum, b) => sum + bucketInflatedTotal(b.year_costs, years, inflationRate),
    0
  )
}

// Format a dollar value for display (with M/K abbreviations for inflated costs)
export function formatCost(value: number): string {
  if (value === 0) return '—'
  if (Math.abs(value) >= 1_000_000)
    return '$' + (value / 1_000_000).toFixed(2) + 'M'
  if (Math.abs(value) >= 1_000)
    return '$' + Math.round(value / 1_000).toLocaleString() + 'K'
  return '$' + Math.round(value).toLocaleString()
}

// Format present cost - NO rounding, NO abbreviations, just raw value with toLocaleString()
export function formatPresentCost(value: number): string {
  if (value === 0) return '—'
  return '$' + Math.round(value).toLocaleString()
}
