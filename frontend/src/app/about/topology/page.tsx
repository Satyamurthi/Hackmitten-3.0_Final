"use client";

import React, { useState } from "react";
import {
  Building,
  Globe,
  ShieldCheck,
  Network,
  Cpu,
  Layers,
  AlertTriangle
} from "lucide-react";
import { AboutShell } from "@/components/about/about-shell";

export default function TopologyPage() {
  const [selectedCategory, setSelectedCategory] = useState<"diploma" | "ug_pg">("ug_pg");

  return (
    <AboutShell
      currentChapter="topology"
      prevChapter={{ label: "02 // PIPELINE", href: "/about/pipeline" }}
      nextChapter={{ label: "04 // REWARDS", href: "/about/rewards" }}
    >
      <section id="topology" className="space-y-8">
        <div className="border-b border-white/10 pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="mono text-xs uppercase tracking-[0.3em] text-[#D83A43] mb-2">
              03 // PARTICIPATION & DOMAIN TOPOLOGY
            </div>
            <h1 className="display text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Educational Category Tree & Domains
            </h1>
            <p className="text-[#A8A8A8] text-sm sm:text-base mt-2 max-w-xl leading-relaxed">
              Explore the segregation matrix, registration fee structure, and dedicated industry domain branches.
            </p>
          </div>

          {/* Interactive Category Switcher */}
          <div className="inline-flex p-1 bg-[#080808] border border-white/10 rounded-xl font-mono text-xs shrink-0">
            <button
              onClick={() => setSelectedCategory("diploma")}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                selectedCategory === "diploma"
                  ? "bg-[#D83A43] text-white font-semibold shadow-md"
                  : "text-[#A8A8A8] hover:text-white"
              }`}
            >
              DIPLOMA TIER (₹500)
            </button>
            <button
              onClick={() => setSelectedCategory("ug_pg")}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                selectedCategory === "ug_pg"
                  ? "bg-[#D83A43] text-white font-semibold shadow-md"
                  : "text-[#A8A8A8] hover:text-white"
              }`}
            >
              UG & PG TIERS (₹1,000)
            </button>
          </div>
        </div>

        {/* Interactive Topology Display */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left: Branch Visual Topology Node */}
          <div className="lg:col-span-5 bg-[#080808] border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="font-mono text-xs text-[#D83A43] uppercase tracking-wider font-bold">
                TIER METADATA
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-white font-semibold">
                {selectedCategory === "diploma" ? "DIPLOMA ONLY" : "UG OR PG ONLY"}
              </span>
            </div>

            {/* Tier Details Card */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#030303] border border-white/5 space-y-2">
                <div className="text-[11px] font-mono text-[#A8A8A8]">REGISTRATION FEE</div>
                <div className="font-display text-3xl font-bold text-white">
                  {selectedCategory === "diploma" ? "₹500" : "₹1,000"}
                  <span className="text-xs font-mono text-[#A8A8A8] font-normal ml-2">/ team (3–4 members)</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#030303] border border-white/5 space-y-2">
                <div className="text-[11px] font-mono text-[#A8A8A8]">ELIGIBILITY DIRECTIVE</div>
                <p className="text-xs text-[#F2F2F2] leading-relaxed">
                  {selectedCategory === "diploma"
                    ? "Teams must consist exclusively of currently enrolled Diploma students. Inter-branch and inter-college team members are permitted, but no UG or PG students can join this team."
                    : "Undergraduate (UG) teams must consist exclusively of UG students. Postgraduate (PG) teams must consist exclusively of PG students. Cross-degree mixing is strictly barred."}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#030303] border border-white/5 space-y-2">
                <div className="text-[11px] font-mono text-[#A8A8A8]">PROBLEM STATEMENTS TIMELINE</div>
                <p className="text-xs text-white">
                  Official problem statements are announced on the day of the event during the opening keynote.
                </p>
              </div>
            </div>

            {/* Status Alert */}
            <div className="p-3.5 rounded-lg bg-[#D83A43]/10 border border-[#D83A43]/30 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-[#D83A43] shrink-0 mt-0.5" />
              <div className="text-xs text-white/90 leading-tight">
                <strong className="text-white block mb-0.5">Non-Refundable Policy:</strong>
                Registration fees cannot be refunded under any circumstances once submitted.
              </div>
            </div>
          </div>

          {/* Right: Domain Branches (Nodes with Circuit Lines) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="font-mono text-xs text-[#A8A8A8] uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>ASSIGNED INDUSTRY DOMAINS ({selectedCategory === "diploma" ? "3 DOMAINS" : "4 DOMAINS"})</span>
              <span className="text-[#D83A43]">VIGYANLABS COLLABORATIVE</span>
            </div>

            {selectedCategory === "diploma" ? (
              /* Diploma Domains (Banking, Agriculture, Healthcare) */
              <div className="space-y-4">
                {[
                  {
                    num: "01",
                    name: "Banking & FinTech",
                    icon: Building,
                    desc: "Innovative digital ledger solutions, secure micro-transactions, loan disbursement optimization, customer fraud detection, and modern digital banking workflows for underserved demographics.",
                    focus: ["Digital Banking", "Micro-finance", "Transaction Security"]
                  },
                  {
                    num: "02",
                    name: "Agriculture & AgriTech",
                    icon: Globe,
                    desc: "Smart agricultural monitoring, crop yield prediction, precision irrigation automation, pest management diagnostics, and direct farmer-to-market transparent supply chains.",
                    focus: ["Smart Irrigation", "Yield Forecasting", "Agri-Marketplace"]
                  },
                  {
                    num: "03",
                    name: "Healthcare & MedTech",
                    icon: ShieldCheck,
                    desc: "Affordable patient vital monitoring, diagnostic assistance, clinic management systems, emergency ambulance dispatch coordination, and telemedicine access for rural clinics.",
                    focus: ["Patient Vitals", "Telemedicine", "Clinic Workflows"]
                  }
                ].map((dom) => {
                  const Icon = dom.icon;
                  return (
                    <div
                      key={dom.num}
                      className="p-5 rounded-xl bg-[#080808] border border-white/10 hover:border-[#D83A43]/50 transition-all hover:bg-[#0c0c0c] group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[#D83A43] group-hover:bg-[#D83A43]/10 transition-colors">
                            <Icon className="w-5 h-5 text-[#D83A43]" />
                          </div>
                          <div>
                            <div className="font-mono text-xs text-[#D83A43]">DOMAIN // {dom.num}</div>
                            <h3 className="font-display text-lg font-bold text-white group-hover:text-[#D83A43] transition-colors">
                              {dom.name}
                            </h3>
                          </div>
                        </div>
                        <span className="font-mono text-[10px] uppercase px-2 py-1 bg-white/5 rounded text-[#A8A8A8] border border-white/5">
                          DIPLOMA
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#A8A8A8] mt-3 leading-relaxed">
                        {dom.desc}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/5">
                        {dom.focus.map((tag, i) => (
                          <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#A8A8A8]">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* UG / PG Domains (Cybersecurity, Cloud, AIOps, ERP) */
              <div className="space-y-4">
                {[
                  {
                    num: "01",
                    name: "Cybersecurity & Zero Trust",
                    icon: ShieldCheck,
                    desc: "Zero-trust network architecture, real-time threat intelligence feeds, automated vulnerability remediation, encrypted credential vaults, and endpoint attack surface neutralization.",
                    focus: ["Zero Trust", "Threat Intelligence", "Vulnerability Remediation"]
                  },
                  {
                    num: "02",
                    name: "Cloud Computing & Distributed Systems",
                    icon: Network,
                    desc: "Elastic multi-cloud orchestrations, serverless event-driven architectures, edge compute latency reduction, distributed state synchronization, and green computing efficiency.",
                    focus: ["Serverless Mesh", "Edge Compute", "Cloud Cost Optimization"]
                  },
                  {
                    num: "03",
                    name: "AIOps & Intelligent Observability",
                    icon: Cpu,
                    desc: "Autonomous infrastructure telemetry, AI-driven log anomaly detection, proactive crash prevention, self-healing production clusters, and LLM-assisted incident response bots.",
                    focus: ["Autonomous Anomaly Detection", "Self-Healing Clusters", "LLMOps"]
                  },
                  {
                    num: "04",
                    name: "Enterprise ERP & Supply Systems",
                    icon: Layers,
                    desc: "Mission-critical resource planning, real-time freight and inventory provenance, smart contracts for enterprise procurement, and unified organizational analytics dashboards.",
                    focus: ["Real-Time Provenance", "Smart Procurement", "Executive Analytics"]
                  }
                ].map((dom) => {
                  const Icon = dom.icon;
                  return (
                    <div
                      key={dom.num}
                      className="p-5 rounded-xl bg-[#080808] border border-white/10 hover:border-[#D83A43]/50 transition-all hover:bg-[#0c0c0c] group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[#D83A43] group-hover:bg-[#D83A43]/10 transition-colors">
                            <Icon className="w-5 h-5 text-[#D83A43]" />
                          </div>
                          <div>
                            <div className="font-mono text-xs text-[#D83A43]">DOMAIN // {dom.num}</div>
                            <h3 className="font-display text-lg font-bold text-white group-hover:text-[#D83A43] transition-colors">
                              {dom.name}
                            </h3>
                          </div>
                        </div>
                        <span className="font-mono text-[10px] uppercase px-2 py-1 bg-white/5 rounded text-[#A8A8A8] border border-white/5">
                          UG & PG
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#A8A8A8] mt-3 leading-relaxed">
                        {dom.desc}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/5">
                        {dom.focus.map((tag, i) => (
                          <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#A8A8A8]">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </AboutShell>
  );
}
