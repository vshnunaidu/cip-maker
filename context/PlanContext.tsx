'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { PlanSettings } from '@/types'
import { getYearRange } from '@/lib/calculations'

interface PlanContextValue {
  settings: PlanSettings
  years: number[]
  updateSettings: (updates: Partial<PlanSettings>) => Promise<void>
}

const PlanContext = createContext<PlanContextValue | null>(null)

export function PlanProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<PlanSettings>({
    id: 1,
    city_name: 'City Name',
    plan_title: 'Water Capital Improvement Program',
    base_year: 2025,
    inflation_rate: 3.0,
    start_year: 2026,
    end_year: 2035,
  })

  useEffect(() => {
    supabase
      .from('plan_settings')
      .select('*')
      .single()
      .then(({ data }) => { if (data) setSettings(data) })
  }, [])

  const years = getYearRange(settings.start_year, settings.end_year)

  async function updateSettings(updates: Partial<PlanSettings>) {
    const next = { ...settings, ...updates }
    setSettings(next)
    await supabase.from('plan_settings').upsert(next)
  }

  return (
    <PlanContext.Provider value={{ settings, years, updateSettings }}>
      {children}
    </PlanContext.Provider>
  )
}

export function usePlan() {
  const ctx = useContext(PlanContext)
  if (!ctx) throw new Error('usePlan must be used within PlanProvider')
  return ctx
}
