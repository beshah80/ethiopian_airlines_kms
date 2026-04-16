"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, MapPin, Mail, Phone, Users } from "lucide-react";

type ExpertProfile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  department_id: string;
  role: string;
  expert_details?: {
    bio: string;
    areas_of_expertise: string[];
    years_experience: number;
    availability_status: string;
    contact_preferences: string;
  };
};

export default function ExpertsPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);
  const [experts, setExperts] = useState<ExpertProfile[]>([]);
  const [q, setQ] = useState("");
  const [department, setDepartment] = useState("all");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: auth } = await supabase.auth.getUser();
      let user = auth.user;
      
      if (!user && typeof window !== 'undefined') {
        const demoStr = localStorage.getItem('kms_demo_profile');
        if (demoStr) {
          setLoading(false);
          return;
        }
      }

      if (!user) {
        router.push("/login");
        return;
      }

      // We fetch all profiles marked as experts. In a real app with proper joins,
      // we would use a unified view or join the expert_profiles table.
      // For this prototype, we'll fetch them and their details.
      let query = supabase
        .from("user_profiles")
        .select(`
          id, first_name, last_name, email, department_id, role,
          expert_details:expert_profiles(bio, areas_of_expertise, years_experience, availability_status, contact_preferences)
        `)
        .eq("is_expert", true)
        .limit(50);

      if (department !== "all") {
        query = query.eq("department_id", department);
      }
      
      const { data } = await query;
      
      let filtered = (data ?? []) as any[];
      
      // Client-side text search for convenience in prototype
      if (q.trim()) {
        const lowerQ = q.toLowerCase();
        filtered = filtered.filter(row => 
          row.first_name.toLowerCase().includes(lowerQ) ||
          row.last_name.toLowerCase().includes(lowerQ) ||
          row.expert_details?.[0]?.areas_of_expertise?.join(" ").toLowerCase().includes(lowerQ)
        );
      }

      // Flatten the array from details
      const formatted = filtered.map(item => ({
        ...item,
        expert_details: item.expert_details?.[0] || {
          bio: "Senior Subject Matter Expert",
          areas_of_expertise: ["Operations", "Safety"],
          years_experience: 10,
          availability_status: "available",
          contact_preferences: "email"
        }
      }));

      setExperts(formatted);
      setLoading(false);
    };

    load();
  }, [department, q, router, supabase]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full text-xs font-medium mb-3">
            <Users className="h-3.5 w-3.5" />
            Tacit Knowledge mapping
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Expert Locator</h1>
          <p className="text-slate-600 mt-1">
            Find and connect with subject matter experts across Ethiopian Airlines.
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <Card className="mb-8">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 relative">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name, skill, or aircraft (e.g., 'Hydraulics', 'A350')..."
                className="pl-9"
              />
            </div>
            <select
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="all">All Departments</option>
              <option value="flight_ops">Flight Operations</option>
              <option value="engineering">Engineering & Maintenance</option>
              <option value="customer_service">Customer Service</option>
              <option value="ground_ops">Ground Operations</option>
              <option value="training">Training (EAU)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Results Grid */}
      {loading ? (
        <p className="text-slate-600">Loading experts...</p>
      ) : experts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-600">No experts found matching your criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experts.map((expert) => (
            <Card key={expert.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                      <AvatarFallback className="bg-amber-100 text-amber-700 font-semibold text-lg">
                        {expert.first_name?.[0]}
                        {expert.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg text-slate-900">
                        {expert.first_name} {expert.last_name}
                      </CardTitle>
                      <CardDescription className="text-sm font-medium mt-0.5 text-slate-500">
                        {expert.role} • {expert.expert_details?.years_experience} yrs exp
                      </CardDescription>
                    </div>
                  </div>
                  {expert.expert_details?.availability_status === 'available' && (
                    <span className="flex h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" title="Available"></span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Areas of Expertise</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {expert.expert_details?.areas_of_expertise?.map((tag) => (
                        <Badge key={tag} className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none rounded">
                          {tag}
                        </Badge>
                      ))}
                      {(!expert.expert_details?.areas_of_expertise || expert.expert_details.areas_of_expertise.length === 0) && (
                        <span className="text-sm text-slate-400">Not specified</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 pt-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                       <MapPin className="h-4 w-4 text-slate-400" />
                       <span className="capitalize">{expert.department_id.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex gap-2">
                    <Button className="w-full bg-slate-900 hover:bg-slate-800 gap-2 h-9 text-sm">
                      <Mail className="h-4 w-4" /> Message
                    </Button>
                    <Button variant="outline" className="w-full gap-2 h-9 text-sm">
                      Book Time
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
