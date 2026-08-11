'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { FundingCategory, BucketType } from '@/types'

interface AddProjectModalProps {
  fundingCategories: FundingCategory[]
  onClose: () => void
  onSuccess: () => void
}

interface FormData {
  funding_category_id: string
  project_id_label: string
  name: string
  description: string
  category_id: string
}

const BUCKET_TYPES: BucketType[] = ['issued_debt_cash', 'new_debt', 'impact_fees']

export function AddProjectModal({ fundingCategories, onClose, onSuccess }: AddProjectModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFundingCategoryId, setSelectedFundingCategoryId] = useState<string>('')
  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      // Insert project
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert({
          project_id_label: data.project_id_label,
          name: data.name,
          description: data.description || null,
          category_id: data.category_id || null,
          enabled: true,
          sort_order: 999,
        })
        .select()
        .single()

      if (projectError) throw projectError

      // Create 3 empty bucket rows for the project
      const bucketInserts = BUCKET_TYPES.map((bucket_type) => ({
        project_id: newProject.id,
        bucket_type,
        year_costs: {},
      }))

      const { error: bucketsError } = await supabase
        .from('project_buckets')
        .insert(bucketInserts)

      if (bucketsError) throw bucketsError

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Failed to create project. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border-2 border-slate-200 max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b-2 border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Add New Project</h2>
            <p className="text-sm text-slate-600 mt-1">Create a new capital improvement project</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors hover:bg-slate-100 p-2 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-6 py-6 space-y-5 overflow-y-auto">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Funding Category *
            </label>
            <select
              {...register('funding_category_id', {
                required: 'Funding category is required',
                onChange: (e) => setSelectedFundingCategoryId(e.target.value)
              })}
              className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 font-medium bg-slate-50"
            >
              <option value="">Select a funding category</option>
              {fundingCategories.map((fc) => (
                <option key={fc.id} value={fc.id}>
                  {fc.code} — {fc.name}
                </option>
              ))}
            </select>
            {errors.funding_category_id && (
              <p className="text-sm text-red-600 mt-1 font-medium">{errors.funding_category_id.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Project Type *
            </label>
            {selectedFundingCategoryId &&
             fundingCategories.find((fc) => fc.id === selectedFundingCategoryId)?.subcategories.length === 0 ? (
              <div className="w-full px-4 py-2.5 border-2 border-amber-300 rounded-lg bg-amber-50 text-amber-800 text-sm">
                No subcategories yet — add one in Settings
              </div>
            ) : (
              <select
                {...register('category_id', { required: 'Project type is required' })}
                disabled={!selectedFundingCategoryId}
                className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 font-medium bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select a project type</option>
                {selectedFundingCategoryId &&
                  fundingCategories
                    .find((fc) => fc.id === selectedFundingCategoryId)
                    ?.subcategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
              </select>
            )}
            {errors.category_id && (
              <p className="text-sm text-red-600 mt-1 font-medium">{errors.category_id.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Project ID
            </label>
            <input
              {...register('project_id_label', {
                pattern: {
                  value: /^[A-Z]{1,3}-\d{1,3}$/,
                  message: 'Project ID must match pattern like W-1, WW-12, RW-3'
                }
              })}
              placeholder="e.g., W-1, WW-12, RW-3 (optional)"
              className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 font-medium bg-slate-50"
            />
            {errors.project_id_label && (
              <p className="text-sm text-red-600 mt-1 font-medium">{errors.project_id_label.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Project Name *
            </label>
            <input
              {...register('name', {
                required: 'Project name is required',
                maxLength: {
                  value: 200,
                  message: 'Project name cannot exceed 200 characters'
                }
              })}
              placeholder="Enter project name"
              className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 font-medium bg-slate-50"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1 font-medium">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Description
            </label>
            <textarea
              {...register('description', {
                maxLength: {
                  value: 500,
                  message: 'Description cannot exceed 500 characters'
                }
              })}
              placeholder="Enter project description (optional)"
              rows={3}
              className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 font-medium bg-slate-50"
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1 font-medium">{errors.description.message}</p>
            )}
          </div>
          </div>

          <div className="flex gap-3 px-6 py-4 border-t-2 border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border-2 border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all disabled:opacity-50 font-semibold shadow-lg shadow-blue-500/30"
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
