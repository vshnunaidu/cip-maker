'use client'
import { usePlan } from '@/context/PlanContext'

export function TopBar() {
  const { settings, updateSettings } = usePlan()

  const handleBaseYearChange = (value: number) => {
    if (value >= 2000 && value <= 2060) {
      updateSettings({ base_year: value })
    }
  }

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
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-slate-700">Base Year:</label>
          <input
            type="number"
            min="2000"
            max="2060"
            value={settings?.base_year ?? 2025}
            onChange={(e) => handleBaseYearChange(parseInt(e.target.value) || 2025)}
            className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-slate-700">Inflation Rate:</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="50"
              step="0.01"
              value={settings?.inflation_rate ?? 3.0}
              onChange={(e) => handleInflationRateChange(parseFloat(e.target.value) || 3.0)}
              className="w-20 px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
            />
            <span className="text-sm font-medium text-slate-600">%</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-slate-700">Year Range:</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="2000"
              max="2060"
              value={settings?.start_year ?? 2026}
              onChange={(e) => handleStartYearChange(parseInt(e.target.value) || 2026)}
              className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
            />
            <span className="text-slate-400 font-medium">—</span>
            <input
              type="number"
              min="2000"
              max="2060"
              value={settings?.end_year ?? 2035}
              onChange={(e) => handleEndYearChange(parseInt(e.target.value) || 2035)}
              className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
            />
          </div>
        </div>

        <div className="flex-1"></div>

        <div className="text-sm font-medium text-slate-700 bg-slate-100 px-4 py-2 rounded-lg">
          {settings?.city_name ?? 'City Name'} • {settings?.plan_title ?? 'Water Capital Improvement Program'}
        </div>
      </div>
    </div>
  )
}
