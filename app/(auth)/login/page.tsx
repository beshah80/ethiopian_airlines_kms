"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plane, Eye, EyeOff, AlertCircle, Lock, Mail, Loader2 } from "lucide-react";
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
        // Zero check bypass: No database call
        const mockProfiles: Record<string, any> = {
          "community@ethiopianairlines.com": { id: "d5038e19-7222-46f1-ac45-6282be5bc5a5", email: "community@ethiopianairlines.com", first_name: "Selam", last_name: "Community", role: "staff", department_id: "customer_service" },
          "expert@ethiopianairlines.com": { id: "e8e20298-de4e-493e-aaa5-daa75cd6f2e0", email: "expert@ethiopianairlines.com", first_name: "Abebe", last_name: "Expert", role: "staff", department_id: "engineering", is_expert: true },
          "admin@ethiopianairlines.com": { id: "abe8f2ef-e924-41c1-a771-ee71d8e7553d", email: "admin@ethiopianairlines.com", first_name: "System", last_name: "Admin", role: "admin", department_id: "it" }
        };

        const profile = mockProfiles[loginEmail];
        // Set cookie manually for middleware visibility
        document.cookie = `kms_demo_profile=${JSON.stringify(profile)}; path=/; max-age=3600`;
        // Also set in localStorage for client components
        localStorage.setItem('kms_demo_profile', JSON.stringify(profile));
        
        window.location.replace("/dashboard");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: loginPass,
        });

        if (authError) {
          setError(authError.message);
          setLoading(false);
          return;
        }

        if (!authData.user || !authData.session) {
          setError("No session returned from request");
          setLoading(false);
          return;
        }

        await supabase.auth.setSession({
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
        });

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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{
        backgroundImage: `radial-gradient(circle at 0% 0%, #0f172a 0%, #020617 100%)`,
      }}
    >
      {/* Aesthetic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-600 via-amber-400 to-red-600 opacity-50" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      
      <div className="w-full max-w-md relative z-10">
        <Card className="border border-white/10 shadow-2xl bg-slate-900/40 backdrop-blur-xl overflow-hidden rounded-2xl">
          <CardHeader className="space-y-1 pb-8 pt-10 text-center border-b border-white/5">
            <CardTitle className="text-3xl font-black tracking-tight text-white uppercase italic">
              Access <span className="text-amber-500">Gateway</span>
            </CardTitle>
            <CardDescription className="text-slate-400 text-sm font-light tracking-wide">
              Secure Authentication Protocol
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-8 px-8">
            {error && (
              <Alert className="mb-6 border-rose-500/20 bg-rose-500/10 text-rose-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300 font-semibold text-xs uppercase tracking-widest pl-1">
                  Employee ID / Email
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@ethiopianairlines.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-12 bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 focus:border-amber-500 focus:ring-amber-500/20 transition-all rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300 font-semibold text-xs uppercase tracking-widest pl-1">
                  Access Key
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 pr-10 h-12 bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 focus:border-amber-500 focus:ring-amber-500/20 transition-all rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm uppercase tracking-widest shadow-lg shadow-amber-500/20 transition-all duration-300 rounded-xl"
                disabled={loading}
              >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="animate-spin h-4 w-4" />
                      Decrypting...
                    </span>
                  ) : (
                    "Authorize Session"
                  )}
                </Button>
            </form>

            <div className="mt-10 mb-8 relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#020617] px-4 text-slate-500 font-bold tracking-[0.2em]">Quick Bypass</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 mb-10">
               <div className="grid grid-cols-3 gap-3">
                  <button 
                    type="button"
                    className="py-3 px-2 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-[10px] font-bold text-slate-300 transition-all uppercase tracking-tight"
                    onClick={() => attemptLogin("community@ethiopianairlines.com", "community123", true)}
                  >
                    Staff
                  </button>
                  <button 
                    type="button"
                    className="py-3 px-2 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 text-[10px] font-bold text-amber-500 transition-all uppercase tracking-tight"
                    onClick={() => attemptLogin("expert@ethiopianairlines.com", "expert123", true)}
                  >
                    Expert
                  </button>
                  <button 
                    type="button"
                    className="py-3 px-2 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-[10px] font-bold text-rose-400 transition-all uppercase tracking-tight"
                    onClick={() => attemptLogin("admin@ethiopianairlines.com", "admin123", true)}
                  >
                    Root
                  </button>
               </div>
            </div>
          </CardContent>
        </Card>
        
        <p className="mt-8 text-center text-[10px] uppercase tracking-[0.3em] text-slate-600 font-bold">
          Strategic Knowledge Gateway <span className="text-slate-800 mx-2">|</span> v1.0.42
        </p>
      </div>
    </div>
  );
}
