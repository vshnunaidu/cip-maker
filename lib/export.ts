import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { FundingCategory, ProjectCategory, BUCKET_LABELS, BucketType } from '@/types'
import {
  formatCost,
  projectPresentTotal,
  projectInflatedTotal,
  bucketPresentTotal,
  bucketInflatedTotal,
} from './calculations'

interface ExportOptions {
  fundingCategories: FundingCategory[]
  years: number[]
  baseYear: number
  inflationRate: number
  cityName: string
  planTitle: string
}

export function exportToExcel({
  fundingCategories,
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

  // Process each funding category
  const enabledProjects = fundingCategories.flatMap((fc) =>
    fc.subcategories.flatMap((cat) => cat.projects.filter((p) => p.enabled))
  )

  fundingCategories.forEach((fundingCat) => {
    const fcProjects = fundingCat.subcategories.flatMap((cat) => cat.projects.filter((p) => p.enabled))
    if (fcProjects.length === 0) return

    // Funding category header row
    worksheetData.push([`${fundingCat.code} — ${fundingCat.name}`])

    // Process each subcategory
    fundingCat.subcategories.forEach((category) => {
      const categoryProjects = category.projects.filter((p) => p.enabled)
      if (categoryProjects.length === 0) return

      // Subcategory header row
      worksheetData.push([`  ${category.name}`])

      // Process each project
      categoryProjects.forEach((project) => {
      const presentTotal = projectPresentTotal(project.buckets, years, baseYear, inflationRate)
      const inflatedTotal = projectInflatedTotal(project.buckets, years)

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
        const bucketPresent = bucketPresentTotal(bucket.year_costs, years, baseYear, inflationRate)
        const bucketInflated = bucketInflatedTotal(bucket.year_costs, years)

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

      // Subcategory subtotal
      const categoryPresent = categoryProjects.reduce(
        (sum, p) => sum + projectPresentTotal(p.buckets, years, baseYear, inflationRate),
        0
      )
      const categoryInflated = categoryProjects.reduce(
        (sum, p) => sum + projectInflatedTotal(p.buckets, years),
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
    })

    // Funding category subtotal
    const fcPresent = fcProjects.reduce(
      (sum, p) => sum + projectPresentTotal(p.buckets, years, baseYear, inflationRate),
      0
    )
    const fcInflated = fcProjects.reduce(
      (sum, p) => sum + projectInflatedTotal(p.buckets, years),
      0
    )

    worksheetData.push([
      '',
      `${fundingCat.code} — ${fundingCat.name} TOTAL`,
      '',
      fcPresent,
      fcInflated,
      ...years.map(() => ''),
      fcPresent,
    ])

    worksheetData.push([]) // Empty row after funding category
  })

  // Grand total
  const grandPresent = enabledProjects.reduce(
    (sum, p) => sum + projectPresentTotal(p.buckets, years, baseYear, inflationRate),
    0
  )
  const grandInflated = enabledProjects.reduce(
    (sum, p) => sum + projectInflatedTotal(p.buckets, years),
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

export function exportToPDF({
  fundingCategories,
  years,
  baseYear,
  inflationRate,
  cityName,
  planTitle,
}: ExportOptions) {
  const doc = new jsPDF('landscape', 'pt', 'letter')

  // Add header
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(`${cityName} | ${planTitle}`, 40, 40)

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('PROJECT COSTS AND IMPLEMENTATION TIMELINE', 40, 60)

  // Prepare table data
  const headers = [
    'ID',
    'Project Name',
    'Description',
    'Present Cost',
    'Issued/Cash',
    'New Debt',
    'Impact Fees',
    ...years.map((y) => y.toString()),
    'Total',
  ]

  const tableData: any[][] = []

  // Process each funding category
  fundingCategories.forEach((fundingCat) => {
    const fcProjects = fundingCat.subcategories.flatMap((cat) => cat.projects.filter((p) => p.enabled))
    if (fcProjects.length === 0) return

    // Funding category header row
    tableData.push([
      { content: `${fundingCat.code} — ${fundingCat.name}`, colSpan: headers.length, styles: { fillColor: [15, 30, 46], textColor: [255, 255, 255], fontStyle: 'bold' } }
    ])

    // Process each subcategory
    fundingCat.subcategories.forEach((subcat) => {
      const subcatProjects = subcat.projects.filter((p) => p.enabled)
      if (subcatProjects.length === 0) return

      // Subcategory header row
      tableData.push([
        { content: subcat.name, colSpan: headers.length, styles: { fillColor: [148, 163, 184], fontStyle: 'bold' } }
      ])

      // Process each project
      subcatProjects.forEach((project) => {
        const presentTotal = projectPresentTotal(project.buckets, years, baseYear, inflationRate)
        const inflatedTotal = projectInflatedTotal(project.buckets, years)

        // Project summary row
        const projectYearTotals = years.map((year) => {
          return project.buckets.reduce((sum, bucket) => sum + (bucket.year_costs[String(year)] || 0), 0)
        })

        tableData.push([
          project.project_id_label || '',
          project.name,
          project.description || '',
          formatCost(presentTotal),
          '',
          '',
          '',
          ...projectYearTotals.map((t) => t > 0 ? formatCost(t) : '—'),
          formatCost(presentTotal),
        ])

        // Bucket rows (only show non-zero buckets)
        project.buckets.forEach((bucket) => {
          const bucketPresent = bucketPresentTotal(bucket.year_costs, years, baseYear, inflationRate)
          if (bucketPresent === 0) return // Skip empty buckets

          tableData.push([
            '',
            `  ${BUCKET_LABELS[bucket.bucket_type as BucketType]}`,
            '',
            '',
            bucket.bucket_type === 'issued_debt_cash' ? formatCost(bucketPresent) : '',
            bucket.bucket_type === 'new_debt' ? formatCost(bucketPresent) : '',
            bucket.bucket_type === 'impact_fees' ? formatCost(bucketPresent) : '',
            ...years.map((year) => {
              const val = bucket.year_costs[String(year)] || 0
              return val > 0 ? formatCost(val) : '—'
            }),
            formatCost(bucketPresent),
          ])
        })
      })
    })

    // Funding category subtotal
    const fcPresent = fcProjects.reduce((sum, p) => sum + projectPresentTotal(p.buckets, years, baseYear, inflationRate), 0)
    tableData.push([
      { content: `${fundingCat.code} Subtotal`, colSpan: 3, styles: { fontStyle: 'bold', fillColor: [226, 232, 240] } },
      formatCost(fcPresent),
      '',
      '',
      '',
      ...years.map(() => ''),
      formatCost(fcPresent),
    ])
  })

  // Grand total
  const enabledProjects = fundingCategories.flatMap((fc) =>
    fc.subcategories.flatMap((cat) => cat.projects.filter((p) => p.enabled))
  )
  const grandPresent = enabledProjects.reduce((sum, p) => sum + projectPresentTotal(p.buckets, years, baseYear, inflationRate), 0)

  tableData.push([
    { content: 'GRAND TOTAL', colSpan: 3, styles: { fontStyle: 'bold', fillColor: [51, 65, 85], textColor: [255, 255, 255] } },
    formatCost(grandPresent),
    '',
    '',
    '',
    ...years.map(() => ''),
    formatCost(grandPresent),
  ])

  // Generate table
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 80,
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [51, 65, 85],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 35 }, // ID
      1: { cellWidth: 100 }, // Project Name
      2: { cellWidth: 120 }, // Description
    },
    didDrawPage: (data) => {
      // Add footer with date
      doc.setFontSize(8)
      doc.setTextColor(128)
      doc.text(
        `Generated on ${new Date().toLocaleDateString()}`,
        40,
        doc.internal.pageSize.height - 20
      )
    },
  })

  // Save the PDF
  const fileName = `${cityName.replace(/\s+/g, '_')}_CIP_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}
