"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lightbulb, ArrowLeft, Loader2 } from "lucide-react";

export default function NewInnovationPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    department: "flight_ops",
    estimated_impact: "medium",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;
    
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

    const { error } = await supabase.from("innovation_ideas").insert({
      title: formData.title,
      description: formData.description,
      department: formData.department,
      estimated_impact: formData.estimated_impact,
      submitted_by: currentUserId,
      status: "submitted",
      votes: 0
    });

    setSaving(false);
    if (!error) {
      router.push("/innovation");
    } else {
      console.error("Submission failed:", error);
      alert("Failed to submit idea. Please check database schema.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link href="/innovation" className="inline-flex items-center text-sm text-indigo-700 hover:text-indigo-800 mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Innovation Hub
      </Link>
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Lightbulb className="h-6 w-6 text-indigo-700" />
            </div>
            <div>
              <CardTitle className="text-2xl">Submit an Idea</CardTitle>
              <CardDescription>Share your process improvements and operational solutions.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Idea Title</Label>
              <Input
                id="title"
                required
                placeholder="e.g. Digital baggage tracking refinement..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Target Department</Label>
                <select
                  id="department"
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  <option value="flight_ops">Flight Operations</option>
                  <option value="engineering">Engineering & Maintenance</option>
                  <option value="customer_service">Customer Service</option>
                  <option value="ground_ops">Ground Operations</option>
                  <option value="training">Training</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="impact">Estimated Impact</Label>
                <select
                  id="impact"
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                  value={formData.estimated_impact}
                  onChange={(e) => setFormData({ ...formData, estimated_impact: e.target.value })}
                >
                  <option value="low">Low Impact</option>
                  <option value="medium">Medium Impact</option>
                  <option value="high">High Impact</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description</Label>
              <textarea
                id="description"
                required
                rows={6}
                className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                placeholder="Describe the problem, your proposed solution, and how it aligns with Vision 2035..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 bg-slate-50 py-4 border-t border-slate-100">
            <Link href="/innovation">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Idea for Review
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
