export interface Job {
  id: string
  title: string
  company_id: string | null
  job_url: string
  location_country: string | null
  location_city: string | null
  description: string | null
  date_posted: string | null
  is_remote: boolean | null
  job_type: string | null
  min_salary: number | null
  max_salary: number | null
  currency: string | null
  source_site: string | null
  searched_term_combination: string | null
  processed_at: string | null
  min_experience_years: number | null
  visa_sponsorship: boolean | null
  remote_status_ai: string | null
  relevance_reason: string | null
  relevance_score: number | null
  job_role: string | null
  primary_product: string | null
  secondary_product: string | null
  created_at: string
  updated_at: string | null
}

export interface JobSearchParams {
  job_role?: string
  primary_product?: string
  location_country?: string
  job_type?: string
  page?: number
  limit?: number
}

export interface JobSearchResponse {
  jobs: Job[]
  total: number
  hasMore: boolean
  page: number
  limit: number
}

export const JOB_TYPES = [
  { value: "all", label: "All Types" },
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "freelance", label: "Freelance" },
  { value: "internship", label: "Internship" },
] as const

export const COUNTRIES = [
  { value: "all", label: "All Countries" },
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "UK", label: "United Kingdom" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "AU", label: "Australia" },
  { value: "NL", label: "Netherlands" },
  { value: "SE", label: "Sweden" },
  { value: "DK", label: "Denmark" },
  { value: "NO", label: "Norway" },
] as const
