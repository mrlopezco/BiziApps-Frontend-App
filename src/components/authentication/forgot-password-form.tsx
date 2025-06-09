"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { resetPasswordForEmail } from "@/app/login/actions"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ForgotPasswordForm() {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  async function handleResetPassword() {
    if (!email) {
      toast({ description: "Please enter your email address", variant: "destructive" })
      return
    }

    setIsLoading(true)
    try {
      const result = await resetPasswordForEmail(email)
      if (result?.error) {
        toast({
          description: result.message || "Something went wrong. Please try again",
          variant: "destructive",
        })
      } else {
        setEmailSent(true)
        toast({
          description: "Password reset email sent! Check your inbox.",
          variant: "default",
        })
      }
    } catch (error) {
      toast({ description: "Something went wrong. Please try again", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className={"px-6 md:px-16 pb-6 py-8 gap-6 flex flex-col items-center justify-center"}>
        <Image src={"/assets/icons/logo/BiziApps-icon.svg"} alt={"BiziApps"} width={80} height={80} />
        <div className={"text-[30px] leading-[36px] font-medium tracking-[-0.6px] text-center"}>Check your email</div>
        <div className={"text-center text-muted-foreground text-sm"}>
          We've sent a password reset link to <strong>{email}</strong>
        </div>
        <div className={"text-center text-muted-foreground text-sm"}>
          Didn't receive the email? Check your spam folder or{" "}
          <button onClick={() => setEmailSent(false)} className={"text-white underline hover:no-underline"}>
            try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <form action={"#"} className={"px-6 md:px-16 pb-6 py-8 gap-6 flex flex-col items-center justify-center"}>
      <Image src={"/assets/icons/logo/BiziApps-icon.svg"} alt={"BiziApps"} width={80} height={80} />
      <div className={"text-[30px] leading-[36px] font-medium tracking-[-0.6px] text-center"}>Reset your password</div>
      <div className={"text-center text-muted-foreground text-sm"}>
        Enter your email address and we'll send you a link to reset your password.
      </div>
      <div className="grid w-full max-w-sm items-center gap-1.5 mt-2">
        <Label className={"text-muted-foreground leading-5"} htmlFor="email">
          Email address
        </Label>
        <Input
          className={"border-border rounded-xs"}
          type="email"
          id="email"
          autoComplete={"email"}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          disabled={isLoading}
        />
      </div>
      <Button
        onClick={handleResetPassword}
        type={"button"}
        variant={"secondary"}
        className={"w-full"}
        disabled={isLoading}
      >
        {isLoading ? "Sending..." : "Send reset link"}
      </Button>
    </form>
  )
}
