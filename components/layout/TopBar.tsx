'use client'
import { usePlan } from '@/context/PlanContext'

export function TopBar() {
  const { settings, updateSettings } = usePlan()

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-slate-700">Base Year:</label>
          <input
            type="number"
            value={settings?.base_year ?? 2025}
            onChange={(e) => updateSettings({ base_year: parseInt(e.target.value) || 2025 })}
            className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-slate-700">Inflation Rate:</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.1"
              value={settings?.inflation_rate ?? 3.0}
              onChange={(e) => updateSettings({ inflation_rate: parseFloat(e.target.value) || 3.0 })}
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
              value={settings?.start_year ?? 2026}
              onChange={(e) => updateSettings({ start_year: parseInt(e.target.value) || 2026 })}
              className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
            />
            <span className="text-slate-400 font-medium">—</span>
            <input
              type="number"
              value={settings?.end_year ?? 2035}
              onChange={(e) => updateSettings({ end_year: parseInt(e.target.value) || 2035 })}
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
