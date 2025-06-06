import { createClient } from "@/utils/supabase/server"
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
