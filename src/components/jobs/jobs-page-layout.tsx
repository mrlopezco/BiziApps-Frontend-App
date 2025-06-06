import { JobsPageContent } from "./jobs-page-content"
import { UserProfile } from "@/lib/database.types"

interface JobsPageLayoutProps {
  profile: UserProfile | null
}

export async function JobsPageLayout({ profile }: JobsPageLayoutProps) {
  return (
    <div className="container-main px-4 md:px-6 py-8">
      <div>
        <JobsPageContent profile={profile} />
      </div>
    </div>
  )
}
