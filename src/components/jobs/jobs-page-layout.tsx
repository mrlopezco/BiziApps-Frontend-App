"use client"

import { useState, useCallback } from "react"
import { JobsPageContent } from "./jobs-page-content"
import { JobSearchBar } from "./job-search-bar"
import { JobFilters as JobFiltersType } from "./job-search-bar"
import { UserProfile } from "@/lib/database.types"

interface JobsPageLayoutProps {
  profile: UserProfile | null
}

export function JobsPageLayout({ profile }: JobsPageLayoutProps) {
  const [searchParams, setSearchParams] = useState({
    job_role: "all",
    primary_product: "all",
    location_country: "all",
    job_type: "all",
  })
  const [filters, setFilters] = useState<JobFiltersType>({})

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
        />
      </div>

      {/* Jobs Content */}
      <div className="container-main px-4 md:px-6 py-8 text-black">
        <JobsPageContent
          profile={profile}
          searchParams={searchParams}
          filters={filters}
          onSearch={handleSearch}
          onFiltersChange={handleFiltersChange}
        />
      </div>
    </div>
  )
}
