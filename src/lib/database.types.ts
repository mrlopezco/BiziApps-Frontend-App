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
  created_at: string
  updated_at: string
}
