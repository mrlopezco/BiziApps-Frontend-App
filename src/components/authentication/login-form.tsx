"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { login } from "@/app/login/actions"
import { useState } from "react"
import { AuthenticationForm } from "@/components/authentication/authentication-form"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"

export function LoginForm() {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  function handleLogin() {
    login({ email, password }).then((data) => {
      if (data?.error) {
        toast({ description: "Invalid email or password", variant: "destructive" })
      }
    })
  }

  return (
    <form action={"#"} className={"px-6 md:px-16 pb-6 py-8 gap-6 flex flex-col items-center justify-center"}>
      <Image src={"/justbee_30.svg"} alt={"BiziApps"} width={80} height={80} />

      <div className={"flex w-full items-center justify-center"}>
        <Separator className={"w-5/12 bg-border"} />
        <div className={"text-border text-xs font-medium px-4"}>or</div>
        <Separator className={"w-5/12 bg-border"} />
      </div>
      <AuthenticationForm
        email={email}
        onEmailChange={(email) => setEmail(email)}
        password={password}
        onPasswordChange={(password) => setPassword(password)}
      />
      <div className={"w-full flex justify-end"}>
        <a href={"/forgot-password"} className={"text-sm text-muted-foreground hover:text-white transition-colors"}>
          Forgot password?
        </a>
      </div>
      <Button formAction={() => handleLogin()} type={"submit"} variant={"secondary"} className={"w-full"}>
        Log in
      </Button>
    </form>
  )
}
