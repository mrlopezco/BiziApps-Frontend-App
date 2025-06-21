"use client"

import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Loader2, Save } from "lucide-react"
import { useState, useTransition } from "react"
import { updateHideHiddenJobsPreference } from "@/lib/actions/job-interactions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Saving...
        </>
      ) : (
        <>
          <Save className="h-4 w-4 mr-2" />
          Save Profile
        </>
      )}
    </Button>
  )
}

interface HideHiddenJobsToggleProps {
  defaultChecked: boolean
}

function HideHiddenJobsToggle({ defaultChecked }: HideHiddenJobsToggleProps) {
  const [checked, setChecked] = useState(defaultChecked)
  const [isPending, startTransition] = useTransition()

  const handleChange = (newChecked: boolean) => {
    setChecked(newChecked)
    startTransition(async () => {
      await updateHideHiddenJobsPreference(newChecked)
    })
  }

  return <Switch id="hideHiddenJobs" checked={checked} onCheckedChange={handleChange} disabled={isPending} />
}

export { SubmitButton, HideHiddenJobsToggle }
