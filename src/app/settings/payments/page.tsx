import { PaymentsContent } from "@/components/settings/payments/payments-content"
import { LoadingScreen } from "@/components/settings/layout/loading-screen"
import { Suspense } from "react"

export default async function PaymentsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
      <Suspense fallback={<LoadingScreen />}>
        <PaymentsContent subscriptionId={""} />
      </Suspense>
    </main>
  )
}
