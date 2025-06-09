"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { updatePassword } from "@/app/login/actions"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"

export function ResetPasswordForm() {
  const { toast } = useToast()
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Check if we have a valid session for password recovery
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setIsValidSession(!!session)
      setIsCheckingSession(false)
    }

    checkSession()

    // Listen for auth state changes, specifically PASSWORD_RECOVERY
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsValidSession(true)
        setIsCheckingSession(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleUpdatePassword() {
    if (!password) {
      toast({ description: "Please enter a new password", variant: "destructive" })
      return
    }

    if (password.length < 6) {
      toast({ description: "Password must be at least 6 characters long", variant: "destructive" })
      return
    }

    if (password !== confirmPassword) {
      toast({ description: "Passwords do not match", variant: "destructive" })
      return
    }

    setIsLoading(true)
    try {
      const result = await updatePassword(password)
      if (result?.error) {
        toast({
          description: result.message || "Failed to update password",
          variant: "destructive",
        })
      } else {
        toast({
          description: "Password updated successfully! Redirecting to login...",
          variant: "default",
        })
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      }
    } catch {
      // Removed 'err' from here
      toast({ description: "Something went wrong. Please try again", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }
  if (isCheckingSession) {
    return (
      <div className={"px-6 md:px-16 pb-6 py-8 gap-6 flex flex-col items-center justify-center"}>
        <Image src={"/assets/icons/logo/BiziApps-icon.svg"} alt={"BiziApps"} width={80} height={80} />
        <div className={"text-[30px] leading-[36px] font-medium tracking-[-0.6px] text-center"}>Loading...</div>
      </div>
    )
  }

  if (!isValidSession) {
    return (
      <div className={"px-6 md:px-16 pb-6 py-8 gap-6 flex flex-col items-center justify-center"}>
        <Image src={"/assets/icons/logo/BiziApps-icon.svg"} alt={"BiziApps"} width={80} height={80} />
        <div className={"text-[30px] leading-[36px] font-medium tracking-[-0.6px] text-center"}>
          Invalid or expired link
        </div>
        <div className={"text-center text-muted-foreground text-sm"}>
          This password reset link is invalid or has expired. Please request a new one.
        </div>
        <Button
          onClick={() => router.push("/forgot-password")}
          type={"button"}
          variant={"secondary"}
          className={"w-full"}
        >
          Request new reset link
        </Button>
      </div>
    )
  }

  return (
    <form action={"#"} className={"px-6 md:px-16 pb-6 py-8 gap-6 flex flex-col items-center justify-center"}>
      <Image src={"/assets/icons/logo/BiziApps-icon.svg"} alt={"BiziApps"} width={80} height={80} />
      <div className={"text-[30px] leading-[36px] font-medium tracking-[-0.6px] text-center"}>Set new password</div>
      <div className={"text-center text-muted-foreground text-sm"}>Enter your new password below.</div>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label className={"text-muted-foreground leading-5"} htmlFor="password">
          New password
        </Label>
        <Input
          className={"border-border rounded-xs"}
          type="password"
          id="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter new password"
          disabled={isLoading}
        />
      </div>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label className={"text-muted-foreground leading-5"} htmlFor="confirmPassword">
          Confirm password
        </Label>
        <Input
          className={"border-border rounded-xs"}
          type="password"
          id="confirmPassword"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          disabled={isLoading}
        />
      </div>
      <Button
        onClick={handleUpdatePassword}
        type={"button"}
        variant={"secondary"}
        className={"w-full"}
        disabled={isLoading}
      >
        {isLoading ? "Updating..." : "Update password"}
      </Button>
    </form>
  )
}
