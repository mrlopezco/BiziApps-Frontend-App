"use client"

import { useState } from "react"
import { JobWithInteraction } from "@/lib/types/jobs"
import { JobDataTable } from "@/components/jobs/job-data-table"
import { JobDetailsDialog } from "@/components/jobs/job-details-dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
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

  const handleRefresh = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/jobs/bookmarks?page=1&limit=100`) // Get more items for table
      if (!response.ok) {
        throw new Error("Failed to fetch bookmarked jobs")
      }
      const result = await response.json()
      setJobs(result.jobs)
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
          <div className="bg-primary hover:bg-primary/90 text-primary-foreground px-2 py-1 border-secondary border-1 rounded-md">
            <p>{total} bookmarked jobs</p>
          </div>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {/* Jobs Table */}
      <JobDataTable
        jobs={jobs}
        onJobSelect={handleJobSelect}
        loading={loading && jobs.length === 0}
        externalSorting={false}
      />

      {/* Job Details Dialog */}
      <JobDetailsDialog job={selectedJob} open={dialogOpen} onOpenChange={handleDialogClose} />
    </div>
  )
}
