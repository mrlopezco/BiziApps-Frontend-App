"use server"

import { createClient } from "@/utils/supabase/server"
import { validateUserSession } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { UserJobInteraction } from "@/lib/types/jobs"

/**
 * Get or create a user's job interaction record
 */
export async function getOrCreateJobInteraction(jobId: string): Promise<UserJobInteraction> {
  await validateUserSession()
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("User not authenticated")
  }

  // First, try to get existing interaction
  const { data: existingInteraction, error: fetchError } = await supabase
    .from("user_job_interactions")
    .select("*")
    .eq("user_id", user.id)
    .eq("job_id", jobId)
    .single()

  if (fetchError && fetchError.code !== "PGRST116") {
    // PGRST116 = no rows returned
    throw new Error(`Failed to fetch interaction: ${fetchError.message}`)
  }

  if (existingInteraction) {
    return existingInteraction
  }

  // Create new interaction if none exists
  const { data: newInteraction, error: createError } = await supabase
    .from("user_job_interactions")
    .insert({
      user_id: user.id,
      job_id: jobId,
      is_favorite: false,
      is_not_interested: false,
      vote_type: null,
      vote_reason: null,
      notes: null,
    })
    .select()
    .single()

  if (createError) {
    throw new Error(`Failed to create interaction: ${createError.message}`)
  }

  return newInteraction
}

/**
 * Toggle bookmark status for a job
 */
export async function toggleJobBookmark(jobId: string): Promise<{ success: boolean; is_favorite: boolean }> {
  try {
    await validateUserSession()
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      throw new Error("User not authenticated")
    }

    // Get or create the interaction
    const interaction = await getOrCreateJobInteraction(jobId)

    // Toggle the favorite status
    const newFavoriteStatus = !interaction.is_favorite

    const { error } = await supabase
      .from("user_job_interactions")
      .update({
        is_favorite: newFavoriteStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", interaction.id)

    if (error) {
      throw new Error(`Failed to update bookmark: ${error.message}`)
    }

    // Revalidate relevant pages
    revalidatePath("/jobs")
    revalidatePath("/dashboard/bookmarks")

    return { success: true, is_favorite: newFavoriteStatus }
  } catch (error) {
    console.error("Error toggling bookmark:", error)
    return { success: false, is_favorite: false }
  }
}

/**
 * Mark a job as not interested
 */
export async function markJobAsNotInterested(jobId: string): Promise<{ success: boolean }> {
  try {
    await validateUserSession()
    const interaction = await getOrCreateJobInteraction(jobId)
    const supabase = await createClient()

    const { error } = await supabase
      .from("user_job_interactions")
      .update({
        is_not_interested: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", interaction.id)

    if (error) {
      throw new Error(`Failed to mark as not interested: ${error.message}`)
    }

    revalidatePath("/jobs")
    return { success: true }
  } catch (error) {
    console.error("Error marking as not interested:", error)
    return { success: false }
  }
}

/**
 * Add or update a vote for a job
 */
export async function voteOnJob(
  jobId: string,
  voteType: "upvote" | "downvote",
  voteReason?: string,
): Promise<{ success: boolean }> {
  try {
    await validateUserSession()
    const interaction = await getOrCreateJobInteraction(jobId)
    const supabase = await createClient()

    const { error } = await supabase
      .from("user_job_interactions")
      .update({
        vote_type: voteType,
        vote_reason: voteReason || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", interaction.id)

    if (error) {
      throw new Error(`Failed to record vote: ${error.message}`)
    }

    revalidatePath("/jobs")
    return { success: true }
  } catch (error) {
    console.error("Error recording vote:", error)
    return { success: false }
  }
}

/**
 * Add or update notes for a job
 */
export async function updateJobNotes(jobId: string, notes: string): Promise<{ success: boolean }> {
  try {
    await validateUserSession()
    const interaction = await getOrCreateJobInteraction(jobId)
    const supabase = await createClient()

    const { error } = await supabase
      .from("user_job_interactions")
      .update({
        notes: notes.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", interaction.id)

    if (error) {
      throw new Error(`Failed to update notes: ${error.message}`)
    }

    revalidatePath("/jobs")
    return { success: true }
  } catch (error) {
    console.error("Error updating notes:", error)
    return { success: false }
  }
}

/**
 * Get user's bookmarked jobs
 */
export async function getUserBookmarkedJobs(page = 1, limit = 20) {
  try {
    await validateUserSession()
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      throw new Error("User not authenticated")
    }

    const offset = (page - 1) * limit

    const { data, count, error } = await supabase
      .from("user_job_interactions")
      .select(
        `
        *,
        transformed_jobs (
          *,
          company:transformed_companies(*)
        )
      `,
        { count: "exact" },
      )
      .eq("user_id", user.id)
      .eq("is_favorite", true)
      .order("updated_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw new Error(`Failed to fetch bookmarked jobs: ${error.message}`)
    }

    const jobs =
      data?.map((interaction) => ({
        ...interaction.transformed_jobs,
        user_interaction: {
          id: interaction.id,
          user_id: interaction.user_id,
          job_id: interaction.job_id,
          is_favorite: interaction.is_favorite,
          is_not_interested: interaction.is_not_interested,
          vote_type: interaction.vote_type,
          vote_reason: interaction.vote_reason,
          notes: interaction.notes,
          created_at: interaction.created_at,
          updated_at: interaction.updated_at,
        },
      })) || []

    const total = count || 0
    const hasMore = offset + limit < total

    return {
      jobs,
      total,
      hasMore,
      page,
      limit,
    }
  } catch (error) {
    console.error("Error fetching bookmarked jobs:", error)
    throw error
  }
}

/**
 * Get user interactions for a list of jobs
 */
export async function getUserJobInteractions(jobIds: string[]): Promise<Record<string, UserJobInteraction>> {
  try {
    await validateUserSession()
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user || jobIds.length === 0) {
      return {}
    }

    const { data, error } = await supabase
      .from("user_job_interactions")
      .select("*")
      .eq("user_id", user.id)
      .in("job_id", jobIds)

    if (error) {
      console.error("Error fetching user interactions:", error)
      return {}
    }

    // Convert to a map for easy lookup
    const interactionsMap: Record<string, UserJobInteraction> = {}
    data?.forEach((interaction) => {
      interactionsMap[interaction.job_id] = interaction
    })

    return interactionsMap
  } catch (error) {
    console.error("Error fetching user interactions:", error)
    return {}
  }
}
