"use client"

import { useState, useTransition } from "react"
import { JobWithInteraction, KanbanStatus } from "@/lib/types/jobs"
import { updateJobKanbanStatus, updateJobNotes } from "@/lib/actions/job-interactions"
import { KanbanColumn } from "./kanban-column"
import { JobDetailsDialog } from "@/components/jobs/job-details-dialog"

interface KanbanBoardData {
  bookmarked: JobWithInteraction[]
  considering: JobWithInteraction[]
  in_progress: JobWithInteraction[]
  rejected: JobWithInteraction[]
}

interface KanbanBoardContentProps {
  initialData: KanbanBoardData
}

export function KanbanBoardContent({ initialData }: KanbanBoardContentProps) {
  const [data, setData] = useState<KanbanBoardData>(initialData)
  const [selectedJob, setSelectedJob] = useState<JobWithInteraction | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const columns = [
    {
      id: "bookmarked" as KanbanStatus,
      title: "Bookmarked",
      jobs: data.bookmarked,
      color: "bg-blue-50 border-blue-200",
      headerColor: "bg-blue-100 text-blue-800",
    },
    {
      id: "considering" as KanbanStatus,
      title: "Considering Application",
      jobs: data.considering,
      color: "bg-yellow-50 border-yellow-200",
      headerColor: "bg-yellow-100 text-yellow-800",
    },
    {
      id: "in_progress" as KanbanStatus,
      title: "In Progress",
      jobs: data.in_progress,
      color: "bg-green-50 border-green-200",
      headerColor: "bg-green-100 text-green-800",
    },
    {
      id: "rejected" as KanbanStatus,
      title: "Rejected",
      jobs: data.rejected,
      color: "bg-red-50 border-red-200",
      headerColor: "bg-red-100 text-red-800",
    },
  ]

  const handleMoveJob = async (jobId: string, newStatus: KanbanStatus) => {
    // Find the job to move
    const jobToMove = Object.values(data)
      .flat()
      .find((job) => job.id === jobId)

    if (!jobToMove) return

    // Optimistically update the UI
    const newData = { ...data }
    Object.keys(newData).forEach((key) => {
      newData[key as KanbanStatus] = newData[key as KanbanStatus].filter((job) => job.id !== jobId)
    })

    // Update the job's kanban status and add to new column
    const updatedJob = {
      ...jobToMove,
      user_interaction: jobToMove.user_interaction ? { ...jobToMove.user_interaction, kanban_status: newStatus } : null,
    }
    newData[newStatus].push(updatedJob)

    setData(newData)

    // Update the server
    startTransition(async () => {
      const result = await updateJobKanbanStatus(jobId, newStatus)
      if (!result.success) {
        // Revert optimistic update if server update failed
        setData(initialData)
      }
    })
  }

  const handleUpdateNotes = async (jobId: string, notes: string) => {
    startTransition(async () => {
      await updateJobNotes(jobId, notes)
    })
  }

  const handleJobSelect = (job: JobWithInteraction) => {
    setSelectedJob(job)
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setSelectedJob(null)
  }

  return (
    <div className="space-y-6">
      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            onMoveJob={handleMoveJob}
            onJobSelect={handleJobSelect}
            onUpdateNotes={handleUpdateNotes}
            isPending={isPending}
          />
        ))}
      </div>

      {/* Job Details Dialog */}
      <JobDetailsDialog job={selectedJob} open={dialogOpen} onOpenChange={handleDialogClose} />
    </div>
  )
}
