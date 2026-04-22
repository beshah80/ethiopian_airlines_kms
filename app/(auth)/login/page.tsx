"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const attemptLogin = async (loginEmail: string, loginPass: string, isBypass = false) => {
    if (isBypass) {
      const mockProfiles: Record<string, object> = {
        "community@ethiopianairlines.com": { id: "d5038e19-7222-46f1-ac45-6282be5bc5a5", email: "community@ethiopianairlines.com", first_name: "Selam", last_name: "Community", role: "staff", department_id: "customer_service" },
        "expert@ethiopianairlines.com": { id: "e8e20298-de4e-493e-aaa5-daa75cd6f2e0", email: "expert@ethiopianairlines.com", first_name: "Abebe", last_name: "Expert", role: "staff", department_id: "engineering", is_expert: true },
        "admin@ethiopianairlines.com": { id: "abe8f2ef-e924-41c1-a771-ee71d8e7553d", email: "admin@ethiopianairlines.com", first_name: "System", last_name: "Admin", role: "admin", department_id: "it" },
      };
      const profile = mockProfiles[loginEmail];
      document.cookie = `kms_demo_profile=${encodeURIComponent(JSON.stringify(profile))}; path=/; max-age=86400; SameSite=Lax`;
      localStorage.setItem("kms_demo_profile", JSON.stringify(profile));
      window.location.replace("/dashboard");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPass });
      if (authError) { setError(authError.message); setLoading(false); return; }
      if (!authData.user || !authData.session) { setError("No session returned"); setLoading(false); return; }
      await supabase.auth.setSession({ access_token: authData.session.access_token, refresh_token: authData.session.refresh_token });
      window.location.replace("/dashboard");
    } catch (err) {
      setError("An unexpected error occurred: " + (err instanceof Error ? err.message : String(err)));
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await attemptLogin(email, password);
  };

  return (
    <div className="min-h-screen flex">

      {/* LEFT — full image */}
      <div className="hidden lg:block lg:w-[55%] relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url('/assets/background.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/75 via-slate-900/35 to-slate-900/75" />
      </div>

      {/* RIGHT — form on slate-50 background */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-slate-50">
        <div className="w-full max-w-md">

          {/* Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/60 p-8">

            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-1.5">Welcome back</h1>
              <p className="text-slate-400 text-sm font-normal">Login to access the system.</p>
            </div>

            {error && (
              <Alert className="mb-5 border-rose-200 bg-rose-50 text-rose-700">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@ethiopianairlines.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-300 focus-visible:border-amber-500 focus-visible:ring-amber-500/20 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 pr-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-300 focus-visible:border-amber-500 focus-visible:ring-amber-500/20 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</> : "Sign In"}
              </button>
            </form>

            <div className="mt-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-slate-300 text-[11px] font-bold uppercase tracking-widest">Demo Access</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Staff", email: "community@ethiopianairlines.com", pass: "community123" },
                  { label: "Expert", email: "expert@ethiopianairlines.com", pass: "expert123" },
                  { label: "Admin", email: "admin@ethiopianairlines.com", pass: "admin123" },
                ].map((d) => (
                  <button
                    key={d.label}
                    type="button"
                    onClick={() => attemptLogin(d.email, d.pass, true)}
                    className="h-10 rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 text-slate-500 hover:text-amber-700 text-xs font-bold transition-all uppercase tracking-wide"
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
