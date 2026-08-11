'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { usePlan } from '@/context/PlanContext'
import { FundingCategory, ProjectCategory, Project, ProjectBucket } from '@/types'
import { StatsBar } from '@/components/layout/StatsBar'
import {
  formatCost,
  projectPresentTotal,
  projectInflatedTotal,
  bucketInflatedTotal,
} from '@/lib/calculations'
import { getCategoryColors } from '@/lib/categoryColors'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function SummaryPage() {
  const { settings, years } = usePlan()
  const [fundingCategories, setFundingCategories] = useState<FundingCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setIsLoading(true)

    // Fetch funding categories
    const { data: fundingCategoriesData } = await supabase
      .from('funding_categories')
      .select('*')
      .order('sort_order')

    // Fetch project categories (subcategories)
    const { data: categoriesData } = await supabase
      .from('project_categories')
      .select('*')
      .order('sort_order')

    // Fetch projects
    const { data: projectsData } = await supabase.from('projects').select('*').order('sort_order')

    // Fetch buckets
    const { data: bucketsData } = await supabase.from('project_buckets').select('*')

    // Assemble 3-level nested structure
    const fundingCategoriesWithData: FundingCategory[] = (fundingCategoriesData || []).map((fundingCat) => {
      const subcategories: ProjectCategory[] = (categoriesData || [])
        .filter((cat) => cat.funding_category_id === fundingCat.id)
        .map((cat) => {
          const categoryProjects = (projectsData || [])
            .filter((p) => p.category_id === cat.id)
            .map((proj): Project => ({
              ...proj,
              buckets: (bucketsData || [])
                .filter((b) => b.project_id === proj.id)
                .map((b): ProjectBucket => ({
                  id: b.id,
                  project_id: b.project_id,
                  bucket_type: b.bucket_type,
                  year_costs: b.year_costs || {},
                })),
            }))

          return {
            ...cat,
            projects: categoryProjects,
          }
        })

      return {
        ...fundingCat,
        subcategories,
      }
    })

    setFundingCategories(fundingCategoriesWithData)
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Loading summary...</div>
      </div>
    )
  }

  const enabledProjects = fundingCategories.flatMap((fc) =>
    fc.subcategories.flatMap((cat) => cat.projects.filter((p) => p.enabled))
  )

  // Calculate totals by year (grand total across all funding categories)
  const yearTotals = years.map((year) => {
    const total = enabledProjects.reduce((sum, project) => {
      const yearTotal = project.buckets.reduce(
        (bucketSum, bucket) => bucketSum + (bucket.year_costs[String(year)] || 0),
        0
      )
      return sum + yearTotal
    }, 0)
    return { year, total }
  })

  // Calculate totals by funding category
  const fundingCategoryTotals = fundingCategories.map((fc) => {
    const fcProjects = fc.subcategories.flatMap((cat) => cat.projects.filter((p) => p.enabled))
    const presentTotal = fcProjects.reduce(
      (sum, p) => sum + projectPresentTotal(p.buckets, years, settings.base_year, settings.inflation_rate),
      0
    )
    const inflatedTotal = fcProjects.reduce(
      (sum, p) => sum + projectInflatedTotal(p.buckets, years),
      0
    )
    return { code: fc.code, name: fc.name, presentTotal, inflatedTotal }
  })

  const grandPresentTotal = enabledProjects.reduce(
    (sum, p) => sum + projectPresentTotal(p.buckets, years, settings.base_year, settings.inflation_rate),
    0
  )
  const grandInflatedTotal = enabledProjects.reduce(
    (sum, p) => sum + projectInflatedTotal(p.buckets, years),
    0
  )

  // Calculate funding mix breakdown per category
  const fundingMixData = fundingCategories.map((fc) => {
    const fcProjects = fc.subcategories.flatMap((cat) => cat.projects.filter((p) => p.enabled))

    const issuedCashTotal = fcProjects.reduce((sum, p) => {
      const bucket = p.buckets.find(b => b.bucket_type === 'issued_debt_cash')
      return sum + (bucket ? bucketInflatedTotal(bucket.year_costs, years) : 0)
    }, 0)

    const newDebtTotal = fcProjects.reduce((sum, p) => {
      const bucket = p.buckets.find(b => b.bucket_type === 'new_debt')
      return sum + (bucket ? bucketInflatedTotal(bucket.year_costs, years) : 0)
    }, 0)

    const impactFeesTotal = fcProjects.reduce((sum, p) => {
      const bucket = p.buckets.find(b => b.bucket_type === 'impact_fees')
      return sum + (bucket ? bucketInflatedTotal(bucket.year_costs, years) : 0)
    }, 0)

    return {
      code: fc.code,
      name: fc.name,
      issuedCash: issuedCashTotal,
      newDebt: newDebtTotal,
      impactFees: impactFeesTotal,
      total: issuedCashTotal + newDebtTotal + impactFeesTotal,
    }
  })

  // Calculate totals across all categories for funding mix
  const totalIssuedCash = fundingMixData.reduce((sum, fc) => sum + fc.issuedCash, 0)
  const totalNewDebt = fundingMixData.reduce((sum, fc) => sum + fc.newDebt, 0)
  const totalImpactFees = fundingMixData.reduce((sum, fc) => sum + fc.impactFees, 0)

  // Year-over-year data for line chart
  const yearOverYearData = years.map((year) => {
    const dataPoint: any = { year }
    fundingCategories.forEach((fc) => {
      const fcProjects = fc.subcategories.flatMap((cat) => cat.projects.filter((p) => p.enabled))
      const total = fcProjects.reduce((sum, project) => {
        const yearTotal = project.buckets.reduce(
          (bucketSum, bucket) => bucketSum + (bucket.year_costs[String(year)] || 0),
          0
        )
        return sum + yearTotal
      }, 0)
      dataPoint[fc.code] = total / 1000000 // Convert to millions
    })
    return dataPoint
  })

  return (
    <div className="p-6 bg-slate-50 pb-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Summary</h1>
        <p className="text-slate-600 mt-1">Comprehensive overview of project costs and distribution</p>
      </div>

      {/* Year Matrix - Moved to Top */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Year Matrix</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-b from-slate-700 to-slate-800 border-b-2 border-slate-900">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-white uppercase tracking-wider text-xs">Category</th>
                {years.map((year) => (
                  <th key={year} className="px-4 py-3 text-right font-bold text-white uppercase tracking-wider text-xs border-l border-slate-600">
                    {year}
                  </th>
                ))}
                <th className="px-4 py-3 text-right font-bold text-cyan-300 uppercase tracking-wider text-xs border-l border-slate-600">Total</th>
              </tr>
            </thead>
            <tbody>
              {fundingCategories.map((fc, fcIdx) => {
                const colors = getCategoryColors(fc.code)
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

                return (
                  <React.Fragment key={fc.id}>
                    <tr
                      style={{
                        background: colors.header,
                        color: colors.text
                      }}
                      className="border-b-2"
                    >
                      <td className="px-4 py-3 font-bold">{fc.code} — {fc.name}</td>
                      {fcYearTotals.map((total, idx) => (
                        <td key={idx} className="px-4 py-3 text-right font-medium border-l" style={{ borderColor: 'rgba(255,255,255,0.3)' }}>
                          {total > 0 ? formatCost(total) : '—'}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right font-bold border-l" style={{ borderColor: 'rgba(255,255,255,0.3)' }}>
                        {formatCost(fcTotal)}
                      </td>
                    </tr>
                  </React.Fragment>
                )
              })}
              <tr className="bg-gradient-to-r from-slate-800 to-slate-700 border-t-4 border-slate-900 text-white font-bold shadow-lg">
                <td className="px-4 py-4 text-lg uppercase tracking-wide">TOTAL</td>
                {yearTotals.map((yt) => (
                  <td key={yt.year} className="px-4 py-4 text-right text-base border-l border-slate-600">
                    {yt.total > 0 ? formatCost(yt.total) : '—'}
                  </td>
                ))}
                <td className="px-4 py-4 text-right text-lg text-cyan-300 border-l border-slate-600">{formatCost(grandInflatedTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Bar */}
      <StatsBar fundingCategories={fundingCategories} />

      {/* Per-Funding-Category Totals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {fundingCategoryTotals.map((fct) => {
          const colors = getCategoryColors(fct.code)
          return (
            <div
              key={fct.code}
              className="rounded-xl shadow-lg p-6 border-2"
              style={{
                backgroundColor: colors.rowTint,
                borderColor: colors.accent
              }}
            >
              <div className="font-bold text-slate-900 mb-3 text-lg">{fct.code} — {fct.name}</div>
              <div className="flex items-center justify-between text-sm bg-white px-3 py-2 rounded-lg mb-2">
                <span className="text-slate-600 font-medium">Present:</span>
                <span className="font-bold text-slate-900">{formatCost(fct.presentTotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm bg-white px-3 py-2 rounded-lg">
                <span className="text-slate-600 font-medium">Inflated:</span>
                <span className="font-bold" style={{ color: colors.accent }}>
                  {formatCost(fct.inflatedTotal)}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Total Cost by Year Bar Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Total Cost by Year</h2>
        <div className="space-y-3">
          {yearTotals.map((yt) => {
            const maxYearTotal = Math.max(...yearTotals.map((y) => y.total))
            return (
              <div key={yt.year} className="flex items-center gap-3">
                <div className="w-16 text-sm font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md text-center">{yt.year}</div>
                <div className="flex-1 bg-slate-100 rounded-full h-7 overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 h-full transition-all shadow-sm"
                    style={{ width: `${(yt.total / maxYearTotal) * 100}%` }}
                  ></div>
                </div>
                <div className="w-28 text-sm font-bold text-right text-slate-900">{formatCost(yt.total)}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Category Comparison Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Category Comparison</h2>

        {/* Proportional Bar */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-slate-900 mb-3">Funding Distribution</h3>
          <div className="flex h-12 rounded-lg overflow-hidden shadow-md">
            {fundingCategoryTotals.map((fct) => {
              const colors = getCategoryColors(fct.code)
              const percentage = (fct.inflatedTotal / grandInflatedTotal) * 100
              return (
                <div
                  key={fct.code}
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: colors.header
                  }}
                  className="flex items-center justify-center text-white font-bold text-sm"
                  title={`${fct.code}: ${percentage.toFixed(1)}% (${formatCost(fct.inflatedTotal)})`}
                >
                  {percentage > 10 && `${percentage.toFixed(0)}%`}
                </div>
              )
            })}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            {fundingCategoryTotals.map((fct) => {
              const colors = getCategoryColors(fct.code)
              const percentage = (fct.inflatedTotal / grandInflatedTotal) * 100
              return (
                <div key={fct.code} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: colors.header }}
                  ></div>
                  <span className="font-semibold">{fct.code}:</span>
                  <span>{percentage.toFixed(1)}% ({formatCost(fct.inflatedTotal)})</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Year-over-Year Line Chart */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-slate-900 mb-3">Year-over-Year Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={yearOverYearData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis label={{ value: 'Cost ($M)', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                formatter={(value) => [`$${typeof value === 'number' ? value.toFixed(2) : '0.00'}M`, '']}
                labelFormatter={(label) => `Year ${label}`}
              />
              <Legend />
              {fundingCategories.map((fc) => {
                const colors = getCategoryColors(fc.code)
                return (
                  <Line
                    key={fc.code}
                    type="monotone"
                    dataKey={fc.code}
                    name={`${fc.code} — ${fc.name}`}
                    stroke={colors.accent}
                    strokeWidth={2}
                    dot={{ fill: colors.accent }}
                  />
                )
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Funding Mix Breakdown Table */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-3">Funding Mix by Category</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-slate-200">
              <thead className="bg-slate-100 border-b-2 border-slate-300">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-slate-900">Category</th>
                  <th className="px-4 py-3 text-right font-bold text-slate-900">Issued/Cash</th>
                  <th className="px-4 py-3 text-right font-bold text-slate-900">New Debt</th>
                  <th className="px-4 py-3 text-right font-bold text-slate-900">Impact Fees</th>
                  <th className="px-4 py-3 text-right font-bold text-slate-900">Total</th>
                </tr>
              </thead>
              <tbody>
                {fundingMixData.map((fc, idx) => {
                  const colors = getCategoryColors(fc.code)
                  return (
                    <tr
                      key={fc.code}
                      className="border-b border-slate-200"
                      style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : colors.rowTint }}
                    >
                      <td className="px-4 py-3 font-bold text-slate-900">{fc.code} — {fc.name}</td>
                      <td className="px-4 py-3 text-right text-slate-700">{formatCost(fc.issuedCash)}</td>
                      <td className="px-4 py-3 text-right text-slate-700">{formatCost(fc.newDebt)}</td>
                      <td className="px-4 py-3 text-right text-slate-700">{formatCost(fc.impactFees)}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">{formatCost(fc.total)}</td>
                    </tr>
                  )
                })}
                <tr className="bg-slate-800 text-white font-bold border-t-2 border-slate-900">
                  <td className="px-4 py-4 uppercase tracking-wide">TOTAL</td>
                  <td className="px-4 py-4 text-right">{formatCost(totalIssuedCash)}</td>
                  <td className="px-4 py-4 text-right">{formatCost(totalNewDebt)}</td>
                  <td className="px-4 py-4 text-right">{formatCost(totalImpactFees)}</td>
                  <td className="px-4 py-4 text-right text-lg text-cyan-300">{formatCost(totalIssuedCash + totalNewDebt + totalImpactFees)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
