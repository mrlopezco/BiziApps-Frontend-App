"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { JOB_ROLES, PRIMARY_PRODUCTS } from "@/lib/constants/job-options"
import { JOB_TYPES, COUNTRIES } from "@/lib/types/jobs"
import { UserProfile } from "@/lib/database.types"

interface JobSearchBarProps {
  profile: UserProfile | null
  onSearch: (params: { job_role: string; primary_product: string; location_country: string; job_type: string }) => void
}

export function JobSearchBar({ profile, onSearch }: JobSearchBarProps) {
  const [jobRole, setJobRole] = useState<string>("all")
  const [primaryProduct, setPrimaryProduct] = useState<string>("all")
  const [locationCountry, setLocationCountry] = useState<string>("all")
  const [jobType, setJobType] = useState<string>("all")

  // Initialize with profile defaults
  useEffect(() => {
    if (profile?.job_roles && profile.job_roles.length > 0) {
      setJobRole(profile.job_roles[0])
    }
    if (profile?.primary_products && profile.primary_products.length > 0) {
      setPrimaryProduct(profile.primary_products[0])
    }
  }, [profile])

  const handleSearch = () => {
    onSearch({
      job_role: jobRole,
      primary_product: primaryProduct,
      location_country: locationCountry,
      job_type: jobType,
    })
  }

  // Enhanced job roles with "All" option
  const jobRoleOptions = [{ value: "all", label: "All Roles" }, ...JOB_ROLES]

  // Enhanced primary products with "All" option
  const primaryProductOptions = [{ value: "all", label: "All Products" }, ...PRIMARY_PRODUCTS]

  return (
    <div className="w-full bg-background/50 backdrop-blur-[24px] border border-border rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        {/* Job Role */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Job Role</label>
          <Select value={jobRole} onValueChange={setJobRole}>
            <SelectTrigger>
              <SelectValue placeholder="Select job role" />
            </SelectTrigger>
            <SelectContent>
              {jobRoleOptions.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Primary Product */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Primary Product</label>
          <Select value={primaryProduct} onValueChange={setPrimaryProduct}>
            <SelectTrigger>
              <SelectValue placeholder="Select product" />
            </SelectTrigger>
            <SelectContent>
              {primaryProductOptions.map((product) => (
                <SelectItem key={product.value} value={product.value}>
                  {product.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location Country */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Location</label>
          <Select value={locationCountry} onValueChange={setLocationCountry}>
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.value} value={country.value}>
                  {country.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Job Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Job Type</label>
          <Select value={jobType} onValueChange={setJobType}>
            <SelectTrigger>
              <SelectValue placeholder="Select job type" />
            </SelectTrigger>
            <SelectContent>
              {JOB_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search Button */}
        <Button onClick={handleSearch} className="h-10">
          <Search className="h-4 w-4 mr-2" />
          Search Jobs
        </Button>
      </div>
    </div>
  )
}
