"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { ReactNode, ButtonHTMLAttributes } from "react"

interface LogoutButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode
}

export function LogoutButton({ children, ...props }: LogoutButtonProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <Button variant="ghost" size="sm" className="gap-2" onClick={handleLogout} {...props}>
      {children || (
        <>
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </>
      )}
    </Button>
  )
}
