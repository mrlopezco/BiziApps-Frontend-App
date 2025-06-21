"use client"

import { useState, useCallback, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { JobsPageContent } from "./jobs-page-content"
import { JobSearchBar } from "./job-search-bar"
import { JobFilters as JobFiltersType } from "./job-search-bar"
import { UserProfile } from "@/lib/database.types"

interface JobsPageLayoutProps {
  profile: UserProfile | null
}

export function JobsPageLayout({ profile }: JobsPageLayoutProps) {
  const urlSearchParams = useSearchParams()

  const [searchParams, setSearchParams] = useState({
    job_role: "all",
    primary_product: "all",
    location_country: "all",
    job_type: "all",
  })
  const [filters, setFilters] = useState<JobFiltersType>({})

  // Initialize from URL parameters (for saved searches)
  useEffect(() => {
    const job_role = urlSearchParams.get("job_role")
    const primary_product = urlSearchParams.get("primary_product")
    const location_country = urlSearchParams.get("location_country")
    const job_type = urlSearchParams.get("job_type")
    const remote = urlSearchParams.get("remote")
    const has_salary = urlSearchParams.get("has_salary")

    if (job_role || primary_product || location_country || job_type || remote || has_salary) {
      const newSearchParams = {
        job_role: job_role ? decodeURIComponent(job_role) : "all",
        primary_product: primary_product ? decodeURIComponent(primary_product) : "all",
        location_country: location_country ? decodeURIComponent(location_country) : "all",
        job_type: job_type ? decodeURIComponent(job_type) : "all",
      }

      const newFilters = {
        remote: remote === "true" ? true : undefined,
        hasSalary: has_salary === "true" ? true : undefined,
      }

      setSearchParams(newSearchParams)
      setFilters(newFilters)
    }
  }, [urlSearchParams])

  const handleSearch = useCallback((params: typeof searchParams) => {
    setSearchParams(params)
  }, [])

  const handleFiltersChange = useCallback((newFilters: JobFiltersType) => {
    setFilters(newFilters)
  }, [])

  return (
    <div className="bg-grey">
      {/* Job Search Bar - Full Width */}
      <div className="mb-6 bg-black py-auto ">
        <JobSearchBar
          profile={profile}
          onSearch={handleSearch}
          onFiltersChange={handleFiltersChange}
          appliedFilters={filters}
          initialSearchParams={searchParams}
        />
      </div>

      {/* Jobs Content */}
      <div className="container-main px-4 md:px-6 py-8 text-black">
        <JobsPageContent
          searchParams={searchParams}
          filters={filters}
          onSearch={handleSearch}
          onFiltersChange={handleFiltersChange}
        />
      </div>
    </div>
  )
}
