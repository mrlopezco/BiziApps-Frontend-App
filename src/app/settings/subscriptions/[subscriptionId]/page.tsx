"use client"

import { LoadingScreen } from "@/components/settings/layout/loading-screen"
import { Suspense } from "react"
import { useParams } from "next/navigation"
import { SubscriptionDetail } from "@/components/settings/subscriptions/components/subscription-detail"

export default function SubscriptionPage() {
  const { subscriptionId } = useParams<{ subscriptionId: string }>()
  return (
    <main className="p-4 lg:gap-6 lg:p-8">
      <Suspense fallback={<LoadingScreen />}>
        <SubscriptionDetail subscriptionId={subscriptionId} />
      </Suspense>
    </main>
  )
}
