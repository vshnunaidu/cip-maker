'use client'
import { useState, useEffect } from 'react'
import { usePlan } from '@/context/PlanContext'
import { supabase } from '@/lib/supabase'
import { Save, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react'

interface Category {
  id: string
  name: string
  sort_order: number
  funding_category_id: string | null
}

interface FundingCategory {
  id: string
  code: string
  name: string
  sort_order: number
}

export default function SettingsPage() {
  const { settings, updateSettings } = usePlan()
  const [fundingCategories, setFundingCategories] = useState<FundingCategory[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [expandedFundingCategories, setExpandedFundingCategories] = useState<Set<string>>(new Set())
  const [localSettings, setLocalSettings] = useState(settings)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'funding' | 'subcategory'
    id: string
    projectCount: number
  } | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  async function fetchCategories() {
    const { data: fundingCatsData } = await supabase
      .from('funding_categories')
      .select('*')
      .order('sort_order')
    if (fundingCatsData) setFundingCategories(fundingCatsData)

    const { data: catsData } = await supabase
      .from('project_categories')
      .select('*')
      .order('sort_order')
    if (catsData) setCategories(catsData)
  }

  function toggleFundingCategory(id: string) {
    setExpandedFundingCategories((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function validateSettings() {
    const newErrors: Record<string, string> = {}

    // City name validation
    if (!localSettings.city_name || localSettings.city_name.trim().length === 0) {
      newErrors.city_name = 'City name is required'
    } else if (localSettings.city_name.length > 100) {
      newErrors.city_name = 'City name cannot exceed 100 characters'
    }

    // Plan title validation
    if (!localSettings.plan_title || localSettings.plan_title.trim().length === 0) {
      newErrors.plan_title = 'Plan title is required'
    } else if (localSettings.plan_title.length > 200) {
      newErrors.plan_title = 'Plan title cannot exceed 200 characters'
    }

    // Base year validation
    if (localSettings.base_year < 2000 || localSettings.base_year > 2060) {
      newErrors.base_year = 'Base year must be between 2000 and 2060'
    }

    // Inflation rate validation
    if (localSettings.inflation_rate < 0 || localSettings.inflation_rate > 50) {
      newErrors.inflation_rate = 'Inflation rate must be between 0 and 50'
    }

    // Start year validation
    if (localSettings.start_year < 2000 || localSettings.start_year > 2060) {
      newErrors.start_year = 'Start year must be between 2000 and 2060'
    }

    // End year validation
    if (localSettings.end_year < 2000 || localSettings.end_year > 2060) {
      newErrors.end_year = 'End year must be between 2000 and 2060'
    }

    // Start year <= end year validation
    if (localSettings.start_year > localSettings.end_year) {
      newErrors.year_range = 'Start year must be less than or equal to end year'
    }

    // Maximum span validation
    if (localSettings.end_year - localSettings.start_year > 30) {
      newErrors.year_range = 'Year range cannot exceed 30 years'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSaveSettings() {
    if (!validateSettings()) {
      return
    }

    setIsSaving(true)
    setSaveSuccess(false)
    await updateSettings(localSettings)
    setIsSaving(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  async function handleAddFundingCategory() {
    const code = prompt('Enter funding category code (e.g., W, WW, RW):')
    if (!code) return
    if (!/^[A-Z]{1,3}$/.test(code)) {
      alert('Code must be 1-3 uppercase letters')
      return
    }

    const name = prompt('Enter funding category name (e.g., Water):')
    if (!name) return
    if (name.length > 100) {
      alert('Name cannot exceed 100 characters')
      return
    }

    const maxSort = Math.max(...fundingCategories.map((c) => c.sort_order), 0)
    const { error } = await supabase
      .from('funding_categories')
      .insert({ code, name, sort_order: maxSort + 1 })

    if (error) {
      alert('Error adding funding category: ' + error.message)
    } else {
      fetchCategories()
    }
  }

  async function handleAddSubcategory(fundingCategoryId: string) {
    const name = prompt('Enter subcategory name:')
    if (!name) return
    if (name.length > 100) {
      alert('Name cannot exceed 100 characters')
      return
    }

    const subcatsInFC = categories.filter((c) => c.funding_category_id === fundingCategoryId)
    const maxSort = Math.max(...subcatsInFC.map((c) => c.sort_order), 0)
    const { error } = await supabase
      .from('project_categories')
      .insert({ name, funding_category_id: fundingCategoryId, sort_order: maxSort + 1 })

    if (error) {
      alert('Error adding subcategory: ' + error.message)
    } else {
      fetchCategories()
    }
  }

  async function handleDeleteSubcategory(id: string) {
    // Check if subcategory has projects
    const { data: projects, count } = await supabase
      .from('projects')
      .select('id', { count: 'exact' })
      .eq('category_id', id)

    const projectCount = count || 0

    if (projectCount === 0) {
      // No projects, delete immediately
      const { error } = await supabase.from('project_categories').delete().eq('id', id)
      if (error) {
        alert('Error deleting subcategory: ' + error.message)
      } else {
        fetchCategories()
      }
    } else {
      // Has projects, show inline confirmation
      setDeleteConfirm({ type: 'subcategory', id, projectCount })
    }
  }

  async function confirmDelete() {
    if (!deleteConfirm) return

    if (deleteConfirm.type === 'subcategory') {
      // Unassign projects first
      await supabase
        .from('projects')
        .update({ category_id: null })
        .eq('category_id', deleteConfirm.id)

      // Then delete subcategory
      const { error } = await supabase.from('project_categories').delete().eq('id', deleteConfirm.id)
      if (error) {
        alert('Error deleting subcategory: ' + error.message)
      } else {
        fetchCategories()
      }
    } else if (deleteConfirm.type === 'funding') {
      // Get all subcategories
      const subcats = categories.filter((c) => c.funding_category_id === deleteConfirm.id)

      // Unassign all projects from these subcategories
      for (const subcat of subcats) {
        await supabase
          .from('projects')
          .update({ category_id: null })
          .eq('category_id', subcat.id)
      }

      // Delete funding category (subcategories will cascade)
      const { error } = await supabase.from('funding_categories').delete().eq('id', deleteConfirm.id)
      if (error) {
        alert('Error deleting funding category: ' + error.message)
      } else {
        fetchCategories()
      }
    }

    setDeleteConfirm(null)
  }

  async function handleDeleteFundingCategory(id: string) {
    // Check if funding category has subcategories with projects
    const subcats = categories.filter((c) => c.funding_category_id === id)
    let totalProjects = 0

    for (const subcat of subcats) {
      const { count } = await supabase
        .from('projects')
        .select('id', { count: 'exact' })
        .eq('category_id', subcat.id)

      totalProjects += count || 0
    }

    if (totalProjects === 0) {
      // No projects, delete immediately
      const { error } = await supabase.from('funding_categories').delete().eq('id', id)
      if (error) {
        alert('Error deleting funding category: ' + error.message)
      } else {
        fetchCategories()
      }
    } else {
      // Has projects, show inline confirmation
      setDeleteConfirm({ type: 'funding', id, projectCount: totalProjects })
    }
  }

  return (
    <div className="p-6 max-w-4xl bg-slate-50 pb-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Plan Settings</h1>
        <p className="text-slate-600 mt-1">Configure plan parameters and categories</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-4">General Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              City Name *
            </label>
            <input
              type="text"
              maxLength={100}
              value={localSettings?.city_name ?? ''}
              onChange={(e) => {
                setLocalSettings({ ...localSettings, city_name: e.target.value })
                if (errors.city_name) {
                  const newErrors = { ...errors }
                  delete newErrors.city_name
                  setErrors(newErrors)
                }
              }}
              className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium bg-slate-50 ${
                errors.city_name ? 'border-red-500' : 'border-slate-300'
              }`}
            />
            {errors.city_name && (
              <p className="text-sm text-red-600 mt-1 font-medium">{errors.city_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Plan Title *
            </label>
            <input
              type="text"
              maxLength={200}
              value={localSettings?.plan_title ?? ''}
              onChange={(e) => {
                setLocalSettings({ ...localSettings, plan_title: e.target.value })
                if (errors.plan_title) {
                  const newErrors = { ...errors }
                  delete newErrors.plan_title
                  setErrors(newErrors)
                }
              }}
              className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium bg-slate-50 ${
                errors.plan_title ? 'border-red-500' : 'border-slate-300'
              }`}
            />
            {errors.plan_title && (
              <p className="text-sm text-red-600 mt-1 font-medium">{errors.plan_title}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Base Year *
              </label>
              <input
                type="number"
                min="2000"
                max="2060"
                value={localSettings?.base_year ?? 2025}
                onChange={(e) => {
                  setLocalSettings({ ...localSettings, base_year: parseInt(e.target.value) || 2025 })
                  if (errors.base_year) {
                    const newErrors = { ...errors }
                    delete newErrors.base_year
                    setErrors(newErrors)
                  }
                }}
                className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium bg-slate-50 ${
                  errors.base_year ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.base_year && (
                <p className="text-sm text-red-600 mt-1 font-medium">{errors.base_year}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Inflation Rate (%) *
              </label>
              <input
                type="number"
                min="0"
                max="50"
                step="0.01"
                value={localSettings?.inflation_rate ?? 3.0}
                onChange={(e) => {
                  const val = parseFloat(e.target.value)
                  // Round to 2 decimal places
                  const rounded = Math.round(val * 100) / 100
                  setLocalSettings({
                    ...localSettings,
                    inflation_rate: isNaN(rounded) ? 3.0 : rounded,
                  })
                  if (errors.inflation_rate) {
                    const newErrors = { ...errors }
                    delete newErrors.inflation_rate
                    setErrors(newErrors)
                  }
                }}
                className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium bg-slate-50 ${
                  errors.inflation_rate ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.inflation_rate && (
                <p className="text-sm text-red-600 mt-1 font-medium">{errors.inflation_rate}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Start Year *
              </label>
              <input
                type="number"
                min="2000"
                max="2060"
                value={localSettings?.start_year ?? 2026}
                onChange={(e) => {
                  setLocalSettings({ ...localSettings, start_year: parseInt(e.target.value) || 2026 })
                  if (errors.start_year || errors.year_range) {
                    const newErrors = { ...errors }
                    delete newErrors.start_year
                    delete newErrors.year_range
                    setErrors(newErrors)
                  }
                }}
                className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium bg-slate-50 ${
                  errors.start_year ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.start_year && (
                <p className="text-sm text-red-600 mt-1 font-medium">{errors.start_year}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                End Year *
              </label>
              <input
                type="number"
                min="2000"
                max="2060"
                value={localSettings?.end_year ?? 2035}
                onChange={(e) => {
                  setLocalSettings({ ...localSettings, end_year: parseInt(e.target.value) || 2035 })
                  if (errors.end_year || errors.year_range) {
                    const newErrors = { ...errors }
                    delete newErrors.end_year
                    delete newErrors.year_range
                    setErrors(newErrors)
                  }
                }}
                className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium bg-slate-50 ${
                  errors.end_year ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.end_year && (
                <p className="text-sm text-red-600 mt-1 font-medium">{errors.end_year}</p>
              )}
            </div>
          </div>

          {errors.year_range && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3">
              <p className="text-sm text-red-700 font-medium">{errors.year_range}</p>
            </div>
          )}

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
          <h2 className="text-xl font-bold text-slate-900">Category Management</h2>
          <button
            onClick={handleAddFundingCategory}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all font-semibold shadow-lg shadow-blue-500/30"
          >
            <Plus className="w-4 h-4" />
            Add Funding Category
          </button>
        </div>

        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {fundingCategories.map((fundingCat) => {
            const isExpanded = expandedFundingCategories.has(fundingCat.id)
            const subcats = categories.filter((c) => c.funding_category_id === fundingCat.id)

            return (
              <div key={fundingCat.id} className="border-2 border-slate-200 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between p-4 bg-slate-100">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleFundingCategory(fundingCat.id)}
                      className="text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                    <span className="font-bold text-slate-900">
                      {fundingCat.code} — {fundingCat.name}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-200 px-2 py-1 rounded-full">
                      {subcats.length} subcategories
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAddSubcategory(fundingCat.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 text-xs rounded-md hover:bg-blue-200 transition-all font-semibold"
                    >
                      <Plus className="w-3 h-3" />
                      Add Subcategory
                    </button>
                    <button
                      onClick={() => handleDeleteFundingCategory(fundingCat.id)}
                      className="text-red-600 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="bg-white p-4 space-y-2">
                    {subcats.length > 0 ? (
                      subcats.map((subcat) => (
                        <div
                          key={subcat.id}
                          className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:border-blue-300 transition-all bg-slate-50"
                        >
                          <span className="font-semibold text-slate-900">{subcat.name}</span>
                          <button
                            onClick={() => handleDeleteSubcategory(subcat.id)}
                            className="text-red-600 hover:text-red-700 transition-colors p-1.5 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-slate-500 py-4">
                        No subcategories. Click "Add Subcategory" to create one.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Inline Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md border-2 border-red-300">
            <h3 className="text-xl font-bold text-red-900 mb-4">Confirm Deletion</h3>
            <p className="text-slate-700 mb-6">
              This {deleteConfirm.type === 'funding' ? 'funding category' : 'subcategory'} has{' '}
              <span className="font-bold text-red-700">{deleteConfirm.projectCount} project(s)</span>.
              Deleting it will unassign those projects. Are you sure?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border-2 border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-semibold"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
