"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, ArrowLeft, Loader2, Plane, AlertCircle, ShieldCheck } from "lucide-react";

export default function NewLessonLearnedPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    incident_date: new Date().toISOString().split('T')[0],
    department: "flight_ops",
    flight_number: "",
    aircraft_type: "",
    summary: "",
    root_cause: "",
    corrective_action: "",
    preventability: "preventable",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.summary || !formData.root_cause || !formData.corrective_action) return;
    
    setSaving(true);
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

    const { error } = await supabase.from("lessons_learned").insert({
      title: formData.title,
      incident_date: formData.incident_date,
      department: formData.department,
      flight_number: formData.flight_number || null,
      aircraft_type: formData.aircraft_type || null,
      summary: formData.summary,
      root_cause: formData.root_cause,
      corrective_action: formData.corrective_action,
      preventability: formData.preventability,
      submitted_by: currentUserId
    });

    setSaving(false);
    if (!error) {
      router.push("/lessons-learned");
    } else {
      console.error("Submission failed:", error);
      alert("Failed to submit report. Please check database schema.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link href="/lessons-learned" className="inline-flex items-center text-sm text-rose-700 hover:text-rose-800 mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Lessons Learned
      </Link>
      
      <Card className="border-t-4 border-t-rose-600 shadow-md">
        <CardHeader className="bg-slate-50/50 pb-8">
          <div className="flex items-center gap-3">
            <div className="bg-rose-100 p-2.5 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-rose-700" />
            </div>
            <div>
              <CardTitle className="text-2xl text-slate-900">After-Action Review (AAR)</CardTitle>
              <CardDescription className="text-base mt-1">Capture incident knowledge to build operational resilience.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8 -mt-4">
            {/* Section 1: Context */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Plane className="h-4 w-4" /> 1. Operational Context
              </h3>
              
              <div className="space-y-3">
                <Label htmlFor="title" className="text-slate-700">Incident Title (Short & Descriptive)</Label>
                <Input
                  id="title"
                  required
                  placeholder="e.g. A350 Hydraulic System B Pressure Drop during Taxi"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-slate-50 border-slate-200"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-3">
                    <Label htmlFor="incident_date" className="text-slate-700">Date of Incident</Label>
                    <Input
                      id="incident_date"
                      type="date"
                      required
                      value={formData.incident_date}
                      onChange={(e) => setFormData({ ...formData, incident_date: e.target.value })}
                    />
                 </div>
                 <div className="space-y-3">
                    <Label htmlFor="department" className="text-slate-700">Primary Department Involved</Label>
                    <select
                      id="department"
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    >
                      <option value="flight_ops">Flight Operations</option>
                      <option value="engineering">Engineering & Maintenance</option>
                      <option value="ground_ops">Ground Operations</option>
                      <option value="customer_service">Customer Service</option>
                    </select>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-3">
                    <Label htmlFor="flight_number" className="text-slate-700 text-xs">Aircraft Type (Optional)</Label>
                    <Input
                      id="aircraft_type"
                      placeholder="e.g. B787, A350, Q400"
                      value={formData.aircraft_type}
                      onChange={(e) => setFormData({ ...formData, aircraft_type: e.target.value })}
                    />
                 </div>
                 <div className="space-y-3">
                    <Label htmlFor="flight_number" className="text-slate-700 text-xs">Flight Number / Station (Optional)</Label>
                    <Input
                      id="flight_number"
                      placeholder="e.g. ET500 / HAAB"
                      value={formData.flight_number}
                      onChange={(e) => setFormData({ ...formData, flight_number: e.target.value })}
                    />
                 </div>
              </div>
            </div>

            {/* Section 2: Analysis */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-slate-100 pb-2">
                <AlertCircle className="h-4 w-4" /> 2. Incident Analysis
              </h3>
              
              <div className="space-y-3">
                <Label htmlFor="summary" className="text-slate-700">Sequence of Events Summary</Label>
                <textarea
                  id="summary"
                  required
                  rows={3}
                  className="flex w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
                  placeholder="Describe exactly what happened step-by-step..."
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="root_cause" className="text-slate-700">Established Root Cause</Label>
                <textarea
                  id="root_cause"
                  required
                  rows={2}
                  className="flex w-full rounded-md border border-red-200 bg-red-50/30 px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
                  placeholder="Why did this happen? Focus on systems, processes, or environment, not just human error."
                  value={formData.root_cause}
                  onChange={(e) => setFormData({ ...formData, root_cause: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="preventability" className="text-slate-700">Preventability Classification</Label>
                <select
                  id="preventability"
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                  value={formData.preventability}
                  onChange={(e) => setFormData({ ...formData, preventability: e.target.value })}
                >
                  <option value="preventable">Preventable (Procedures existed but failed/were missed)</option>
                  <option value="partially_preventable">Partially Preventable (Mitigation was possible)</option>
                  <option value="unpreventable">Unpreventable (Weather, Act of God, Unforeseen limits)</option>
                </select>
              </div>
            </div>

            {/* Section 3: Resolution */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-slate-100 pb-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> 3. Actions & Resolution
              </h3>
              
              <div className="space-y-3">
                <Label htmlFor="corrective_action" className="text-slate-700">Corrective Action Taken</Label>
                <textarea
                  id="corrective_action"
                  required
                  rows={3}
                  className="flex w-full rounded-md border border-emerald-200 bg-emerald-50/30 px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
                  placeholder="What was done to fix the immediate issue, and what process is changing to prevent recurrence?"
                  value={formData.corrective_action}
                  onChange={(e) => setFormData({ ...formData, corrective_action: e.target.value })}
                />
              </div>
            </div>
            
          </CardContent>
          <CardFooter className="flex justify-between gap-3 bg-slate-50 py-4 border-t border-slate-100 rounded-b-xl">
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
               Reports are shared organization-wide. Omit sensitive passenger PII per data policy.
            </p>
            <div className="flex gap-2">
               <Link href="/lessons-learned">
                 <Button type="button" variant="outline">Cancel</Button>
               </Link>
               <Button type="submit" disabled={saving} className="bg-rose-600 hover:bg-rose-700 font-semibold px-8">
                 {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                 Log Incident to Database
               </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
