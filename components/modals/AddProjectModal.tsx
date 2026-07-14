'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { ProjectCategory, BucketType } from '@/types'

interface AddProjectModalProps {
  categories: ProjectCategory[]
  onClose: () => void
  onSuccess: () => void
}

interface FormData {
  project_id_label: string
  name: string
  description: string
  category_id: string
}

const BUCKET_TYPES: BucketType[] = ['issued_debt_cash', 'new_debt', 'impact_fees']

export function AddProjectModal({ categories, onClose, onSuccess }: AddProjectModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

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
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border-2 border-slate-200">
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

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Project Label
            </label>
            <input
              {...register('project_id_label', { required: 'Project label is required' })}
              placeholder="e.g., W-1, W-17"
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
              {...register('name', { required: 'Project name is required' })}
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
              {...register('description')}
              placeholder="Enter project description (optional)"
              rows={3}
              className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 font-medium bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Category *
            </label>
            <select
              {...register('category_id', { required: 'Category is required' })}
              className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 font-medium bg-slate-50"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="text-sm text-red-600 mt-1 font-medium">{errors.category_id.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-6">
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
