"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { X, Filter } from "lucide-react"
import { getAllJobConstantsClient } from "@/lib/cache/job-constants-client"
import { UserProfile } from "@/lib/database.types"

interface JobSearchBarProps {
  profile: UserProfile | null
  onSearch: (params: { job_role: string; primary_product: string; location_country: string; job_type: string }) => void
  onFiltersChange: (filters: JobFilters) => void
  appliedFilters: JobFilters
}

export interface JobFilters {
  remote?: boolean
  visaSponsorship?: boolean
}

interface JobConstants {
  jobRoles: Array<{ value: string; label: string }>
  primaryProducts: Array<{ value: string; label: string }>
  jobTypes: Array<{ value: string; label: string }>
  countries: Array<{ value: string; label: string }>
}

interface FilterDialogProps {
  title: string
  options: Array<{ value: string; label: string }>
  currentValue: string
  onApply: (value: string) => void
  onClear: () => void
  children: React.ReactNode
}

function FilterDialog({ title, options, currentValue, onApply, onClear, children }: FilterDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState(currentValue)

  useEffect(() => {
    setSelectedValue(currentValue)
  }, [currentValue, isOpen])

  const handleApply = () => {
    onApply(selectedValue)
    setIsOpen(false)
  }

  const handleClear = () => {
    onClear()
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={selectedValue} onValueChange={setSelectedValue}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${title.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2 pt-4">
            <Button onClick={handleApply} className="flex-1">
              Apply Filter
            </Button>
            <Button onClick={handleClear} variant="outline" className="flex-1">
              Clear All
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface BooleanFilterDialogProps {
  title: string
  description: string
  currentValue: boolean
  onApply: (value: boolean) => void
  onClear: () => void
  children: React.ReactNode
}

function BooleanFilterDialog({
  title,
  description,
  currentValue,
  onApply,
  onClear,
  children,
}: BooleanFilterDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState(currentValue)

  useEffect(() => {
    setSelectedValue(currentValue)
  }, [currentValue, isOpen])

  const handleApply = () => {
    onApply(selectedValue)
    setIsOpen(false)
  }

  const handleClear = () => {
    onClear()
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id={title.toLowerCase().replace(/\s+/g, "-")}
              checked={selectedValue}
              onCheckedChange={setSelectedValue}
            />
            <Label htmlFor={title.toLowerCase().replace(/\s+/g, "-")} className="text-sm">
              {description}
            </Label>
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={handleApply} className="flex-1">
              Apply Filter
            </Button>
            <Button onClick={handleClear} variant="outline" className="flex-1">
              Clear All
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function JobSearchBar({ profile, onSearch, onFiltersChange, appliedFilters }: JobSearchBarProps) {
  const [jobRole, setJobRole] = useState<string>("all")
  const [primaryProduct, setPrimaryProduct] = useState<string>("all")
  const [locationCountry, setLocationCountry] = useState<string>("all")
  const [jobType, setJobType] = useState<string>("all")
  const [filters, setFilters] = useState<JobFilters>(appliedFilters)
  const [constants, setConstants] = useState<JobConstants | null>(null)
  const [loading, setLoading] = useState(true)

  // Load constants from cache/database
  useEffect(() => {
    async function loadConstants() {
      try {
        const data = await getAllJobConstantsClient()
        setConstants(data)
      } catch (error) {
        console.error("Failed to load job constants:", error)
        // Set fallback constants if needed
        setConstants({
          jobRoles: [{ value: "all", label: "All Roles" }],
          primaryProducts: [{ value: "all", label: "All Products" }],
          jobTypes: [{ value: "all", label: "All Types" }],
          countries: [{ value: "all", label: "All Countries" }],
        })
      } finally {
        setLoading(false)
      }
    }

    loadConstants()
  }, [])

  // Initialize with profile defaults
  useEffect(() => {
    if (profile?.job_roles && profile.job_roles.length > 0) {
      setJobRole(profile.job_roles[0])
    }
    if (profile?.primary_products && profile.primary_products.length > 0) {
      setPrimaryProduct(profile.primary_products[0])
    }
  }, [profile])

  // Auto-execute search when filters change
  useEffect(() => {
    if (!loading && constants) {
      onSearch({
        job_role: jobRole,
        primary_product: primaryProduct,
        location_country: locationCountry,
        job_type: jobType,
      })
    }
  }, [jobRole, primaryProduct, locationCountry, jobType, loading, constants])

  // Auto-execute filters change
  useEffect(() => {
    if (!loading && constants) {
      onFiltersChange(filters)
    }
  }, [filters, loading, constants])

  const handleJobRoleChange = (value: string) => {
    setJobRole(value)
  }

  const handlePrimaryProductChange = (value: string) => {
    setPrimaryProduct(value)
  }

  const handleLocationCountryChange = (value: string) => {
    setLocationCountry(value)
  }

  const handleJobTypeChange = (value: string) => {
    setJobType(value)
  }

  const handleRemoteFilterChange = (value: boolean) => {
    const newFilters = { ...filters, remote: value || undefined }
    setFilters(newFilters)
  }

  const handleVisaSponsorshipFilterChange = (value: boolean) => {
    const newFilters = { ...filters, visaSponsorship: value || undefined }
    setFilters(newFilters)
  }

  const clearJobRole = () => setJobRole("all")
  const clearPrimaryProduct = () => setPrimaryProduct("all")
  const clearLocationCountry = () => setLocationCountry("all")
  const clearJobType = () => setJobType("all")
  const clearRemoteFilter = () => {
    const newFilters = { ...filters }
    delete newFilters.remote
    setFilters(newFilters)
  }
  const clearVisaSponsorshipFilter = () => {
    const newFilters = { ...filters }
    delete newFilters.visaSponsorship
    setFilters(newFilters)
  }

  if (loading || !constants) {
    return (
      <div className="w-full bg-background/50 backdrop-blur-[24px] border border-border rounded-lg p-6">
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 w-24 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  // Enhanced options with "All" option
  const jobRoleOptions = [{ value: "all", label: "All Roles" }, ...constants.jobRoles]
  const primaryProductOptions = [{ value: "all", label: "All Products" }, ...constants.primaryProducts]
  const countryOptions = [{ value: "all", label: "All Countries" }, ...constants.countries]
  const jobTypeOptions = [{ value: "all", label: "All Types" }, ...constants.jobTypes]

  // Helper function to get display label
  const getDisplayLabel = (value: string, options: Array<{ value: string; label: string }>) => {
    const option = options.find((opt) => opt.value === value)
    return option ? option.label : value
  }

  const isFilterActive = (value: string) => value !== "all"
  const isBooleanFilterActive = (value: boolean | undefined) => value === true

  const hasAnyActiveFilters = () => {
    return (
      isFilterActive(jobRole) ||
      isFilterActive(primaryProduct) ||
      isFilterActive(locationCountry) ||
      isFilterActive(jobType) ||
      isBooleanFilterActive(filters.remote) ||
      isBooleanFilterActive(filters.visaSponsorship)
    )
  }

  return (
    <div className="w-full bg-background/50 backdrop-blur-[24px] border border-border rounded-lg p-6">
      <div className="flex flex-wrap gap-3">
        {/* Job Role Filter */}
        <FilterDialog
          title="Job Role"
          options={jobRoleOptions}
          currentValue={jobRole}
          onApply={handleJobRoleChange}
          onClear={clearJobRole}
        >
          <Button variant={isFilterActive(jobRole) ? "default" : "outline"} size="sm" className="h-10">
            <Filter className="h-4 w-4 mr-2" />
            {getDisplayLabel(jobRole, jobRoleOptions)}
            {isFilterActive(jobRole) && (
              <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                1
              </Badge>
            )}
          </Button>
        </FilterDialog>

        {/* Primary Product Filter */}
        <FilterDialog
          title="Primary Product"
          options={primaryProductOptions}
          currentValue={primaryProduct}
          onApply={handlePrimaryProductChange}
          onClear={clearPrimaryProduct}
        >
          <Button variant={isFilterActive(primaryProduct) ? "default" : "outline"} size="sm" className="h-10">
            <Filter className="h-4 w-4 mr-2" />
            {getDisplayLabel(primaryProduct, primaryProductOptions)}
            {isFilterActive(primaryProduct) && (
              <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                1
              </Badge>
            )}
          </Button>
        </FilterDialog>

        {/* Location Filter */}
        <FilterDialog
          title="Location"
          options={countryOptions}
          currentValue={locationCountry}
          onApply={handleLocationCountryChange}
          onClear={clearLocationCountry}
        >
          <Button variant={isFilterActive(locationCountry) ? "default" : "outline"} size="sm" className="h-10">
            <Filter className="h-4 w-4 mr-2" />
            {getDisplayLabel(locationCountry, countryOptions)}
            {isFilterActive(locationCountry) && (
              <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                1
              </Badge>
            )}
          </Button>
        </FilterDialog>

        {/* Job Type Filter */}
        <FilterDialog
          title="Job Type"
          options={jobTypeOptions}
          currentValue={jobType}
          onApply={handleJobTypeChange}
          onClear={clearJobType}
        >
          <Button variant={isFilterActive(jobType) ? "default" : "outline"} size="sm" className="h-10">
            <Filter className="h-4 w-4 mr-2" />
            {getDisplayLabel(jobType, jobTypeOptions)}
            {isFilterActive(jobType) && (
              <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                1
              </Badge>
            )}
          </Button>
        </FilterDialog>

        {/* Remote Work Filter */}
        <BooleanFilterDialog
          title="Remote Work"
          description="Show only remote positions"
          currentValue={filters.remote || false}
          onApply={handleRemoteFilterChange}
          onClear={clearRemoteFilter}
        >
          <Button variant={isBooleanFilterActive(filters.remote) ? "default" : "outline"} size="sm" className="h-10">
            <Filter className="h-4 w-4 mr-2" />
            Remote Work
            {isBooleanFilterActive(filters.remote) && (
              <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                1
              </Badge>
            )}
          </Button>
        </BooleanFilterDialog>

        {/* Visa Sponsorship Filter */}
        <BooleanFilterDialog
          title="Visa Sponsorship"
          description="Show only jobs that offer visa sponsorship"
          currentValue={filters.visaSponsorship || false}
          onApply={handleVisaSponsorshipFilterChange}
          onClear={clearVisaSponsorshipFilter}
        >
          <Button
            variant={isBooleanFilterActive(filters.visaSponsorship) ? "default" : "outline"}
            size="sm"
            className="h-10"
          >
            <Filter className="h-4 w-4 mr-2" />
            Visa Sponsorship
            {isBooleanFilterActive(filters.visaSponsorship) && (
              <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                1
              </Badge>
            )}
          </Button>
        </BooleanFilterDialog>

        {/* Clear All Filters Button (only show if any filters are active) */}
        {hasAnyActiveFilters() && (
          <Button
            variant="ghost"
            size="sm"
            className="h-10 text-muted-foreground hover:text-foreground"
            onClick={() => {
              setJobRole("all")
              setPrimaryProduct("all")
              setLocationCountry("all")
              setJobType("all")
              setFilters({})
            }}
          >
            <X className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>
    </div>
  )
}
