"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  MapPin, Mail, Calendar, Briefcase, Award, 
  BookOpen, Lightbulb, Shield, TrendingUp, Eye, ThumbsUp,
  Edit, Camera, ChevronRight, MessageSquare, Star,
  Globe, Info, Clock, ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Activity = {
  id: string;
  type: "article" | "idea" | "lesson";
  title: string;
  content?: string;
  date: string;
  stats?: { views?: number; votes?: number; helpful?: number };
};

export default function ProfilePage() {
  const { profile, loading: authLoading, supabase } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState({ articles: 0, ideas: 0, lessons: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "about" | "contributions">("posts");

  useEffect(() => {
    if (authLoading || !profile) return;

    const load = async () => {
      setLoading(true);
      const userId = profile.id;

      const [articlesRes, ideasRes, lessonsRes] = await Promise.all([
        supabase.from("knowledge_articles").select("*").eq("author_id", userId).order("created_at", { ascending: false }).limit(10),
        supabase.from("innovation_ideas").select("*").eq("submitted_by", userId).order("created_at", { ascending: false }).limit(10),
        supabase.from("lessons_learned").select("*").eq("created_by", userId).order("created_at", { ascending: false }).limit(10)
      ]);

      const combined: Activity[] = [
        ...(articlesRes.data || []).map(a => ({ id: a.id, type: "article" as const, title: a.title, content: a.content, date: a.created_at, stats: { views: a.view_count, helpful: a.helpful_count } })),
        ...(ideasRes.data || []).map(i => ({ id: i.id, type: "idea" as const, title: i.title, content: i.description, date: i.created_at, stats: { votes: i.votes } })),
        ...(lessonsRes.data || []).map(l => ({ id: l.id, type: "lesson" as const, title: l.summary, date: l.created_at })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setActivities(combined);
      setStats({
        articles: articlesRes.data?.length || 0,
        ideas: ideasRes.data?.length || 0,
        lessons: lessonsRes.data?.length || 0,
      });
      setLoading(false);
    };

    load();
  }, [profile, authLoading, supabase]);

  if (authLoading || loading) return <LoadingScreen />;

  const initials = `${profile?.first_name?.[0] ?? ""}${profile?.last_name?.[0] ?? ""}`;
  const roleKey = profile?.role === "admin" ? "admin" : profile?.is_expert ? "expert" : "staff";
  const roleConfig = {
    admin: { label: "System Administrator", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" },
    expert: { label: "Subject Matter Expert", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
    staff: { label: "Aviation Personnel", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-12">
      
      {/* ── Top Header Section (Facebook Style) ── */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-5xl mx-auto">
          {/* Cover Photo */}
          <div className="relative h-[350px] bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 rounded-b-2xl overflow-hidden shadow-inner group">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <button className="absolute bottom-6 right-6 flex items-center gap-2 px-4 py-2.5 bg-white/90 backdrop-blur hover:bg-white border border-slate-200 rounded-xl text-slate-900 text-xs font-bold transition-all shadow-lg active:scale-95">
              <Camera className="h-4 w-4" /> Edit Cover Photo
            </button>
          </div>

          {/* Profile Basic Info */}
          <div className="relative px-8 pb-2">
            <div className="flex flex-col md:flex-row items-end gap-6 -mt-16 md:-mt-20 mb-6">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-44 h-44 rounded-3xl bg-amber-500 flex items-center justify-center text-white font-black text-6xl border-[6px] border-white shadow-2xl transition-transform group-hover:scale-[1.02]">
                  {initials}
                </div>
                <button className="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center hover:bg-slate-50 transition-all border border-slate-100 active:scale-90">
                  <Camera className="h-5 w-5 text-slate-700" />
                </button>
              </div>

              {/* Name & Role */}
              <div className="flex-1 mb-4 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                   <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                    {profile?.first_name} {profile?.last_name}
                  </h1>
                  <Badge className={cn("px-3 py-1 font-bold text-[10px] uppercase tracking-wider rounded-lg shadow-sm", roleConfig[roleKey].bg, roleConfig[roleKey].color, roleConfig[roleKey].border)}>
                    {roleConfig[roleKey].label}
                  </Badge>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-6 gap-y-2 text-sm text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-slate-300" /> Ethiopian Airlines · {profile?.department_id?.replace(/_/g, " ")}</div>
                  <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-slate-300" /> Addis Ababa, HQ</div>
                  <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-slate-300" /> Joined April 2026</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mb-4">
                <button className="h-10 px-6 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-lg hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2">
                  <Edit className="h-4 w-4" /> Edit Profile
                </button>
                <button className="h-10 w-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-all border border-slate-200">
                  <ChevronRight className="h-4 w-4 rotate-90" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-t border-slate-100 -mx-8 px-8 pt-1">
              {[
                { id: "posts", label: "Feed", icon: MessageSquare },
                { id: "about", label: "Professional Info", icon: Info },
                { id: "contributions", label: "Contributions", icon: Award },
              ].map((tab) => {
                const active = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "flex items-center gap-2.5 px-6 py-4 font-bold text-sm transition-all relative",
                      active ? "text-amber-600" : "text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", active ? "text-amber-500" : "text-slate-400")} />
                    {tab.label}
                    {active && (
                      <motion.div layoutId="profile-tab" className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500 rounded-t-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content Grid ── */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 px-4 py-6">
        
        {/* Sidebar Info */}
        <aside className="space-y-6">
          {/* Intro Card */}
          <Card className="p-6 border-none shadow-sm rounded-2xl bg-white space-y-6">
            <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">Intro</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0"><Briefcase className="h-5 w-5 text-slate-400" /></div>
                <div>
                  <div className="text-slate-900 font-bold">Primary Department</div>
                  <div className="text-xs capitalize">{profile?.department_id?.replace(/_/g, " ")}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0"><Mail className="h-5 w-5 text-slate-400" /></div>
                <div>
                  <div className="text-slate-900 font-bold">Internal Email</div>
                  <div className="text-xs truncate">{profile?.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0"><Globe className="h-5 w-5 text-slate-400" /></div>
                <div>
                  <div className="text-slate-900 font-bold">HQ Location</div>
                  <div className="text-xs">Addis Ababa Terminal (HAAB)</div>
                </div>
              </div>
            </div>
            {profile?.is_expert && (
              <div className="mt-6 pt-6 border-t border-slate-50">
                <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 shadow-sm">
                  <Star className="h-8 w-8 text-amber-500 fill-amber-500 shrink-0" />
                  <div>
                    <div className="text-sm font-black text-amber-900 leading-none">Top Expert</div>
                    <div className="text-[10px] text-amber-700 font-bold uppercase mt-1">Certified Specialist</div>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Activity Mini-Stats */}
          <Card className="p-6 border-none shadow-sm rounded-2xl bg-white">
            <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-6">Activity Index</h3>
            <div className="grid grid-cols-3 gap-4">
               {[
                 { label: "Articles", value: stats.articles, color: "text-amber-500", icon: BookOpen },
                 { label: "Ideas", value: stats.ideas, color: "text-violet-500", icon: Lightbulb },
                 { label: "Lessons", value: stats.lessons, color: "text-rose-500", icon: Shield },
               ].map(s => (
                 <div key={s.label} className="text-center">
                    <div className={cn("w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mx-auto mb-2 border border-slate-100 shadow-sm transition-transform hover:scale-110", s.color)}>
                      <s.icon className="h-5 w-5" />
                    </div>
                    <div className="text-lg font-black text-slate-900 leading-none">{s.value}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">{s.label}</div>
                 </div>
               ))}
            </div>
          </Card>
        </aside>

        {/* Main Feed */}
        <main>
          <AnimatePresence mode="wait">
            {activeTab === "posts" && (
              <motion.div 
                key="posts"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {activities.length === 0 ? (
                   <Card className="p-16 text-center bg-white border-none shadow-sm rounded-2xl">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-inner">
                      <TrendingUp className="h-10 w-10 text-slate-300" />
                    </div>
                    <h3 className="font-black text-slate-900 mb-2">No activity recorded yet</h3>
                    <p className="text-sm text-slate-400 max-w-[280px] mx-auto font-medium leading-relaxed">Your professional contributions and knowledge shares will appear here for the group to see.</p>
                  </Card>
                ) : (
                  activities.map((activity, idx) => (
                    <Card key={activity.id} className="p-6 bg-white border-none shadow-sm rounded-2xl hover:shadow-md transition-all group overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 rounded-full -translate-y-16 translate-x-16 -z-10 group-hover:scale-110 transition-transform" />
                      
                      {/* Post Header */}
                      <div className="flex items-start justify-between gap-4 mb-5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-amber-500/20 shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="font-black text-slate-900 text-base leading-tight">
                              {profile?.first_name} {profile?.last_name}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                              <span>{new Date(activity.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                              <span className="w-1 h-1 bg-slate-200 rounded-full" />
                              <span className={cn(
                                "px-2 py-0.5 rounded bg-slate-100 border border-slate-200",
                                activity.type === "article" ? "text-amber-600 border-amber-100 bg-amber-50" : activity.type === "idea" ? "text-violet-600 border-violet-100 bg-violet-50" : "text-rose-600 border-rose-100 bg-rose-50"
                              )}>
                                {activity.type === "article" ? "Knowledge Share" : activity.type === "idea" ? "Innovation Hub" : "Operational Lesson"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button className="w-8 h-8 rounded-lg hover:bg-slate-50 flex items-center justify-center transition-colors">
                           <ChevronRight className="h-4 w-4 text-slate-400" />
                        </button>
                      </div>

                      {/* Post Content */}
                      <div className="mb-6">
                        <h4 className="font-black text-slate-900 text-lg mb-3 leading-tight group-hover:text-amber-600 transition-colors">{activity.title}</h4>
                        {activity.content && (
                          <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed font-medium">
                            {activity.content.replace(/<[^>]*>/g, "")}
                          </p>
                        )}
                      </div>

                      {/* Post Stats */}
                      {activity.stats && (
                        <div className="flex items-center gap-6 pt-5 border-t border-slate-50">
                          {activity.stats.views !== undefined && (
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                              <Eye className="h-4 w-4 text-amber-500" />
                              <span>{activity.stats.views} Views</span>
                            </div>
                          )}
                          {activity.stats.votes !== undefined && (
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                              <TrendingUp className="h-4 w-4 text-violet-500" />
                              <span>{activity.stats.votes} Votes</span>
                            </div>
                          )}
                          {activity.stats.helpful !== undefined && (
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                              <ThumbsUp className="h-4 w-4 text-emerald-500" />
                              <span>{activity.stats.helpful} Helpful</span>
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === "about" && (
              <motion.div 
                key="about"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Card className="p-8 bg-white border-none shadow-sm rounded-2xl">
                  <h3 className="font-black text-slate-900 text-lg mb-8 uppercase tracking-widest border-b border-slate-50 pb-4">Professional Profile</h3>
                  <div className="space-y-10">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Employment Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InfoItem icon={Briefcase} label="Company" value="Ethiopian Airlines Group" />
                        <InfoItem icon={Award} label="Department" value={profile?.department_id?.replace(/_/g, " ") || "N/A"} capitalized />
                        <InfoItem icon={Clock} label="Experience" value="Senior Personnel" />
                        <InfoItem icon={Globe} label="Region" value="Addis Ababa (Global Hub)" />
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Security & Credentials</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InfoItem icon={Mail} label="Corporate ID" value={profile?.email || "N/A"} />
                        <InfoItem icon={Shield} label="KMS Clearance" value="Standard Personnel" />
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === "contributions" && (
              <motion.div 
                key="contributions"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Card className="p-10 bg-white border-none shadow-sm rounded-3xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8 opacity-5"><Award className="h-40 w-40" /></div>
                  <h3 className="font-black text-slate-900 text-xl mb-10 tracking-tight">Contributions Matrix</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    <ContributionMetric 
                      icon={BookOpen} 
                      label="Knowledge" 
                      value={stats.articles} 
                      color="bg-amber-500" 
                      bg="bg-amber-50"
                      border="border-amber-100"
                    />
                    <ContributionMetric 
                      icon={Lightbulb} 
                      label="Innovation" 
                      value={stats.ideas} 
                      color="bg-violet-600" 
                      bg="bg-violet-50"
                      border="border-violet-100"
                    />
                    <ContributionMetric 
                      icon={Shield} 
                      label="Operations" 
                      value={stats.lessons} 
                      color="bg-rose-600" 
                      bg="bg-rose-50"
                      border="border-rose-100"
                    />
                  </div>

                  <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <h4 className="text-sm font-black text-slate-900 mb-4">KMS Engagement Summary</h4>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">
                      Your contributions are helping build a safer, more innovative airline. Thank you for sharing your expertise across the group.
                    </p>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// ── Sub-Components ─────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F0F2F5] gap-4">
      <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin shadow-lg" />
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing Aviation Profile</div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value, capitalized }: any) {
  return (
    <div className="flex items-center gap-4 group">
      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-amber-50 group-hover:border-amber-200 transition-colors">
        <Icon className="h-5 w-5 text-slate-400 group-hover:text-amber-500 transition-colors" />
      </div>
      <div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-tight leading-none mb-1">{label}</div>
        <div className={cn("text-sm font-bold text-slate-900 leading-none", capitalized && "capitalize")}>{value}</div>
      </div>
    </div>
  );
}

function ContributionMetric({ icon: Icon, label, value, color, bg, border }: any) {
  return (
    <div className={cn("p-8 rounded-[2rem] border text-center transition-transform hover:scale-105 shadow-sm", bg, border)}>
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg", color)}>
        <Icon className="h-7 w-7" />
      </div>
      <div className="text-4xl font-black text-slate-900 leading-none tracking-tighter mb-2">{value}</div>
      <div className="text-xs font-black text-slate-400 uppercase tracking-[0.1em]">{label}</div>
    </div>
  );
}
