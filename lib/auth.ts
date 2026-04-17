import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Returns true if the user is authenticated — either via real Supabase session
 * or via the demo bypass profile stored in localStorage.
 * Use this instead of supabase.auth.getUser() on every protected page.
 */
export async function isAuthenticated(supabase: SupabaseClient): Promise<boolean> {
  // Check demo bypass first (fast, no network)
  if (typeof window !== "undefined") {
    const demo = localStorage.getItem("kms_demo_profile");
    if (demo) return true;
  }
  // Fall back to real Supabase session
  const { data: { user } } = await supabase.auth.getUser();
  return !!user;
}
