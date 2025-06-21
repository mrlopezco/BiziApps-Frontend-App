import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { getKanbanJobs } from "@/lib/actions/job-interactions"
import { KanbanBoardContent } from "@/components/settings/kanban/kanban-board-content"

export default async function KanbanBoardPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user) {
    redirect("/login")
  }

  try {
    const kanbanJobs = await getKanbanJobs()

    return (
      <div className="bg-grey">
        <div className="container-main px-4 md:px-6 py-8 text-black">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Job Application Tracker</h1>
            <p className="text-muted-foreground mt-2">Manage your job applications with this Kanban board</p>
          </div>
          <KanbanBoardContent initialData={kanbanJobs} />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error loading kanban jobs:", error)

    return (
      <div className="bg-grey">
        <div className="container-main px-4 md:px-6 py-8 text-black">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Job Application Tracker</h1>
            <p className="text-muted-foreground mt-2">Manage your job applications with this Kanban board</p>
          </div>

          <div className="text-center py-12">
            <p className="text-muted-foreground">Unable to load kanban board. Please try again later.</p>
          </div>
        </div>
      </div>
    )
  }
}
