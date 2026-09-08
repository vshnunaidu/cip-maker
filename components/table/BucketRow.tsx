'use client'
import { useState } from 'react'
import { Project, ProjectBucket } from '@/types'
import { BucketBadge } from '@/components/ui/BucketBadge'
import { EditableCell } from '@/components/ui/EditableCell'
import { usePlan } from '@/context/PlanContext'
import { formatCost, bucketPresentTotal, bucketInflatedTotal } from '@/lib/calculations'

interface BucketRowProps {
  bucket: ProjectBucket
  onUpdateCost: (year: string, value: number) => void
  onSwapYears?: (year1: string, year2: string) => void
  disabled?: boolean
  project?: Project
}

export function BucketRow({ bucket, onUpdateCost, onSwapYears, disabled = false, project }: BucketRowProps) {
  const { settings, years } = usePlan()
  const [draggedYear, setDraggedYear] = useState<number | null>(null)

  const presentTotal = bucketPresentTotal(bucket.year_costs, years)
  const inflatedTotal = bucketInflatedTotal(bucket.year_costs, years, settings.inflation_rate)

  // Determine effective start year for this project
  const effectiveStartYear = project?.start_year
    ? Math.max(settings.start_year, project.start_year)
    : settings.start_year

  const borderColor = {
    issued_debt_cash: 'border-l-amber-500',
    new_debt: 'border-l-rose-500',
    impact_fees: 'border-l-teal-500',
  }[bucket.bucket_type]

  const handleDragStart = (year: number, value: number) => {
    if (value > 0 && !disabled) {
      setDraggedYear(year)
    }
  }

  const handleDragEnd = () => {
    setDraggedYear(null)
  }

  const handleDrop = (targetYear: number) => {
    if (draggedYear === null || draggedYear === targetYear) {
      setDraggedYear(null)
      return
    }

    // Use swap function if available, otherwise fall back to individual updates
    if (onSwapYears) {
      onSwapYears(String(draggedYear), String(targetYear))
    } else {
      const sourceValue = bucket.year_costs[String(draggedYear)] || 0
      const targetValue = bucket.year_costs[String(targetYear)] || 0
      onUpdateCost(String(draggedYear), targetValue)
      onUpdateCost(String(targetYear), sourceValue)
    }

    setDraggedYear(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault() // Allow drop
  }

  return (
    <tr className={`border-b border-slate-100 bg-slate-50/70 border-l-4 ${borderColor} ${disabled ? 'opacity-50' : ''}`}>
      <td className="px-4 py-2.5 pl-16">
        <BucketBadge type={bucket.bucket_type} />
      </td>
      <td className="px-4 py-2.5"></td>
      <td className="px-4 py-2.5 text-right font-semibold text-slate-700">{formatCost(presentTotal)}</td>
      <td className="px-4 py-2.5 text-right font-semibold text-cyan-600">
        {formatCost(inflatedTotal)}
      </td>
      {years.map((year) => {
        const isBeforeStartYear = year < effectiveStartYear
        const cellValue = bucket.year_costs[String(year)] || 0
        const isDragging = draggedYear === year
        const isValidDropTarget = draggedYear !== null && draggedYear !== year && !isBeforeStartYear

        return (
          <td
            key={year}
            className={`px-2 py-1.5 border-l border-slate-100 ${
              isBeforeStartYear ? 'bg-slate-100 opacity-40' : ''
            } ${isValidDropTarget ? 'ring-2 ring-blue-400 ring-inset' : ''} ${
              isDragging ? 'opacity-50' : ''
            } transition-all`}
            draggable={cellValue > 0 && !disabled && !isBeforeStartYear}
            onDragStart={() => handleDragStart(year, cellValue)}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(year)}
          >
            <div className="relative group">
              {cellValue > 0 && !disabled && !isBeforeStartYear && (
                <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                  <span className="text-slate-400 text-xs">⠿</span>
                </div>
              )}
              <EditableCell
                value={cellValue}
                onChange={(value) => onUpdateCost(String(year), value)}
                disabled={disabled || isBeforeStartYear}
                year={isBeforeStartYear ? undefined : year}
                inflationRate={isBeforeStartYear ? undefined : settings.inflation_rate}
              />
            </div>
          </td>
        )
      })}
    </tr>
  )
}
