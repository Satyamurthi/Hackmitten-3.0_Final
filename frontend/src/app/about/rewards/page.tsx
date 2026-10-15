"use client";

import React from "react";
import {
  Award,
  Sparkles,
  Zap,
  CheckCircle2
} from "lucide-react";
import { AboutShell } from "@/components/about/about-shell";

export default function RewardsPage() {
  return (
    <AboutShell
      currentChapter="rewards"
      prevChapter={{ label: "03 // TOPOLOGY", href: "/about/topology" }}
      nextChapter={{ label: "05 // RULES", href: "/about/rules" }}
    >
      <section id="prizes" className="space-y-8">
        <div className="border-b border-white/10 pb-5">
          <div className="mono text-xs uppercase tracking-[0.3em] text-[#D83A43] mb-2">
            04 // REWARDS & RECOGNITION
          </div>
          <h1 className="display text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Prizes, Internships & Incubation Support
          </h1>
          <p className="text-[#A8A8A8] text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
            Competitive honors designed to elevate innovative prototypes from student hackathon builds into industry-ready commercial ventures.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Grand Prize Card */}
          <div className="relative rounded-2xl bg-gradient-to-b from-[#151515] to-[#080808] border border-[#D83A43]/50 p-6 sm:p-8 shadow-[0_0_30px_rgba(216,58,67,0.15)] flex flex-col justify-between overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D83A43]/20 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#D83A43]/15 border border-[#D83A43]/30 flex items-center justify-center mb-6">
                <Award className="w-6 h-6 text-[#D83A43]" />
              </div>
              <div className="font-mono text-xs text-[#D83A43] uppercase tracking-wider mb-1 font-bold">
                CUMULATIVE CASH AWARDS
              </div>
              <div className="font-display text-4xl sm:text-5xl font-bold text-white mb-3">
                ₹1,00,000
              </div>
              <p className="text-sm text-[#A8A8A8] leading-relaxed">
                Overall competitive prize pool distributed across standout category winners. Individual prize breakdowns and track bonuses will be officially declared on event day.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#A8A8A8]">
              <span>NATIONAL RANKING</span>
              <span className="text-[#D83A43] font-bold">CASH AWARDS</span>
            </div>
          </div>

          {/* Internship Card */}
          <div className="rounded-2xl bg-[#080808] border border-white/10 p-6 sm:p-8 flex flex-col justify-between hover:border-white/20 transition-colors">
            <div>
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="font-mono text-xs text-[#A8A8A8] uppercase tracking-wider mb-1 font-bold">
                INDUSTRY RECRUITMENT
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">
                VigyanLabs Internships
              </h2>
              <p className="text-sm text-[#A8A8A8] leading-relaxed">
                Top-performing engineering and design talents will earn direct consideration for exclusive internship placements at VigyanLabs, working on live commercial technology stacks.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#A8A8A8]">
              <span>CAREER ACCELERATION</span>
              <span className="text-white font-medium">DIRECT INTERVIEW</span>
            </div>
          </div>

          {/* Incubation Card */}
          <div className="rounded-2xl bg-[#080808] border border-white/10 p-6 sm:p-8 flex flex-col justify-between hover:border-white/20 transition-colors">
            <div>
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="font-mono text-xs text-[#A8A8A8] uppercase tracking-wider mb-1 font-bold">
                VENTURE DEVELOPMENT
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">
                Incubation Support
              </h2>
              <p className="text-sm text-[#A8A8A8] leading-relaxed">
                The team demonstrating the highest viability and market potential will receive comprehensive incubation support, technical mentoring, and guidance.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#A8A8A8]">
              <span>PROTOTYPE ACCELERATION</span>
              <span className="text-white font-medium">INCUBATION SUPPORT</span>
            </div>
          </div>
        </div>

        {/* Benefits Matrix */}
        <div className="rounded-2xl border border-white/10 bg-[#090909] p-6 sm:p-8 space-y-4">
          <div className="font-mono text-xs text-[#D83A43] uppercase tracking-wider font-bold">
            PARTICIPANT PERKS & CREDENTIALS
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            {[
              { title: "Verified Certificates", desc: "Official participation credentials co-certified by MITT & VigyanLabs." },
              { title: "Industry Mentorship", desc: "1-on-1 feedback from senior enterprise architects and founders." },
              { title: "Portfolio Visibility", desc: "Showcase prototype to national tech networks and recruiters." },
              { title: "Hackathon Goodies", desc: "Exclusive HackMITTEN 3.0 swag, badges, and stickers." }
            ].map((perk, i) => (
              <div key={i} className="p-4 rounded-xl bg-[#040404] border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{perk.title}</span>
                </div>
                <p className="text-xs text-[#A8A8A8] leading-relaxed pt-1">{perk.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AboutShell>
  );
}
