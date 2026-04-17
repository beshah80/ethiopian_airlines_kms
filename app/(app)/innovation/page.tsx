"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Lightbulb, Plus, TrendingUp, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type InnovationIdea = {
  id: string;
  title: string;
  description: string;
  department: string;
  estimated_impact: "low" | "medium" | "high";
  status: "submitted" | "under_review" | "approved" | "implemented" | "rejected";
  votes: number;
  created_at: string;
};

const impactColors: Record<string, string> = {
  high: "bg-rose-50 text-rose-700 border-rose-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-slate-100 text-slate-600 border-slate-200",
};

const statusColors: Record<string, string> = {
  implemented: "bg-emerald-50 text-emerald-700",
  approved: "bg-blue-50 text-blue-700",
  under_review: "bg-amber-50 text-amber-700",
  rejected: "bg-red-50 text-red-600",
  submitted: "bg-slate-100 text-slate-600",
};

export default function InnovationHubPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [ideas, setIdeas] = useState<InnovationIdea[]>([]);
  const [sortBy, setSortBy] = useState("votes");
  const [q, setQ] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) { router.push("/login"); return; }

      let query = supabase.from("innovation_ideas").select("id,title,description,department,estimated_impact,status,votes,created_at");
      query = sortBy === "votes" ? query.order("votes", { ascending: false }) : query.order("created_at", { ascending: false });
      if (q.trim()) query = query.ilike("title", `%${q.trim()}%`);

      const { data } = await query;
      setIdeas((data ?? []) as InnovationIdea[]);
      setLoading(false);
    };
    load();
  }, [router, sortBy, q, supabase]);

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="container mx-auto px-5 py-10 max-w-6xl">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1 mb-3">
              <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-amber-700 text-xs font-bold tracking-widest uppercase">Innovation Hub</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Ideas & Improvements</h1>
            <p className="text-slate-400 text-sm mt-1 font-normal">Submit, vote, and track operational improvements.</p>
          </div>
          <Link href="/innovation/new">
            <Button className="bg-slate-900 hover:bg-amber-500 hover:text-black text-white font-bold text-xs h-10 px-5 rounded-xl gap-2 transition-all">
              <Plus className="h-4 w-4" /> Submit Idea
            </Button>
          </Link>
        </div>

        {/* Search + Sort */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 mb-8 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search ideas..."
              className="pl-10 h-10 bg-slate-50 border-none rounded-xl text-sm font-medium placeholder:text-slate-300 focus-visible:ring-1 focus-visible:ring-amber-500/30"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-10 px-4 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase tracking-wider text-slate-500 cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500/30"
          >
            <option value="votes">Top Voted</option>
            <option value="recent">Most Recent</option>
          </select>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Ideas", value: ideas.length },
            { label: "Implemented", value: ideas.filter(i => i.status === "implemented").length },
            { label: "High Impact", value: ideas.filter(i => i.estimated_impact === "high").length },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-slate-900">{value}</div>
              <div className="text-xs text-slate-400 font-medium mt-0.5 uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>

        {/* Ideas grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Loading ideas...</p>
          </div>
        ) : ideas.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-2xl border border-slate-100">
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="h-7 w-7 text-slate-300" />
            </div>
            <h3 className="font-bold text-slate-900 mb-1">No ideas yet</h3>
            <p className="text-slate-400 text-sm mb-6 font-normal">Be the first to submit an improvement idea.</p>
            <Link href="/innovation/new">
              <Button className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs h-9 px-5 rounded-xl">Submit an Idea</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ideas.map((idea) => (
              <Link key={idea.id} href={`/innovation/${idea.id}`} className="group block">
                <div className="h-full bg-white rounded-2xl border border-slate-100 hover:border-amber-500/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col overflow-hidden">
                  <div className="p-5 flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border", impactColors[idea.estimated_impact])}>
                        {idea.estimated_impact} impact
                      </span>
                      <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg", statusColors[idea.status])}>
                        {idea.status.replace("_", " ")}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug mb-2 group-hover:text-amber-600 transition-colors line-clamp-2">
                      {idea.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 font-normal leading-relaxed">{idea.description}</p>
                  </div>
                  <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium capitalize">{idea.department.replace("_", " ")}</span>
                    <div className="flex items-center gap-1 text-amber-600 font-bold text-xs">
                      <TrendingUp className="h-3.5 w-3.5" />
                      {idea.votes}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
