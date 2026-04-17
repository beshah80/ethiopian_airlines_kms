"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Plus, Search, Calendar, Target, Settings, Plane } from "lucide-react";

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

export default function LessonsLearnedPage() {
  const { profile, loading: authLoading, supabase } = useAuth();
  const router = useRouter();

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

  const getPreventabilityColor = (p: string) => {
    switch(p) {
      case 'preventable': return "bg-red-50 text-red-700 border-red-200";
      case 'partially_preventable': return "bg-orange-50 text-orange-700 border-orange-200";
      case 'unpreventable': return "bg-green-50 text-green-700 border-green-200";
      default: return "";
    }
  };

  const getDepartmentIcon = (dept: string) => {
     switch(dept) {
        case 'flight_ops': return <Plane className="h-4 w-4" />;
        case 'engineering': return <Settings className="h-4 w-4" />;
        default: return <Target className="h-4 w-4" />;
     }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-rose-700 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full text-xs font-medium mb-3">
            <AlertTriangle className="h-3.5 w-3.5" />
            After-Action Review System
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Lessons Learned</h1>
          <p className="text-slate-600 mt-1 max-w-2xl">
            Structured incident analyses emphasizing root cause finding and corrective actions to prevent recurrence.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/lessons-learned/new">
            <Button className="bg-rose-600 hover:bg-rose-700 gap-2">
              <Plus className="h-4 w-4" />
              Log AAR
            </Button>
          </Link>
        </div>
      </div>

      <Card className="mb-6 border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 relative">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search incident titles or aircraft models..."
                className="pl-9 bg-slate-50 border-slate-200"
              />
            </div>
            <select
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
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
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-slate-600 text-center py-8">Loading lessons learned...</p>
      ) : lessons.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-16 text-center">
            <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
               <AlertTriangle className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">Ensure operational resilience</h3>
            <p className="text-slate-500 mb-4 max-w-md mx-auto">Document the first After-Action Review to help the organization learn from an operational challenge.</p>
            <Link href="/lessons-learned/new">
              <Button className="bg-rose-600 hover:bg-rose-700">Submit Report</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {lessons.map((lesson) => (
            <Card key={lesson.id} className="hover:shadow-md transition-shadow overflow-hidden group">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-64 bg-slate-50 p-6 flex flex-col justify-center border-r border-slate-100 h-full">
                   <div className="flex items-center gap-2 text-slate-500 mb-2 font-medium text-sm">
                      <Calendar className="h-4 w-4" />
                      {new Date(lesson.incident_date).toLocaleDateString()}
                   </div>
                   <div className="flex items-center gap-2 text-slate-700 mb-4 capitalize font-semibold text-sm">
                      {getDepartmentIcon(lesson.department)}
                      {lesson.department.replace('_', ' ')}
                   </div>
                   {(lesson.aircraft_type || lesson.flight_number) && (
                     <div className="inline-flex flex-col gap-1">
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Context</span>
                        <div className="flex flex-wrap gap-1">
                          {lesson.aircraft_type && <Badge variant="secondary" className="text-xs bg-slate-200 hover:bg-slate-200">{lesson.aircraft_type}</Badge>}
                          {lesson.flight_number && <Badge variant="secondary" className="text-xs bg-slate-200 hover:bg-slate-200">{lesson.flight_number}</Badge>}
                        </div>
                     </div>
                   )}
                </div>
                <div className="flex-1 p-6">
                   <div className="flex justify-between items-start mb-2">
                     <h3 className="text-xl font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                       {lesson.title}
                     </h3>
                     <Badge variant="outline" className={`capitalize border whitespace-nowrap ${getPreventabilityColor(lesson.preventability)}`}>
                       {lesson.preventability.replace('_', ' ')}
                     </Badge>
                   </div>
                   
                   <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Root Cause</h4>
                        <p className="text-sm text-slate-700 bg-red-50/50 p-3 rounded border border-red-100">
                          {lesson.root_cause}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Corrective Action Taken</h4>
                        <p className="text-sm text-slate-700 bg-emerald-50/50 p-3 rounded border border-emerald-100">
                          {lesson.corrective_action}
                        </p>
                      </div>
                   </div>
                   
                   <div className="mt-4 pt-4 border-t border-slate-100">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Incident Summary</h4>
                      <p className="text-sm text-slate-600 line-clamp-2">{lesson.summary}</p>
                   </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
