"use server"

import { createClient } from "@/utils/supabase/server"
import { SavedSearch } from "@/lib/database.types"
import { revalidatePath } from "next/cache"

export interface SavedSearchFormData {
  name: string
  description?: string
  job_role?: string
  primary_product?: string
  location_country?: string
  job_type?: string
  remote?: boolean
  has_salary?: boolean
}

export async function createSavedSearch(
  data: SavedSearchFormData,
): Promise<{ success: boolean; error?: string; savedSearch?: SavedSearch }> {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Authentication required" }
    }

    // Insert saved search
    const { data: savedSearch, error } = await supabase
      .from("user_saved_searches")
      .insert({
        user_id: user.id,
        name: data.name,
        description: data.description || null,
        job_role: data.job_role === "all" ? null : data.job_role,
        primary_product: data.primary_product === "all" ? null : data.primary_product,
        location_country: data.location_country === "all" ? null : data.location_country,
        job_type: data.job_type === "all" ? null : data.job_type,
        remote: data.remote || null,
        has_salary: data.has_salary || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating saved search:", error)
      if (error.code === "23505") {
        return { success: false, error: "A search with this name already exists" }
      }
      return { success: false, error: "Failed to save search" }
    }

    revalidatePath("/me/saved-searches")
    return { success: true, savedSearch }
  } catch (error) {
    console.error("Error in createSavedSearch:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function getSavedSearches(): Promise<SavedSearch[]> {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return []
    }

    // Get saved searches ordered by last used
    const { data: savedSearches, error } = await supabase
      .from("user_saved_searches")
      .select("*")
      .eq("user_id", user.id)
      .order("last_used_at", { ascending: false })

    if (error) {
      console.error("Error fetching saved searches:", error)
      return []
    }

    return savedSearches || []
  } catch (error) {
    console.error("Error in getSavedSearches:", error)
    return []
  }
}

export async function deleteSavedSearch(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Authentication required" }
    }

    // Delete saved search
    const { error } = await supabase.from("user_saved_searches").delete().eq("id", id).eq("user_id", user.id)

    if (error) {
      console.error("Error deleting saved search:", error)
      return { success: false, error: "Failed to delete search" }
    }

    revalidatePath("/me/saved-searches")
    return { success: true }
  } catch (error) {
    console.error("Error in deleteSavedSearch:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function updateSavedSearchLastUsed(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Authentication required" }
    }

    // Update last used timestamp
    const { error } = await supabase
      .from("user_saved_searches")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      console.error("Error updating saved search last used:", error)
      return { success: false, error: "Failed to update search" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in updateSavedSearchLastUsed:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function updateSavedSearch(
  id: string,
  data: Partial<SavedSearchFormData>,
): Promise<{ success: boolean; error?: string; savedSearch?: SavedSearch }> {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Authentication required" }
    }

    // Update saved search
    const { data: savedSearch, error } = await supabase
      .from("user_saved_searches")
      .update({
        name: data.name,
        description: data.description || null,
        job_role: data.job_role === "all" ? null : data.job_role,
        primary_product: data.primary_product === "all" ? null : data.primary_product,
        location_country: data.location_country === "all" ? null : data.location_country,
        job_type: data.job_type === "all" ? null : data.job_type,
        remote: data.remote || null,
        has_salary: data.has_salary || null,
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating saved search:", error)
      if (error.code === "23505") {
        return { success: false, error: "A search with this name already exists" }
      }
      return { success: false, error: "Failed to update search" }
    }

    revalidatePath("/me/saved-searches")
    return { success: true, savedSearch }
  } catch (error) {
    console.error("Error in updateSavedSearch:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
