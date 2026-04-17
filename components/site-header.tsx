"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plane, LayoutDashboard, BookOpen, Users, Shield, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/knowledge", label: "Knowledge", icon: BookOpen },
  { href: "/lessons-learned", label: "Lessons", icon: Shield },
  { href: "/experts", label: "Experts", icon: Users },
  { href: "/innovation", label: "Innovation", icon: Lightbulb },
];

export function SiteHeader({ variant = "public" }: { variant?: "public" | "app" }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-100">
      {/* Ethiopian flag accent */}
      <div className="h-[3px] bg-gradient-to-r from-[#078930] via-[#FCDD09] to-[#DA121A]" />

      <div className="px-6 md:px-10 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href={variant === "app" ? "/dashboard" : "/"}
          className="flex items-center gap-2.5 shrink-0"
        >
          <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
            <Plane className="h-3.5 w-3.5 text-black" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold text-slate-900 tracking-tight">Ethiopian Airlines</div>
            <div className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">Knowledge Portal</div>
          </div>
        </Link>

        {variant === "public" ? (
          <div className="flex items-center gap-2">
            <Link href="/login">
              <button className="h-8 px-4 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
                Sign In
              </button>
            </Link>
            <Link href="/login">
              <button className="h-8 px-4 text-sm font-bold bg-slate-900 hover:bg-amber-500 hover:text-black text-white rounded-lg transition-all">
                Get Started
              </button>
            </Link>
          </div>
        ) : (
          <nav className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all",
                    active
                      ? "bg-amber-50 text-amber-700"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
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
