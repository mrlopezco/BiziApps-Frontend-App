"use client"

import { Button } from "@/components/ui/button"
import { signInWithLinkedIn } from "@/app/login/actions"
import Image from "next/image"

interface Props {
  label: string
}

export function LinkedInLoginButton({ label }: Props) {
  return (
    <Button onClick={() => signInWithLinkedIn()} variant={"secondary"} className={"w-full"}>
      <Image
        height="24"
        className={"mr-3"}
        width="24"
        src="https://cdn.simpleicons.org/linkedin/0077b5"
        unoptimized={true}
        alt={"LinkedIn logo"}
      />
      {label}
    </Button>
  )
}
