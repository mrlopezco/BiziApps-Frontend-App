import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { User, Briefcase } from "lucide-react"
import { UserProfile } from "@/lib/database.types"
import { updateProfile } from "@/lib/profile-actions"
import { SubmitButton } from "./profile-form-client"
import { ProfileMessages } from "./profile-messages"
import { JobFieldsClient } from "./job-fields-client"
import { Suspense } from "react"

interface ProfileFormServerProps {
  profile: UserProfile | null
}

export function ProfileFormServer({ profile }: ProfileFormServerProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Suspense fallback={null}>
        <ProfileMessages />
      </Suspense>

      <form action={updateProfile} className="contents">
        {/* Personal Information Card */}
        <Card className="bg-background/50 backdrop-blur-[24px] border-border p-6">
          <CardHeader className="p-0 space-y-0">
            <CardTitle className="flex justify-between items-center pb-6 border-border border-b">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-[#4B4F4F]" />
                  <span className="text-xl font-medium">Personal Information</span>
                </div>
                <span className="text-base leading-4 text-secondary">Manage your personal details and profile</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-6 flex gap-6 flex-col">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-base leading-4 font-medium">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  defaultValue={profile?.first_name || ""}
                  placeholder="Enter your first name"
                  className="border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-base leading-4 font-medium">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  defaultValue={profile?.last_name || ""}
                  placeholder="Enter your last name"
                  className="border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar" className="text-base leading-4 font-medium">
                Avatar URL
              </Label>
              <Input
                id="avatar"
                name="avatar"
                type="url"
                defaultValue={profile?.avatar || ""}
                placeholder="https://example.com/avatar.jpg"
                className="border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-base leading-4 font-medium">
                Bio
              </Label>
              <textarea
                id="bio"
                name="bio"
                defaultValue={profile?.bio || ""}
                placeholder="Tell us a bit about yourself..."
                className="flex min-h-[100px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Professional Information Card */}
        <Card className="bg-background/50 backdrop-blur-[24px] border-border p-6">
          <CardHeader className="p-0 space-y-0">
            <CardTitle className="flex justify-between items-center pb-6 border-border border-b">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-[#4B4F4F]" />
                  <span className="text-xl font-medium">Professional Information</span>
                </div>
                <span className="text-base leading-4 text-secondary">Define your expertise and specializations</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-6 flex gap-6 flex-col">
            <JobFieldsClient
              initialJobRoles={profile?.job_roles || []}
              initialPrimaryProducts={profile?.primary_products || []}
            />
          </CardContent>
        </Card>

        {/* Submit Button Card */}
        <Card className="bg-background/50 backdrop-blur-[24px] border-border p-6 lg:col-span-2">
          <CardContent className="p-0">
            <SubmitButton />
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
