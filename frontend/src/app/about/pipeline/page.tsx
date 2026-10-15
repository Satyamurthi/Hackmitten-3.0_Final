"use client";

import React, { useState } from "react";
import {
  FileText,
  MapPin,
  Terminal,
  Zap,
  ShieldCheck,
  Award
} from "lucide-react";
import { AboutShell } from "@/components/about/about-shell";

export default function PipelinePage() {
  const [activePipelineStep, setActivePipelineStep] = useState<number>(1);

  return (
    <AboutShell
      currentChapter="pipeline"
      prevChapter={{ label: "01 // OVERVIEW", href: "/about" }}
      nextChapter={{ label: "03 // TOPOLOGY", href: "/about/topology" }}
    >
      <section id="pipeline" className="space-y-8">
        <div className="border-b border-white/10 pb-5">
          <div className="mono text-xs uppercase tracking-[0.3em] text-[#D83A43] mb-2">
            02 // TIMELINE & SPRINT PHASES
          </div>
          <h1 className="display text-3xl sm:text-5xl font-bold tracking-tight text-white">
            The 24-Hour Marathon Pipeline
          </h1>
          <p className="text-[#A8A8A8] text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
            From arrival check-in and problem statement unveils to intense midnight sprints and jury defense. Click each milestone node to inspect phase rules and deliverables.
          </p>
        </div>

        {/* Interactive Pipeline Node Strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { step: 1, title: "01. Registration", subtitle: "Category Verification", time: "Pre-Event", icon: FileText },
            { step: 2, title: "02. Check-In", subtitle: "Campus Reporting", time: "Day 1 Morning", icon: MapPin },
            { step: 3, title: "03. Reveal", subtitle: "Industry Problems", time: "Day 1 Opening", icon: Terminal },
            { step: 4, title: "04. 24H Sprint", subtitle: "Build & Rebuild", time: "24 Hours Non-stop", icon: Zap },
            { step: 5, title: "05. Evaluation", subtitle: "Jury Demonstration", time: "Day 2 Morning", icon: ShieldCheck },
            { step: 6, title: "06. Finale", subtitle: "Valedictory & Awards", time: "Day 2 Afternoon", icon: Award }
          ].map((node) => {
            const isActive = activePipelineStep === node.step;
            const Icon = node.icon;
            return (
              <button
                key={node.step}
                onClick={() => setActivePipelineStep(node.step)}
                className={`relative text-left p-4 rounded-xl border transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#151515] border-[#D83A43] shadow-[0_0_20px_rgba(216,58,67,0.25)] -translate-y-1"
                    : "bg-[#080808] border-white/10 hover:border-white/20 hover:bg-[#0c0c0c]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`w-6 h-6 rounded-md flex items-center justify-center font-mono text-xs font-bold ${
                      isActive ? "bg-[#D83A43] text-white" : "bg-white/10 text-[#A8A8A8]"
                    }`}
                  >
                    {node.step}
                  </span>
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#D83A43]" : "text-[#A8A8A8]"}`} />
                </div>
                <div className="font-display font-semibold text-sm text-white">
                  {node.title}
                </div>
                <div className="text-[11px] text-[#A8A8A8] mt-0.5">
                  {node.subtitle}
                </div>
                <div className="text-[10px] font-mono text-[#D83A43] mt-2 font-bold">
                  {node.time}
                </div>

                {isActive && (
                  <div className="absolute -bottom-px left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-[#D83A43] to-transparent" />
                )}
              </button>
            );
          })}
        </div>

        {/* Active Pipeline Node Detailed HUD Card */}
        <div className="bg-[#0a0a0a] border border-white/15 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D83A43]/10 rounded-full blur-3xl pointer-events-none" />

          {activePipelineStep === 1 && (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#D83A43] bg-[#D83A43]/10 px-2.5 py-1 rounded">
                <FileText className="w-3.5 h-3.5" />
                PHASE 01 // REGISTRATION & TEAM VERIFICATION
              </div>
              <h2 className="font-display text-2xl font-bold text-white">
                Registration & Strict Degree Tier Segregation
              </h2>
              <p className="text-[#A8A8A8] text-sm sm:text-base leading-relaxed">
                Teams of 3–4 members access the official registration portal via the QR code on the official poster or through verified 
                WhatsApp broadcasts. All team members must strictly belong to the same educational level (Diploma, UG, or PG). 
                Inter-branch and inter-college team formations are welcomed, but educational levels cannot be mixed. 
                Fees (Diploma: ₹500, UG/PG: ₹1,000) are non-refundable.
              </p>
              <div className="grid sm:grid-cols-3 gap-3 pt-2 font-mono text-xs">
                <div className="bg-[#030303] p-3.5 rounded-lg border border-white/10">
                  <span className="text-[#A8A8A8] block">TEAM SIZE</span>
                  <span className="text-white font-bold text-sm">3–4 Members</span>
                </div>
                <div className="bg-[#030303] p-3.5 rounded-lg border border-white/10">
                  <span className="text-[#A8A8A8] block">POLICY</span>
                  <span className="text-[#D83A43] font-bold text-sm">Strictly Non-refundable</span>
                </div>
                <div className="bg-[#030303] p-3.5 rounded-lg border border-white/10">
                  <span className="text-[#A8A8A8] block">CROSS-COLLEGE</span>
                  <span className="text-emerald-400 font-bold text-sm">Fully Permitted</span>
                </div>
              </div>
            </div>
          )}

          {activePipelineStep === 2 && (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#D83A43] bg-[#D83A43]/10 px-2.5 py-1 rounded">
                <MapPin className="w-3.5 h-3.5" />
                PHASE 02 // CAMPUS ARRIVAL & CREDENTIAL CHECK-IN
              </div>
              <h2 className="font-display text-2xl font-bold text-white">
                Reporting at MIT Thandavapura Campus
              </h2>
              <p className="text-[#A8A8A8] text-sm sm:text-base leading-relaxed">
                Registered participants report on October 28, 2026 at Maharaja Institute of Technology Thandavapura, Mysuru. 
                Every participant must display their official physical College Identity Card at the registration desk. 
                Participants will receive official credentials, designated hackathon workspace allocation, and Wi-Fi credentials.
              </p>
              <div className="grid sm:grid-cols-3 gap-3 pt-2 font-mono text-xs">
                <div className="bg-[#030303] p-3.5 rounded-lg border border-white/10">
                  <span className="text-[#A8A8A8] block">CAMPUS</span>
                  <span className="text-white font-bold text-sm">MIT Thandavapura, Mysuru</span>
                </div>
                <div className="bg-[#030303] p-3.5 rounded-lg border border-white/10">
                  <span className="text-[#A8A8A8] block">IDENTIFICATION</span>
                  <span className="text-amber-400 font-bold text-sm">College ID Required</span>
                </div>
                <div className="bg-[#030303] p-3.5 rounded-lg border border-white/10">
                  <span className="text-[#A8A8A8] block">FACILITIES READY</span>
                  <span className="text-emerald-400 font-bold text-sm">Desks & High-Speed LAN</span>
                </div>
              </div>
            </div>
          )}

          {activePipelineStep === 3 && (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#D83A43] bg-[#D83A43]/10 px-2.5 py-1 rounded">
                <Terminal className="w-3.5 h-3.5" />
                PHASE 03 // LIVE PROBLEM STATEMENT UNVEILING
              </div>
              <h2 className="font-display text-2xl font-bold text-white">
                Curated Industry Problem Statements Revealed
              </h2>
              <p className="text-[#A8A8A8] text-sm sm:text-base leading-relaxed">
                Problem statements formulated in partnership with VigyanLabs will be unlocked simultaneously inside the Seminar Hall 
                and participant dashboards. Diploma teams choose from Banking, Agriculture, and Healthcare. UG and PG teams 
                tackle Cybersecurity, Cloud Computing, AIOps, or Enterprise ERP. Teams analyze, strategize, and lock their domain.
              </p>
              <div className="grid sm:grid-cols-3 gap-3 pt-2 font-mono text-xs">
                <div className="bg-[#030303] p-3.5 rounded-lg border border-white/10">
                  <span className="text-[#A8A8A8] block">CURATION</span>
                  <span className="text-white font-bold text-sm">VigyanLabs & MITT</span>
                </div>
                <div className="bg-[#030303] p-3.5 rounded-lg border border-white/10">
                  <span className="text-[#A8A8A8] block">DIPLOMA DOMAINS</span>
                  <span className="text-white font-bold text-sm">3 Specializations</span>
                </div>
                <div className="bg-[#030303] p-3.5 rounded-lg border border-white/10">
                  <span className="text-[#A8A8A8] block">UG & PG DOMAINS</span>
                  <span className="text-white font-bold text-sm">4 Deep-Tech Fields</span>
                </div>
              </div>
            </div>
          )}

          {activePipelineStep === 4 && (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#D83A43] bg-[#D83A43]/10 px-2.5 py-1 rounded">
                <Zap className="w-3.5 h-3.5" />
                PHASE 04 // 24-HOUR CONTINUOUS CODE SPRINT
              </div>
              <h2 className="font-display text-2xl font-bold text-white">
                Build. Break. Rebuild. (The 24-Hour Marathon)
              </h2>
              <p className="text-[#A8A8A8] text-sm sm:text-base leading-relaxed">
                24 hours of pure ingenuity across the Seminar Hall, Central Library, and MCA Lab. Industry mentors from VigyanLabs 
                and MITT faculty conduct live checkpoints to guide teams through architectural hurdles, database scaling, and API integration. 
                Strict adherence to originality—pre-built commercial repositories are prohibited.
              </p>
              <div className="grid sm:grid-cols-3 gap-3 pt-2 font-mono text-xs">
                <div className="bg-[#030303] p-3.5 rounded-lg border border-white/10">
                  <span className="text-[#A8A8A8] block">DURATION</span>
                  <span className="text-[#D83A43] font-bold text-sm">Continuous 24 Hours</span>
                </div>
                <div className="bg-[#030303] p-3.5 rounded-lg border border-white/10">
                  <span className="text-[#A8A8A8] block">MENTOR SESSIONS</span>
                  <span className="text-white font-bold text-sm">Scheduled Checkpoints</span>
                </div>
                <div className="bg-[#030303] p-3.5 rounded-lg border border-white/10">
                  <span className="text-[#A8A8A8] block">INTEGRITY AUDIT</span>
                  <span className="text-emerald-400 font-bold text-sm">Original Code Mandate</span>
                </div>
              </div>
            </div>
          )}

          {activePipelineStep === 5 && (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#D83A43] bg-[#D83A43]/10 px-2.5 py-1 rounded">
                <ShieldCheck className="w-3.5 h-3.5" />
                PHASE 05 // JURY DEMONSTRATION & CODE AUDIT
              </div>
              <h2 className="font-display text-2xl font-bold text-white">
                Live Demonstrations Before Eminent Technical Jury
              </h2>
              <p className="text-[#A8A8A8] text-sm sm:text-base leading-relaxed">
                Following the final submission deadline, teams demonstrate live prototypes before an esteemed jury comprising 
                industry leaders from VigyanLabs and senior academic authorities. Evaluation centers on technical innovation, 
                practical feasibility, code robustness, UI/UX execution, and solution impact.
              </p>
              <div className="grid sm:grid-cols-3 gap-3 pt-2 font-mono text-xs">
                <div className="bg-[#030303] p-3.5 rounded-lg border border-white/10">
                  <span className="text-[#A8A8A8] block">FORMAT</span>
                  <span className="text-white font-bold text-sm">Live Working Prototype</span>
                </div>
                <div className="bg-[#030303] p-3.5 rounded-lg border border-white/10">
                  <span className="text-[#A8A8A8] block">JURY PANEL</span>
                  <span className="text-white font-bold text-sm">VigyanLabs & MITT</span>
                </div>
                <div className="bg-[#030303] p-3.5 rounded-lg border border-white/10">
                  <span className="text-[#A8A8A8] block">DEFENSE</span>
                  <span className="text-white font-bold text-sm">Q&A Code Inspection</span>
                </div>
              </div>
            </div>
          )}

          {activePipelineStep === 6 && (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#D83A43] bg-[#D83A43]/10 px-2.5 py-1 rounded">
                <Award className="w-3.5 h-3.5" />
                PHASE 06 // GRAND VALEDICTORY & PRIZE CEREMONY
              </div>
              <h2 className="font-display text-2xl font-bold text-white">
                ₹1,00,000 Prize Pool, VigyanLabs Internships & Incubation Support
              </h2>
              <p className="text-[#A8A8A8] text-sm sm:text-base leading-relaxed">
                The grand finale brings together all innovators for the official valedictory ceremony in the Seminar Hall. 
                Winners across all categories receive cash awards from the overall ₹1,00,000 pool, verified certificates of excellence, 
                exclusive internship opportunities at VigyanLabs, and incubation support to transform their prototype into a commercial venture.
              </p>
              <div className="grid sm:grid-cols-3 gap-3 pt-2 font-mono text-xs">
                <div className="bg-[#030303] p-3.5 rounded-lg border border-white/10">
                  <span className="text-[#A8A8A8] block">CASH PRIZE POOL</span>
                  <span className="text-[#D83A43] font-bold text-sm">₹1,00,000</span>
                </div>
                <div className="bg-[#030303] p-3.5 rounded-lg border border-white/10">
                  <span className="text-[#A8A8A8] block">INTERNSHIPS</span>
                  <span className="text-white font-bold text-sm">VigyanLabs Opportunities</span>
                </div>
                <div className="bg-[#030303] p-3.5 rounded-lg border border-white/10">
                  <span className="text-[#A8A8A8] block">INCUBATION</span>
                  <span className="text-emerald-400 font-bold text-sm">Incubation Support</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </AboutShell>
  );
}
