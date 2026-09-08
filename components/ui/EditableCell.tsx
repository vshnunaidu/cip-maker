'use client'
import { useState, useRef, useEffect } from 'react'
import { Pencil, Check } from 'lucide-react'
import { inflateCost } from '@/lib/calculations'

interface EditableCellProps {
  value: number
  onChange: (value: number) => void
  onNext?: () => void
  disabled?: boolean
  year?: number // Year for inflation calculation
  inflationRate?: number // Inflation rate percentage
}

export function EditableCell({ value, onChange, onNext, disabled = false, year, inflationRate }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value.toString())
  const [showSaved, setShowSaved] = useState(false)
  const [showError, setShowError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Calculate display value (inflated if year and inflationRate provided, otherwise raw)
  const displayValue = year && inflationRate !== undefined && value > 0
    ? inflateCost(value, year, inflationRate)
    : value

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = () => {
    const numValue = parseFloat(editValue) || 0

    // Validation
    if (numValue < 0 || numValue > 999999999 || isNaN(numValue)) {
      // Invalid value - revert and show error
      setEditValue(value.toString())
      setIsEditing(false)
      setShowError(true)
      setTimeout(() => setShowError(false), 1000)
      return
    }

    onChange(numValue)
    setIsEditing(false)
    setShowSaved(true)
    setTimeout(() => setShowSaved(false), 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
      onNext?.()
    } else if (e.key === 'Escape') {
      setEditValue(value.toString())
      setIsEditing(false)
    } else if (e.key === 'Tab') {
      e.preventDefault()
      handleSave()
      onNext?.()
    }
  }

  if (disabled) {
    return <div className="px-3 py-2 text-slate-400 text-right font-medium">—</div>
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="number"
        min="0"
        max="999999999"
        value={editValue}
        onChange={(e) => {
          // Strip any non-numeric characters except decimal point
          const cleaned = e.target.value.replace(/[^0-9.]/g, '')
          setEditValue(cleaned)
        }}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="w-full px-3 py-2 text-right border-2 border-blue-500 rounded-lg font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-blue-50"
      />
    )
  }

  if (showError) {
    return (
      <div className="px-3 py-2 text-right font-medium text-red-700 bg-red-100 rounded-lg animate-pulse">
        {displayValue === 0 ? '—' : `$${Math.round(displayValue).toLocaleString()}`}
      </div>
    )
  }

  if (showSaved) {
    return (
      <div className="px-3 py-2 text-right font-medium text-emerald-700 bg-emerald-50 rounded-lg flex items-center justify-end gap-1">
        <Check className="w-3 h-3" />
        {displayValue === 0 ? '—' : `$${Math.round(displayValue).toLocaleString()}`}
      </div>
    )
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="px-3 py-2 text-right cursor-pointer hover:bg-blue-100 rounded-lg transition-all font-medium hover:shadow-sm relative group"
      style={{
        color: year && inflationRate !== undefined && value > 0 ? '#0891b2' : '#1e293b',
        fontWeight: year && inflationRate !== undefined && value > 0 ? '600' : '500'
      }}
    >
      <div className="flex items-center justify-end gap-1">
        {displayValue === 0 ? (
          <span className="text-slate-400">{isHovered ? 'Click to add' : '—'}</span>
        ) : (
          <>
            ${Math.round(displayValue).toLocaleString()}
            {isHovered && <Pencil className="w-3 h-3 text-blue-600" />}
          </>
        )}
      </div>
    </div>
  )
}
