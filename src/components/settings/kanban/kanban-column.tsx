"use client"

import { JobWithInteraction, KanbanStatus } from "@/lib/types/jobs"
import { KanbanJobCard } from "./kanban-job-card"
import { Badge } from "@/components/ui/badge"

interface KanbanColumnProps {
  column: {
    id: KanbanStatus
    title: string
    jobs: JobWithInteraction[]
    color: string
    headerColor: string
  }
  onMoveJob: (jobId: string, newStatus: KanbanStatus) => void
  onJobSelect: (job: JobWithInteraction) => void
  onUpdateNotes: (jobId: string, notes: string) => void
  isPending: boolean
}

export function KanbanColumn({ column, onMoveJob, onJobSelect, onUpdateNotes, isPending }: KanbanColumnProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const jobId = e.dataTransfer.getData("text/plain")
    if (jobId) {
      onMoveJob(jobId, column.id)
    }
  }

  return (
    <div
      className={`flex flex-col h-full min-h-[600px] rounded-lg border-2 border-dashed ${column.color}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div className={`flex items-center justify-between p-4 rounded-t-lg ${column.headerColor}`}>
        <h3 className="font-semibold text-sm">{column.title}</h3>
        <Badge variant="secondary" className="text-xs">
          {column.jobs.length}
        </Badge>
      </div>

      {/* Column Content */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {column.jobs.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8">
            <p>No jobs yet</p>
            <p className="text-xs mt-1">Drag jobs here to organize them</p>
          </div>
        ) : (
          column.jobs.map((job) => (
            <KanbanJobCard
              key={job.id}
              job={job}
              onJobSelect={onJobSelect}
              onUpdateNotes={onUpdateNotes}
              isPending={isPending}
            />
          ))
        )}
      </div>
    </div>
  )
}
