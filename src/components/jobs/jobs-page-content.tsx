"use client"

import { useState, useEffect } from "react"
import { JobSearchBar } from "./job-search-bar"
import { JobFilters, JobFilters as JobFiltersType } from "./job-filters-simple"
import { JobCard } from "./job-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Job, JobSearchResponse } from "@/lib/types/jobs"
import { UserProfile } from "@/lib/database.types"

interface JobsPageContentProps {
  profile: UserProfile | null
}

export function JobsPageContent({ profile }: JobsPageContentProps) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchParams, setSearchParams] = useState({
    job_role: "all",
    primary_product: "all",
    location_country: "all",
    job_type: "all",
  })
  const [filters, setFilters] = useState<JobFiltersType>({})
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)

  const fetchJobs = async (
    newPage = 1,
    resetJobs = true,
    customSearchParams = searchParams,
    customFilters = filters,
  ) => {
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
      if (customFilters.visaSponsorship) params.append("visa_sponsorship", "true")

      const response = await fetch(`/api/jobs?${params}`)

      if (!response.ok) {
        throw new Error("Failed to fetch jobs")
      }

      const data: JobSearchResponse = await response.json()

      if (resetJobs) {
        setJobs(data.jobs)
      } else {
        setJobs((prev) => [...prev, ...data.jobs])
      }

      setHasMore(data.hasMore)
      setTotal(data.total)
      setPage(newPage)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchJobs()
  }, [])

  const handleSearch = (params: typeof searchParams) => {
    setSearchParams(params)
    setPage(1)
    fetchJobs(1, true, params, filters)
  }

  const handleFiltersChange = (newFilters: JobFiltersType) => {
    setFilters(newFilters)
    setPage(1)
    fetchJobs(1, true, searchParams, newFilters)
  }

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchJobs(page + 1, false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <JobSearchBar profile={profile} onSearch={handleSearch} />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <JobFilters onFiltersChange={handleFiltersChange} appliedFilters={filters} />
        </div>

        {/* Jobs Results */}
        <div className="lg:col-span-3">
          {/* Results Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold">Job Results</h2>
              <p className="text-sm text-muted-foreground">{loading ? "Loading..." : `${total} jobs found`}</p>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Jobs Grid */}
          <div className="space-y-4">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}

            {/* Loading Skeletons */}
            {loading && jobs.length === 0 && (
              <div className="space-y-4">
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
              </div>
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

            {/* Load More Button */}
            {hasMore && !loading && (
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
      </div>
    </div>
  )
}
