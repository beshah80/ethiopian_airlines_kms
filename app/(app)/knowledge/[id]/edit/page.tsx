"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Article = {
  id: string;
  title: string;
  category: string;
  status: "draft" | "review" | "published" | "archived";
  language: "en" | "am" | "both";
  content: string | null;
  content_am: string | null;
  tags: string[] | null;
};

type ArticleStatus = Article["status"];
type ArticleLanguage = Article["language"];

type KnowledgeArticleUpdate = {
  title: string;
  category: string;
  status: ArticleStatus;
  language: ArticleLanguage;
  tags: string[];
  content: string | null;
  content_am: string | null;
};

export default function KnowledgeEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [article, setArticle] = useState<Article | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("general");
  const [status, setStatus] = useState<Article["status"]>("draft");
  const [language, setLanguage] = useState<Article["language"]>("en");
  const [contentEn, setContentEn] = useState("");
  const [contentAm, setContentAm] = useState("");
  const [tags, setTags] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      const { data: auth } = await supabase.auth.getUser();
      const isDemo = typeof window !== "undefined" && !!localStorage.getItem("kms_demo_profile");
      if (!auth.user && !isDemo) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("knowledge_articles")
        .select("id,title,category,status,language,content,content_am,tags")
        .eq("id", params.id)
        .single();

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const a = data as Article;
      setArticle(a);
      setTitle(a.title ?? "");
      setCategory(a.category ?? "general");
      setStatus(a.status ?? "draft");
      setLanguage(a.language ?? "en");
      setContentEn(a.content ?? "");
      setContentAm(a.content_am ?? "");
      setTags((a.tags ?? []).join(", "));
      setLoading(false);
    };

    load();
  }, [params.id, router, supabase]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!article) return;
    setSaving(true);
    setError(null);

    const tagArr = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload: KnowledgeArticleUpdate = {
      title: title.trim(),
      category,
      status,
      language,
      tags: tagArr,
      content: language === "am" ? null : contentEn,
      content_am: language === "en" ? null : contentAm,
    };

    const { error } = await supabase.from("knowledge_articles").update(payload).eq("id", article.id);
    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    router.push(`/knowledge/${article.id}`);
    router.refresh();
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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-5 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between gap-3 mb-8">
            <div>
              <p className="text-xs font-bold text-amber-600 tracking-widest uppercase mb-1">Knowledge Base</p>
              <h1 className="text-2xl font-bold text-slate-900">Edit Article</h1>
              <p className="text-slate-400 text-sm mt-0.5 font-normal">Update content, status, tags, and bilingual fields.</p>
            </div>
            <Link href={`/knowledge/${article.id}`}>
              <Button variant="outline" className="text-xs font-bold h-9">Cancel</Button>
            </Link>
          </div>

        <Card className="shadow-sm border-slate-100">
          <CardHeader className="border-b border-slate-50">
            <CardTitle className="text-base font-bold">Article Details</CardTitle>
            <CardDescription>Changes apply immediately (RLS controls who can edit).</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="sop">SOP</option>
                    <option value="training">Training</option>
                    <option value="safety">Safety</option>
                    <option value="best_practice">Best practice</option>
                    <option value="lesson_learned">Lesson learned</option>
                    <option value="innovation">Innovation</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ArticleStatus)}
                  >
                    <option value="draft">Draft</option>
                    <option value="review">In review</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <select
                    id="language"
                    className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as ArticleLanguage)}
                  >
                    <option value="en">English</option>
                    <option value="am">Amharic</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} />
              </div>

              <Tabs defaultValue="en">
                <TabsList>
                  <TabsTrigger value="en">English</TabsTrigger>
                  <TabsTrigger value="am">Amharic</TabsTrigger>
                </TabsList>
                <TabsContent value="en" className="mt-3">
                  <div className="space-y-2">
                    <Label htmlFor="contentEn">Content (EN)</Label>
                    <Textarea
                      id="contentEn"
                      value={contentEn}
                      onChange={(e) => setContentEn(e.target.value)}
                      className="min-h-52"
                    />
                  </div>
                </TabsContent>
                <TabsContent value="am" className="mt-3">
                  <div className="space-y-2">
                    <Label htmlFor="contentAm">Content (AM)</Label>
                    <Textarea
                      id="contentAm"
                      value={contentAm}
                      onChange={(e) => setContentAm(e.target.value)}
                      className="min-h-52"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="submit" className="bg-amber-500 hover:bg-amber-400 text-black font-bold" disabled={saving}>
                  {saving ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}

