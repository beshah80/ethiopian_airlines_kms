"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type Article = {
  id: string;
  title: string;
  category: string;
  status: string;
  created_at: string;
  updated_at: string;
  helpful_count: number;
  view_count: number;
  department_id: string | null;
  language: "en" | "am" | "both";
};

export default function KnowledgeIndexPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("published");

  useEffect(() => {
    // Read initial filters from URL on client (avoids build-time suspense requirements).
    const sp = new URLSearchParams(window.location.search);
    setQ(sp.get("q") ?? "");
    setCategory(sp.get("category") ?? "all");
    setStatus(sp.get("status") ?? "published");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        router.push("/login");
        return;
      }

      let query = supabase
        .from("knowledge_articles")
        .select(
          "id,title,category,status,created_at,updated_at,helpful_count,view_count,department_id,language"
        )
        .order("updated_at", { ascending: false })
        .limit(50);

      if (status !== "all") query = query.eq("status", status);
      if (category !== "all") query = query.eq("category", category);
      if (q.trim()) query = query.ilike("title", `%${q.trim()}%`);

      const { data } = await query;
      setArticles((data ?? []) as Article[]);
      setLoading(false);
    };

    load();
  }, [category, q, router, status, supabase]);

  const applyFilters = () => {
    const next = new URLSearchParams();
    if (q.trim()) next.set("q", q.trim());
    if (category !== "all") next.set("category", category);
    if (status !== "published") next.set("status", status);
    router.push(`/knowledge${next.toString() ? `?${next.toString()}` : ""}`);
  };

  return (
    <div className="min-h-screen bg-slate-50/30">
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-amber-600 bg-amber-500/5 border border-amber-500/20 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest">
              <BookOpen className="h-4 w-4" />
              Intelligence Repository
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight italic uppercase italic">
              Knowledge <span className="text-amber-500 underline decoration-amber-500/20 underline-offset-8">Base</span>
            </h1>
            <p className="text-slate-500 font-medium max-w-2xl text-lg">
              Search and access official SOPs, best practices, and safety protocols. Verified and synchronized for global operations.
            </p>
          </div>
          <Link href="/knowledge/new">
            <Button className="bg-slate-900 hover:bg-slate-800 text-white font-black px-8 h-14 rounded-2xl shadow-xl shadow-slate-900/10 gap-2 overflow-hidden relative group">
              <div className="absolute inset-0 bg-amber-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <Plus className="h-5 w-5 relative z-10 group-hover:text-slate-950 transition-colors" />
              <span className="relative z-10 group-hover:text-slate-950 transition-colors uppercase italic">New Intelligence</span>
            </Button>
          </Link>
        </div>

        {/* Search Command Center */}
        <Card className="mb-12 border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
          <div className="p-2 md:p-3">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="h-5 w-5 text-slate-400 absolute left-6 top-1/2 -translate-y-1/2" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Query by title, fleet type, or protocol ID (e.g. '787 Hydraulic')..."
                  className="h-16 pl-14 pr-6 bg-slate-50 border-none rounded-3xl text-slate-900 font-bold placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-amber-500/20 text-base"
                />
              </div>
              <div className="flex gap-2">
                <select
                  className="h-16 px-6 bg-slate-50 border-none rounded-3xl text-sm font-black uppercase tracking-widest text-slate-600 cursor-pointer focus:ring-2 focus:ring-amber-500/20"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="sop">Official SOP</option>
                  <option value="lesson_learned">AAR Lesson</option>
                  <option value="best_practice">Best Practice</option>
                  <option value="safety">Safety Alert</option>
                </select>
                <Button 
                  onClick={applyFilters}
                  className="h-16 px-10 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-3xl uppercase italic tracking-widest"
                >
                  Execute Search
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Accessing Archives...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Search className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 uppercase italic">No Intel Found</h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto mt-2">The requested protocol does not exist. Please refine your search parameters or contribute a new entry.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((a) => (
              <Link key={a.id} href={`/knowledge/${a.id}`} className="group">
                <Card className="h-full border border-slate-200/60 bg-white hover:border-amber-500/50 transition-all duration-300 shadow-sm hover:shadow-2xl hover:-translate-y-2 rounded-[2rem] overflow-hidden flex flex-col">
                  <div className="p-8 flex-1">
                    <div className="flex items-center justify-between mb-6">
                      <Badge className={cn(
                        "font-black text-[10px] uppercase tracking-[0.15em] px-3 py-1 rounded-lg",
                        a.status === 'published' ? "bg-emerald-500/10 text-emerald-700" : "bg-amber-500/10 text-amber-700"
                      )}>
                        {a.status}
                      </Badge>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{new Date(a.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-black text-slate-900 leading-tight mb-4 group-hover:text-amber-600 transition-colors line-clamp-2">
                      {a.title}
                    </h3>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      <Badge variant="outline" className="border-slate-200 text-slate-500 font-bold text-[10px] uppercase tracking-widest px-2 py-0.5">
                        {a.category?.replace('_', ' ')}
                      </Badge>
                      <Badge className="bg-slate-900 text-white font-bold text-[10px] uppercase tracking-widest px-2 py-0.5">
                        {a.language === 'both' ? 'Bilingual (EN/AM)' : a.language?.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="px-8 py-5 bg-slate-50 flex items-center justify-between border-t border-slate-100 mt-auto">
                    <div className="flex items-center gap-4 text-slate-400">
                      <div className="flex items-center gap-1 text-[10px] font-black uppercase">
                        <span className="text-slate-900">{a.view_count}</span> VIEWS
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-black uppercase">
                        <span className="text-amber-600">{a.helpful_count}</span> HELPFUL
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:bg-amber-500 group-hover:border-amber-500 transition-all">
                      <Plus className="h-4 w-4 text-slate-400 group-hover:text-slate-950 rotate-45" />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

