"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Plus, ThumbsUp, TrendingUp, Filter } from "lucide-react";

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
      if (!auth.user) {
        router.push("/login");
        return;
      }

      let query = supabase
        .from("innovation_ideas")
        .select("id, title, description, department, estimated_impact, status, votes, created_at");

      if (sortBy === "votes") {
        query = query.order("votes", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      if (q.trim()) query = query.ilike("title", `%${q.trim()}%`);

      const { data } = await query;
      setIdeas((data ?? []) as InnovationIdea[]);
      setLoading(false);
    };

    load();
  }, [router, sortBy, q, supabase]);

  const getImpactColor = (impact: string) => {
    switch(impact) {
      case 'high': return "bg-red-50 text-red-700 border-red-200";
      case 'medium': return "bg-amber-50 text-amber-700 border-amber-200";
      default: return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'implemented': return <Badge className="bg-emerald-500">Implemented</Badge>;
      case 'approved': return <Badge className="bg-blue-500">Approved</Badge>;
      case 'under_review': return <Badge variant="secondary">In Review</Badge>;
      case 'rejected': return <Badge variant="destructive">Declined</Badge>;
      default: return <Badge variant="outline">Submitted</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full text-xs font-medium mb-3">
            <Lightbulb className="h-3.5 w-3.5" />
            Ideation & Continuous Improvement
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Innovation Hub</h1>
          <p className="text-slate-600 mt-1">
            Submit, vote on, and track solutions to operational challenges.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/innovation/new">
            <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
              <Plus className="h-4 w-4" />
              Submit Idea
            </Button>
          </Link>
        </div>
      </div>

      {/* Analytics / Highlight Row */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardDescription className="text-indigo-100 font-medium">Idea Pipeline</CardDescription>
            <CardTitle className="text-4xl">{ideas.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-indigo-100 opacity-90">Total active proposals from all departments</p>
          </CardContent>
        </Card>
        <div className="md:col-span-2 flex items-center justify-end">
             <div className="w-full flex gap-3">
                <div className="relative flex-1">
                  <Input 
                    placeholder="Search proposals..." 
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="w-full"
                  />
                </div>
                <select 
                   value={sortBy} 
                   onChange={(e) => setSortBy(e.target.value)}
                   className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                >
                  <option value="votes">Top Voted</option>
                  <option value="recent">Most Recent</option>
                </select>
             </div>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-600">Loading ideas...</p>
      ) : ideas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center flex flex-col items-center">
            <div className="bg-slate-100 p-4 rounded-full mb-4">
               <Lightbulb className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No ideas found</h3>
            <p className="text-slate-500 mb-4">Be the first to submit a process improvement idea.</p>
            <Link href="/innovation/new">
              <Button className="bg-indigo-600 hover:bg-indigo-700">Submit an idea</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideas.map((idea) => (
             <Link key={idea.id} href={`/innovation/${idea.id}`} className="block h-full">
                <Card className="h-full flex flex-col hover:shadow-md transition-all hover:-translate-y-1 duration-200">
                  <CardHeader className="pb-3 border-b border-slate-100">
                    <div className="flex justify-between items-start mb-2">
                       <Badge variant="outline" className={`capitalize border ${getImpactColor(idea.estimated_impact)}`}>
                         {idea.estimated_impact} Impact
                       </Badge>
                       {getStatusBadge(idea.status)}
                    </div>
                    <CardTitle className="text-lg leading-snug line-clamp-2">{idea.title}</CardTitle>
                    <CardDescription className="capitalize pt-1 flex items-center gap-1.5 text-xs font-medium">
                       <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                       {idea.department.replace('_', ' ')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 flex-grow">
                    <p className="text-sm text-slate-600 line-clamp-3">
                      {idea.description}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center rounded-b-xl">
                     <span className="text-xs text-slate-500">
                        {new Date(idea.created_at).toLocaleDateString()}
                     </span>
                     <div className="flex items-center gap-1.5 text-indigo-700 font-semibold text-sm">
                        <TrendingUp className="h-4 w-4" />
                        {idea.votes} votes
                     </div>
                  </CardFooter>
                </Card>
             </Link>
          ))}
        </div>
      )}
    </div>
  );
}
