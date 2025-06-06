import { ProfileFormServer } from "@/components/dashboard/profile/profile-form-server"
import { getProfile } from "@/lib/profile-actions"

export default async function ProfilePage() {
  const profile = await getProfile()

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your account profile and personal information.</p>
      </div>
      <ProfileFormServer profile={profile} />
    </div>
  )
}
