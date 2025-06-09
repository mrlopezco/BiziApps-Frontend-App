"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

interface FormData {
  email: string
  password: string
}

export async function login(data: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: true }
  }

  revalidatePath("/", "layout")
  redirect("/")
}

export async function signInWithGithub() {
  const supabase = await createClient()
  const { data } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `https://paddle-billing.vercel.app/auth/callback`,
    },
  })
  if (data.url) {
    redirect(data.url)
  }
}

export async function signInWithLinkedIn() {
  const supabase = await createClient()
  const { data } = await supabase.auth.signInWithOAuth({
    provider: "linkedin_oidc",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })
  if (data.url) {
    redirect(data.url)
  }
}

export async function loginAnonymously() {
  const supabase = await createClient()
  const { error: signInError } = await supabase.auth.signInAnonymously()
  const { error: updateUserError } = await supabase.auth.updateUser({
    email: `BiziApps+${Date.now().toString(36)}@paddle.com`,
  })

  if (signInError || updateUserError) {
    return { error: true }
  }

  revalidatePath("/", "layout")
  redirect("/")
}

export async function resetPasswordForEmail(email: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  })

  if (error) {
    return { error: true, message: error.message }
  }

  return { success: true }
}

export async function updatePassword(newPassword: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    return { error: true, message: error.message }
  }

  revalidatePath("/", "layout")
  return { success: true }
}
