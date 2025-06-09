"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { MultiSelect } from "@/components/ui/multi-select"
import { getAllJobConstantsClient } from "@/lib/cache/job-constants-client"
import { JobRole, PrimaryProduct } from "@/lib/constants/job-options"

interface JobFieldsClientProps {
  initialJobRoles: JobRole[]
  initialPrimaryProducts: PrimaryProduct[]
}

interface JobConstants {
  jobRoles: Array<{ value: string; label: string }>
  primaryProducts: Array<{ value: string; label: string }>
}

export function JobFieldsClient({ initialJobRoles, initialPrimaryProducts }: JobFieldsClientProps) {
  const [jobRoles, setJobRoles] = useState<string[]>(initialJobRoles)
  const [primaryProducts, setPrimaryProducts] = useState<string[]>(initialPrimaryProducts)
  const [constants, setConstants] = useState<JobConstants | null>(null)
  const [loading, setLoading] = useState(true)

  // Load constants from cache/database
  useEffect(() => {
    async function loadConstants() {
      try {
        const data = await getAllJobConstantsClient()
        setConstants({
          jobRoles: data.jobRoles,
          primaryProducts: data.primaryProducts,
        })
      } catch (error) {
        console.error("Failed to load job constants:", error)
        // Set fallback constants if needed
        setConstants({
          jobRoles: [],
          primaryProducts: [],
        })
      } finally {
        setLoading(false)
      }
    }

    loadConstants()
  }, [])

  // Update hidden inputs when values change
  useEffect(() => {
    // Update hidden form fields
    const jobRolesInput = document.querySelector('input[name="jobRoles"]') as HTMLInputElement
    const primaryProductsInput = document.querySelector('input[name="primaryProducts"]') as HTMLInputElement

    if (jobRolesInput) {
      jobRolesInput.value = JSON.stringify(jobRoles)
    }
    if (primaryProductsInput) {
      primaryProductsInput.value = JSON.stringify(primaryProducts)
    }
  }, [jobRoles, primaryProducts])

  if (loading || !constants) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-base leading-4 font-medium">Job Roles</Label>
          <div className="h-10 bg-muted rounded animate-pulse" />
          <p className="text-base leading-4 text-secondary">Loading job roles...</p>
        </div>
        <div className="space-y-2">
          <Label className="text-base leading-4 font-medium">Primary Products</Label>
          <div className="h-10 bg-muted rounded animate-pulse" />
          <p className="text-base leading-4 text-secondary">Loading primary products...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="jobRoles" className="text-base leading-4 font-medium">
          Job Roles
        </Label>
        <MultiSelect
          options={constants.jobRoles}
          selected={jobRoles}
          onChange={setJobRoles}
          placeholder="Select your job roles..."
        />
        <p className="text-base leading-4 text-secondary">
          Select the roles that best describe your expertise and responsibilities.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="primaryProducts" className="text-base leading-4 font-medium">
          Primary Products
        </Label>
        <MultiSelect
          options={constants.primaryProducts}
          selected={primaryProducts}
          onChange={setPrimaryProducts}
          placeholder="Select primary products you work with..."
        />
        <p className="text-base leading-4 text-secondary">
          Choose the Microsoft products and technologies you specialize in.
        </p>
      </div>

      {/* Hidden inputs for form submission */}
      <input type="hidden" name="jobRoles" defaultValue={JSON.stringify(jobRoles)} />
      <input type="hidden" name="primaryProducts" defaultValue={JSON.stringify(primaryProducts)} />
    </>
  )
}
