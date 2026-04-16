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
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full text-xs font-medium mb-3">
            <BookOpen className="h-3.5 w-3.5" />
            Explicit knowledge repository
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Knowledge Base</h1>
          <p className="text-slate-600 mt-1">
            SOPs, best practices, safety notes, training materials — bilingual where possible.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/knowledge/new">
            <Button className="bg-amber-600 hover:bg-amber-700 gap-2">
              <Plus className="h-4 w-4" />
              New article
            </Button>
          </Link>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Search & filters</CardTitle>
          <CardDescription>Fast search by title (we’ll add full-text ranking next).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2 relative">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by title (e.g. 737 hydraulic, passenger handling)…"
                className="pl-9"
              />
            </div>
            <select
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">All categories</option>
              <option value="sop">SOP</option>
              <option value="lesson_learned">Lesson learned</option>
              <option value="best_practice">Best practice</option>
              <option value="innovation">Innovation</option>
              <option value="safety">Safety</option>
              <option value="training">Training</option>
              <option value="general">General</option>
            </select>
            <select
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="review">In review</option>
              <option value="archived">Archived</option>
              <option value="all">All statuses</option>
            </select>
          </div>

          <div className="mt-3 flex items-center justify-end">
            <Button variant="outline" onClick={applyFilters}>
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-slate-600">Loading articles…</p>
      ) : articles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-600">No articles found. Create the first one.</p>
            <div className="mt-4">
              <Link href="/knowledge/new">
                <Button className="bg-amber-600 hover:bg-amber-700">Create article</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((a) => (
            <Link key={a.id} href={`/knowledge/${a.id}`} className="block">
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base leading-snug line-clamp-2">{a.title}</CardTitle>
                    <Badge variant="secondary" className="shrink-0">
                      {a.status}
                    </Badge>
                  </div>
                  <CardDescription className="flex flex-wrap gap-2">
                    <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">{a.category}</Badge>
                    <Badge className="bg-amber-50 text-amber-800 hover:bg-amber-50">{a.language}</Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Helpful: {a.helpful_count}</span>
                    <span>Views: {a.view_count}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

