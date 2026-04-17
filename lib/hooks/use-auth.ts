"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  department_id: string;
  is_expert: boolean;
}

export function useAuth(requireAuth = true) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let mounted = true;

    async function getSession() {
      try {
        // 1. Check Demo Profile first (Bypass)
        if (typeof window !== "undefined") {
          const demoStr = localStorage.getItem("kms_demo_profile");
          if (demoStr) {
            try {
              const demoProfile = JSON.parse(demoStr) as UserProfile;
              if (mounted) {
                setProfile(demoProfile);
                setLoading(false);
              }
              return;
            } catch (e) {
              console.error("Failed to parse demo profile", e);
            }
          }
        }

        // 2. Fallback to Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          if (mounted) {
            setLoading(false);
            if (requireAuth) router.replace("/login");
          }
          return;
        }

        const currentUser = session.user;
        if (mounted) setUser(currentUser);

        // 3. Fetch Profile for real user
        const { data: profileData, error: profileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single();

        if (profileError || !profileData) {
          console.error("Profile fetch error:", profileError);
          if (mounted) {
            setLoading(false);
            // If real user has no profile, maybe they need onboarding
            if (requireAuth) router.replace("/onboarding");
          }
          return;
        }

        if (mounted) {
          setProfile(profileData as UserProfile);
          setLoading(false);
        }
      } catch (err) {
        console.error("Auth hook error:", err);
        if (mounted) {
          setLoading(false);
          if (requireAuth) router.replace("/login");
        }
      }
    }

    getSession();

    return () => {
      mounted = false;
    };
  }, [requireAuth, router, supabase]);

  const logout = async () => {
    setLoading(true);
    if (typeof window !== "undefined") {
      localStorage.removeItem("kms_demo_profile");
      document.cookie = "kms_demo_profile=; path=/; max-age=0";
    }
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return { user, profile, loading, logout, supabase };
}
