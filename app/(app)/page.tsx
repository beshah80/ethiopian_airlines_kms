"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Search, 
  Lightbulb, 
  BookOpen, 
  Users, 
  Shield, 
  Plus,
  TrendingUp,
  MessageCircle,
  Bookmark,
  ChevronRight,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
type Article = {
  id: string;
  title: string;
  category: string;
  helpful_count: number;
  language: string;
};

type Idea = {
  id: string;
  title: string;
  votes: number;
  status: string;
  myVote?: boolean;
};

type Expert = {
  id: string;
  first_name: string;
  last_name: string;
  department_id: string;
  expertise_tags: string[];
};

type Lesson = {
  id: string;
  title: string;
  department: string;
  incident_date: string;
  preventability: string;
};

type ArticleHistory = {
  id: string;
  title: string;
  category: string;
  read_at: string;
  acknowledged?: boolean;
};

const categoryColors: Record<string, string> = {
  sop: "bg-blue-50 text-blue-700 border-blue-200",
  safety: "bg-rose-50 text-rose-700 border-rose-200",
  best_practice: "bg-emerald-50 text-emerald-700 border-emerald-200",
  lesson_learned: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function StaffHubPage() {
  const { profile, loading: authLoading, supabase } = useAuth();
  const [activeTab, setActiveTab] = useState("feed");
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [myIdeas, setMyIdeas] = useState<Idea[]>([]);
  const [articleHistory, setArticleHistory] = useState<ArticleHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !profile || !supabase) return;

    const loadData = async () => {
      setLoading(true);
      try {
        // Load articles
        const { data: articlesData } = await supabase
          .from("knowledge_articles")
          .select("id, title, category, helpful_count, language")
          .eq("status", "published")
          .order("updated_at", { ascending: false })
          .limit(5);
        setArticles(articlesData || []);

        // Load ideas
        const { data: ideasData } = await supabase
          .from("innovation_ideas")
          .select("id, title, votes, status")
          .order("votes", { ascending: false })
          .limit(5);
        setIdeas(ideasData || []);

        // Load my ideas
        const { data: myIdeasData } = await supabase
          .from("innovation_ideas")
          .select("id, title, votes, status")
          .eq("submitted_by", profile.id)
          .order("created_at", { ascending: false });
        setMyIdeas(myIdeasData || []);

        // Load experts
        const { data: expertsData } = await supabase
          .from("user_profiles")
          .select("id, first_name, last_name, department_id, expertise_tags")
          .eq("is_expert", true)
          .limit(4);
        setExperts(expertsData || []);

        // Load lessons
        const { data: lessonsData } = await supabase
          .from("lessons_learned")
          .select("id, title, department, incident_date, preventability")
          .order("incident_date", { ascending: false })
          .limit(3);
        setLessons(lessonsData || []);

        // Load article history (mock data for now - would come from article_reads table)
        const mockArticleHistory: ArticleHistory[] = [
          {
            id: "1",
            title: "Passenger Handling Procedures - Bole International",
            category: "sop",
            read_at: new Date(Date.now() - 86400000).toISOString(),
            acknowledged: true
          },
          {
            id: "2", 
            title: "Weather Alert: HAAB Thunderstorm Protocol",
            category: "safety",
            read_at: new Date(Date.now() - 172800000).toISOString(),
            acknowledged: false
          }
        ];
        setArticleHistory(mockArticleHistory);
      } catch (err) {
        console.error("Failed to load data:", err);
      }
      setLoading(false);
    };

    loadData();
  }, [profile, authLoading, supabase]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  const initials = `${profile?.first_name?.[0] || ""}${profile?.last_name?.[0] || ""}`;
  const displayName = `${profile?.first_name || ""} ${profile?.last_name || ""}`;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ET</span>
            </div>
            <span className="font-semibold text-slate-900 hidden sm:block">Knowledge Hub</span>
          </div>
          
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search knowledge, experts, ideas..."
                className="pl-9 h-9 bg-slate-100 border-0 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Link href="/profile">
            <Avatar className="h-8 w-8 bg-amber-500 cursor-pointer">
              <AvatarFallback className="bg-amber-500 text-white text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        
        {/* Profile Section */}
        <Card className="p-4 mb-6 border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 bg-amber-500">
                <AvatarFallback className="bg-amber-500 text-white text-sm font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">{displayName}</h1>
                <p className="text-sm text-slate-500">{profile?.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="text-xs bg-blue-100 text-blue-700">
                    {profile?.role}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    {myIdeas.length} ideas submitted
                  </span>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-rose-600 hover:bg-rose-50"
              onClick={() => supabase?.auth.signOut()}
            >
              Sign Out
            </Button>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <QuickActionButton 
            icon={Lightbulb} 
            label="Idea" 
            color="bg-violet-50 text-violet-600"
            href="/innovation/new"
          />
          <QuickActionButton 
            icon={BookOpen} 
            label="Article" 
            color="bg-blue-50 text-blue-600"
            href="/knowledge/new"
          />
          <QuickActionButton 
            icon={Shield} 
            label="Incident" 
            color="bg-rose-50 text-rose-600"
            href="/lessons-learned/new"
          />
          <QuickActionButton 
            icon={MessageCircle} 
            label="Ask" 
            color="bg-emerald-50 text-emerald-600"
            href="/experts"
          />
        </div>

        {/* Your Ideas Section */}
        {myIdeas.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900">Your Ideas</h2>
              <Link href="/profile?tab=ideas" className="text-xs text-amber-600 hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-2">
              {myIdeas.map((idea) => (
                <Card key={idea.id} className="p-3 border-slate-200">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {idea.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {idea.status}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          {idea.votes} votes
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-violet-600">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-semibold">{idea.votes}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Article History */}
        {articleHistory.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900">Article History</h2>
              <Link href="/knowledge" className="text-xs text-amber-600 hover:underline">
                Browse all
              </Link>
            </div>
            <div className="space-y-2">
              {articleHistory.map((article) => (
                <Card key={article.id} className="p-3 border-slate-200">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 line-clamp-2">
                        {article.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", categoryColors[article.category] || categoryColors.sop)}
                        >
                          {article.category}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          {new Date(article.read_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {article.acknowledged && (
                      <Badge className="text-xs bg-emerald-100 text-emerald-700">
                        Acknowledged
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Trending Ideas */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900">Trending Ideas</h2>
            <Link href="/innovation" className="text-xs text-amber-600 hover:underline">
              See all
            </Link>
          </div>
          <div className="space-y-2">
            {ideas.slice(0, 3).map((idea) => (
              <Card key={idea.id} className="p-3 border-slate-200 hover:border-violet-300 transition-colors cursor-pointer">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 line-clamp-2">
                      {idea.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {idea.status}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-violet-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {idea.votes}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Knowledge For You */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900">Knowledge Base</h2>
            <Link href="/knowledge" className="text-xs text-amber-600 hover:underline">
              Browse all
            </Link>
          </div>
          <div className="space-y-2">
            {articles.map((article) => (
              <Link key={article.id} href={`/knowledge/${article.id}`}>
                <Card className="p-3 border-slate-200 hover:border-amber-300 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 line-clamp-2">
                        {article.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", categoryColors[article.category] || categoryColors.sop)}
                        >
                          {article.category}
                        </Badge>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
                  </div>
                </Card>
              </Link>
            ))}
            {articles.length === 0 && (
              <Card className="p-4 border-dashed border-slate-300 text-center">
                <p className="text-sm text-slate-500">No articles yet</p>
              </Card>
            )}
          </div>
        </section>

        {/* Experts You May Need */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900">Experts</h2>
            <Link href="/experts" className="text-xs text-amber-600 hover:underline">
              Find more
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {experts.map((expert) => (
              <Card 
                key={expert.id} 
                className="p-3 border-slate-200 min-w-[160px] flex-shrink-0 cursor-pointer hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-8 w-8 bg-blue-100">
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                      {expert.first_name[0]}{expert.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {expert.first_name} {expert.last_name}
                    </p>
                    <p className="text-xs text-slate-500 capitalize truncate">
                      {expert.department_id?.replace(/_/g, " ")}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {expert.expertise_tags?.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
            {experts.length === 0 && (
              <Card className="p-4 border-dashed border-slate-300 text-center w-full">
                <p className="text-sm text-slate-500">No experts found</p>
              </Card>
            )}
          </div>
        </section>

        {/* Recent Lessons Learned */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900">Recent Lessons</h2>
            <Link href="/lessons-learned" className="text-xs text-amber-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {lessons.map((lesson) => (
              <Card key={lesson.id} className="p-3 border-slate-200 hover:border-rose-300 transition-colors cursor-pointer">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 line-clamp-2">
                      {lesson.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs capitalize">
                        {lesson.department?.replace(/_/g, " ")}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        {new Date(lesson.incident_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs shrink-0",
                      lesson.preventability === "preventable" ? "bg-rose-50 text-rose-700" :
                      lesson.preventability === "unpreventable" ? "bg-emerald-50 text-emerald-700" :
                      "bg-amber-50 text-amber-700"
                    )}
                  >
                    {lesson.preventability?.replace(/_/g, " ")}
                  </Badge>
                </div>
              </Card>
            ))}
            {lessons.length === 0 && (
              <Card className="p-4 border-dashed border-slate-300 text-center">
                <p className="text-sm text-slate-500">No lessons recorded</p>
              </Card>
            )}
          </div>
        </section>

      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 md:hidden">
        <div className="flex items-center justify-around h-14">
          <BottomNavItem icon={BookOpen} label="Home" href="/" active />
          <BottomNavItem icon={Search} label="Search" href="/search" />
          <div className="relative -top-4">
            <Link href="/innovation/new">
              <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                <Plus className="h-6 w-6 text-white" />
              </div>
            </Link>
          </div>
          <BottomNavItem icon={Lightbulb} label="Ideas" href="/innovation" />
          <BottomNavItem icon={Users} label="Profile" href="/profile" />
        </div>
      </nav>

      {/* Spacer for mobile bottom nav */}
      <div className="h-20 md:hidden" />
    </div>
  );
}

// Components
function QuickActionButton({ 
  icon: Icon, 
  label, 
  color, 
  href 
}: { 
  icon: React.ElementType; 
  label: string; 
  color: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", color)}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-xs font-medium text-slate-600">{label}</span>
      </div>
    </Link>
  );
}

function BottomNavItem({ 
  icon: Icon, 
  label, 
  href, 
  active 
}: { 
  icon: React.ElementType; 
  label: string; 
  href: string;
  active?: boolean;
}) {
  return (
    <Link href={href} className="flex flex-col items-center gap-0.5 py-2 px-4">
      <Icon className={cn("h-5 w-5", active ? "text-amber-500" : "text-slate-400")} />
      <span className={cn("text-xs", active ? "text-amber-500 font-medium" : "text-slate-400")}>
        {label}
      </span>
    </Link>
  );
}
