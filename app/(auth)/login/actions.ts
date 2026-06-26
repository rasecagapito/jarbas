"use server";

import { redirect } from "next/navigation";
import {
  getLoginErrorMessage,
  validateLoginCredentials,
} from "@/lib/auth/login";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  const validation = validateLoginCredentials(
    String(formData.get("email") ?? ""),
    String(formData.get("password") ?? ""),
  );

  if (!validation.ok) {
    redirect("/login?message=missing");
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: validation.email,
    password: validation.password,
  });

  if (error) {
    const message = getLoginErrorMessage(error);
    redirect(message.includes("invalidos") ? "/login?message=invalid" : "/login?message=error");
  }

  redirect("/");
}

export async function signOut() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login?message=signed-out");
}
