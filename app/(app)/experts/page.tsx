"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Mail, Star } from "lucide-react";
import { cn } from "@/lib/utils";

type ExpertProfile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  department_id: string;
  role: string;
  is_expert: boolean;
  expertise_tags?: string[];
  seniority_level?: number;
};

const departmentLabels: Record<string, string> = {
  flight_ops: "Flight Operations",
  engineering: "Engineering & Maintenance",
  customer_service: "Customer Service",
  ground_ops: "Ground Operations",
  training: "Training",
  cargo: "Cargo",
  hr: "Human Resources",
};

export default function ExpertsPage() {
  const { profile, loading: authLoading, supabase } = useAuth();
  const [loading, setLoading] = useState(true);
  const [experts, setExperts] = useState<ExpertProfile[]>([]);
  const [q, setQ] = useState("");
  const [department, setDepartment] = useState("all");

  useEffect(() => {
    if (authLoading || !profile) return;

    const load = async () => {
      setLoading(true);

      try {
        let query = supabase
          .from("user_profiles")
          .select("id,first_name,last_name,email,department_id,role,is_expert,expertise_tags,seniority_level")
          .eq("is_expert", true)
          .limit(50);

        if (department !== "all") query = query.eq("department_id", department);

        const { data, error } = await query;
        
        if (error) {
          console.error("Experts query error:", error);
          setExperts([]);
        } else {
          let filtered = (data ?? []) as ExpertProfile[];

          if (q.trim()) {
            const lq = q.toLowerCase();
            filtered = filtered.filter((r) =>
              r.first_name?.toLowerCase().includes(lq) ||
              r.last_name?.toLowerCase().includes(lq) ||
              r.expertise_tags?.some(tag => tag.toLowerCase().includes(lq))
            );
          }

          setExperts(filtered);
        }
      } catch (err) {
        console.error("Failed to load experts:", err);
        setExperts([]);
      }
      setLoading(false);
    };
    load();
  }, [department, q, supabase, profile, authLoading]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Users className="h-4 w-4 text-blue-700" />
              </div>
              <span className="text-sm font-medium text-blue-700">Expert Network</span>
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">Expert Locator</h1>
            <p className="text-slate-500 text-sm mt-1">
              Find and connect with subject matter experts across all departments.
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <Card className="p-4 mb-6 border-slate-200 shadow-sm">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name or expertise..."
                className="pl-9 bg-white border-slate-200"
              />
            </div>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="h-9 px-3 bg-white border border-slate-200 rounded-md text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="all">All Departments</option>
              <option value="flight_ops">Flight Operations</option>
              <option value="engineering">Engineering & Maintenance</option>
              <option value="customer_service">Customer Service</option>
              <option value="ground_ops">Ground Operations</option>
              <option value="training">Training</option>
            </select>
          </div>
        </Card>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3 text-slate-400">
              <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Loading experts...</span>
            </div>
          </div>
        ) : experts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-slate-200 border-dashed">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {q ? "No experts match your search" : "No experts found"}
            </h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              {q 
                ? "Try different search terms or clear filters to see all experts."
                : "If you expect to see experts here, check browser console for errors or verify database permissions."
              }
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {experts.map((expert) => {
              const initials = `${expert.first_name?.[0] ?? ""}${expert.last_name?.[0] ?? ""}`;
              return (
                <Card key={expert.id} className="p-5 border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 font-semibold text-lg shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-900 truncate">
                        {expert.first_name} {expert.last_name}
                      </h3>
                      <p className="text-sm text-slate-500 capitalize">
                        {departmentLabels[expert.department_id] || expert.department_id?.replace(/_/g, " ")}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                        <span className="text-xs text-slate-400">
                          {expert.seniority_level || 5}+ years
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expertise Tags */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1.5">
                      {(expert.expertise_tags ?? []).slice(0, 4).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs bg-slate-100 text-slate-600 font-normal">
                          {tag}
                        </Badge>
                      ))}
                      {(expert.expertise_tags?.length || 0) > 4 && (
                        <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600">
                          +{expert.expertise_tags!.length - 4}
                        </Badge>
                      )}
                      {(!expert.expertise_tags?.length) && (
                        <span className="text-xs text-slate-400">Subject Matter Expert</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-slate-100">
                    <Button 
                      variant="outline" 
                      className="flex-1 text-xs h-8"
                      onClick={() => window.location.href = `mailto:${expert.email}`}
                    >
                      <Mail className="h-3.5 w-3.5 mr-1.5" /> Contact
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
