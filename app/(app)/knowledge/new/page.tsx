"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

type ArticleStatus = "draft" | "review" | "published";
type ArticleLanguage = "en" | "am" | "both";

type KnowledgeArticleInsert = {
  title: string;
  category: string;
  status: ArticleStatus;
  language: ArticleLanguage;
  tags: string[];
  author_id: string;
  content: string | null;
  content_am: string | null;
  video_url: string | null;
};

export default function KnowledgeNewPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("general");
  const [status, setStatus] = useState<ArticleStatus>("draft");
  const [language, setLanguage] = useState<ArticleLanguage>("en");
  const [contentEn, setContentEn] = useState("");
  const [contentAm, setContentAm] = useState("");
  const [tags, setTags] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { data: auth } = await supabase.auth.getUser();
    let user = auth.user;
    let demoProfile = null;

    if (!user && typeof window !== 'undefined') {
       const demoStr = localStorage.getItem('kms_demo_profile');
       if (demoStr) demoProfile = JSON.parse(demoStr);
    }

    if (!user && !demoProfile) {
      router.push("/login");
      return;
    }

    const currentUserId = user?.id || demoProfile?.id;

    const tagArr = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload: KnowledgeArticleInsert = {
      title: title.trim(),
      category,
      status,
      language,
      tags: tagArr,
      author_id: currentUserId,
      content: language === "am" ? null : contentEn,
      content_am: language === "en" ? null : contentAm,
      video_url: null,
    };

    if (videoFile) {
      const fileExt = videoFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `videos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('knowledge_assets')
        .upload(filePath, videoFile);

      if (uploadError) {
        setError("Failed to upload video: " + uploadError.message);
        setSaving(false);
        return;
      }
      
      const { data: publicUrlData } = supabase.storage.from('knowledge_assets').getPublicUrl(filePath);
      payload.video_url = publicUrlData.publicUrl;
    }

    const { data, error } = await supabase.from("knowledge_articles").insert(payload).select("id").single();
    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    router.push(`/knowledge/${data.id}`);
    router.refresh();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">New article</h1>
            <p className="text-slate-600 mt-1">Create SOPs, training notes, safety guidance, and best practices.</p>
          </div>
          <Link href="/knowledge">
            <Button variant="outline">Back</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Article details</CardTitle>
            <CardDescription>Use bilingual fields for localization (English + Amharic).</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleCreate} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Passenger handling procedure (Bahir Dar) / 737 Hydraulic pressure low"
                  required
                />
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
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Flight Ops, HAAB, Weather, B787"
                />
              </div>

              <div className="space-y-2 pb-2">
                 <Label htmlFor="video">Tacit Video Capture (Optional)</Label>
                 <Input 
                   id="video" 
                   type="file" 
                   accept="video/*" 
                   onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                 />
                 <p className="text-xs text-slate-500">Record or upload a short troubleshooting or expert video.</p>
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
                      placeholder="Write the procedure / guidance in English…"
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
                      placeholder="በአማርኛ ይፃፉ…"
                      className="min-h-52"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="submit" className="bg-amber-600 hover:bg-amber-700" disabled={saving}>
                  {saving ? "Creating…" : "Create article"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

