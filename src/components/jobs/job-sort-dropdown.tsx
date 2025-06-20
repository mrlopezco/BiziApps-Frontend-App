"use client"

import { ChevronDown, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type SortOption = "featured" | "date-desc" | "date-asc" | "title-asc" | "title-desc"

export interface SortConfig {
  option: SortOption
  label: string
}

const SORT_OPTIONS: SortConfig[] = [
  { option: "featured", label: "Featured" },
  { option: "date-desc", label: "Newest First" },
  { option: "date-asc", label: "Oldest First" },
  { option: "title-asc", label: "Title A-Z" },
  { option: "title-desc", label: "Title Z-A" },
]

interface JobSortDropdownProps {
  currentSort: SortOption
  onSortChange: (sort: SortOption) => void
  className?: string
}

export function JobSortDropdown({ currentSort, onSortChange, className }: JobSortDropdownProps) {
  const currentSortConfig = SORT_OPTIONS.find((option) => option.option === currentSort)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <ArrowUpDown className="mr-2 h-4 w-4" />
          Sort: {currentSortConfig?.label || "Featured"}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {SORT_OPTIONS.map((sortOption) => (
          <DropdownMenuItem
            key={sortOption.option}
            onClick={() => onSortChange(sortOption.option)}
            className={currentSort === sortOption.option ? "bg-accent" : ""}
          >
            {sortOption.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Utility function to sort jobs based on the selected option
export function sortJobs<
  T extends {
    date_posted?: string | null
    relevance_score?: number | null
    title: string
  },
>(jobs: T[], sortOption: SortOption): T[] {
  const jobsCopy = [...jobs]

  switch (sortOption) {
    case "featured":
      return jobsCopy.sort((a, b) => {
        // Featured sorting: combination of recency and relevance
        // First, sort by relevance score (higher is better)
        const aRelevance = a.relevance_score || 0
        const bRelevance = b.relevance_score || 0

        // If relevance scores are significantly different (difference > 2), use relevance
        if (Math.abs(aRelevance - bRelevance) > 2) {
          return bRelevance - aRelevance
        }

        // If relevance is similar, prefer newer posts
        const aDate = a.date_posted ? new Date(a.date_posted).getTime() : 0
        const bDate = b.date_posted ? new Date(b.date_posted).getTime() : 0

        return bDate - aDate
      })

    case "date-desc":
      return jobsCopy.sort((a, b) => {
        const aDate = a.date_posted ? new Date(a.date_posted).getTime() : 0
        const bDate = b.date_posted ? new Date(b.date_posted).getTime() : 0
        return bDate - aDate
      })

    case "date-asc":
      return jobsCopy.sort((a, b) => {
        const aDate = a.date_posted ? new Date(a.date_posted).getTime() : 0
        const bDate = b.date_posted ? new Date(b.date_posted).getTime() : 0
        return aDate - bDate
      })

    case "title-asc":
      return jobsCopy.sort((a, b) => a.title.localeCompare(b.title))

    case "title-desc":
      return jobsCopy.sort((a, b) => b.title.localeCompare(a.title))

    default:
      return jobsCopy
  }
}
