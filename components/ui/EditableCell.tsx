'use client'
import { useState, useRef, useEffect } from 'react'
import { Pencil, Check } from 'lucide-react'

interface EditableCellProps {
  value: number
  onChange: (value: number) => void
  onNext?: () => void
  disabled?: boolean
}

export function EditableCell({ value, onChange, onNext, disabled = false }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value.toString())
  const [showSaved, setShowSaved] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = () => {
    const numValue = parseFloat(editValue) || 0
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
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="w-full px-3 py-2 text-right border-2 border-blue-500 rounded-lg font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-blue-50"
      />
    )
  }

  if (showSaved) {
    return (
      <div className="px-3 py-2 text-right font-medium text-emerald-700 bg-emerald-50 rounded-lg flex items-center justify-end gap-1">
        <Check className="w-3 h-3" />
        {value === 0 ? '—' : value.toLocaleString()}
      </div>
    )
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="px-3 py-2 text-right cursor-pointer hover:bg-blue-100 rounded-lg transition-all font-medium text-slate-800 hover:shadow-sm relative group"
    >
      <div className="flex items-center justify-end gap-1">
        {value === 0 ? (
          <span className="text-slate-400">{isHovered ? 'Click to add' : '—'}</span>
        ) : (
          <>
            {value.toLocaleString()}
            {isHovered && <Pencil className="w-3 h-3 text-blue-600" />}
          </>
        )}
      </div>
    </div>
  )
}
