"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { MultiSelect } from "@/components/ui/multi-select"
import { JOB_ROLES, PRIMARY_PRODUCTS, JobRole, PrimaryProduct } from "@/lib/constants/job-options"

interface JobFieldsClientProps {
  initialJobRoles: JobRole[]
  initialPrimaryProducts: PrimaryProduct[]
}

export function JobFieldsClient({ initialJobRoles, initialPrimaryProducts }: JobFieldsClientProps) {
  const [jobRoles, setJobRoles] = useState<string[]>(initialJobRoles)
  const [primaryProducts, setPrimaryProducts] = useState<string[]>(initialPrimaryProducts)

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

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="jobRoles" className="text-base leading-4 font-medium">
          Job Roles
        </Label>
        <MultiSelect
          options={JOB_ROLES as any}
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
          options={PRIMARY_PRODUCTS as any}
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
