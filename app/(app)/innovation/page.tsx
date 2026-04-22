"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  implemented: "bg-emerald-50 text-emerald-700 border-emerald-200",
  approved: "bg-blue-50 text-blue-700 border-blue-200",
  under_review: "bg-amber-50 text-amber-700 border-amber-200",
  rejected: "bg-red-50 text-red-600 border-red-200",
  submitted: "bg-slate-100 text-slate-600 border-slate-200",
};

const statusLabels: Record<string, string> = {
  implemented: "Implemented",
  approved: "Approved",
  under_review: "Under Review",
  rejected: "Rejected",
  submitted: "Submitted",
};

export default function InnovationPage() {
  const { profile, loading: authLoading, supabase } = useAuth();
  const [loading, setLoading] = useState(true);
  const [ideas, setIdeas] = useState<InnovationIdea[]>([]);
  const [sortBy, setSortBy] = useState("votes");
  const [q, setQ] = useState("");

  useEffect(() => {
    if (authLoading || !profile) return;

    const load = async () => {
      setLoading(true);

      let query = supabase.from("innovation_ideas").select("id,title,description,department,estimated_impact,status,votes,created_at");
      query = sortBy === "votes" ? query.order("votes", { ascending: false }) : query.order("created_at", { ascending: false });
      if (q.trim()) query = query.ilike("title", `%${q.trim()}%`);

      const { data } = await query;
      setIdeas((data ?? []) as InnovationIdea[]);
      setLoading(false);
    };
    load();
  }, [sortBy, q, supabase, profile, authLoading]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-violet-100 rounded-lg">
                <Lightbulb className="h-4 w-4 text-violet-700" />
              </div>
              <span className="text-sm font-medium text-violet-700">Innovation Hub</span>
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">Ideas & Improvements</h1>
            <p className="text-slate-500 text-sm mt-1">
              Submit, vote, and track operational improvements across the organization.
            </p>
          </div>
          <Link href="/innovation/new">
            <Button className="bg-slate-900 hover:bg-slate-800 text-white gap-2">
              <Plus className="h-4 w-4" />
              Submit Idea
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Ideas", value: ideas.length },
            { label: "Implemented", value: ideas.filter(i => i.status === "implemented").length },
            { label: "High Impact", value: ideas.filter(i => i.estimated_impact === "high").length },
          ].map(({ label, value }) => (
            <Card key={label} className="p-4 text-center border-slate-200">
              <div className="text-2xl font-semibold text-slate-900">{value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            </Card>
          ))}
        </div>

        {/* Search & Sort */}
        <Card className="p-4 mb-6 border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search ideas..."
                className="pl-9 bg-white border-slate-200"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-9 px-3 bg-white border border-slate-200 rounded-md text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="votes">Top Voted</option>
              <option value="recent">Most Recent</option>
            </select>
          </div>
        </Card>

        {/* Ideas Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3 text-slate-400">
              <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Loading ideas...</span>
            </div>
          </div>
        ) : ideas.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-slate-200 border-dashed">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="h-6 w-6 text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No ideas yet</h3>
            <p className="text-slate-500 text-sm mb-4">Be the first to submit an improvement idea.</p>
            <Link href="/innovation/new">
              <Button className="bg-amber-500 hover:bg-amber-600 text-white">Submit an Idea</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ideas.map((idea) => (
              <Link key={idea.id} href={`/innovation/${idea.id}`} className="group block">
                <Card className="h-full p-5 border-slate-200 hover:border-violet-300 hover:shadow-md transition-all duration-200">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs font-medium", impactColors[idea.estimated_impact])}
                    >
                      {idea.estimated_impact} impact
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs font-medium", statusColors[idea.status])}
                    >
                      {statusLabels[idea.status]}
                    </Badge>
                  </div>

                  {/* Content */}
                  <h3 className="font-medium text-slate-900 mb-2 line-clamp-2 group-hover:text-violet-600 transition-colors">
                    {idea.title}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4">{idea.description}</p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-xs text-slate-500 capitalize">
                      {idea.department.replace(/_/g, " ")}
                    </span>
                    <div className="flex items-center gap-1 text-violet-600 font-medium text-sm">
                      <TrendingUp className="h-4 w-4" />
                      {idea.votes}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
