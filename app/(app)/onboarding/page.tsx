"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Department = { id: string; name: string; regional_location: string | null };
type UserRole = "staff" | "trainee" | "expert" | "dept_head" | "admin";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [role, setRole] = useState<UserRole>("staff");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      // Check session first (more reliable)
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("Onboarding: No session found, redirecting to login");
        router.push("/login");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("Onboarding: No user found, redirecting to login");
        router.push("/login");
        return;
      }
      
      console.log("Onboarding: User found:", user.email);

      const { data: existing } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (existing?.id) {
        router.push("/dashboard");
        return;
      }

      const { data: departments } = await supabase
        .from("departments")
        .select("id,name,regional_location")
        .order("name");

      setDepartments(departments ?? []);
      setDepartmentId(departments?.[0]?.id ?? "");
      setLoading(false);
    };

    load();
  }, [router, supabase]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) {
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("user_profiles").insert({
      id: user.id,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: user.email ?? "",
      role,
      department_id: departmentId || null,
      is_expert: role === "expert",
    });

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p className="text-slate-600">Loading…</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Complete your profile</CardTitle>
            <CardDescription>
              This helps the system personalize content and route expert questions to the right people.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Abebe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Bekele"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department / Station</Label>
                  <select
                    id="department"
                    className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                        {d.regional_location ? ` — ${d.regional_location}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                  >
                    <option value="staff">Staff</option>
                    <option value="trainee">Trainee</option>
                    <option value="expert">Expert</option>
                    <option value="dept_head">Department head</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="submit" className="bg-amber-600 hover:bg-amber-700" disabled={saving}>
                  {saving ? "Saving…" : "Save & continue"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

