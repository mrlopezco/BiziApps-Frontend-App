import { ProfileFormServer } from "@/components/settings/profile/profile-form-server"
import { getProfile } from "@/lib/profile-actions"

export default async function ProfilePage() {
  const profile = await getProfile()

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8 min-h-screen">
      <div className="grid flex-1 items-start gap-6 p-0">
        <ProfileFormServer profile={profile} />
      </div>
    </main>
  )
}
