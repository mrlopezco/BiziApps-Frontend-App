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

  const { error: updateError } = await supabase
    .from("user_profiles")
    .update({
      first_name: firstName || null,
      last_name: lastName || null,
      bio: bio || null,
      avatar: avatar || null,
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
