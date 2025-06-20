"use client"

import { LayoutGrid, Table } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type ViewType = "cards" | "table"

interface JobViewToggleProps {
  view: ViewType
  onViewChange: (view: ViewType) => void
  className?: string
}

export function JobViewToggle({ view, onViewChange, className }: JobViewToggleProps) {
  return (
    <div className={cn("flex items-center rounded-md border p-1", className)}>
      <Button
        variant={view === "cards" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onViewChange("cards")}
        className="h-8 px-3"
      >
        <LayoutGrid className="h-4 w-4 mr-2" />
        Cards
      </Button>
      <Button
        variant={view === "table" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onViewChange("table")}
        className="h-8 px-3"
      >
        <Table className="h-4 w-4 mr-2" />
        Table
      </Button>
    </div>
  )
}
