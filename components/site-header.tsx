"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plane, LayoutDashboard, BookOpen, Users, Shield, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/knowledge", label: "Knowledge Base", icon: BookOpen },
  { href: "/lessons-learned", label: "Lessons Learned", icon: Shield },
  { href: "/experts", label: "Experts", icon: Users },
  { href: "/innovation", label: "Innovation", icon: Lightbulb },
];

export function SiteHeader({
  variant = "public",
}: {
  variant?: "public" | "app";
}) {
  const pathname = usePathname();

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href={variant === "app" ? "/dashboard" : "/"} className="flex items-center gap-3">
          <Plane className="h-8 w-8 text-amber-600" />
          <div className="leading-tight">
            <div className="text-base font-bold text-slate-900">Ethiopian Airlines</div>
            <div className="text-xs text-slate-600">Knowledge Management System</div>
          </div>
        </Link>

        {variant === "public" ? (
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/login">
              <Button className="bg-amber-600 hover:bg-amber-700">Get Started</Button>
            </Link>
          </div>
        ) : (
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors",
                    active
                      ? "bg-amber-50 text-amber-800"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}

