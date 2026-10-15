"use client";

import React from "react";
import Link from "next/link";
import {
  Clock,
  Award,
  Users,
  Cpu,
  Building,
  Sparkles,
  Calendar,
  Radio,
  ArrowRight,
  ShieldCheck,
  Terminal,
  Zap,
  HelpCircle,
  CheckCircle2
} from "lucide-react";
import { AboutShell } from "@/components/about/about-shell";
import { ABOUT_TABS } from "@/components/about/about-subnav";

export default function AboutPage() {
  return (
    <AboutShell
      currentChapter="overview"
      nextChapter={{ label: "02 // PIPELINE", href: "/about/pipeline" }}
    >
      {/* ---------------- 01 // OVERVIEW SHOWCASE ---------------- */}
      <section id="overview" className="space-y-12">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Headlines & High-Tech Decals */}
          <div className="lg:col-span-7 space-y-6">
            {/* Terminal Breadcrumb */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-[#D83A43]">
              <Radio className="w-3.5 h-3.5 animate-pulse text-[#D83A43]" />
              <span className="tracking-widest uppercase font-bold">
                01 // OFFICIAL PARTICIPANT INTELLIGENCE & OVERVIEW
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05]">
              IDEAS BEYOND <br />
              <span className="bg-gradient-to-r from-[#D83A43] via-[#B52A32] to-[#F2F2F2] bg-clip-text text-transparent">
                THE EVENT HORIZON
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#A8A8A8] leading-relaxed max-w-2xl">
              <strong className="text-white">HackMITTEN 3.0</strong> is a premier 24-hour national-level hackathon organized by the 
              Departments of <strong className="text-white">Computer Science & Engineering (CS&E)</strong> and{" "}
              <strong className="text-white">CS&E (Artificial Intelligence & Machine Learning)</strong> at{" "}
              <strong className="text-white">Maharaja Institute of Technology Thandavapura (MITT), Mysuru</strong>, 
              in direct collaboration with industry vanguard <strong className="text-[#D83A43]">VigyanLabs</strong>.
            </p>

            {/* High-level Pill Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {[
                { label: "SPRINT DURATION", val: "24 HOURS", icon: Clock },
                { label: "PRIZE POOL", val: "₹1,00,000", icon: Award },
                { label: "TEAM CAPACITY", val: "3–4 CODERS", icon: Users },
                { label: "EVENT THEME", val: "INDUSTRY PROBLEMS", icon: Cpu }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#080808] border border-white/10 rounded-xl p-3.5 hover:border-[#D83A43]/50 transition-colors"
                >
                  <item.icon className="w-4 h-4 text-[#D83A43] mb-2" />
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#A8A8A8]">
                    {item.label}
                  </div>
                  <div className="font-display font-semibold text-sm sm:text-base text-white mt-0.5">
                    {item.val}
                  </div>
                </div>
              ))}
            </div>

            {/* Department & Institution Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono text-[#A8A8A8]">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/[0.04] border border-white/5">
                <Building className="w-3.5 h-3.5 text-[#D83A43]" />
                MIT Thandavapura, Mysuru
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/[0.04] border border-white/5">
                <Sparkles className="w-3.5 h-3.5 text-[#D83A43]" />
                In Collaboration With VigyanLabs
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/[0.04] border border-white/5">
                <Calendar className="w-3.5 h-3.5 text-[#D83A43]" />
                28–29 October 2026
              </span>
            </div>
          </div>

          {/* Right Column: Mission Matrix HUD Display */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl border border-white/10 bg-[#080808] p-6 sm:p-8 space-y-6 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2 font-mono text-xs text-[#D83A43]">
                  <Terminal className="w-4 h-4" />
                  <span>MISSION SPECIFICATIONS</span>
                </div>
                <span className="font-mono text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                  SYSTEM READY
                </span>
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-[#030303] border border-white/5 space-y-1">
                  <div className="text-[#A8A8A8] text-[10px] uppercase">CO-ORGANIZED BY</div>
                  <div className="text-white font-bold text-sm">Department of CSE & CSE (AI & ML)</div>
                  <div className="text-[#A8A8A8]">Maharaja Institute of Technology Thandavapura</div>
                </div>


                <div className="p-3.5 rounded-xl bg-[#030303] border border-white/5 space-y-1">
                  <div className="text-[#A8A8A8] text-[10px] uppercase">CASH REWARDS & PERKS</div>
                  <div className="text-emerald-400 font-bold text-sm">₹1,00,000 Total Prize Pool</div>
                  <div className="text-[#A8A8A8]">Plus VigyanLabs internships and incubation support</div>
                </div>
              </div>

              <Link
                href="/about/pipeline"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#B52A32] hover:bg-[#c9323b] px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all"
              >
                <span>Explore 24H Pipeline Roadmap</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* ── 7 Chapters Navigation Directory Grid ── */}
        <div className="space-y-6 pt-6">
          <div className="border-b border-white/10 pb-4">
            <div className="font-mono text-xs text-[#D83A43] uppercase tracking-wider font-bold">
              MANUAL CHAPTER DIRECTORY
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-1">
              Select Any Section To Open Its Dedicated Page
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                id: "pipeline",
                num: "02",
                title: "Sprint Pipeline",
                desc: "Hour-by-hour 24-hour sprint timeline, check-in, review checkpoints, and finale.",
                href: "/about/pipeline",
                icon: Zap
              },
              {
                id: "topology",
                num: "03",
                title: "Domain Topology",
                desc: "Diploma vs UG/PG category matrix and assigned industry domains (Cyber, AI, Cloud, ERP).",
                href: "/about/topology",
                icon: Cpu
              },
              {
                id: "rewards",
                num: "04",
                title: "Rewards & Prizes",
                desc: "₹1,00,000 cash pool, VigyanLabs interview fast-track, incubation support, and swag.",
                href: "/about/rewards",
                icon: Award
              },
              {
                id: "rules",
                num: "05",
                title: "Rules & Conduct",
                desc: "10 golden competition rules, originality audit, and official 6-pillar code of conduct.",
                href: "/about/rules",
                icon: ShieldCheck
              },
              {
                id: "team",
                num: "06",
                title: "Organizing Team",
                desc: "Department heads, faculty coordinators, and student leads with instant call/chat buttons.",
                href: "/about/team",
                icon: Users
              },
              {
                id: "faq",
                num: "07",
                title: "Knowledge Base (FAQ)",
                desc: "Searchable and categorized answers to all queries on fees, eligibility, and rules.",
                href: "/about/faq",
                icon: HelpCircle
              }
            ].map((ch) => {
              const Icon = ch.icon;
              return (
                <Link
                  key={ch.id}
                  href={ch.href}
                  className="p-5 rounded-2xl bg-[#080808] border border-white/10 hover:border-[#D83A43]/50 hover:bg-[#0c0c0c] transition-all group flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-[#D83A43] font-bold">
                        CHAPTER // {ch.num}
                      </span>
                      <Icon className="w-4 h-4 text-[#A8A8A8] group-hover:text-[#D83A43] transition-colors" />
                    </div>
                    <h3 className="font-display font-bold text-lg text-white group-hover:text-[#f2636a] transition-colors">
                      {ch.title}
                    </h3>
                    <p className="text-xs text-[#A8A8A8] leading-relaxed">
                      {ch.desc}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-[#D83A43] group-hover:translate-x-0.5 transition-transform">
                    <span>OPEN CHAPTER</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </AboutShell>
  );
}
