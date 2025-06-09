"use server"

import { createClient } from "@/utils/supabase/server"
import { createClient as createServiceClient } from "@/utils/supabase/server-internal"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

interface DeleteAccountData {
  email: string
  password: string
}

export async function deleteUserAccount(data: DeleteAccountData) {
  // First, verify the current user's session
  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData.user) {
    return { error: true, message: "Not authenticated" }
  }

  // Verify the user's credentials by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })

  if (signInError) {
    return { error: true, message: "Invalid credentials. Please check your email and password." }
  }

  // Use service role client to delete the user
  const serviceClient = await createServiceClient()

  try {
    const { error: deleteError } = await serviceClient.auth.admin.deleteUser(
      userData.user.id,
      false, // Set to false for hard delete, true for soft delete
    )

    if (deleteError) {
      console.error("Error deleting user:", deleteError)
      return { error: true, message: "Failed to delete account. Please try again." }
    }

    // Sign out the user after successful deletion
    await supabase.auth.signOut()

    // Revalidate and redirect
    revalidatePath("/", "layout")
    redirect("/")
  } catch (error) {
    console.error("Unexpected error during account deletion:", error)
    return { error: true, message: "An unexpected error occurred. Please try again." }
  }
}
