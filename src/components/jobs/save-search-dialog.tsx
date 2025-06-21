"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Bookmark, Save } from "lucide-react"
import { createSavedSearch, SavedSearchFormData } from "@/lib/actions/saved-searches"
import { toast } from "@/components/ui/use-toast"

interface SaveSearchDialogProps {
  searchParams: {
    job_role: string
    primary_product: string
    location_country: string
    job_type: string
  }
  filters: {
    remote?: boolean
    hasSalary?: boolean
  }
}

export function SaveSearchDialog({ searchParams, filters }: SaveSearchDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  const hasActiveFilters = () => {
    return (
      (searchParams.job_role && searchParams.job_role !== "all") ||
      (searchParams.primary_product && searchParams.primary_product !== "all") ||
      (searchParams.location_country && searchParams.location_country !== "all") ||
      (searchParams.job_type && searchParams.job_type !== "all") ||
      filters.remote ||
      filters.hasSalary
    )
  }

  const getFilterSummary = () => {
    const activeParts = []

    if (searchParams.job_role && searchParams.job_role !== "all") {
      activeParts.push(searchParams.job_role.replace(/_/g, " "))
    }
    if (searchParams.primary_product && searchParams.primary_product !== "all") {
      activeParts.push(searchParams.primary_product.replace(/_/g, " "))
    }
    if (searchParams.location_country && searchParams.location_country !== "all") {
      activeParts.push(searchParams.location_country.replace(/_/g, " "))
    }
    if (searchParams.job_type && searchParams.job_type !== "all") {
      activeParts.push(searchParams.job_type.replace(/_/g, " "))
    }
    if (filters.remote) {
      activeParts.push("Remote")
    }
    if (filters.hasSalary) {
      activeParts.push("With Salary")
    }

    return activeParts.length > 0 ? activeParts.join(", ") : "No specific filters"
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for your search.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const data: SavedSearchFormData = {
        name: name.trim(),
        description: description.trim() || undefined,
        job_role: searchParams.job_role,
        primary_product: searchParams.primary_product,
        location_country: searchParams.location_country,
        job_type: searchParams.job_type,
        remote: filters.remote,
        has_salary: filters.hasSalary,
      }

      const result = await createSavedSearch(data)

      if (result.success) {
        toast({
          title: "Search Saved",
          description: `Your search "${name}" has been saved successfully.`,
        })
        setOpen(false)
        setName("")
        setDescription("")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save search. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving search:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Don't show the button if no filters are active
  if (!hasActiveFilters()) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Bookmark className="h-4 w-4" />
          Save Search
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Current Search</DialogTitle>
          <DialogDescription>Save your current search filters to quickly access them later.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current filters preview */}
          <div className="p-3 bg-muted rounded-lg">
            <Label className="text-sm font-medium">Current Filters:</Label>
            <p className="text-sm text-muted-foreground mt-1 capitalize">{getFilterSummary()}</p>
          </div>

          {/* Name field */}
          <div className="space-y-2">
            <Label htmlFor="search-name">Search Name *</Label>
            <Input
              id="search-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Frontend Developer Jobs in NY"
              maxLength={255}
            />
          </div>

          {/* Description field */}
          <div className="space-y-2">
            <Label htmlFor="search-description">Description (Optional)</Label>
            <Input
              id="search-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this search"
              maxLength={500}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading} className="gap-2">
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-current" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Search
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
