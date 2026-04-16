"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, ThumbsUp } from "lucide-react";

type Article = {
  id: string;
  title: string;
  category: string;
  status: string;
  language: "en" | "am" | "both";
  content: string | null;
  content_am: string | null;
  tags: string[] | null;
  helpful_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  video_url: string | null;
};

export default function KnowledgeViewPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState<Article | null>(null);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("knowledge_articles")
        .select(
          "id,title,category,status,language,content,content_am,tags,helpful_count,view_count,created_at,updated_at,video_url"
        )
        .eq("id", params.id)
        .single();

      setArticle((data ?? null) as Article | null);
      setLoading(false);

      if (data?.id) {
        // best-effort view count increment
        await supabase
          .from("knowledge_articles")
          .update({ view_count: (data.view_count ?? 0) + 1 })
          .eq("id", data.id);
      }
    };

    load();
  }, [params.id, router, supabase]);

  const handleLike = async () => {
    if (!article) return;
    setLiking(true);
    const next = (article.helpful_count ?? 0) + 1;
    setArticle({ ...article, helpful_count: next });
    await supabase.from("knowledge_articles").update({ helpful_count: next }).eq("id", article.id);
    setLiking(false);
  };

  if (loading) return <div className="container mx-auto px-4 py-8">Loading…</div>;
  if (!article)
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-10 text-center text-slate-600">Article not found.</CardContent>
        </Card>
      </div>
    );

  const showEn = article.language === "en" || article.language === "both";
  const showAm = article.language === "am" || article.language === "both";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <Link href="/knowledge" className="text-sm text-amber-700 hover:text-amber-800">
              ← Back to Knowledge Base
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 mt-2">{article.title}</h1>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">{article.category}</Badge>
              <Badge variant="secondary">{article.status}</Badge>
              <Badge className="bg-amber-50 text-amber-800 hover:bg-amber-50">{article.language}</Badge>
              {(article.tags ?? []).slice(0, 6).map((t) => (
                <Badge key={t} className="bg-white text-slate-700 border border-slate-200 hover:bg-white">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/knowledge/${article.id}/edit`}>
              <Button variant="outline" className="gap-2">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </Link>
            <Button onClick={handleLike} disabled={liking} className="bg-amber-600 hover:bg-amber-700 gap-2">
              <ThumbsUp className="h-4 w-4" />
              Helpful ({article.helpful_count ?? 0})
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Content</CardTitle>
            <CardDescription>
              Views: {article.view_count ?? 0} • Updated: {new Date(article.updated_at).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {article.video_url && (
              <div className="mb-6 rounded-lg overflow-hidden border border-slate-200">
                 <video controls className="w-full max-h-[400px] object-cover bg-black">
                    <source src={article.video_url} type="video/mp4" />
                    Your browser does not support the video tag.
                 </video>
              </div>
            )}
            <Tabs defaultValue={showEn ? "en" : "am"}>
              <TabsList>
                {showEn && <TabsTrigger value="en">English</TabsTrigger>}
                {showAm && <TabsTrigger value="am">Amharic</TabsTrigger>}
              </TabsList>
              {showEn && (
                <TabsContent value="en" className="mt-4">
                  <div className="prose prose-slate max-w-none whitespace-pre-wrap">
                    {article.content || "—"}
                  </div>
                </TabsContent>
              )}
              {showAm && (
                <TabsContent value="am" className="mt-4">
                  <div className="prose prose-slate max-w-none whitespace-pre-wrap">
                    {article.content_am || "—"}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

