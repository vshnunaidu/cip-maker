// Deflate a future-dollar year value back to present value
export function deflateCost(
  futureValue: number,
  year: number,
  baseYear: number,
  inflationRate: number
): number {
  if (year === baseYear) return futureValue
  return futureValue / Math.pow(1 + inflationRate / 100, year - baseYear)
}

// Get year range array from start to end inclusive
export function getYearRange(startYear: number, endYear: number): number[] {
  const years: number[] = []
  for (let y = startYear; y <= endYear; y++) years.push(y)
  return years
}

// Inflated cost = simple sum of all year values (user already entered future dollars)
export function bucketInflatedTotal(
  yearCosts: Record<string, number>,
  years: number[]
): number {
  return years.reduce((sum, y) => sum + (yearCosts[String(y)] ?? 0), 0)
}

// Present cost = deflate each year value back to base year, then sum
export function bucketPresentTotal(
  yearCosts: Record<string, number>,
  years: number[],
  baseYear: number,
  inflationRate: number
): number {
  return years.reduce((sum, y) => {
    const v = yearCosts[String(y)] ?? 0
    return sum + (v > 0 ? deflateCost(v, y, baseYear, inflationRate) : 0)
  }, 0)
}

// Project-level inflated total (sum all buckets, all years)
export function projectInflatedTotal(
  buckets: { year_costs: Record<string, number> }[],
  years: number[]
): number {
  return buckets.reduce((sum, b) => sum + bucketInflatedTotal(b.year_costs, years), 0)
}

// Project-level present total (deflate each year value, sum all buckets)
export function projectPresentTotal(
  buckets: { year_costs: Record<string, number> }[],
  years: number[],
  baseYear: number,
  inflationRate: number
): number {
  return buckets.reduce(
    (sum, b) => sum + bucketPresentTotal(b.year_costs, years, baseYear, inflationRate),
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

// DEPRECATED - kept for backwards compatibility, will be removed
// This was the old inflate function when we incorrectly assumed users entered present values
export function bucketRangeTotal(
  yearCosts: Record<string, number>,
  years: number[]
): number {
  return bucketInflatedTotal(yearCosts, years)
}
