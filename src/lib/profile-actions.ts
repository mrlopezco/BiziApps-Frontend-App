import { createClient } from "@/utils/supabase/server"
import { UserProfile } from "@/lib/database.types"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function getProfile(): Promise<UserProfile | null> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/login")
  }

  console.log("User ID for profile lookup:", user.id)

  // First try to get the profile
  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle() // Use maybeSingle instead of single to handle no rows gracefully

  if (profileError) {
    console.error("Failed to fetch profile:", profileError)
    return null
  }

  // If profile exists, return it
  if (profile) {
    return profile
  }

  // If no profile found, try to create one (only if it truly doesn't exist)
  const { data: newProfile, error: createError } = await supabase
    .from("user_profiles")
    .insert({ id: user.id })
    .select()
    .maybeSingle()

  if (createError) {
    console.error("Failed to create profile:", createError)
    // If creation fails, try one more time to fetch (maybe it was created by trigger)
    const { data: existingProfile, error: retryError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()

    if (retryError) {
      console.error("Failed to fetch profile on retry:", retryError)
      return null
    }

    return existingProfile
  }

  return newProfile
}

export async function updateProfile(formData: FormData) {
  "use server"

  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/login")
  }

  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const bio = formData.get("bio") as string
  const avatar = formData.get("avatar") as string
  const jobRoles = formData.get("jobRoles") as string
  const primaryProducts = formData.get("primaryProducts") as string

  // Parse JSON arrays
  let parsedJobRoles = []
  let parsedPrimaryProducts = []

  try {
    parsedJobRoles = jobRoles ? JSON.parse(jobRoles) : []
  } catch (e) {
    console.error("Failed to parse job roles:", e)
  }

  try {
    parsedPrimaryProducts = primaryProducts ? JSON.parse(primaryProducts) : []
  } catch (e) {
    console.error("Failed to parse primary products:", e)
  }

  const { error: updateError } = await supabase
    .from("user_profiles")
    .update({
      first_name: firstName || null,
      last_name: lastName || null,
      bio: bio || null,
      avatar: avatar || null,
      job_roles: parsedJobRoles,
      primary_products: parsedPrimaryProducts,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (updateError) {
    console.error("Failed to update profile:", updateError)
    redirect("/dashboard/profile?error=" + encodeURIComponent("Failed to update profile. Please try again."))
  }

  revalidatePath("/dashboard/profile")
  redirect("/dashboard/profile?success=true")
}

export async function updateProfileFromOAuth() {
  "use server"

  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error("No authenticated user found")
    return
  }

  // Check if profile already has data to avoid overriding existing information
  const { data: existingProfile } = await supabase
    .from("user_profiles")
    .select("first_name, last_name, avatar")
    .eq("id", user.id)
    .maybeSingle()

  // Only update if profile doesn't have first_name or last_name
  if (existingProfile?.first_name && existingProfile?.last_name) {
    console.log("Profile already has name data, skipping OAuth update")
    return
  }

  // Extract profile data from user metadata
  const userMetadata = user.user_metadata || {}
  const appMetadata = user.app_metadata || {}

  // LinkedIn OIDC provides data in user_metadata
  const firstName = userMetadata.given_name || userMetadata.first_name
  const lastName = userMetadata.family_name || userMetadata.last_name
  const avatar = userMetadata.picture || userMetadata.avatar_url

  console.log("OAuth profile data:", { firstName, lastName, avatar, userMetadata })

  // Only update fields that have values and aren't already set
  const updateData: any = {}

  if (firstName && !existingProfile?.first_name) {
    updateData.first_name = firstName
  }

  if (lastName && !existingProfile?.last_name) {
    updateData.last_name = lastName
  }

  if (avatar && !existingProfile?.avatar) {
    updateData.avatar = avatar
  }

  // Only update if we have data to update
  if (Object.keys(updateData).length > 0) {
    updateData.updated_at = new Date().toISOString()

    const { error: updateError } = await supabase.from("user_profiles").upsert({
      id: user.id,
      ...updateData,
    })

    if (updateError) {
      console.error("Failed to update profile from OAuth:", updateError)
    } else {
      console.log("Successfully updated profile from OAuth:", updateData)
    }
  }
}
