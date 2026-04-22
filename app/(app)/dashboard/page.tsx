"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth, UserProfile } from "@/lib/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
  motion, 
  AnimatePresence 
} from "framer-motion";
import {
  BookOpen, Users, Lightbulb, Shield, Search,
  Eye, ThumbsUp, TrendingUp, Star, Mail, Plus,
  AlertTriangle, Calendar, Settings, Plane, Target,
  X, ChevronRight, Filter, MessageSquare, Info,
  CheckCircle2, Clock, MapPin, ExternalLink, ArrowLeft
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
type Article = { id: string; title: string; category: string; updated_at: string; helpful_count: number; view_count: number; language: string; content?: string; author_id?: string; author_name?: string; };
type Expert = { id: string; first_name: string; last_name: string; department_id: string; expertise_tags?: string[]; seniority_level?: number; email: string; bio?: string; role: string; };
type Idea = { id: string; title: string; description: string; department: string; estimated_impact: string; status: string; votes: number; created_at: string; submitted_by_name?: string; };
type Lesson = { id: string; title: string; incident_date: string; department: string; aircraft_type: string | null; summary: string; root_cause: string; corrective_action: string; preventability: string; created_at: string; };

type Tab = "pulse" | "knowledge" | "experts" | "lessons" | "innovation" | "directory";
type SelectedItem = { type: string; data: any } | null;
type ActiveForm = Tab | null;

// ── UI Constants ───────────────────────────────────────────────────────────
const tabConfig: Record<Tab, { label: string; icon: any; color: string; bg: string; border: string }> = {
  pulse: { label: "Global Pulse", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  knowledge: { label: "Knowledge Base", icon: BookOpen, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  experts: { label: "Expert Locator", icon: Users, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  lessons: { label: "Lessons Learned", icon: Shield, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" },
  innovation: { label: "Innovation Hub", icon: Lightbulb, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200" },
  directory: { label: "User Directory", icon: Users, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200" },
};

// ── Main Component ─────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { profile, loading: authLoading, supabase } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("pulse");
  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null);
  const [activeForm, setActiveForm] = useState<ActiveForm>(null);

  // Data states
  const [articles, setArticles] = useState<Article[]>([]);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [allUsers, setAllUsers] = useState<Expert[]>([]);
  
  // UI states
  const [searchQ, setSearchQ] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loadingData, setLoadingData] = useState(false);
  const [stats, setStats] = useState({ totalArticles: 0, activeExperts: 0, pendingIdeas: 0 });
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => setRefreshKey(prev => prev + 1);

  // Load Feed Data
  useEffect(() => {
    if (authLoading || !profile) return;
    
    const fetchData = async () => {
      setLoadingData(true);
      if (activeTab === "pulse") {
        const [k, e, i, l] = await Promise.all([
          supabase.from("knowledge_articles").select("*").eq("status", "published").order("updated_at", { ascending: false }).limit(5),
          supabase.from("user_profiles").select("*").eq("is_expert", true).limit(3),
          supabase.from("innovation_ideas").select("*").order("votes", { ascending: false }).limit(5),
          supabase.from("lessons_learned").select("*").order("incident_date", { ascending: false }).limit(5)
        ]);
        setArticles((k.data ?? []) as Article[]);
        setExperts((e.data ?? []) as Expert[]);
        setIdeas((i.data ?? []) as Idea[]);
        setLessons((l.data ?? []) as Lesson[]);
      } else if (activeTab === "knowledge") {
        let q = supabase.from("knowledge_articles").select("*").eq("status", "published").order("updated_at", { ascending: false });
        if (categoryFilter !== "all") q = q.eq("category", categoryFilter);
        if (searchQ.trim()) q = q.ilike("title", `%${searchQ.trim()}%`);
        const { data } = await q.limit(20);
        setArticles((data ?? []) as Article[]);
      } else if (activeTab === "experts") {
        let q = supabase.from("user_profiles").select("*").eq("is_expert", true);
        const { data } = await q.limit(20);
        let filtered = (data ?? []) as Expert[];
        if (searchQ.trim()) {
          const lq = searchQ.toLowerCase();
          filtered = filtered.filter(e => `${e.first_name} ${e.last_name}`.toLowerCase().includes(lq) || e.expertise_tags?.some(t => t.toLowerCase().includes(lq)));
        }
        setExperts(filtered);
      } else if (activeTab === "innovation") {
        let q = supabase.from("innovation_ideas").select("*").order("votes", { ascending: false });
        if (searchQ.trim()) q = q.ilike("title", `%${searchQ.trim()}%`);
        const { data } = await q.limit(20);
        setIdeas((data ?? []) as Idea[]);
      } else if (activeTab === "lessons") {
        let q = supabase.from("lessons_learned").select("*").order("incident_date", { ascending: false });
        if (searchQ.trim()) q = q.ilike("title", `%${searchQ.trim()}%`);
        const { data } = await q.limit(20);
        setLessons((data ?? []) as Lesson[]);
      } else if (activeTab === "directory") {
        let q = supabase.from("user_profiles").select("*").order("first_name", { ascending: true });
        if (searchQ.trim()) {
          const lq = searchQ.toLowerCase();
          q = q.or(`first_name.ilike.%${lq}%,last_name.ilike.%${lq}%,email.ilike.%${lq}%`);
        }
        const { data } = await q.limit(50);
        setAllUsers((data ?? []) as Expert[]);
      }
      setLoadingData(false);
    };

    fetchData();
  }, [activeTab, searchQ, categoryFilter, profile, authLoading, supabase, refreshKey]);

  // Load Global Stats
  useEffect(() => {
    if (!profile) return;
    const loadStats = async () => {
      const { count: ac } = await supabase.from("knowledge_articles").select("*", { count: "exact", head: true });
      const { count: ec } = await supabase.from("user_profiles").select("*", { count: "exact", head: true }).eq("is_expert", true);
      const { count: ic } = await supabase.from("innovation_ideas").select("*", { count: "exact", head: true }).eq("status", "under_review");
      setStats({ totalArticles: ac || 0, activeExperts: ec || 0, pendingIdeas: ic || 0 });
    };
    loadStats();
  }, [profile, supabase, refreshKey]);

  const handleVote = async (ideaId: string, currentVotes: number) => {
    const { error } = await supabase
      .from("innovation_ideas")
      .update({ votes: currentVotes + 1 })
      .eq("id", ideaId);
    
    if (!error) handleRefresh();
  };

  const handleHelpful = async (articleId: string, currentCount: number) => {
    const { error } = await supabase
      .from("knowledge_articles")
      .update({ helpful_count: currentCount + 1 })
      .eq("id", articleId);
    
    if (!error) handleRefresh();
  };

  if (authLoading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-slate-900 font-sans">
      {/* ── Main Layout (Facebook/Telegram Style 3-Column) ── */}
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-6 p-4 md:p-6">
        
        {/* ── Left Sidebar (Navigation) ── */}
        <aside className="hidden lg:flex flex-col gap-4">
          <Card className="p-4 border-none shadow-sm rounded-xl bg-white">
            <nav className="space-y-1">
              {(Object.keys(tabConfig) as Tab[]).map((t) => {
                const config = tabConfig[t];
                const Icon = config.icon;
                const active = activeTab === t;
                return (
                  <button
                    key={t}
                    onClick={() => { setActiveTab(t); setSearchQ(""); }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all group",
                      active ? "bg-amber-50 text-amber-700 shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <div className={cn("p-1.5 rounded-md", active ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200")}>
                      <Icon className="h-4 w-4" />
                    </div>
                    {config.label}
                  </button>
                );
              })}
            </nav>
          </Card>

          <Card className="p-4 border-none shadow-sm rounded-xl bg-white">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">
              {profile?.role === "admin" ? "Admin Console" : profile?.is_expert ? "Expert Tools" : "Quick Actions"}
            </h3>
            <div className="space-y-2">
              {profile?.role === "admin" && (
                <>
                  <button 
                    onClick={() => setActiveTab("directory")}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-all text-left",
                      activeTab === "directory" ? "bg-amber-50 text-amber-700" : "text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <Users className="h-3.5 w-3.5 text-blue-500" /> User Directory
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg transition-all text-left">
                    <Settings className="h-3.5 w-3.5 text-slate-500" /> System Logs
                  </button>
                </>
              )}
              
              {(profile?.is_expert || profile?.role === "admin") && (
                <button onClick={() => setActiveForm("knowledge")} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg transition-all text-left">
                  <Plus className="h-3.5 w-3.5 text-amber-500" /> Publish Article
                </button>
              )}

              <button onClick={() => setActiveForm("innovation")} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg transition-all text-left">
                <Lightbulb className="h-3.5 w-3.5 text-violet-500" /> Submit Idea
              </button>
              <button onClick={() => setActiveForm("lessons")} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg transition-all text-left">
                <Shield className="h-3.5 w-3.5 text-rose-500" /> Log AAR
              </button>
            </div>
          </Card>
        </aside>

        {/* ── Center Column (Main Feed) ── */}
        <main className="flex flex-col gap-4">
          {/* Mobile Header / Tab Switcher */}
          <div className="lg:hidden flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
             {(Object.keys(tabConfig) as Tab[]).map((t) => {
                const config = tabConfig[t];
                const active = activeTab === t;
                return (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={cn(
                      "whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all",
                      active ? "bg-amber-500 text-white shadow-md" : "bg-white text-slate-600 border border-slate-200"
                    )}
                  >
                    {config.label}
                  </button>
                );
              })}
          </div>

          {/* Search & Filter Bar */}
          <Card className="p-4 border-none shadow-sm rounded-xl bg-white flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder={`Search ${tabConfig[activeTab].label.toLowerCase()}...`}
                className="w-full h-10 pl-10 pr-4 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 transition-all outline-none"
              />
            </div>
            {activeTab === "knowledge" && (
               <select 
                value={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-10 px-4 bg-slate-100 border-none rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="all">All Categories</option>
                <option value="sop">SOPs</option>
                <option value="best_practice">Best Practice</option>
                <option value="safety">Safety Alerts</option>
              </select>
            )}
            <button className="h-10 w-10 flex items-center justify-center bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
              <Filter className="h-4 w-4 text-slate-500" />
            </button>
          </Card>

          {/* Feed Content */}
          <div className="space-y-4">
            {loadingData ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Updating Feed</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {activeTab === "pulse" && (
                  <motion.div key="pulse-content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                    {profile?.role === "admin" ? (
                      <Card className="p-6 border-none shadow-sm rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Settings className="h-24 w-24" /></div>
                        <h3 className="text-lg font-black mb-1">System Overview</h3>
                        <p className="text-xs font-medium text-white/80 max-w-[280px]">Monitoring Ethiopian Airlines KMS performance, user growth, and data security.</p>
                      </Card>
                    ) : profile?.is_expert ? (
                      <Card className="p-6 border-none shadow-sm rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Star className="h-24 w-24" /></div>
                        <h3 className="text-lg font-black mb-1">Expert Command</h3>
                        <p className="text-xs font-medium text-white/80 max-w-[280px]">Verify technical articles and mentor junior personnel across the group.</p>
                      </Card>
                    ) : (
                      <Card className="p-6 border-none shadow-sm rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><TrendingUp className="h-24 w-24" /></div>
                        <h3 className="text-lg font-black mb-1">Aviation Command Pulse</h3>
                        <p className="text-xs font-medium text-white/80 max-w-[280px]">Real-time intelligence from Flight Ops, Engineering, and Innovation streams.</p>
                      </Card>
                    )}
                    
                    {/* Interleaved items */}
                    {articles.slice(0, 1).map((a, idx) => (
                      <FeedCard key={`pulse-article-${a.id || idx}`} idx={idx} type="knowledge" title={a.title} meta={`LATEST ARTICLE · ${a.category.toUpperCase()}`} stats={[{ icon: Eye, value: a.view_count }, { icon: ThumbsUp, value: a.helpful_count }]} onClick={() => setSelectedItem({ type: "knowledge", data: a })} />
                    ))}
                    {experts.slice(0, 1).map((e, idx) => (
                      <FeedCard key={`pulse-expert-${e.id || idx}`} idx={idx} type="experts" title={`${e.first_name} ${e.last_name}`} meta="FEATURED EXPERT" avatar={`${e.first_name[0]}${e.last_name[0]}`} onClick={() => setSelectedItem({ type: "experts", data: e })} />
                    ))}
                    {ideas.slice(0, 1).map((i, idx) => (
                      <FeedCard key={`pulse-idea-${i.id || idx}`} idx={idx} type="innovation" title={i.title} desc={i.description} meta="TRENDING IDEA" stats={[{ icon: TrendingUp, value: i.votes, color: "text-violet-600" }]} onClick={() => setSelectedItem({ type: "innovation", data: i })} />
                    ))}
                    {lessons.slice(0, 1).map((l, idx) => (
                      <FeedCard key={`pulse-lesson-${l.id || idx}`} idx={idx} type="lessons" title={l.title} meta="NEW LESSON LEARNED" desc={l.summary} badge={{ label: l.preventability.replace(/_/g, " "), color: "bg-rose-50 text-rose-700" }} onClick={() => setSelectedItem({ type: "lessons", data: l })} />
                    ))}
                  </motion.div>
                )}
                {activeTab === "knowledge" && (
                  <motion.div key="knowledge-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    {articles.map((a, idx) => (
                      <FeedCard 
                        key={a.id || `article-${idx}`} 
                        idx={idx}
                        type="knowledge"
                        title={a.title}
                        meta={`${a.category.toUpperCase()} · ${new Date(a.updated_at).toLocaleDateString()}`}
                        stats={[
                          { icon: Eye, value: a.view_count },
                          { icon: ThumbsUp, value: a.helpful_count }
                        ]}
                        onClick={() => setSelectedItem({ type: "knowledge", data: a })}
                      />
                    ))}
                  </motion.div>
                )}
                {activeTab === "experts" && (
                  <motion.div key="experts-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    {experts.map((e, idx) => (
                      <FeedCard 
                        key={e.id || `expert-${idx}`} 
                        idx={idx}
                        type="experts"
                        title={`${e.first_name} ${e.last_name}`}
                        meta={`${e.department_id.replace(/_/g, " ")} · ${e.seniority_level || 5}+ yrs exp`}
                        tags={e.expertise_tags}
                        avatar={`${e.first_name?.[0]}${e.last_name?.[0]}`}
                        onClick={() => setSelectedItem({ type: "experts", data: e })}
                      />
                    ))}
                  </motion.div>
                )}
                {activeTab === "innovation" && (
                  <motion.div key="innovation-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    {ideas.map((i, idx) => (
                      <FeedCard 
                        key={i.id || `idea-${idx}`} 
                        idx={idx}
                        type="innovation"
                        title={i.title}
                        desc={i.description}
                        meta={`${i.department.replace(/_/g, " ")} · ${i.status.replace(/_/g, " ")}`}
                        stats={[
                          { icon: TrendingUp, value: i.votes, color: "text-violet-600" }
                        ]}
                        onClick={() => setSelectedItem({ type: "innovation", data: i })}
                      />
                    ))}
                  </motion.div>
                )}
                {activeTab === "lessons" && (
                  <motion.div key="lessons-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    {lessons.map((l, idx) => (
                      <FeedCard 
                        key={l.id || `lesson-${idx}`} 
                        idx={idx}
                        type="lessons"
                        title={l.title}
                        meta={`${l.department.replace(/_/g, " ")} · ${l.aircraft_type || "All Fleet"}`}
                        desc={l.summary}
                        badge={{ label: l.preventability.replace(/_/g, " "), color: "bg-rose-50 text-rose-700" }}
                        onClick={() => setSelectedItem({ type: "lessons", data: l })}
                      />
                    ))}
                  </motion.div>
                )}
                {activeTab === "directory" && (
                  <motion.div key="directory-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    {allUsers.map((u, idx) => (
                      <FeedCard 
                        key={u.id || `user-${idx}`} 
                        idx={idx}
                        type="experts"
                        title={`${u.first_name} ${u.last_name}`}
                        meta={`${u.department_id.replace(/_/g, " ")} · ${u.email}`}
                        desc={u.bio || "Staff Member"}
                        badge={{ label: u.role.toUpperCase(), color: "bg-slate-100 text-slate-700" }}
                        onClick={() => setSelectedItem({ type: "experts", data: u })}
                      />
                    ))}
                  </motion.div>
                )}
                {!loadingData && (
                  activeTab === "pulse" 
                    ? (articles.length === 0 && experts.length === 0 && ideas.length === 0 && lessons.length === 0)
                    : (activeTab === "knowledge" ? articles : activeTab === "experts" ? experts : activeTab === "innovation" ? ideas : activeTab === "lessons" ? lessons : allUsers).length === 0
                ) && (
                  <EmptyState tab={activeTab} />
                )}
              </AnimatePresence>
            )}
          </div>
        </main>

        {/* ── Right Sidebar (Stats & Trending) ── */}
        <aside className="hidden xl:flex flex-col gap-6">
          <Card className="p-5 border-none shadow-sm rounded-xl bg-white">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-amber-500" />
              Portal Insights
            </h3>
            <div className="space-y-4">
              <StatRow label="Global Knowledge" value={stats.totalArticles} icon={BookOpen} color="bg-amber-100 text-amber-600" />
              <StatRow label="Certified Experts" value={stats.activeExperts} icon={Users} color="bg-blue-100 text-blue-600" />
              <StatRow label="Active Ideas" value={stats.pendingIdeas} icon={Lightbulb} color="bg-violet-100 text-violet-600" />
            </div>
            <button className="w-full mt-6 py-2.5 rounded-lg border border-slate-100 text-[11px] font-bold text-slate-500 hover:bg-slate-50 transition-colors uppercase tracking-wider">
              View Detailed Analytics
            </button>
          </Card>

          <Card className="p-5 border-none shadow-sm rounded-xl bg-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Plane className="h-20 w-20 rotate-45" />
            </div>
            <h3 className="font-bold text-slate-900 mb-4">Upcoming Safety Briefings</h3>
            <div className="space-y-3 relative z-10">
              {[
                { title: "B787 Battery SOP Update", time: "Tomorrow, 10:00 AM", category: "Technical" },
                { title: "Ground Ops Safety Review", time: "Friday, 02:00 PM", category: "Safety" },
              ].map((brief, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-amber-200 transition-all cursor-pointer">
                  <div className="text-[10px] font-bold text-amber-600 uppercase mb-1">{brief.category}</div>
                  <div className="text-xs font-bold text-slate-800 mb-1">{brief.title}</div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Clock className="h-3 w-3" /> {brief.time}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="px-4 text-[11px] text-slate-400 font-medium leading-relaxed">
            &copy; 2026 Ethiopian Airlines Group.<br />
            Knowledge Management System v2.4.0-SPA
          </div>
        </aside>
      </div>

      {/* ── Inline Detail Overlay (Slide-over) ── */}
      <AnimatePresence>
        {selectedItem && (
          <DetailOverlay 
            item={selectedItem} 
            onClose={() => setSelectedItem(null)} 
            onVote={handleVote}
            onHelpful={handleHelpful}
          />
        )}
      </AnimatePresence>

      {/* ── Inline Creation Modal ── */}
      <AnimatePresence>
        {activeForm && (
          <FormOverlay 
            type={activeForm} 
            onClose={() => setActiveForm(null)} 
            onRefresh={handleRefresh}
          />
        )}
      </AnimatePresence>

    </div>
  );
}

// ── Sub-Components ─────────────────────────────────────────────────────────

function FeedCard({ idx, type, title, desc, meta, stats, tags, avatar, badge, onClick }: any) {
  const config = tabConfig[type as Tab];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      onClick={onClick}
      className="group bg-white rounded-xl shadow-sm border border-transparent hover:border-amber-200 hover:shadow-md transition-all cursor-pointer overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            {avatar ? (
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm border border-slate-200">
                {avatar}
              </div>
            ) : (
              (() => {
                const Icon = config.icon;
                return (
                  <div className={cn("p-2 rounded-lg", config.bg, config.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                );
              })()
            )}
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{meta}</div>
              <h3 className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">{title}</h3>
            </div>
          </div>
          {badge && <Badge className={cn("text-[10px] px-2 py-0.5", badge.color)}>{badge.label}</Badge>}
        </div>
        
        {desc && <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">{desc}</p>}
        
        {tags && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.slice(0, 3).map((t: string) => (
              <span key={t} className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded text-[10px] font-bold border border-slate-100">#{t}</span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <div className="flex items-center gap-4">
            {stats?.map((s: any, i: number) => {
              const Icon = s.icon;
              return (
                <div key={i} className="flex items-center gap-1.5 text-slate-400">
                  <Icon className={cn("h-3.5 w-3.5", s.color)} />
                  <span className="text-[11px] font-bold">{s.value}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
            View Details <ChevronRight className="h-3 w-3" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatRow({ label, value, icon: Icon, color }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn("p-2 rounded-lg", color)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <div className="text-xs font-bold text-slate-800">{value}</div>
        <div className="text-[10px] text-slate-400 font-medium">{label}</div>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30"
      >
        <Plane className="h-6 w-6 text-black" />
      </motion.div>
      <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] animate-pulse">Initializing Aviation Command</div>
    </div>
  );
}

function EmptyState({ tab }: { tab: Tab }) {
  const Icon = tabConfig[tab].icon;
  return (
    <Card className="p-12 border-2 border-dashed border-slate-200 bg-white/50 text-center rounded-xl">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="h-8 w-8 text-slate-300" />
      </div>
      <h3 className="font-bold text-slate-900 mb-1">No items found</h3>
      <p className="text-sm text-slate-400 max-w-[240px] mx-auto">Try adjusting your search or check back later for updates.</p>
    </Card>
  );
}

function DetailOverlay({ 
  item, 
  onClose, 
  onVote, 
  onHelpful 
}: { 
  item: SelectedItem; 
  onClose: () => void;
  onVote: (id: string, current: number) => void;
  onHelpful: (id: string, current: number) => void;
}) {
  if (!item) return null;
  const config = tabConfig[item.type as Tab];

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
      />
      <motion.div 
        initial={{ x: "100%" }} 
        animate={{ x: 0 }} 
        exit={{ x: "100%" }} 
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {(() => {
              const Icon = config.icon;
              return (
                <div className={cn("p-2 rounded-lg", config.bg, config.color)}>
                  <Icon className="h-5 w-5" />
                </div>
              );
            })()}
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{config.label}</div>
              <h2 className="text-lg font-bold text-slate-900 truncate max-w-[400px]">
                {item.type === "experts" ? `${item.data.first_name} ${item.data.last_name}` : item.data.title || item.data.summary}
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {item.type === "knowledge" && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Updated {new Date(item.data.updated_at).toLocaleDateString()}</div>
                <div className="flex items-center gap-1.5"><Target className="h-4 w-4" /> Language: {item.data.language?.toUpperCase()}</div>
              </div>
              <article className="prose prose-slate max-w-none prose-sm">
                <div dangerouslySetInnerHTML={{ __html: item.data.content || "<p class='text-slate-400 italic'>No content available for this article summary.</p>" }} />
              </article>
              <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                <div className="text-sm font-bold text-slate-900">Was this helpful?</div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => onHelpful(item.data.id, item.data.helpful_count || 0)}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
                  >
                    <ThumbsUp className="h-4 w-4 text-amber-500" /> Yes
                  </button>
                  <button className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-bold hover:bg-slate-50 transition-all">No</button>
                </div>
              </div>
            </div>
          )}

          {item.type === "experts" && (
            <div className="space-y-8">
              <div className="flex items-center gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-24 h-24 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-3xl border-4 border-white shadow-xl shrink-0">
                  {item.data.first_name[0]}{item.data.last_name[0]}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">{item.data.first_name} {item.data.last_name}</h3>
                  <div className="text-sm font-bold text-amber-600 mb-2 uppercase tracking-wide">{item.data.department_id.replace(/_/g, " ")}</div>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <div className="flex items-center gap-1"><Star className="h-4 w-4 text-amber-400 fill-amber-400" /> {item.data.seniority_level || 5}+ yrs Exp</div>
                    <div className="flex items-center gap-1"><MapPin className="h-4 w-4" /> Addis Ababa (HQ)</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl border border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Expertise Areas</h4>
                  <div className="flex flex-wrap gap-2">
                    {item.data.expertise_tags?.map((t: string) => <Badge key={t} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">{t}</Badge>)}
                  </div>
                </div>
                <div className="p-5 rounded-xl border border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium"><Mail className="h-4 w-4 text-slate-400" /> {item.data.email}</div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium"><MessageSquare className="h-4 w-4 text-slate-400" /> Available for Chat</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900">Professional Bio</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.data.bio || "Subject Matter Expert with extensive experience in Ethiopian Airlines operations. Specializes in providing high-level technical guidance and mentoring across departments."}
                </p>
              </div>

              <button className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2">
                <Mail className="h-5 w-5" /> Schedule Consultation
              </button>
            </div>
          )}

          {item.type === "innovation" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-violet-50 border border-violet-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center text-white"><TrendingUp className="h-5 w-5" /></div>
                  <div>
                    <div className="text-[10px] font-bold text-violet-600 uppercase">Current Standing</div>
                    <div className="text-lg font-bold text-violet-900">{item.data.votes} Votes Received</div>
                  </div>
                </div>
                <Badge className={cn("px-3 py-1 font-bold", item.data.estimated_impact === "high" ? "bg-rose-500" : "bg-blue-500")}>{item.data.estimated_impact.toUpperCase()} IMPACT</Badge>
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900">Idea Proposal</h4>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-5 rounded-xl border border-slate-100 italic">"{item.data.description}"</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-slate-100 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Status</div>
                  <div className="text-sm font-bold text-slate-800 capitalize">{item.data.status.replace(/_/g, " ")}</div>
                </div>
                <div className="p-4 border border-slate-100 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Department</div>
                  <div className="text-sm font-bold text-slate-800 capitalize">{item.data.department.replace(/_/g, " ")}</div>
                </div>
              </div>
              <div className="pt-6 border-t border-slate-100">
                <button 
                  onClick={() => onVote(item.data.id, item.data.votes)}
                  className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <TrendingUp className="h-4 w-4" /> Upvote this Idea
                </button>
              </div>
            </div>
          )}

          {item.type === "lessons" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-rose-50 border border-rose-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-600 flex items-center justify-center text-white"><Shield className="h-5 w-5" /></div>
                  <div>
                    <div className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">Post-Operational Review</div>
                    <div className="text-lg font-bold text-rose-900">{new Date(item.data.incident_date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><Info className="h-4 w-4 text-amber-500" /> Situation Summary</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.data.summary}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-100">
                    <h5 className="text-xs font-bold text-rose-700 mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Root Cause</h5>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">{item.data.root_cause}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100">
                    <h5 className="text-xs font-bold text-emerald-700 mb-3 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Corrective Action</h5>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">{item.data.corrective_action}</p>
                  </div>
                </div>

                <div className="p-4 border border-slate-100 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Technical Context</div>
                  <div className="flex flex-wrap gap-4">
                    <div className="text-xs font-bold text-slate-700">Fleet: <span className="text-slate-500 font-medium ml-1">{item.data.aircraft_type || "N/A"}</span></div>
                    <div className="text-xs font-bold text-slate-700">Department: <span className="text-slate-500 font-medium ml-1 capitalize">{item.data.department.replace(/_/g, " ")}</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
            <Shield className="h-3.5 w-3.5" /> Internal Secure Document
          </div>
          <button className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors">
            Share <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function FormOverlay({ type, onClose, onRefresh }: { type: Tab; onClose: () => void; onRefresh: () => void }) {
  const { profile, supabase } = useAuth();
  const config = tabConfig[type as Tab];
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title || !content || !profile) return;
    setIsSubmitting(true);

    try {
      let table = "";
      let payload: any = {};

      if (type === "knowledge") {
        table = "knowledge_articles";
        payload = { 
          title, 
          content, 
          category: "sop", 
          department_id: profile.department_id || "flight_ops",
          author_id: profile.id,
          status: "published",
          view_count: 0,
          helpful_count: 0
        };
      } else if (type === "innovation") {
        table = "innovation_ideas";
        payload = {
          title,
          description: content,
          department_id: profile.department_id || "flight_ops",
          submitted_by: profile.id,
          status: "submitted",
          estimated_impact: "medium",
          votes: 0
        };
      } else if (type === "lessons") {
        table = "lessons_learned";
        payload = {
          title,
          summary: content,
          department_id: profile.department_id || "flight_ops",
          incident_date: new Date().toISOString().split('T')[0],
          root_cause: "Under investigation",
          corrective_action: "Pending review",
          preventability: "partially_preventable",
          created_by: profile.id
        };
      }

      if (table) {
        const { error } = await supabase.from(table).insert(payload);
        if (error) throw error;
        onRefresh();
        onClose();
      }
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Submission failed. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.95, opacity: 0 }} 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className={cn("p-8 text-center relative overflow-hidden", config.bg)}>
          {(() => {
            const Icon = config.icon;
            return (
              <>
                <div className="absolute top-0 right-0 p-4 opacity-5"><Icon className="h-32 w-32" /></div>
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg", config.bg, config.color)}>
                  <Icon className="h-8 w-8" />
                </div>
              </>
            );
          })()}
          <h2 className="text-2xl font-bold text-slate-900">New {config.label.replace("Base", "").replace("Hub", "").replace("Locator", "")} Submission</h2>
          <p className="text-sm text-slate-500 mt-2">Contributing to Ethiopian Airlines Group Knowledge Excellence</p>
        </div>

        <div className="p-8 space-y-6">
           <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Title / Brief Description</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Summarize your contribution..."
                  className="w-full h-12 px-4 bg-slate-100 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500/20 outline-none transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Content / Details</label>
                <textarea 
                  rows={4} 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Provide comprehensive details here..."
                  className="w-full p-4 bg-slate-100 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500/20 outline-none transition-all resize-none"
                />
              </div>
           </div>

           <div className="flex gap-4 pt-4">
             <button disabled={isSubmitting} onClick={onClose} className="flex-1 py-3.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all text-center">Cancel</button>
             <button 
              disabled={isSubmitting || !title || !content}
              onClick={handleSubmit}
              className={cn(
                "flex-1 py-3.5 text-sm font-bold text-white rounded-xl shadow-lg transition-all text-center flex items-center justify-center gap-2", 
                type === "knowledge" ? "bg-amber-500 text-black shadow-amber-500/20" : type === "experts" ? "bg-blue-600 shadow-blue-500/20" : type === "innovation" ? "bg-violet-600 shadow-violet-500/20" : "bg-rose-600 shadow-rose-500/20",
                (isSubmitting || !title || !content) && "opacity-50 cursor-not-allowed"
              )}
             >
               {isSubmitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Submit Contribution"}
             </button>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
