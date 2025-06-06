import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User } from "lucide-react"
import { UserProfile } from "@/lib/database.types"
import { updateProfile } from "@/lib/profile-actions"
import { SubmitButton } from "./profile-form-client"
import { ProfileMessages } from "./profile-messages"
import { Suspense } from "react"

interface ProfileFormServerProps {
  profile: UserProfile | null
}

export function ProfileFormServer({ profile }: ProfileFormServerProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Settings
        </CardTitle>
        <CardDescription>Manage your personal information and profile details.</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={null}>
          <ProfileMessages />
        </Suspense>
        <form action={updateProfile} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                defaultValue={profile?.first_name || ""}
                placeholder="Enter your first name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                defaultValue={profile?.last_name || ""}
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar">Avatar URL</Label>
            <Input
              id="avatar"
              name="avatar"
              type="url"
              defaultValue={profile?.avatar || ""}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              name="bio"
              defaultValue={profile?.bio || ""}
              placeholder="Tell us a bit about yourself..."
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  )
}
