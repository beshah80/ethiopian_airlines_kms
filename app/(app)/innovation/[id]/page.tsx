"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ThumbsUp, TrendingUp, Lightbulb } from "lucide-react";

type InnovationIdea = {
  id: string;
  title: string;
  description: string;
  department: string;
  estimated_impact: string;
  status: string;
  votes: number;
  created_at: string;
};

export default function InnovationViewPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);
  const [idea, setIdea] = useState<InnovationIdea | null>(null);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("innovation_ideas")
        .select("*")
        .eq("id", params.id)
        .single();

      setIdea((data ?? null) as InnovationIdea | null);
      setLoading(false);
    };

    load();
  }, [params.id, router, supabase]);

  const handleVote = async () => {
    if (!idea) return;
    setVoting(true);
    
    // In a real app, track votes per user in a junction table to prevent multiple votes natively.
    const newVotes = (idea.votes ?? 0) + 1;
    setIdea({ ...idea, votes: newVotes });
    
    await supabase.from("innovation_ideas").update({ votes: newVotes }).eq("id", idea.id);
    setVoting(false);
  };

  if (loading) return <div className="container mx-auto px-4 py-8 text-center text-slate-500">Loading idea details...</div>;
  if (!idea) return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardContent className="py-12 text-center text-slate-600">Idea not found or deleted.</CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/innovation" className="inline-flex items-center text-sm text-indigo-700 hover:text-indigo-800 mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Innovation Hub
      </Link>
      
      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
           <div>
             <div className="flex gap-2 items-center mb-4">
                <Badge variant="outline" className="text-indigo-700 border-indigo-200 bg-indigo-50">
                  {idea.department.replace('_', ' ').toUpperCase()}
                </Badge>
                <Badge className={
                  idea.status === 'implemented' ? "bg-emerald-500" :
                  idea.status === 'approved' ? "bg-blue-500" :
                  idea.status === 'rejected' ? "bg-red-500" :
                  "bg-slate-500"
                }>
                  Status: {idea.status.replace('_', ' ').toUpperCase()}
                </Badge>
             </div>
             
             <h1 className="text-3xl font-bold text-slate-900 mb-2">{idea.title}</h1>
             <p className="text-sm text-slate-500">
               Submitted on {new Date(idea.created_at).toLocaleDateString()}
             </p>
           </div>
           
           <Card>
             <CardHeader>
               <CardTitle className="text-lg">Idea Description</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="prose prose-slate max-w-none whitespace-pre-wrap text-slate-700">
                 {idea.description}
               </div>
             </CardContent>
           </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
           <Card className="border-2 border-indigo-100 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10 mix-blend-multiply opacity-50"></div>
             <CardContent className="pt-6 text-center">
               <div className="text-5xl font-bold text-indigo-700 mb-2">{idea.votes}</div>
               <div className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-6">Total Votes</div>
               
               <Button 
                 size="lg" 
                 onClick={handleVote} 
                 disabled={voting} 
                 className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2 h-12 text-base shadow-md hover:shadow-lg transition-all"
               >
                 <TrendingUp className="h-5 w-5" />
                 Upvote Idea
               </Button>
             </CardContent>
           </Card>

           <Card>
             <CardHeader>
                <CardTitle className="text-sm uppercase text-slate-500 tracking-wider">At a glance</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                <div>
                   <h4 className="text-xs text-slate-500 mb-1">Estimated Impact</h4>
                   <p className="font-medium capitalize text-slate-900">{idea.estimated_impact}</p>
                </div>
                <div>
                   <h4 className="text-xs text-slate-500 mb-1">Target Department</h4>
                   <p className="font-medium capitalize text-slate-900">{idea.department.replace('_', ' ')}</p>
                </div>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
