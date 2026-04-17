"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import {
  BookOpen, Users, Lightbulb, LogOut, Shield,
  ArrowRight, FileText, TrendingUp, Plus,
  Settings, BarChart2, CheckSquare, Video, Star
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  department_id: string;
  is_expert: boolean;
}

// ── Role-specific action configs ──────────────────────────────────────────────

const staffActions = [
  { href: "/knowledge", icon: BookOpen, label: "Knowledge Base", desc: "Search SOPs & procedures", color: "bg-amber-50 text-amber-600" },
  { href: "/experts", icon: Users, label: "Find an Expert", desc: "Ask a subject matter expert", color: "bg-blue-50 text-blue-600" },
  { href: "/lessons-learned", icon: Shield, label: "Lessons Learned", desc: "Browse incident reports", color: "bg-rose-50 text-rose-600" },
  { href: "/innovation", icon: Lightbulb, label: "Submit an Idea", desc: "Propose an improvement", color: "bg-violet-50 text-violet-600" },
];

const expertActions = [
  { href: "/knowledge/new", icon: Plus, label: "Add Knowledge", desc: "Document your expertise", color: "bg-amber-50 text-amber-600" },
  { href: "/lessons-learned/new", icon: Shield, label: "Log an AAR", desc: "Record a lessons learned", color: "bg-rose-50 text-rose-600" },
  { href: "/knowledge", icon: Video, label: "Knowledge Base", desc: "Browse & update articles", color: "bg-blue-50 text-blue-600" },
  { href: "/experts", icon: Star, label: "Expert Directory", desc: "View your expert profile", color: "bg-emerald-50 text-emerald-600" },
];

const adminActions = [
  { href: "/knowledge", icon: FileText, label: "All Articles", desc: "Review & manage content", color: "bg-amber-50 text-amber-600" },
  { href: "/experts", icon: Users, label: "Manage Experts", desc: "Expert profiles & access", color: "bg-blue-50 text-blue-600" },
  { href: "/innovation", icon: BarChart2, label: "Innovation Pipeline", desc: "Review submitted ideas", color: "bg-violet-50 text-violet-600" },
  { href: "/lessons-learned", icon: CheckSquare, label: "AAR Database", desc: "Incident reports & trends", color: "bg-rose-50 text-rose-600" },
];

const roleConfig = {
  admin: {
    label: "Administrator",
    badge: "bg-rose-100 text-rose-700",
    greeting: "System Overview",
    subtitle: "Manage content, users, and organizational knowledge.",
    actions: adminActions,
    statsLabels: ["Total Articles", "Active Experts", "Open Ideas"],
  },
  expert: {
    label: "Expert",
    badge: "bg-amber-100 text-amber-700",
    greeting: "Knowledge Hub",
    subtitle: "Share your expertise and contribute to the organization.",
    actions: expertActions,
    statsLabels: ["My Articles", "My Contributions", "SOPs Acknowledged"],
  },
  staff: {
    label: "Staff",
    badge: "bg-blue-100 text-blue-700",
    greeting: "Welcome back",
    subtitle: "Find knowledge, connect with experts, and share ideas.",
    actions: staffActions,
    statsLabels: ["Total Articles", "Active Experts", "My Ideas"],
  },
};

function getRoleKey(profile: UserProfile | null): "admin" | "expert" | "staff" {
  if (!profile) return "staff";
  if (profile.role === "admin") return "admin";
  if (profile.is_expert || profile.role === "expert") return "expert";
  return "staff";
}

