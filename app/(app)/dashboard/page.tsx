"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Plane,
  BookOpen,
  Users,
  Lightbulb,
  LogOut,
  Search,
  Bell,
  Settings,
  AlertTriangle
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  department_id: string;
  is_expert: boolean;
}

export default function DashboardPage() {
  const [, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalArticles: 0, myContributions: 0, sopsAcked: 0 });
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      // Check for Demo Bypass first
      if (typeof window !== 'undefined') {
        const demoProfileStr = localStorage.getItem('kms_demo_profile');
        if (demoProfileStr) {
          try {
            const demoProfile = JSON.parse(demoProfileStr);
            console.log("Dashboard: Using Demo Bypass Profile:", demoProfile.email);
            setProfile(demoProfile);

            // Try fetch stats using anon key
            const { count: tc } = await supabase.from('knowledge_articles').select('*', { count: 'exact', head: true });
            setStats(prev => ({ ...prev, totalArticles: tc || 0 }));

            setLoading(false);
            return;
          } catch (e) { console.error("Demo profile parse error"); }
        }
      }

      // Wait a moment for auth to initialize from localStorage
      await new Promise(resolve => setTimeout(resolve, 100));

      // First check session (more reliable than getUser)
      const { data: { session } } = await supabase.auth.getSession();

      console.log("Dashboard: Session check:", session ? "found" : "not found");

      if (!session) {
        console.log("Dashboard: No session, redirecting to login");
        if (mounted) router.push("/login");
        return;
      }

      // Get user from session
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.log("Dashboard: No user, redirecting to login");
        if (mounted) router.push("/login");
        return;
      }

      if (!mounted) return;

      setUser(user);
      console.log("Dashboard: User found:", user.email);

      // Fetch user profile
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!profile) {
        console.log("Dashboard: No profile, redirecting to onboarding");
        if (mounted) router.push("/onboarding");
        return;
      }

      console.log("Dashboard: Profile found:", profile.first_name, profile.last_name);

      // Fetch Stats
      let totalArts = 0;
      let myContribs = 0;
      let sops = 0;

      try {
        const { count: tc } = await supabase.from('knowledge_articles').select('*', { count: 'exact', head: true });
        totalArts = tc || 0;

        const { count: mc } = await supabase.from('knowledge_articles').select('*', { count: 'exact', head: true }).eq('author', user.id);
        myContribs = mc || 0;

        const { count: sa } = await supabase.from('sop_acknowledgments').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
        sops = sa || 0;
      } catch (e) {
        console.log("Stats fetch error, likely tables not migrated yet.");
      }

      if (mounted) {
        setProfile(profile);
        setStats({ totalArticles: totalArts, myContributions: myContribs, sopsAcked: sops });
        setLoading(false);
      }
    };

    checkAuth();

    return () => { mounted = false; };
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome, {profile?.first_name || "User"}!
          </h1>
          <p className="text-slate-600 mt-1">
            {profile?.role && (
              <Badge variant="secondary" className="mr-2">
                {profile.role}
              </Badge>
            )}
            {profile?.is_expert && (
              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                Expert
              </Badge>
            )}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-amber-100 text-amber-700">
                {profile?.first_name?.[0]}
                {profile?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <div className="font-medium text-slate-900">
                {profile?.first_name} {profile?.last_name}
              </div>
              <div className="text-slate-600">{profile?.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" aria-label="Search">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" aria-label="Notifications">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" aria-label="Aircraft">
              <Plane className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <BookOpen className="h-8 w-8 text-amber-600 mb-2" />
              <CardTitle className="text-lg">Knowledge Base</CardTitle>
              <CardDescription>Search articles & SOPs</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/knowledge" className="block">
                <Button variant="outline" className="w-full">
                  Browse
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <Users className="h-8 w-8 text-amber-600 mb-2" />
              <CardTitle className="text-lg">Expert Locator</CardTitle>
              <CardDescription>Find subject experts</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/experts" className="block">
                <Button variant="outline" className="w-full">
                  Find Experts
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <Lightbulb className="h-8 w-8 text-amber-600 mb-2" />
              <CardTitle className="text-lg">Innovation</CardTitle>
              <CardDescription>Submit & vote ideas</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/innovation" className="block">
                <Button variant="outline" className="w-full">
                  Explore
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <Settings className="h-8 w-8 text-amber-600 mb-2" />
              <CardTitle className="text-lg">My Profile</CardTitle>
              <CardDescription>Manage your account</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/profile" className="block">
                <Button variant="outline" className="w-full">
                  Settings
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer md:col-span-2 lg:col-span-4 border-rose-200">
            <div className="flex flex-col sm:flex-row justify-between items-center p-6 bg-rose-50/50 rounded-xl">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2 text-rose-900 border-none mb-1">
                  <AlertTriangle className="h-5 w-5 text-rose-600" /> After-Action Reviews
                </h3>
                <p className="text-sm text-rose-700">Explore searchable operational incident reports and lessons learned.</p>
              </div>
              <Link href="/lessons-learned" className="mt-4 sm:mt-0">
                <Button className="bg-rose-600 hover:bg-rose-700 w-full sm:w-auto">
                  View AAR Database
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardDescription>Total Articles</CardDescription>
              <CardTitle className="text-3xl">{stats.totalArticles}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>My Contributions</CardDescription>
              <CardTitle className="text-3xl">{stats.myContributions}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>SOPs Acknowledged</CardDescription>
              <CardTitle className="text-3xl">{stats.sopsAcked}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-500 text-center py-8">
              No recent activity. Start exploring the knowledge base!
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
