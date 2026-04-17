"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Department = { id: string; name: string; regional_location: string | null };
type UserRole = "staff" | "trainee" | "expert" | "dept_head" | "admin";

export default function OnboardingPage() {
  const { profile, loading: authLoading, supabase } = useAuth();
  const router = useRouter();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [role, setRole] = useState<UserRole>("staff");

  useEffect(() => {
    if (authLoading) return;
    if (profile) {
      router.push("/dashboard");
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);

      const { data: departments } = await supabase
        .from("departments")
        .select("id,name,regional_location")
        .order("name");

      setDepartments(departments ?? []);
      setDepartmentId(departments?.[0]?.id ?? "");
      setLoading(false);
    };

    load();
  }, [router, supabase, profile, authLoading]);

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center mx-auto mb-4">
            <span className="text-black font-bold text-lg">ET</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Complete your profile</h1>
          <p className="text-slate-400 text-sm mt-1 font-normal">Helps route expert questions to the right people.</p>
        </div>
        <Card className="shadow-sm border-slate-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Your Details</CardTitle>
            <CardDescription>This is shown to colleagues when they search for experts.</CardDescription>
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
                <Button type="submit" className="bg-amber-500 hover:bg-amber-400 text-black font-bold" disabled={saving}>
                  {saving ? "Saving…" : "Save & Continue"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

