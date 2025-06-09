import { ReactNode } from "react"
import { SettingsLayout } from "@/components/settings/layout/settings-layout"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

interface Props {
  children: ReactNode
}

export default async function Layout({ children }: Props) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  if (!data.user) {
    redirect("/login")
  }
  return <SettingsLayout>{children}</SettingsLayout>
}
