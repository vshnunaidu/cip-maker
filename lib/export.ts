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
      const presentTotal = projectPresentTotal(project.buckets, years)
      const inflatedTotal = projectInflatedTotal(project.buckets, years, inflationRate)

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
        const bucketPresent = bucketPresentTotal(bucket.year_costs, years)
        const bucketInflated = bucketInflatedTotal(bucket.year_costs, years, inflationRate)

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
        (sum, p) => sum + projectPresentTotal(p.buckets, years),
        0
      )
      const categoryInflated = categoryProjects.reduce(
        (sum, p) => sum + projectInflatedTotal(p.buckets, years, inflationRate),
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
      (sum, p) => sum + projectPresentTotal(p.buckets, years),
      0
    )
    const fcInflated = fcProjects.reduce(
      (sum, p) => sum + projectInflatedTotal(p.buckets, years, inflationRate),
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
    (sum, p) => sum + projectPresentTotal(p.buckets, years),
    0
  )
  const grandInflated = enabledProjects.reduce(
    (sum, p) => sum + projectInflatedTotal(p.buckets, years, inflationRate),
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
        const presentTotal = projectPresentTotal(project.buckets, years)
        const inflatedTotal = projectInflatedTotal(project.buckets, years, inflationRate)

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
          const bucketPresent = bucketPresentTotal(bucket.year_costs, years)
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
    const fcPresent = fcProjects.reduce((sum, p) => sum + projectPresentTotal(p.buckets, years), 0)
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
  const grandPresent = enabledProjects.reduce((sum, p) => sum + projectPresentTotal(p.buckets, years), 0)

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

export function generateSummaryPDF({
  fundingCategories,
  years,
  inflationRate,
  cityName,
  planTitle,
}: ExportOptions) {
  const doc = new jsPDF('landscape', 'pt', 'letter')

  const enabledProjects = fundingCategories.flatMap((fc) =>
    fc.subcategories.flatMap((cat) => cat.projects.filter((p) => p.enabled))
  )

  const grandPresentTotal = enabledProjects.reduce(
    (sum, p) => sum + projectPresentTotal(p.buckets, years),
    0
  )
  const grandInflatedTotal = enabledProjects.reduce(
    (sum, p) => sum + projectInflatedTotal(p.buckets, years, inflationRate),
    0
  )

  // Helper function to add header
  const addHeader = (pageTitle: string) => {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(`${cityName} | ${planTitle} | ${pageTitle}`, 40, 30)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, doc.internal.pageSize.width - 140, 30)
  }

  // Page 1: Stat Cards & Per-Category Totals
  addHeader('SUMMARY REPORT')

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Summary Overview', 40, 60)

  // Stat cards
  const statCardsY = 80
  const stats = [
    { label: 'Enabled Projects', value: enabledProjects.length.toString() },
    { label: 'Present Total', value: formatCost(grandPresentTotal) },
    { label: 'Inflated Total', value: formatCost(grandInflatedTotal) },
  ]

  stats.forEach((stat, idx) => {
    const x = 40 + idx * 240
    doc.setFillColor(241, 245, 249)
    doc.rect(x, statCardsY, 220, 60, 'F')
    doc.setFontSize(9)
    doc.setTextColor(71, 85, 105)
    doc.text(stat.label, x + 10, statCardsY + 20)
    doc.setFontSize(18)
    doc.setTextColor(15, 23, 42)
    doc.setFont('helvetica', 'bold')
    doc.text(stat.value, x + 10, statCardsY + 45)
  })

  // Per-funding-category totals table
  const categoryTotalsData = fundingCategories.map((fc) => {
    const fcProjects = fc.subcategories.flatMap((cat) => cat.projects.filter((p) => p.enabled))
    const presentTotal = fcProjects.reduce((sum, p) => sum + projectPresentTotal(p.buckets, years), 0)
    const inflatedTotal = fcProjects.reduce((sum, p) => sum + projectInflatedTotal(p.buckets, years, inflationRate), 0)
    return [fc.code + ' — ' + fc.name, formatCost(presentTotal), formatCost(inflatedTotal)]
  })

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('Total by Funding Category', 40, 170)

  autoTable(doc, {
    head: [['Category', 'Present Cost', 'Inflated Cost']],
    body: categoryTotalsData,
    startY: 180,
    theme: 'grid',
    headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 10 },
  })

  // Page 2: Year Matrix
  doc.addPage()
  addHeader('SUMMARY REPORT - Year Matrix')

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Year Matrix', 40, 60)

  const yearMatrixHeaders = ['Category', ...years.map(String), 'Total']
  const yearMatrixData: any[][] = []

  fundingCategories.forEach((fc) => {
    const fcProjects = fc.subcategories.flatMap((cat) => cat.projects.filter((p) => p.enabled))
    const fcYearTotals = years.map((year) => {
      return fcProjects.reduce((sum, project) => {
        const yearTotal = project.buckets.reduce(
          (bucketSum, bucket) => bucketSum + (bucket.year_costs[String(year)] || 0),
          0
        )
        return sum + yearTotal
      }, 0)
    })
    const fcTotal = fcYearTotals.reduce((sum, val) => sum + val, 0)

    yearMatrixData.push([
      { content: fc.code + ' — ' + fc.name, styles: { fontStyle: 'bold' } },
      ...fcYearTotals.map(t => t > 0 ? formatCost(t) : '—'),
      { content: formatCost(fcTotal), styles: { fontStyle: 'bold' } }
    ])
  })

  // Grand total row
  const grandTotalByYear = years.map((year) => {
    return enabledProjects.reduce((sum, project) => {
      const yearTotal = project.buckets.reduce(
        (bucketSum, bucket) => bucketSum + (bucket.year_costs[String(year)] || 0),
        0
      )
      return sum + yearTotal
    }, 0)
  })

  yearMatrixData.push([
    { content: 'TOTAL', styles: { fontStyle: 'bold', fillColor: [51, 65, 85], textColor: [255, 255, 255] } },
    ...grandTotalByYear.map(t => ({ content: t > 0 ? formatCost(t) : '—', styles: { fontStyle: 'bold', fillColor: [51, 65, 85], textColor: [255, 255, 255] } })),
    { content: formatCost(grandInflatedTotal), styles: { fontStyle: 'bold', fillColor: [51, 65, 85], textColor: [255, 255, 255] } }
  ])

  autoTable(doc, {
    head: [yearMatrixHeaders],
    body: yearMatrixData,
    startY: 80,
    theme: 'grid',
    headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 7, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 150 }
    }
  })

  // Page 3: Category Comparison
  doc.addPage()
  addHeader('SUMMARY REPORT - Funding Mix')

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Funding Mix by Category', 40, 60)

  // Calculate funding mix
  const fundingMixData = fundingCategories.map((fc) => {
    const fcProjects = fc.subcategories.flatMap((cat) => cat.projects.filter((p) => p.enabled))

    const issuedCashTotal = fcProjects.reduce((sum, p) => {
      const bucket = p.buckets.find(b => b.bucket_type === 'issued_debt_cash')
      return sum + (bucket ? bucketInflatedTotal(bucket.year_costs, years, inflationRate) : 0)
    }, 0)

    const newDebtTotal = fcProjects.reduce((sum, p) => {
      const bucket = p.buckets.find(b => b.bucket_type === 'new_debt')
      return sum + (bucket ? bucketInflatedTotal(bucket.year_costs, years, inflationRate) : 0)
    }, 0)

    const impactFeesTotal = fcProjects.reduce((sum, p) => {
      const bucket = p.buckets.find(b => b.bucket_type === 'impact_fees')
      return sum + (bucket ? bucketInflatedTotal(bucket.year_costs, years, inflationRate) : 0)
    }, 0)

    return [
      fc.code + ' — ' + fc.name,
      formatCost(issuedCashTotal),
      formatCost(newDebtTotal),
      formatCost(impactFeesTotal),
      formatCost(issuedCashTotal + newDebtTotal + impactFeesTotal)
    ]
  })

  const totalIssuedCash = fundingMixData.reduce((sum, row) => {
    const val = enabledProjects.reduce((s, p) => {
      const bucket = p.buckets.find(b => b.bucket_type === 'issued_debt_cash')
      return s + (bucket ? bucketInflatedTotal(bucket.year_costs, years, inflationRate) : 0)
    }, 0)
    return val
  }, 0)

  const totalNewDebt = enabledProjects.reduce((sum, p) => {
    const bucket = p.buckets.find(b => b.bucket_type === 'new_debt')
    return sum + (bucket ? bucketInflatedTotal(bucket.year_costs, years, inflationRate) : 0)
  }, 0)

  const totalImpactFees = enabledProjects.reduce((sum, p) => {
    const bucket = p.buckets.find(b => b.bucket_type === 'impact_fees')
    return sum + (bucket ? bucketInflatedTotal(bucket.year_costs, years, inflationRate) : 0)
  }, 0)

  fundingMixData.push([
    { content: 'TOTAL', styles: { fontStyle: 'bold', fillColor: [51, 65, 85], textColor: [255, 255, 255] } },
    { content: formatCost(totalIssuedCash + totalNewDebt + totalImpactFees), styles: { fontStyle: 'bold', fillColor: [51, 65, 85], textColor: [255, 255, 255] }, colSpan: 4 }
  ])

  autoTable(doc, {
    head: [['Category', 'Issued/Cash', 'New Debt', 'Impact Fees', 'Total']],
    body: fundingMixData,
    startY: 80,
    theme: 'grid',
    headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 10 },
  })

  // Save
  const fileName = `${cityName.replace(/\s+/g, '_')}_Summary_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}
