"use client"

import { useState } from "react"
import { JobWithInteraction } from "@/lib/types/jobs"
import { JobPostingCard } from "@/components/jobs/job-posting-card"
import { JobDetailsDialog } from "@/components/jobs/job-details-dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface BookmarksPageContentProps {
  initialData: {
    jobs: JobWithInteraction[]
    total: number
    hasMore: boolean
    page: number
    limit: number
  }
}

export function BookmarksPageContent({ initialData }: BookmarksPageContentProps) {
  const [jobs, setJobs] = useState<JobWithInteraction[]>(initialData.jobs)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(initialData.page)
  const [hasMore, setHasMore] = useState(initialData.hasMore)
  const [total, setTotal] = useState(initialData.total)
  const [selectedJob, setSelectedJob] = useState<JobWithInteraction | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleJobSelect = (job: JobWithInteraction) => {
    setSelectedJob(job)
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setSelectedJob(null)
  }

  const handleLoadMore = async () => {
    if (loading || !hasMore) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/jobs/bookmarks?page=${page + 1}&limit=20`)
      if (!response.ok) {
        throw new Error("Failed to fetch bookmarked jobs")
      }
      const result = await response.json()
      setJobs((prev) => [...prev, ...result.jobs])
      setPage(result.page)
      setHasMore(result.hasMore)
      setTotal(result.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more jobs")
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/jobs/bookmarks?page=1&limit=20`)
      if (!response.ok) {
        throw new Error("Failed to fetch bookmarked jobs")
      }
      const result = await response.json()
      setJobs(result.jobs)
      setPage(result.page)
      setHasMore(result.hasMore)
      setTotal(result.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh jobs")
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (jobs.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No bookmarked jobs</h3>
        <p className="text-muted-foreground mb-4">Start bookmarking jobs you&apos;re interested in to see them here.</p>
        <Button onClick={handleRefresh} variant="outline">
          Refresh
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-baseline gap-2">
          <h2 className="text-xl font-semibold">Your Bookmarks</h2>
          <div className="bg-primary hover:bg-primary/90 text-primary-foreground px-2 py-1 border-secondary border-1 rounded-md">
            <p>{total}</p>
          </div>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {jobs.map((job) => (
          <JobPostingCard key={job.id} job={job} onViewDetails={() => handleJobSelect(job)} />
        ))}

        {/* Loading Skeletons */}
        {loading && (
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

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-6">
          <Button onClick={handleLoadMore} variant="outline" size="lg" disabled={loading}>
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

      {/* Job Details Dialog */}
      <JobDetailsDialog job={selectedJob} open={dialogOpen} onOpenChange={handleDialogClose} />
    </div>
  )
}
