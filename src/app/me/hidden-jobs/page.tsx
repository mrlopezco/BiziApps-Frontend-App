import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { getUserHiddenJobs } from "@/lib/actions/job-interactions"
import { HiddenJobsPageContent } from "@/components/settings/hidden-jobs/hidden-jobs-page-content"

export default async function HiddenJobsPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user) {
    redirect("/login")
  }

  try {
    const hiddenJobs = await getUserHiddenJobs(1, 100) // Get more items for table

    return (
      <div className="bg-grey">
        <div className="container-main px-4 md:px-6 py-8 text-black">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Hidden Jobs</h1>
            <p className="text-muted-foreground mt-2">Jobs you&apos;ve hidden from search results</p>
          </div>
          <HiddenJobsPageContent initialData={hiddenJobs} />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error loading hidden jobs:", error)

    return (
      <div className="bg-grey">
        <div className="container-main px-4 md:px-6 py-8 text-black">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Hidden Jobs</h1>
            <p className="text-muted-foreground mt-2">Jobs you&apos;ve hidden from search results</p>
          </div>

          <div className="text-center py-12">
            <p className="text-muted-foreground">Unable to load hidden jobs. Please try again later.</p>
          </div>
        </div>
      </div>
    )
  }
}
