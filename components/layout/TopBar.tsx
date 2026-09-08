'use client'
import { usePlan } from '@/context/PlanContext'
import Image from 'next/image'

export function TopBar() {
  const { settings, updateSettings } = usePlan()

  const handleInflationRateChange = (value: number) => {
    if (value >= 0 && value <= 50) {
      // Round to 2 decimal places
      const rounded = Math.round(value * 100) / 100
      updateSettings({ inflation_rate: rounded })
    }
  }

  const handleStartYearChange = (value: number) => {
    if (value >= 2000 && value <= 2060 && value <= settings.end_year && settings.end_year - value <= 30) {
      updateSettings({ start_year: value })
    }
  }

  const handleEndYearChange = (value: number) => {
    if (value >= 2000 && value <= 2060 && value >= settings.start_year && value - settings.start_year <= 30) {
      updateSettings({ end_year: value })
    }
  }

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left side: Logos */}
        <div className="flex items-center gap-4">
          <Image
            src="/civitas-logo.png"
            alt="Civitas"
            width={80}
            height={40}
            className="object-contain"
          />
          <Image
            src="/richmond-logo.png"
            alt="City of Richmond"
            width={80}
            height={40}
            className="object-contain"
          />
        </div>

        {/* Right side: Title and controls */}
        <div className="flex flex-col items-end gap-2">
          {/* Title */}
          <div className="text-sm font-medium text-slate-700 bg-slate-100 px-4 py-2 rounded-lg">
            {settings?.city_name ?? 'City Name'} • {settings?.plan_title ?? 'Water Capital Improvement Program'}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600">Inflation Rate:</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.01"
                  value={settings?.inflation_rate ?? 3.0}
                  onChange={(e) => handleInflationRateChange(parseFloat(e.target.value) || 3.0)}
                  className="w-16 px-2 py-1 border border-slate-300 rounded text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
                />
                <span className="text-xs font-medium text-slate-600">%</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600">Year Range:</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="2000"
                  max="2060"
                  value={settings?.start_year ?? 2026}
                  onChange={(e) => handleStartYearChange(parseInt(e.target.value) || 2026)}
                  className="w-20 px-2 py-1 border border-slate-300 rounded text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
                />
                <span className="text-slate-400 font-medium text-xs">—</span>
                <input
                  type="number"
                  min="2000"
                  max="2060"
                  value={settings?.end_year ?? 2035}
                  onChange={(e) => handleEndYearChange(parseInt(e.target.value) || 2035)}
                  className="w-20 px-2 py-1 border border-slate-300 rounded text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
