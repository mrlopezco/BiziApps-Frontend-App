import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getUserBookmarkedJobs } from "@/lib/actions/job-interactions"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    // Get bookmarked jobs
    const result = await getUserBookmarkedJobs(page, limit)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching bookmarked jobs:", error)
    return NextResponse.json({ error: "Failed to fetch bookmarked jobs" }, { status: 500 })
  }
}
