"use client";

import Link from "next/link";
import { Plane } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t bg-white">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Plane className="h-7 w-7 text-amber-600" />
            <div className="leading-tight">
              <div className="font-semibold text-slate-900">Ethiopian Airlines KMS</div>
              <div className="text-sm text-slate-600">Strategic KM for Digital Ethiopia 2030</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-10 gap-y-2 text-sm">
            <Link href="/knowledge" className="text-slate-600 hover:text-slate-900">
              Knowledge Base
            </Link>
            <Link href="/experts" className="text-slate-600 hover:text-slate-900">
              Expert Locator
            </Link>
            <Link href="/innovation" className="text-slate-600 hover:text-slate-900">
              Innovation Hub
            </Link>
            <Link href="/lessons" className="text-slate-600 hover:text-slate-900">
              Lessons Learned
            </Link>
            <Link href="/dashboard" className="text-slate-600 hover:text-slate-900">
              Dashboard
            </Link>
            <Link href="/login" className="text-slate-600 hover:text-slate-900">
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center justify-between text-xs text-slate-500">
          <div>© 2026 Ethiopian Airlines. For academic prototype/demo use.</div>
          <div className="flex gap-3">
            <span>Innovation</span>
            <span>Quality</span>
            <span>Localization</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

