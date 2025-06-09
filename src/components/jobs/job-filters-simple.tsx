"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Filter, X } from "lucide-react"

interface JobFiltersProps {
  onFiltersChange: (filters: JobFilters) => void
  appliedFilters: JobFilters
}

export interface JobFilters {
  remote?: boolean
  salaryRange?: [number, number]
  experienceYears?: [number, number]
}

export function JobFilters({ onFiltersChange, appliedFilters }: JobFiltersProps) {
  const [filters, setFilters] = useState<JobFilters>(appliedFilters)

  const handleFilterChange = (key: keyof JobFilters, value: boolean | [number, number] | undefined) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const emptyFilters: JobFilters = {}
    setFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  const hasActiveFilters = Object.keys(filters).some((key) => {
    const value = filters[key as keyof JobFilters]
    return value !== undefined && value !== null && value !== false
  })

  return (
    <Card className="bg-background/50 backdrop-blur-[24px] border-border sticky top-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-lg">Filters</CardTitle>
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-8 px-2">
              <X className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Remote Work */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Work Type</h4>
          <Button
            variant={filters.remote ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange("remote", !filters.remote)}
            className="w-full justify-start"
          >
            Remote Work
          </Button>
        </div>

        <Separator />

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Active Filters</h4>
              <div className="flex flex-wrap gap-1">
                {filters.remote && (
                  <Badge variant="secondary" className="text-xs">
                    Remote
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
