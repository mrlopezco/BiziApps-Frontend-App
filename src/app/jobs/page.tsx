// import { redirect } from "next/navigation"
// import { createClient } from "@/utils/supabase/server"
import { getProfile } from "@/lib/profile-actions"
import { JobsPageLayout } from "@/components/jobs/jobs-page-layout"

export default async function JobsPage() {
  // const supabase = await createClient()
  // const { data } = await supabase.auth.getUser()

  // if (!data.user) {
  //   redirect("/login")
  // }

  const profile = await getProfile()

  return <JobsPageLayout profile={profile} />
}
