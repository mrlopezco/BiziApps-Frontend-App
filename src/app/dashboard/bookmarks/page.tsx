import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { getUserBookmarkedJobs } from "@/lib/actions/job-interactions"
import { BookmarksPageContent } from "@/components/dashboard/bookmarks/bookmarks-page-content"

export default async function BookmarksPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user) {
    redirect("/login")
  }

  try {
    const bookmarkedJobs = await getUserBookmarkedJobs(1, 20)

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Bookmarked Jobs</h1>
          <p className="text-muted-foreground mt-2">Jobs you&apos;ve saved for later review</p>
        </div>

        <BookmarksPageContent initialData={bookmarkedJobs} />
      </div>
    )
  } catch (error) {
    console.error("Error loading bookmarked jobs:", error)

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Bookmarked Jobs</h1>
          <p className="text-muted-foreground mt-2">Jobs you&apos;ve saved for later review</p>
        </div>

        <div className="text-center py-12">
          <p className="text-muted-foreground">Unable to load bookmarked jobs. Please try again later.</p>
        </div>
      </div>
    )
  }
}
