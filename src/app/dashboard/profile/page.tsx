import { DashboardPageHeader } from "@/components/dashboard/layout/dashboard-page-header"
import { ProfileFormServer } from "@/components/dashboard/profile/profile-form-server"
import { getProfile } from "@/lib/profile-actions"

export default async function ProfilePage() {
  const profile = await getProfile()

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
      <DashboardPageHeader pageTitle="Profile" />
      <div className="grid flex-1 items-start gap-6 p-0">
        <ProfileFormServer profile={profile} />
      </div>
    </main>
  )
}
