"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  // Change to single values instead of arrays
  const [jobRole, setJobRole] = useState<string>(initialJobRoles[0] || "")
  const [primaryProduct, setPrimaryProduct] = useState<string>(initialPrimaryProducts[0] || "")
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
    // Update hidden form fields - still use arrays for backend compatibility
    const jobRoleInput = document.querySelector('input[name="jobRoles"]') as HTMLInputElement
    const primaryProductInput = document.querySelector('input[name="primaryProducts"]') as HTMLInputElement

    if (jobRoleInput) {
      jobRoleInput.value = JSON.stringify(jobRole ? [jobRole] : [])
    }
    if (primaryProductInput) {
      primaryProductInput.value = JSON.stringify(primaryProduct ? [primaryProduct] : [])
    }
  }, [jobRole, primaryProduct])

  if (loading || !constants) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-base leading-4 font-medium">Job Role</Label>
          <div className="h-10 bg-muted rounded animate-pulse" />
          <p className="text-base leading-4 text-secondary">Loading job roles...</p>
        </div>
        <div className="space-y-2">
          <Label className="text-base leading-4 font-medium">Primary Product</Label>
          <div className="h-10 bg-muted rounded animate-pulse" />
          <p className="text-base leading-4 text-secondary">Loading primary products...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="jobRole" className="text-base leading-4 font-medium">
          Job Role
        </Label>
        <Select value={jobRole} onValueChange={setJobRole}>
          <SelectTrigger>
            <SelectValue placeholder="Select your job role..." />
          </SelectTrigger>
          <SelectContent>
            {constants.jobRoles.map((role) => (
              <SelectItem key={role.value} value={role.value}>
                {role.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-base leading-4 text-secondary">
          Select the role that best describes your expertise and responsibilities.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="primaryProduct" className="text-base leading-4 font-medium">
          Primary Product
        </Label>
        <Select value={primaryProduct} onValueChange={setPrimaryProduct}>
          <SelectTrigger>
            <SelectValue placeholder="Select your primary product..." />
          </SelectTrigger>
          <SelectContent>
            {constants.primaryProducts.map((product) => (
              <SelectItem key={product.value} value={product.value}>
                {product.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-base leading-4 text-secondary">
          Choose the Microsoft product or technology you specialize in most.
        </p>
      </div>

      {/* Hidden inputs for form submission */}
      <input type="hidden" name="jobRoles" defaultValue={JSON.stringify(jobRole ? [jobRole] : [])} />
      <input
        type="hidden"
        name="primaryProducts"
        defaultValue={JSON.stringify(primaryProduct ? [primaryProduct] : [])}
      />
    </>
  )
}
