import * as XLSX from 'xlsx'
import { ProjectCategory, BUCKET_LABELS, BucketType } from '@/types'
import {
  formatCost,
  projectPresentTotal,
  projectInflatedTotal,
  bucketRangeTotal,
  bucketInflatedTotal,
} from './calculations'

interface ExportOptions {
  categories: ProjectCategory[]
  years: number[]
  baseYear: number
  inflationRate: number
  cityName: string
  planTitle: string
}

export function exportToExcel({
  categories,
  years,
  baseYear,
  inflationRate,
  cityName,
  planTitle,
}: ExportOptions) {
  const workbook = XLSX.utils.book_new()
  const worksheetData: any[][] = []

  // Title row
  worksheetData.push([`${cityName} - ${planTitle}`])
  worksheetData.push([]) // Empty row

  // Header row
  worksheetData.push([
    'Project ID',
    'Project Name',
    'Description',
    'Present Cost',
    'Inflated Cost',
    ...years.map((y) => y.toString()),
    'Total',
  ])

  // Process each category
  const enabledProjects = categories.flatMap((cat) => cat.projects.filter((p) => p.enabled))

  categories.forEach((category) => {
    const categoryProjects = category.projects.filter((p) => p.enabled)
    if (categoryProjects.length === 0) return

    // Category header row
    worksheetData.push([category.name])

    // Process each project
    categoryProjects.forEach((project) => {
      const presentTotal = projectPresentTotal(project.buckets, years)
      const inflatedTotal = projectInflatedTotal(
        project.buckets,
        years,
        baseYear,
        inflationRate
      )

      // Project summary row
      worksheetData.push([
        project.project_id_label || '',
        project.name,
        project.description || '',
        presentTotal,
        inflatedTotal,
        ...years.map(() => ''),
        presentTotal,
      ])

      // Bucket rows
      project.buckets.forEach((bucket) => {
        const bucketPresent = bucketRangeTotal(bucket.year_costs, years)
        const bucketInflated = bucketInflatedTotal(
          bucket.year_costs,
          years,
          baseYear,
          inflationRate
        )

        worksheetData.push([
          '',
          `  ${BUCKET_LABELS[bucket.bucket_type as BucketType]}`,
          '',
          bucketPresent,
          bucketInflated,
          ...years.map((year) => bucket.year_costs[String(year)] || 0),
          bucketPresent,
        ])
      })
    })

    // Category subtotal
    const categoryPresent = categoryProjects.reduce(
      (sum, p) => sum + projectPresentTotal(p.buckets, years),
      0
    )
    const categoryInflated = categoryProjects.reduce(
      (sum, p) => sum + projectInflatedTotal(p.buckets, years, baseYear, inflationRate),
      0
    )

    worksheetData.push([
      '',
      `${category.name} Subtotal`,
      '',
      categoryPresent,
      categoryInflated,
      ...years.map(() => ''),
      categoryPresent,
    ])

    worksheetData.push([]) // Empty row after category
  })

  // Grand total
  const grandPresent = enabledProjects.reduce(
    (sum, p) => sum + projectPresentTotal(p.buckets, years),
    0
  )
  const grandInflated = enabledProjects.reduce(
    (sum, p) => sum + projectInflatedTotal(p.buckets, years, baseYear, inflationRate),
    0
  )

  worksheetData.push([
    '',
    'GRAND TOTAL',
    '',
    grandPresent,
    grandInflated,
    ...years.map(() => ''),
    grandPresent,
  ])

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

  // Set column widths
  const columnWidths = [
    { wch: 12 }, // Project ID
    { wch: 40 }, // Project Name
    { wch: 50 }, // Description
    { wch: 15 }, // Present Cost
    { wch: 15 }, // Inflated Cost
    ...years.map(() => ({ wch: 12 })), // Year columns
    { wch: 15 }, // Total
  ]
  worksheet['!cols'] = columnWidths

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'CIP Summary')

  // Generate file
  const fileName = `${cityName.replace(/\s+/g, '_')}_CIP_${new Date().toISOString().split('T')[0]}.xlsx`
  XLSX.writeFile(workbook, fileName)
}
