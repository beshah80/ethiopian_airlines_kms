"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Plus, Search, Calendar, Target, Settings, Plane } from "lucide-react";
import { cn } from "@/lib/utils";

type LessonLearned = {
  id: string;
  title: string;
  incident_date: string;
  department: string;
  flight_number: string | null;
  aircraft_type: string | null;
  summary: string;
  root_cause: string;
  corrective_action: string;
  preventability: string;
  created_at: string;
};

const preventabilityColors: Record<string, string> = {
  preventable: "bg-rose-50 text-rose-700 border-rose-200",
  partially_preventable: "bg-amber-50 text-amber-700 border-amber-200",
  unpreventable: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function LessonsLearnedPage() {
  const { profile, loading: authLoading, supabase } = useAuth();
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<LessonLearned[]>([]);
  const [q, setQ] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");

  useEffect(() => {
    if (authLoading || !profile) return;

    const load = async () => {
      setLoading(true);

      let query = supabase
        .from("lessons_learned")
        .select("*")
        .order("incident_date", { ascending: false });

      if (deptFilter !== "all") query = query.eq("department", deptFilter);
      if (q.trim()) query = query.ilike("title", `%${q.trim()}%`);

      const { data } = await query;
      setLessons((data ?? []) as LessonLearned[]);
      setLoading(false);
    };

    load();
  }, [q, deptFilter, supabase, profile, authLoading]);

  const getDepartmentIcon = (dept: string) => {
     switch(dept) {
        case 'flight_ops': return <Plane className="h-4 w-4" />;
        case 'engineering': return <Settings className="h-4 w-4" />;
        default: return <Target className="h-4 w-4" />;
     }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-rose-100 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-rose-700" />
              </div>
              <span className="text-sm font-medium text-rose-700">After-Action Reviews</span>
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">Lessons Learned</h1>
            <p className="text-slate-500 text-sm mt-1">
              Structured incident analyses with root cause findings and corrective actions.
            </p>
          </div>
          <Link href="/lessons-learned/new">
            <Button className="bg-rose-600 hover:bg-rose-700 text-white gap-2">
              <Plus className="h-4 w-4" />
              Log AAR
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
                placeholder="Search incidents by title..."
                className="pl-9 bg-white border-slate-200"
              />
            </div>
            <select
              className="h-9 px-3 bg-white border border-slate-200 rounded-md text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="all">All Departments</option>
              <option value="flight_ops">Flight Operations</option>
              <option value="engineering">Engineering & Maintenance</option>
              <option value="ground_ops">Ground Operations</option>
              <option value="customer_service">Customer Service</option>
            </select>
          </div>
        </Card>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3 text-slate-400">
              <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Loading lessons...</span>
            </div>
          </div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-slate-200 border-dashed">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-6 w-6 text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No lessons recorded yet</h3>
            <p className="text-slate-500 text-sm mb-4 max-w-md mx-auto">
              Document After-Action Reviews to help the organization learn from operational challenges.
            </p>
            <Link href="/lessons-learned/new">
              <Button className="bg-rose-600 hover:bg-rose-700">Submit First AAR</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {lessons.map((lesson) => (
              <Card key={lesson.id} className="overflow-hidden border-slate-200 hover:shadow-md transition-all">
                <div className="flex flex-col lg:flex-row">
                  {/* Sidebar Info */}
                  <div className="lg:w-64 bg-slate-50 p-5 border-b lg:border-b-0 lg:border-r border-slate-100">
                    <div className="flex items-center gap-2 text-slate-500 mb-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      {new Date(lesson.incident_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 mb-3 capitalize font-medium text-sm">
                      {getDepartmentIcon(lesson.department)}
                      {lesson.department.replace(/_/g, " ")}
                    </div>
                    {(lesson.aircraft_type || lesson.flight_number) && (
                      <div className="flex flex-wrap gap-1">
                        {lesson.aircraft_type && (
                          <Badge variant="secondary" className="text-xs bg-white">
                            {lesson.aircraft_type}
                          </Badge>
                        )}
                        {lesson.flight_number && (
                          <Badge variant="secondary" className="text-xs bg-white">
                            {lesson.flight_number}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="font-medium text-slate-900">
                        {lesson.title}
                      </h3>
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs whitespace-nowrap", preventabilityColors[lesson.preventability])}
                      >
                        {lesson.preventability.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="text-xs font-medium text-slate-400 uppercase mb-1">Root Cause</h4>
                        <p className="text-sm text-slate-700 bg-rose-50/50 p-2 rounded">
                          {lesson.root_cause}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-slate-400 uppercase mb-1">Corrective Action</h4>
                        <p className="text-sm text-slate-700 bg-emerald-50/50 p-2 rounded">
                          {lesson.corrective_action}
                        </p>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-slate-100">
                      <h4 className="text-xs font-medium text-slate-400 uppercase mb-1">Summary</h4>
                      <p className="text-sm text-slate-600 line-clamp-2">{lesson.summary}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
