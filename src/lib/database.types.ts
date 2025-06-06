export interface Subscription {
  subscriptionId: string
  subscriptionStatus: string
  priceId: string
  productId: string
  scheduledChange: string
  customerId: string
  customerEmail: string
}

export interface UserProfile {
  id: string
  first_name: string | null
  last_name: string | null
  bio: string | null
  avatar: string | null
  created_at: string
  updated_at: string
}
