"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { JobFilters as JobFiltersType } from "./job-search-bar" // Ensure JobFiltersType includes visaSponsorship
import { JobPostingCard } from "./job-posting-card"
import { JobDetailsDialog } from "./job-details-dialog"
import { JobDataTable } from "./job-data-table"
import { JobViewToggle, ViewType } from "./job-view-toggle"
import { JobSortDropdown, SortOption, sortJobs } from "./job-sort-dropdown"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Job, JobSearchResponse } from "@/lib/types/jobs"
import { UserProfile } from "@/lib/database.types"

interface JobsPageContentProps {
  profile: UserProfile | null
  searchParams: {
    job_role: string
    primary_product: string
    location_country: string
    job_type: string
  }
  filters: JobFiltersType
  onSearch: (params: { job_role: string; primary_product: string; location_country: string; job_type: string }) => void
  onFiltersChange: (filters: JobFiltersType) => void
}

export function JobsPageContent({ searchParams, filters }: JobsPageContentProps) {
  const router = useRouter()
  const urlSearchParams = useSearchParams()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewType, setViewType] = useState<ViewType>("cards")
  const [sortOption, setSortOption] = useState<SortOption>("featured")

  // Wrap fetchJobs in useCallback to memoize it and prevent unnecessary re-renders
  const fetchJobs = useCallback(
    async (newPage = 1, resetJobs = true, customSearchParams = searchParams, customFilters = filters) => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          ...customSearchParams,
          page: newPage.toString(),
          limit: "20",
        })

        // Add filters to params
        if (customFilters.remote) params.append("remote", "true")
        // This line assumes customFilters (JobFiltersType) now includes visaSponsorship

        const response = await fetch(`/api/jobs?${params}`)

        if (!response.ok) {
          throw new Error("Failed to fetch jobs")
        }

        const data: JobSearchResponse = await response.json()

        if (resetJobs) {
          setJobs(sortJobs(data.jobs, sortOption))
        } else {
          setJobs((prev) => sortJobs([...prev, ...data.jobs], sortOption))
        }

        setHasMore(data.hasMore)
        setTotal(data.total)
        setPage(newPage)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    },
    [searchParams, filters, sortOption], // Dependencies for useCallback: fetchJobs will only change if searchParams, filters, or sortOption change
  )

  // Load jobs when search params, filters, or sort option change
  useEffect(() => {
    fetchJobs(1, true, searchParams, filters)
  }, [fetchJobs, searchParams, filters]) // Add fetchJobs to the dependency array

  // Apply sorting when sort option changes (for existing jobs)
  useEffect(() => {
    if (jobs.length > 0) {
      setJobs((prevJobs) => sortJobs(prevJobs, sortOption))
    }
  }, [sortOption, jobs.length]) // Re-sort existing jobs when sort option changes

  // Handle URL-based job selection
  useEffect(() => {
    const jobId = urlSearchParams.get("job")
    if (jobId && jobs.length > 0) {
      const job = jobs.find((j) => j.id === jobId)
      if (job) {
        setSelectedJob(job)
        setDialogOpen(true)
      }
    } else {
      setDialogOpen(false)
      setSelectedJob(null)
    }
  }, [urlSearchParams, jobs])

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job)
    setDialogOpen(true)

    // Update URL with job ID for SEO
    const params = new URLSearchParams(urlSearchParams.toString())
    params.set("job", job.id)
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setSelectedJob(null)

    // Remove job ID from URL
    const params = new URLSearchParams(urlSearchParams.toString())
    params.delete("job")
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname
    router.push(newUrl, { scroll: false })
  }

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchJobs(page + 1, false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Main Content */}
      <div id="jobs-results" className="p-6 rounded-lg">
        {/* Jobs Results */}
        <div>
          {/* Results Header */}
          <div className="flex flex-col justify-between items-center mb-6">
            <div className="flex flex-col w-full items-start mb-6">
              <div className="flex items-center justify-between w-full mb-4">
                <div className="flex items-baseline gap-2">
                  <h2 className="text-xl font-semibold">Recommended Jobs</h2>
                  <div className="bg-primary hover:bg-primary/90 text-primary-foreground px-2 py-1 border-secondary border-1 rounded-md">
                    <p className="">{loading ? "Loading..." : `${total}`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <JobSortDropdown currentSort={sortOption} onSortChange={setSortOption} />
                  <JobViewToggle view={viewType} onViewChange={setViewType} />
                </div>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Jobs Content */}
          {viewType === "cards" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {jobs.map((job) => (
                <JobPostingCard key={job.id} job={job} onViewDetails={() => handleJobSelect(job)} />
              ))}

              {/* Loading Skeletons */}
              {loading && jobs.length === 0 && (
                <>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="bg-background/50 backdrop-blur-[24px] border border-border rounded-lg p-6">
                      <div className="space-y-3">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <div className="flex gap-2">
                          <Skeleton className="h-6 w-16" />
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-6 w-24" />
                        </div>
                        <Skeleton className="h-16 w-full" />
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          ) : (
            <JobDataTable
              jobs={jobs}
              onJobSelect={handleJobSelect}
              loading={loading && jobs.length === 0}
              externalSorting={true}
            />
          )}

          {/* Empty State */}
          {!loading && jobs.length === 0 && !error && (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No jobs found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or filters to find more opportunities.
              </p>
              <Button onClick={() => fetchJobs(1, true)} variant="outline">
                Refresh Results
              </Button>
            </div>
          )}

          {/* Load More Button - Only show for cards view */}
          {viewType === "cards" && hasMore && !loading && (
            <div className="flex justify-center pt-6">
              <Button onClick={handleLoadMore} variant="outline" size="lg">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  "Load More Jobs"
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Job Details Dialog */}
      <JobDetailsDialog job={selectedJob} open={dialogOpen} onOpenChange={handleDialogClose} />
    </div>
  )
}
