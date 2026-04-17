"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Users, Mail, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type ExpertProfile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  department_id: string;
  role: string;
  expert_details?: {
    bio: string;
    areas_of_expertise: string[];
    years_experience: number;
    availability_status: string;
    contact_preferences: string;
  };
};

const availabilityStyle: Record<string, string> = {
  available: "bg-emerald-500",
  busy: "bg-amber-500",
  offline: "bg-slate-300",
};

export default function ExpertsPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [experts, setExperts] = useState<ExpertProfile[]>([]);
  const [q, setQ] = useState("");
  const [department, setDepartment] = useState("all");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: auth } = await supabase.auth.getUser();
      let user = auth.user;

      if (!user && typeof window !== "undefined") {
        const demoStr = localStorage.getItem("kms_demo_profile");
        if (demoStr) { setLoading(false); return; }
      }
      if (!user) { router.push("/login"); return; }

      let query = supabase
        .from("user_profiles")
        .select(`id,first_name,last_name,email,department_id,role,expert_details:expert_profiles(bio,areas_of_expertise,years_experience,availability_status,contact_preferences)`)
        .eq("is_expert", true)
        .limit(50);

      if (department !== "all") query = query.eq("department_id", department);

      const { data } = await query;
      let filtered = (data ?? []) as unknown as ExpertProfile[];

      if (q.trim()) {
        const lq = q.toLowerCase();
        filtered = filtered.filter((r) =>
          r.first_name.toLowerCase().includes(lq) ||
          r.last_name.toLowerCase().includes(lq) ||
          (r.expert_details as unknown as { areas_of_expertise?: string[] })?.areas_of_expertise?.join(" ").toLowerCase().includes(lq)
        );
      }

      const formatted = filtered.map((item) => ({
        ...item,
        expert_details: (item.expert_details as unknown as ExpertProfile["expert_details"][])?.[0] ?? {
          bio: "Senior Subject Matter Expert",
          areas_of_expertise: ["Operations", "Safety"],
          years_experience: 10,
          availability_status: "available",
          contact_preferences: "email",
        },
      }));

      setExperts(formatted);
      setLoading(false);
    };
    load();
  }, [department, q, router, supabase]);

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="container mx-auto px-5 py-10 max-w-6xl">

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1 mb-3">
            <Users className="h-3.5 w-3.5 text-amber-600" />
            <span className="text-amber-700 text-xs font-bold tracking-widest uppercase">Tacit Knowledge</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Expert Locator</h1>
          <p className="text-slate-400 text-sm mt-1 font-normal">Find and connect with subject matter experts across Ethiopian Airlines.</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 mb-8 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, skill, or aircraft type..."
              className="pl-10 h-10 bg-slate-50 border-none rounded-xl text-sm font-medium placeholder:text-slate-300 focus-visible:ring-1 focus-visible:ring-amber-500/30"
            />
          </div>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="h-10 px-4 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase tracking-wider text-slate-500 cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500/30"
          >
            <option value="all">All Departments</option>
            <option value="flight_ops">Flight Operations</option>
            <option value="engineering">Engineering & Maintenance</option>
            <option value="customer_service">Customer Service</option>
            <option value="ground_ops">Ground Operations</option>
            <option value="training">Training (EAU)</option>
          </select>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Loading experts...</p>
          </div>
        ) : experts.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-2xl border border-slate-100">
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="h-7 w-7 text-slate-300" />
            </div>
            <h3 className="font-bold text-slate-900 mb-1">No experts found</h3>
            <p className="text-slate-400 text-sm font-normal">Try adjusting your search or department filter.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {experts.map((expert) => {
              const details = expert.expert_details;
              const initials = `${expert.first_name?.[0] ?? ""}${expert.last_name?.[0] ?? ""}`;
              const avail = details?.availability_status ?? "offline";
              return (
                <div key={expert.id} className="bg-white rounded-2xl border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">
                            {initials}
                          </div>
                          <span className={cn("absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white", availabilityStyle[avail])} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{expert.first_name} {expert.last_name}</div>
                          <div className="text-xs text-slate-400 font-medium capitalize mt-0.5">
                            {expert.role} · {details?.years_experience ?? "—"} yrs
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Expertise</div>
                      <div className="flex flex-wrap gap-1.5">
                        {(details?.areas_of_expertise ?? []).slice(0, 4).map((tag) => (
                          <span key={tag} className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg">
                            {tag}
                          </span>
                        ))}
                        {(!details?.areas_of_expertise?.length) && (
                          <span className="text-xs text-slate-300">Not specified</span>
                        )}
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 font-medium capitalize mb-4">
                      {expert.department_id?.replace(/_/g, " ")}
                    </div>
                  </div>

                  <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex gap-2">
                    <Button className="flex-1 bg-slate-900 hover:bg-amber-500 hover:text-black text-white text-xs font-bold h-8 rounded-xl gap-1.5 transition-all">
                      <Mail className="h-3.5 w-3.5" /> Message
                    </Button>
                    <Button variant="outline" className="flex-1 text-xs font-bold h-8 rounded-xl gap-1.5">
                      <Clock className="h-3.5 w-3.5" /> Book Time
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
