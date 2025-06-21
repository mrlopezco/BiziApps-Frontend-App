export interface Subscription {
  subscriptionId: string
  subscriptionStatus: string
  priceId: string
  productId: string
  scheduledChange: string
  customerId: string
  customerEmail: string
}

import { JobRole, PrimaryProduct } from "./constants/job-options"

export interface UserProfile {
  id: string
  first_name: string | null
  last_name: string | null
  bio: string | null
  avatar: string | null
  job_roles: JobRole[]
  primary_products: PrimaryProduct[]
  hide_hidden_jobs: boolean
  created_at: string
  updated_at: string
}

export interface SavedSearch {
  id: string
  user_id: string
  name: string
  description: string | null
  job_role: string | null
  primary_product: string | null
  location_country: string | null
  job_type: string | null
  remote: boolean | null
  has_salary: boolean | null
  created_at: string
  updated_at: string
  last_used_at: string
}
