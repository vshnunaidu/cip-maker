'use client'
import { useState, useEffect } from 'react'
import { usePlan } from '@/context/PlanContext'
import { supabase } from '@/lib/supabase'
import { Save, Plus, Trash2 } from 'lucide-react'

interface Category {
  id: string
  name: string
  sort_order: number
}

export default function SettingsPage() {
  const { settings, updateSettings } = usePlan()
  const [categories, setCategories] = useState<Category[]>([])
  const [localSettings, setLocalSettings] = useState(settings)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  async function fetchCategories() {
    const { data } = await supabase
      .from('project_categories')
      .select('*')
      .order('sort_order')
    if (data) setCategories(data)
  }

  async function handleSaveSettings() {
    setIsSaving(true)
    setSaveSuccess(false)
    await updateSettings(localSettings)
    setIsSaving(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  async function handleAddCategory() {
    const name = prompt('Enter category name:')
    if (!name) return

    const maxSort = Math.max(...categories.map((c) => c.sort_order), 0)
    const { error } = await supabase
      .from('project_categories')
      .insert({ name, sort_order: maxSort + 1 })

    if (!error) fetchCategories()
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm('Are you sure? This will unassign all projects from this category.')) return

    const { error } = await supabase.from('project_categories').delete().eq('id', id)
    if (!error) fetchCategories()
  }

  return (
    <div className="p-6 max-w-4xl bg-slate-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Plan Settings</h1>
        <p className="text-slate-600 mt-1">Configure plan parameters and categories</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-4">General Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              City Name
            </label>
            <input
              type="text"
              value={localSettings?.city_name ?? ''}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, city_name: e.target.value })
              }
              className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 font-medium bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Plan Title
            </label>
            <input
              type="text"
              value={localSettings?.plan_title ?? ''}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, plan_title: e.target.value })
              }
              className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 font-medium bg-slate-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Base Year
              </label>
              <input
                type="number"
                value={localSettings?.base_year ?? 2025}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, base_year: parseInt(e.target.value) || 2025 })
                }
                className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 font-medium bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Inflation Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={localSettings?.inflation_rate ?? 3.0}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    inflation_rate: parseFloat(e.target.value) || 3.0,
                  })
                }
                className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 font-medium bg-slate-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Start Year
              </label>
              <input
                type="number"
                value={localSettings?.start_year ?? 2026}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, start_year: parseInt(e.target.value) || 2026 })
                }
                className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 font-medium bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                End Year
              </label>
              <input
                type="number"
                value={localSettings?.end_year ?? 2035}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, end_year: parseInt(e.target.value) || 2035 })
                }
                className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 font-medium bg-slate-50"
              />
            </div>
          </div>

          <div className="pt-6">
            <div className="flex items-center gap-4">
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all disabled:opacity-50 font-semibold shadow-lg shadow-blue-500/30"
              >
                <Save className="w-5 h-5" />
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
              {saveSuccess && (
                <div className="flex items-center gap-2 text-emerald-700 font-semibold bg-emerald-100 px-4 py-2 rounded-lg border-2 border-emerald-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Settings saved successfully!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Project Categories</h2>
          <button
            onClick={handleAddCategory}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all font-semibold shadow-lg shadow-blue-500/30"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>

        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-4 border-2 border-slate-200 rounded-lg hover:border-blue-300 transition-all bg-slate-50"
            >
              <span className="font-semibold text-slate-900">{category.name}</span>
              <button
                onClick={() => handleDeleteCategory(category.id)}
                className="text-red-600 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
