"use client";

import { supabase } from "./supabase";

export type AuthProvider = "google" | "twitter";

export async function signInWithProvider(provider: AuthProvider) {
  if (!supabase) {
    throw new Error("Supabase環境変数を設定するとログインできます。");
  }

  const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/login` : undefined;
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo }
  });
  if (error) throw error;
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getCurrentUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
}
