export type BucketType = 'issued_debt_cash' | 'new_debt' | 'impact_fees'

export const BUCKET_LABELS: Record<BucketType, string> = {
  issued_debt_cash: 'Issued/Cash',
  new_debt: 'New Debt',
  impact_fees: 'Impact Fees',
}

export interface ProjectBucket {
  id: string
  project_id: string
  bucket_type: BucketType
  year_costs: Record<string, number>  // key is year as string e.g. "2026"
}

export interface Project {
  id: string
  category_id: string | null
  project_id_label: string | null
  name: string
  description: string | null
  enabled: boolean
  sort_order: number
  buckets: ProjectBucket[]
}

export interface ProjectCategory {
  id: string
  name: string
  sort_order: number
  funding_category_id: string | null
  projects: Project[]
}

export interface FundingCategory {
  id: string
  code: string
  name: string
  sort_order: number
  subcategories: ProjectCategory[]
}

export interface PlanSettings {
  id: number
  city_name: string
  plan_title: string
  base_year: number
  inflation_rate: number
  start_year: number
  end_year: number
}
