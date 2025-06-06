import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "./logout-button"
import { createClient } from "@/utils/supabase/server"
import { User, LayoutDashboard, Briefcase, Home } from "lucide-react"
import { ReactNode } from "react"
import Header from "../home/header/header"

interface GlobalLayoutProps {
  children: ReactNode
}

export async function GlobalLayout({ children }: GlobalLayoutProps) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header data={data} />

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  )
}
