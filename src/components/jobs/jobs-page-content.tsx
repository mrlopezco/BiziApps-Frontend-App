"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { JobFilters as JobFiltersType } from "./job-search-bar" // Ensure JobFiltersType includes visaSponsorship
import { JobDetailsDialog } from "./job-details-dialog"
import { JobDataTable } from "./job-data-table"
import { SaveSearchDialog } from "./save-search-dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
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
  const [total, setTotal] = useState(0)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

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
        if (customFilters.hasSalary) params.append("hasSalary", "true")
        // This line assumes customFilters (JobFiltersType) now includes visaSponsorship

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

        setTotal(data.total)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    },
    [searchParams, filters], // Dependencies for useCallback: fetchJobs will only change if searchParams or filters change
  )

  // Load jobs when search params or filters change
  useEffect(() => {
    fetchJobs(1, true, searchParams, filters)
  }, [fetchJobs, searchParams, filters]) // Add fetchJobs to the dependency array

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

  return (
    <div className="space-y-6">
      {/* Main Content */}
      <div id="jobs-results" className="p-6 rounded-lg">
        {/* Jobs Results */}
        <div>
          {/* Results Header */}
          <div className="flex flex-col justify-between items-center mb-6">
            <div className="flex flex-col w-full items-start">
              <div className="flex items-center justify-between w-full mb-4">
                <div className="flex items-baseline gap-2">
                  <h2 className="text- font-semibold">Recommended Jobs</h2>
                  <div className="bg-primary hover:bg-primary/90 text-primary-foreground px-2 py-1 border-secondary border-1 rounded-md">
                    <p className="">{loading ? "Loading..." : `${total}`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <SaveSearchDialog searchParams={searchParams} filters={filters} />
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

          {/* Jobs Table */}
          <JobDataTable
            jobs={jobs}
            onJobSelect={handleJobSelect}
            loading={loading && jobs.length === 0}
            externalSorting={false}
          />

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
        </div>
      </div>

      {/* Job Details Dialog */}
      <JobDetailsDialog job={selectedJob} open={dialogOpen} onOpenChange={handleDialogClose} />
    </div>
  )
}
