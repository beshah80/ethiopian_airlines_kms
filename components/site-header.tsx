"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Plane, LayoutDashboard, BookOpen, Users, 
  Shield, Lightbulb, LogOut, ChevronDown, 
  UserCircle, Bell, Search, Globe, Menu, X, Settings, CheckCircle2, Star 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import i18n from "@/lib/i18n";

const navItems: { href: string; label: string; icon: any }[] = [];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, logout, loading } = useAuth(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!profile) return null;

  const displayName = `${profile.first_name} ${profile.last_name}`;
  const initials = `${profile.first_name?.[0]}${profile.last_name?.[0]}`;

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
      {/* Aviation Grade Status Bar */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#078930] via-[#FCDD09] to-[#DA121A] opacity-80" />
      
      <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Left Section: Logo & Brand */}
        <Link href="/dashboard" className="flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform shadow-lg shadow-slate-200">
            <Plane className="h-5 w-5 text-amber-500" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-black text-slate-900 leading-none uppercase tracking-tighter">Selam Community</h1>
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest opacity-80">Knowledge Management</p>
          </div>
        </Link>

        {/* Desktop Navigation - Removed as requested */}
        <div className="hidden lg:flex flex-1" />

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Universal Search Trigger */}
          <button className="hidden md:flex items-center gap-3 px-4 h-10 bg-slate-100/80 hover:bg-slate-200/80 rounded-xl border border-slate-200/50 text-slate-400 transition-all group">
            <Search className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium pr-8">Search knowledge...</span>
            <kbd className="text-[10px] font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-500">⌘K</kbd>
          </button>

          <div className="flex items-center gap-1.5 md:gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100/50 hover:bg-slate-200/50 text-slate-500 transition-all border border-slate-200/50 group">
                <Bell className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="absolute top-2 right-2 w-3.5 h-3.5 bg-rose-500 text-[8px] font-black text-white flex items-center justify-center rounded-full border-2 border-white">3</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-2 rounded-2xl shadow-2xl border-slate-200">
                <div className="flex items-center justify-between p-3 border-b border-slate-50 mb-2">
                   <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Intelligence Feed</h3>
                   <span className="text-[10px] font-bold text-amber-600 cursor-pointer hover:underline">Mark all read</span>
                </div>
                <div className="space-y-1">
                  <NotificationItem title="B787 Technical SOP" desc="New revision uploaded by Engineering HQ" time="2m ago" icon={Shield} color="text-amber-500" />
                  <NotificationItem title="Idea Approved" desc="Your proposal for Ground Ops optimization is under review" time="1h ago" icon={Lightbulb} color="text-violet-500" />
                  <NotificationItem title="Expert Endorsement" desc="Capt. Abebe endorsed your Technical Writing skill" time="3h ago" icon={Star} color="text-emerald-500" />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100/50 hover:bg-slate-200/50 text-slate-500 transition-all border border-slate-200/50 group">
                <Globe className="h-4 w-4 group-hover:scale-110 transition-transform" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32 p-1 rounded-xl shadow-xl border-slate-200">
                <DropdownMenuItem 
                  onClick={() => i18n.changeLanguage('en')}
                  className="flex items-center justify-between py-2 rounded-lg cursor-pointer font-bold text-xs"
                >
                  English {i18n.language === 'en' && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => i18n.changeLanguage('am')}
                  className="flex items-center justify-between py-2 rounded-lg cursor-pointer font-bold text-xs"
                >
                  አማርኛ {i18n.language === 'am' && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2.5 p-1 pr-2.5 rounded-xl hover:bg-slate-100 transition-all outline-none border border-transparent hover:border-slate-200">
                <div className="relative">
                  <Avatar className="h-8 w-8 rounded-lg bg-amber-500 ring-2 ring-white shadow-sm">
                    <AvatarFallback className="bg-amber-500 text-black text-xs font-black rounded-lg">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-[11px] font-black text-slate-900 leading-none mb-0.5">{displayName}</div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">
                    {profile.is_expert ? "SME" : profile.role}
                  </div>
                </div>
                <ChevronDown className="hidden md:block h-3.5 w-3.5 text-slate-400" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-2xl border-slate-200">
                 <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-2">
                    <Avatar className="h-10 w-10 rounded-xl bg-amber-500">
                      <AvatarFallback className="text-black font-black">{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-xs font-black text-slate-900">{displayName}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">{profile.email}</div>
                    </div>
                 </div>
                 <DropdownMenuItem onClick={() => router.push("/profile")} className="flex items-center gap-3 py-2.5 rounded-lg cursor-pointer font-bold text-xs">
                    <UserCircle className="h-4 w-4" /> My Profile
                 </DropdownMenuItem>
                 <DropdownMenuItem className="flex items-center gap-3 py-2.5 rounded-lg cursor-pointer font-bold text-xs">
                    <Settings className="h-4 w-4" /> Account Settings
                 </DropdownMenuItem>
                 <DropdownMenuSeparator className="my-2" />
                 <DropdownMenuItem onClick={logout} className="flex items-center gap-3 py-2.5 rounded-lg cursor-pointer font-bold text-xs text-rose-600 focus:bg-rose-50 focus:text-rose-600">
                    <LogOut className="h-4 w-4" /> Log Out
                 </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

function HeaderIconButton({ icon: Icon, badge }: { icon: any; badge?: string }) {
  return (
    <button className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100/50 hover:bg-slate-200/50 text-slate-500 transition-all border border-slate-200/50 group">
      <Icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
      {badge && (
        <span className="absolute top-2 right-2 w-3.5 h-3.5 bg-rose-500 text-[8px] font-black text-white flex items-center justify-center rounded-full border-2 border-white">
          {badge}
        </span>
      )}
    </button>
  );
}

function NotificationItem({ title, desc, time, icon: Icon, color }: any) {
  return (
    <DropdownMenuItem className="flex items-start gap-3 p-3 rounded-xl cursor-pointer hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
      <div className={cn("w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0", color.replace("text", "bg").replace("500", "50"))}>
        <Icon className={cn("h-4 w-4", color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-xs font-black text-slate-900 truncate">{title}</span>
          <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap">{time}</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-tight line-clamp-2 font-medium">{desc}</p>
      </div>
    </DropdownMenuItem>
  );
}