export default function DashboardPage() {
  const [, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([0, 0, 0]);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      if (typeof window !== "undefined") {
        const demoProfileStr = localStorage.getItem("kms_demo_profile");
        if (demoProfileStr) {
          try {
            const demoProfile = JSON.parse(demoProfileStr);
            setProfile(demoProfile);
            const { count: tc } = await supabase.from("knowledge_articles").select("*", { count: "exact", head: true });
            setStats([tc || 0, 0, 0]);
            setLoading(false);
            return;
          } catch { /* ignore */ }
        }
      }

      await new Promise((r) => setTimeout(r, 100));
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { if (mounted) router.push("/login"); return; }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { if (mounted) router.push("/login"); return; }
      if (!mounted) return;
      setUser(user);

      const { data: profileData } = await supabase.from("user_profiles").select("*").eq("id", user.id).single();
      if (!profileData) { if (mounted) router.push("/onboarding"); return; }

      let s0 = 0, s1 = 0, s2 = 0;
      try {
        const roleKey = getRoleKey(profileData as UserProfile);
        if (roleKey === "admin") {
          const { count: tc } = await supabase.from("knowledge_articles").select("*", { count: "exact", head: true });
          const { count: ec } = await supabase.from("user_profiles").select("*", { count: "exact", head: true }).eq("is_expert", true);
          const { count: ic } = await supabase.from("innovation_ideas").select("*", { count: "exact", head: true }).eq("status", "submitted");
          s0 = tc || 0; s1 = ec || 0; s2 = ic || 0;
        } else if (roleKey === "expert") {
          const { count: mc } = await supabase.from("knowledge_articles").select("*", { count: "exact", head: true }).eq("author_id", user.id);
          const { count: tc } = await supabase.from("knowledge_articles").select("*", { count: "exact", head: true });
          const { count: sa } = await supabase.from("sop_acknowledgments").select("*", { count: "exact", head: true }).eq("user_id", user.id);
          s0 = mc || 0; s1 = tc || 0; s2 = sa || 0;
        } else {
          const { count: tc } = await supabase.from("knowledge_articles").select("*", { count: "exact", head: true });
          const { count: ec } = await supabase.from("user_profiles").select("*", { count: "exact", head: true }).eq("is_expert", true);
          const { count: ic } = await supabase.from("innovation_ideas").select("*", { count: "exact", head: true }).eq("submitted_by", user.id);
          s0 = tc || 0; s1 = ec || 0; s2 = ic || 0;
        }
      } catch { /* tables may not exist yet */ }

      if (mounted) {
        setProfile(profileData as UserProfile);
        setStats([s0, s1, s2]);
        setLoading(false);
      }
    };

    checkAuth();
    return () => { mounted = false; };
  }, [router, supabase]);

  const handleLogout = async () => {
    if (typeof window !== "undefined") localStorage.removeItem("kms_demo_profile");
    document.cookie = "kms_demo_profile=; path=/; max-age=0";
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-semibold tracking-widest uppercase">Loading</p>
        </div>
      </div>
    );
  }

  const roleKey = getRoleKey(profile);
  const config = roleConfig[roleKey];
  const initials = `${profile?.first_name?.[0] ?? ""}${profile?.last_name?.[0] ?? ""}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="container mx-auto px-5 py-8 max-w-5xl">

        {/* ── TOP BAR ── */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-black font-bold text-sm shrink-0">
              {initials}
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">
                {profile?.first_name} {profile?.last_name}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide ${config.badge}`}>
                  {config.label}
                </span>
                {profile?.department_id && (
                  <span className="text-[11px] text-slate-400 font-medium capitalize">
                    · {profile.department_id.replace(/_/g, " ")}
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 h-8"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </Button>
        </div>

        {/* ── WELCOME ── */}
        <div className="mb-8">
          <p className="text-xs font-bold text-amber-600 tracking-widest uppercase mb-1">{config.greeting}</p>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {profile?.first_name ?? "User"}
          </h1>
          <p className="text-slate-400 text-sm mt-1 font-normal">{config.subtitle}</p>
        </div>

        {/* ── STATS ── */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {config.statsLabels.map((label, i) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{label}</div>
              <div className="text-3xl font-bold text-slate-900">{stats[i]}</div>
            </div>
          ))}
        </div>

        {/* ── ROLE-SPECIFIC ACTIONS ── */}
        <div className="mb-3">
          <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase">
            {roleKey === "admin" ? "Management Tools" : roleKey === "expert" ? "Contribute" : "Quick Access"}
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {config.actions.map(({ href, icon: Icon, label, desc, color }) => (
            <Link key={href + label} href={href} className="group block">
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="font-bold text-slate-900 text-sm mb-1">{label}</div>
                <div className="text-xs text-slate-400 font-normal leading-relaxed">{desc}</div>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-amber-600 transition-colors">
                  Open <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── ROLE-SPECIFIC BOTTOM BANNER ── */}
        {roleKey === "admin" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <Settings className="h-5 w-5 text-slate-500" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">System Administration</div>
                <div className="text-xs text-slate-400 mt-0.5">Manage users, departments, and system settings.</div>
              </div>
            </div>
            <Link href="/knowledge/new">
              <Button className="bg-slate-900 hover:bg-amber-500 hover:text-black text-white text-xs font-bold h-9 px-5 rounded-xl shrink-0 gap-1.5 transition-all">
                <Plus className="h-3.5 w-3.5" /> Add Content
              </Button>
            </Link>
          </div>
        )}

        {roleKey === "expert" && (
          <div className="bg-amber-50 rounded-2xl border border-amber-100 shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <Star className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">You're a recognized expert</div>
                <div className="text-xs text-slate-500 mt-0.5">Your knowledge contributions help the entire organization.</div>
              </div>
            </div>
            <Link href="/knowledge/new">
              <Button className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold h-9 px-5 rounded-xl shrink-0 gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Share Knowledge
              </Button>
            </Link>
          </div>
        )}

        {roleKey === "staff" && (
          <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                <Shield className="h-5 w-5 text-rose-500" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">After-Action Reviews</div>
                <div className="text-xs text-slate-400 mt-0.5">Searchable incident reports and operational lessons.</div>
              </div>
            </div>
            <Link href="/lessons-learned">
              <Button className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold h-9 px-5 rounded-xl shrink-0 gap-1.5">
                View AAR Database <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        )}

      </main>
    </div>
  );
}
