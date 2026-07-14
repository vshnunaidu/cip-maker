'use client'
import { ProjectCategory } from '@/types'
import { usePlan } from '@/context/PlanContext'
import { formatCost, projectPresentTotal, projectInflatedTotal } from '@/lib/calculations'

interface StatsBarProps {
  categories: ProjectCategory[]
}

export function StatsBar({ categories }: StatsBarProps) {
  const { settings, years } = usePlan()

  const allProjects = categories.flatMap((cat) => cat.projects)
  const enabledProjects = allProjects.filter((p) => p.enabled)

  const totalPresentCost = enabledProjects.reduce(
    (sum, p) => sum + projectPresentTotal(p.buckets, years),
    0
  )

  const totalInflatedCost = enabledProjects.reduce(
    (sum, p) =>
      sum + projectInflatedTotal(p.buckets, years, settings.base_year, settings.inflation_rate),
    0
  )

  const stats = [
    {
      label: 'Total Projects',
      value: allProjects.length.toString(),
      sublabel: `${enabledProjects.length} enabled`,
    },
    {
      label: 'Total Present Cost',
      value: formatCost(totalPresentCost),
      sublabel: `${years.length} years`,
    },
    {
      label: 'Total Inflated Cost',
      value: formatCost(totalInflatedCost),
      sublabel: `${settings.inflation_rate}% inflation`,
      valueClassName: 'text-blue-600',
    },
    {
      label: 'Categories',
      value: categories.length.toString(),
      sublabel: 'active groups',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
        const bgColors = [
          'bg-white border-blue-300',
          'bg-white border-emerald-300',
          'bg-white border-cyan-300',
          'bg-white border-violet-300',
        ]
        const textColors = ['text-blue-700', 'text-emerald-700', 'text-cyan-700', 'text-violet-700']
        const accentColors = [
          'border-l-blue-600',
          'border-l-emerald-600',
          'border-l-cyan-600',
          'border-l-violet-600',
        ]

        return (
          <div
            key={stat.label}
            className={`rounded-lg shadow-md p-5 border-2 border-l-4 ${bgColors[index]} ${accentColors[index]} transition-all hover:shadow-lg`}
          >
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
              {stat.label}
            </div>
            <div className={`text-3xl font-bold ${stat.valueClassName || textColors[index]}`}>
              {stat.value}
            </div>
            {stat.sublabel && (
              <div className="text-xs text-slate-600 mt-2 font-medium">{stat.sublabel}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}
