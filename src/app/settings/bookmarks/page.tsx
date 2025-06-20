import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { getUserBookmarkedJobs } from "@/lib/actions/job-interactions"
import { BookmarksPageContent } from "@/components/settings/bookmarks/bookmarks-page-content"

export default async function BookmarksPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user) {
    redirect("/login")
  }

  try {
    const bookmarkedJobs = await getUserBookmarkedJobs(1, 100) // Get more items for table

    return (
      <div className="bg-grey">
        <div className="container-main px-4 md:px-6 py-8 text-black">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Bookmarked Jobs</h1>
            <p className="text-muted-foreground mt-2">Jobs you&apos;ve saved for later review</p>
          </div>
          <BookmarksPageContent initialData={bookmarkedJobs} />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error loading bookmarked jobs:", error)

    return (
      <div className="bg-grey">
        <div className="container-main px-4 md:px-6 py-8 text-black">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Bookmarked Jobs</h1>
            <p className="text-muted-foreground mt-2">Jobs you&apos;ve saved for later review</p>
          </div>

          <div className="text-center py-12">
            <p className="text-muted-foreground">Unable to load bookmarked jobs. Please try again later.</p>
          </div>
        </div>
      </div>
    )
  }
}
