"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Search, Eye, ThumbsUp } from "lucide-react";
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

const categoryColors: Record<string, string> = {
  sop: "bg-blue-50 text-blue-700 border-blue-200",
  lesson_learned: "bg-amber-50 text-amber-700 border-amber-200",
  best_practice: "bg-emerald-50 text-emerald-700 border-emerald-200",
  safety: "bg-rose-50 text-rose-700 border-rose-200",
  general: "bg-slate-50 text-slate-700 border-slate-200",
};

const categoryLabels: Record<string, string> = {
  sop: "SOP",
  lesson_learned: "Lesson Learned",
  best_practice: "Best Practice",
  safety: "Safety Alert",
  general: "General",
};

export default function KnowledgePage() {
  const { profile, loading: authLoading, supabase } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setQ(sp.get("q") ?? "");
    setCategory(sp.get("category") ?? "all");
  }, []);

  useEffect(() => {
    if (authLoading || !profile) return;

    const load = async () => {
      setLoading(true);
      
      let query = supabase
        .from("knowledge_articles")
        .select("id,title,category,status,created_at,updated_at,helpful_count,view_count,department_id,language")
        .eq("status", "published")
        .order("updated_at", { ascending: false })
        .limit(50);

      if (category !== "all") query = query.eq("category", category);
      if (q.trim()) query = query.ilike("title", `%${q.trim()}%`);

      const { data } = await query;
      setArticles((data ?? []) as Article[]);
      setLoading(false);
    };

    load();
  }, [category, q, supabase, profile, authLoading]);

  const applyFilters = () => {
    const next = new URLSearchParams();
    if (q.trim()) next.set("q", q.trim());
    if (category !== "all") next.set("category", category);
    router.push(`/knowledge${next.toString() ? `?${next.toString()}` : ""}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-amber-100 rounded-lg">
                <BookOpen className="h-4 w-4 text-amber-700" />
              </div>
              <span className="text-sm font-medium text-amber-700">Knowledge Repository</span>
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">Knowledge Base</h1>
            <p className="text-slate-500 text-sm mt-1">
              Access official SOPs, best practices, safety protocols, and operational guidance.
            </p>
          </div>
          <Link href="/knowledge/new">
            <Button className="bg-slate-900 hover:bg-slate-800 text-white gap-2">
              <Plus className="h-4 w-4" />
              New Article
            </Button>
          </Link>
        </div>

        {/* Search & Filters */}
        <Card className="p-4 mb-6 border-slate-200 shadow-sm">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                placeholder="Search articles by title..."
                className="pl-9 bg-white border-slate-200"
              />
            </div>
            <div className="flex gap-2">
              <select
                className="h-9 px-3 bg-white border border-slate-200 rounded-md text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="sop">SOP</option>
                <option value="lesson_learned">Lessons Learned</option>
                <option value="best_practice">Best Practices</option>
                <option value="safety">Safety Alerts</option>
              </select>
              <Button onClick={applyFilters} className="bg-amber-500 hover:bg-amber-600 text-white">
                Search
              </Button>
            </div>
          </div>
        </Card>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3 text-slate-400">
              <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Loading articles...</span>
            </div>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-slate-200 border-dashed">
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-6 w-6 text-amber-500" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {q ? "No articles match your search" : "No articles yet"}
            </h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
              {q 
                ? "Try different search terms or clear filters to see all articles."
                : "Create the first knowledge article to help your colleagues find important information."
              }
            </p>
            {!q && (
              <Link href="/knowledge/new">
                <Button className="bg-amber-500 hover:bg-amber-600 text-white gap-2">
                  <Plus className="h-4 w-4" />
                  Create First Article
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((article) => (
              <Link key={article.id} href={`/knowledge/${article.id}`} className="group">
                <Card className="h-full p-5 border-slate-200 hover:border-amber-300 hover:shadow-md transition-all duration-200">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs font-medium", categoryColors[article.category] || categoryColors.general)}
                    >
                      {categoryLabels[article.category] || article.category}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {new Date(article.updated_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-medium text-slate-900 mb-3 line-clamp-2 group-hover:text-amber-600 transition-colors">
                    {article.title}
                  </h3>

                  {/* Language Badge */}
                  <div className="mb-4">
                    <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600">
                      {article.language === "both" ? "English & Amharic" : article.language === "en" ? "English" : "Amharic"}
                    </Badge>
                  </div>

                  {/* Footer Stats */}
                  <div className="flex items-center gap-4 pt-4 border-t border-slate-100 text-sm text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Eye className="h-4 w-4" />
                      <span>{article.view_count}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ThumbsUp className="h-4 w-4" />
                      <span>{article.helpful_count}</span>
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

