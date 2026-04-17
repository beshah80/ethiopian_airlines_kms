"use client";

import Link from "next/link";
import { Plane } from "lucide-react";

const links = [
  { href: "/knowledge", label: "Knowledge Base" },
  { href: "/experts", label: "Expert Locator" },
  { href: "/innovation", label: "Innovation Hub" },
  { href: "/lessons-learned", label: "Lessons Learned" },
  { href: "/dashboard", label: "Dashboard" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="container mx-auto px-5 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
              <Plane className="h-3.5 w-3.5 text-black" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">Ethiopian Airlines KMS</div>
              <div className="text-xs text-slate-400">Digital Ethiopia 2030 · Academic Prototype</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="text-xs text-slate-400 hover:text-slate-700 font-medium transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-300">
          <span>© 2026 Ethiopian Airlines Group</span>
          <div className="flex gap-4">
            <span>Innovation</span>
            <span>Quality</span>
            <span>Localization</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
