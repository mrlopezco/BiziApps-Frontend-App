"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export function ProfileMessages() {
  const searchParams = useSearchParams()
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    const success = searchParams.get("success")
    const error = searchParams.get("error")

    if (success) {
      setMessage({ type: "success", text: "Profile updated successfully!" })
      // Clear the message after 5 seconds
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }

    if (error) {
      setMessage({ type: "error", text: error })
      // Clear the message after 5 seconds
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  if (!message) return null

  return (
    <Alert
      variant={message.type === "error" ? "destructive" : "default"}
      className={`mb-6 ${message.type === "success" ? "border-green-200 bg-green-50 text-green-800" : ""}`}
    >
      <AlertDescription>{message.text}</AlertDescription>
    </Alert>
  )
}
