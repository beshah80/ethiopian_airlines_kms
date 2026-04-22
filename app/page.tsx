"use client";

import Link from "next/link";
import { useRef } from "react";
import { BookOpen, Users, Lightbulb, Shield, Globe, Plane, ArrowRight, TrendingUp } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

const features = [
  { icon: BookOpen, label: "Knowledge Base", desc: "SOPs, manuals & best practices — searchable, bilingual, versioned.", href: "/knowledge" },
  { icon: Users, label: "Expert Locator", desc: "Find who knows what across every department, instantly.", href: "/experts" },
  { icon: Lightbulb, label: "Innovation Hub", desc: "Submit ideas, vote, track implementation from any level.", href: "/innovation" },
  { icon: Shield, label: "Lessons Learned", desc: "After-action reviews that prevent incidents from repeating.", href: "/lessons-learned" },
  { icon: Globe, label: "Localization", desc: "Amharic + English. Offline-ready for regional stations.", href: "/login" },
  { icon: Plane, label: "All Departments", desc: "Flight Ops, Engineering, Ground, Cabin, Training — one system.", href: "/login" },
];

const personas = [
  { name: "Capt. Abebe Bikila", role: "Senior Pilot · 15 yrs", quote: "I share HAAB weather approaches once — every junior pilot learns forever." },
  { name: "Engineer Tola Girma", role: "MRO · 14 yrs", quote: "Hydraulic fault on the 737? I find the SOP and the expert in under a minute." },
  { name: "Tewodros Abebe", role: "Ground Ops · Bahir Dar", quote: "Offline Amharic procedures. Works even when the internet doesn't." },
  { name: "Innovation Committee", role: "Cross-departmental", quote: "Ideas from the hangar floor reach management and get implemented." },
];

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const fullText = "One system.\nAll the knowledge.";

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const backgroundScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.12]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* ── HERO — full image background with parallax, typewriter, and scroll indicator ── */}
      <section ref={containerRef} className="relative min-h-screen flex flex-col overflow-hidden">
        {/* Parallax Background Image */}
        <motion.div
          style={{ y: backgroundY, scale: backgroundScale }}
          className="absolute inset-0 z-0"
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url('/assets/background.jpg')`,
              backgroundSize: "cover",
              backgroundPosition: "center center",
            }}
          />
          {/* Dark overlay with gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>
          {/* Subtle noise texture */}
          <motion.div
            initial={{ backgroundPosition: "0% 0%" }}
            animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
            transition={{ repeat: Infinity, duration: 200, ease: "linear" }}
            className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"
          />
        </motion.div>

        {/* NAV — transparent, over image */}
        <nav className="relative z-20 flex items-center justify-between px-8 md:px-14 h-16 pt-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shadow-sm">
              <Plane className="h-4 w-4 text-black" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold text-white tracking-tight">Ethiopian Airlines</div>
              <div className="text-[10px] text-white/40 font-semibold tracking-widest uppercase">Knowledge Portal</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <button className="h-9 px-5 text-sm font-semibold text-white/70 hover:text-white transition-colors">
                Sign In
              </button>
            </Link>
            <Link href="/login">
              <button className="h-9 px-5 text-sm font-bold bg-amber-500 hover:bg-amber-400 text-black rounded-xl transition-all">
                Get Started
              </button>
            </Link>
          </div>
        </nav>

        {/* HERO CONTENT — centered vertically with animations */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-8 md:px-14">
          <div className="max-w-3xl text-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tight text-white mb-6"
            >
              <span className="whitespace-pre-line">{fullText}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
              className="text-white/80 text-lg md:text-xl leading-relaxed mb-10 font-normal max-w-2xl mx-auto"
            >
              Institutional intelligence — captured, searchable, and accessible to every employee from Addis to Bahir Dar.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex justify-center"
            >
              <Link href="/login">
                <button className="group relative h-12 px-8 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm rounded-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 flex items-center gap-2 shadow-lg shadow-amber-500/20 overflow-hidden">
                  <span className="relative z-10 flex items-center gap-2">
                    Access Knowledge Base <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-white/20 to-amber-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </button>
              </Link>
            </motion.div>
          </div>
        </div>

      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-8 md:px-14 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <p className="text-amber-600 text-xs font-bold tracking-widest uppercase mb-3">What's inside</p>
            <h2 className="text-3xl font-bold text-slate-900">Built for every role,<br />every station.</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, label, desc, href }) => (
              <Link key={label} href={href} className="group block">
                <div className="h-full bg-white hover:bg-amber-50/60 border border-slate-100 hover:border-amber-200 rounded-2xl p-6 transition-all duration-200 shadow-sm hover:shadow-md">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-5 group-hover:bg-amber-200 transition-colors">
                    <Icon className="h-5 w-5 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-2">{label}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed font-normal">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 px-8 md:px-14 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { n: "01", title: "Capture", body: "Experts record SOPs, videos, and lessons learned directly into the system." },
              { n: "02", title: "Search", body: "Any employee finds what they need in seconds — by topic, aircraft, or department." },
              { n: "03", title: "Improve", body: "Ideas get voted on, reviewed, and implemented. Knowledge compounds over time." },
            ].map((step) => (
              <div key={step.n} className="flex gap-5">
                <span className="text-5xl font-bold text-slate-200 leading-none select-none shrink-0">{step.n}</span>
                <div>
                  <h3 className="font-bold text-slate-900 text-base mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed font-normal">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PERSONAS ── */}
      <section className="py-24 px-8 md:px-14 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <p className="text-amber-600 text-xs font-bold tracking-widest uppercase mb-3">Real scenarios</p>
            <h2 className="text-3xl font-bold text-slate-900">Used by everyone,<br />from hangar to HQ.</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {personas.map((p) => (
              <div key={p.name} className="bg-white border border-slate-100 rounded-2xl p-7 shadow-sm">
                <p className="text-slate-600 text-sm leading-relaxed mb-6 font-normal">"{p.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm shrink-0">
                    {p.name[0]}
                  </div>
                  <div>
                    <div className="text-slate-900 font-semibold text-sm">{p.name}</div>
                    <div className="text-slate-400 text-xs">{p.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-8 md:px-14 bg-white border-t border-slate-100">
        <div className="max-w-xl mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-7">
            <TrendingUp className="h-7 w-7 text-amber-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Ready to access<br />the knowledge base?</h2>
          <p className="text-slate-400 text-sm mb-8 font-normal">Login with your Ethiopian Airlines credentials.</p>
          <Link href="/login">
            <button className="h-11 px-10 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm rounded-xl transition-colors inline-flex items-center gap-2">
              Login to KMS <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-100 py-8 px-8 md:px-14 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-amber-100 flex items-center justify-center">
              <Plane className="h-3 w-3 text-amber-600" />
            </div>
            <span>Ethiopian Airlines KMS · Academic Prototype 2026</span>
          </div>
          <div className="flex gap-6">
            <span>Innovation</span>
            <span>Quality</span>
            <span>Localization</span>
          </div>
        </div>
      </footer>
    </div>
  );
}