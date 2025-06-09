import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { JobSearchResponse, JobWithInteraction } from "@/lib/types/jobs"
import { getUserJobInteractions } from "@/lib/actions/job-interactions"

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
    const job_role = searchParams.get("job_role")
    const primary_product = searchParams.get("primary_product")
    const location_country = searchParams.get("location_country")
    const job_type = searchParams.get("job_type")
    const remote = searchParams.get("remote")
    const visa_sponsorship = searchParams.get("visa_sponsorship")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    // Calculate offset
    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from("transformed_jobs")
      .select(
        `
        *,
        company:transformed_companies(*)
      `,
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (job_role && job_role !== "all") {
      query = query.eq("job_role", job_role)
    }

    if (primary_product && primary_product !== "all") {
      query = query.eq("primary_product", primary_product)
    }

    if (location_country && location_country !== "all") {
      query = query.eq("location_country", location_country)
    }

    if (job_type && job_type !== "all") {
      query = query.eq("job_type", job_type)
    }

    if (remote === "true") {
      query = query.eq("is_remote", true)
    }

    if (visa_sponsorship === "true") {
      query = query.eq("visa_sponsorship", true)
    }

    // Execute query
    const { data: jobs, count, error } = await query

    if (error) {
      console.error("Error fetching jobs:", error)
      return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
    }

    // Get user interactions for these jobs
    const jobIds = jobs?.map((job) => job.id) || []
    const userInteractions = await getUserJobInteractions(jobIds)

    // Combine jobs with user interactions
    const jobsWithInteractions: JobWithInteraction[] = (jobs || []).map((job) => ({
      ...job,
      user_interaction: userInteractions[job.id] || null,
    }))

    const total = count || 0
    const hasMore = offset + limit < total

    const response: JobSearchResponse = {
      jobs: jobsWithInteractions,
      total,
      hasMore,
      page,
      limit,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
