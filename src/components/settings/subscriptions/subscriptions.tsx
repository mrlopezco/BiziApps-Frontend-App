import { SubscriptionDetail } from "@/components/settings/subscriptions/components/subscription-detail"
import { NoSubscriptionView } from "@/components/settings/subscriptions/views/no-subscription-view"
import { MultipleSubscriptionsView } from "@/components/settings/subscriptions/views/multiple-subscriptions-view"
import { SubscriptionErrorView } from "@/components/settings/subscriptions/views/subscription-error-view"
import { getSubscriptions } from "@/utils/paddle/get-subscriptions"

export async function Subscriptions() {
  const { data: subscriptions } = await getSubscriptions()

  if (subscriptions) {
    if (subscriptions.length === 0) {
      return <NoSubscriptionView />
    } else if (subscriptions.length === 1) {
      return <SubscriptionDetail subscriptionId={subscriptions[0].id} />
    } else {
      return <MultipleSubscriptionsView subscriptions={subscriptions} />
    }
  } else {
    return <SubscriptionErrorView />
  }
}
