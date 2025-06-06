import { JobsPageContent } from "./jobs-page-content"
import { UserProfile } from "@/lib/database.types"

interface JobsPageLayoutProps {
  profile: UserProfile | null
}

export async function JobsPageLayout({ profile }: JobsPageLayoutProps) {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Find Your Next Opportunity</h1>
          <p className="text-muted-foreground text-lg">Discover Microsoft ecosystem jobs tailored to your expertise</p>
        </div>

        <JobsPageContent profile={profile} />
      </div>
    </div>
  )
}
