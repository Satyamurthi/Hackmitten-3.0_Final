"use client";

import React from "react";
import {
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { AboutShell } from "@/components/about/about-shell";

export default function RulesPage() {
  return (
    <AboutShell
      currentChapter="rules"
      prevChapter={{ label: "04 // REWARDS", href: "/about/rewards" }}
      nextChapter={{ label: "06 // TEAM", href: "/about/team" }}
    >
      <section id="rules" className="space-y-8">
        <div className="border-b border-white/10 pb-5">
          <div className="mono text-xs uppercase tracking-[0.3em] text-[#D83A43] mb-2">
            05 // COMPLIANCE MATRIX
          </div>
          <h1 className="display text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Rules, Regulations & Code of Conduct
          </h1>
          <p className="text-[#A8A8A8] text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
            Strict governance principles ensuring fair competition, academic integrity, and physical safety throughout HackMITTEN 3.0.
          </p>
        </div>

        {/* 10 Rules Terminal Grid */}
        <div className="space-y-4">
          <div className="font-mono text-xs text-white uppercase tracking-wider flex items-center gap-2 font-bold">
            <ShieldCheck className="w-4 h-4 text-[#D83A43]" />
            THE 10 GOLDEN RULES & REGULATIONS
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { num: "01", title: "Eligibility", text: "Participants must satisfy the authentic eligibility requirements for their respective educational tier." },
              { num: "02", title: "Team Size & Segregation", text: "Each team must have 3–4 members. Strictly all Diploma, all UG, or all PG. No mixed educational levels." },
              { num: "03", title: "Accurate Registration", text: "Teams must provide accurate personal/institutional credentials and pay the applicable non-refundable fee." },
              { num: "04", title: "Originality & Integrity", text: "Projects must represent original work. Plagiarism, pre-built solutions, and false ownership cause instant disqualification." },
              { num: "05", title: "Problem Statements", text: "Official problem statements are unveiled on event day. Teams must adhere to the designated domain parameters." },
              { num: "06", title: "Submission Deadline", text: "Teams must submit source code and deliverables precisely within the announced countdown deadline. No extensions." },
              { num: "07", title: "Live Demonstration", text: "Teams must participate actively in the live evaluation and demonstrate their code execution to the jury." },
              { num: "08", title: "Campus Discipline", text: "Participants must follow safety rules, lab protocols, schedule timings, and organizing committee directions." },
              { num: "09", title: "Disqualification", text: "Violations of academic integrity, code tampering, or behavioral misconduct leads to immediate disqualification." },
              { num: "10", title: "Finality of Decisions", text: "All evaluations, penalties, and winner selections made by the jury and organizers are authoritative and final." }
            ].map((rule) => (
              <div
                key={rule.num}
                className="p-4 rounded-xl bg-[#080808] border border-white/10 hover:border-white/25 transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="font-mono text-xs text-[#D83A43] font-bold block mb-1">
                    RULE {rule.num}
                  </span>
                  <h3 className="font-display font-semibold text-white text-sm mb-2">
                    {rule.title}
                  </h3>
                  <p className="text-xs text-[#A8A8A8] leading-relaxed">
                    {rule.text}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-white/5 flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  MANDATORY
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6 Pillars Code of Conduct */}
        <div className="bg-gradient-to-r from-[#121212] via-[#080808] to-[#121212] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="font-mono text-xs text-[#D83A43] uppercase tracking-wider font-bold">
            OFFICIAL CODE OF CONDUCT PILLARS
          </div>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { title: "Respect & Inclusivity", desc: "Treat fellow hackers, organizers, mentors, and staff with kindness, equity, and constructive cooperation regardless of background." },
              { title: "Zero Harassment Tolerance", desc: "No discriminatory jokes, unwelcome physical contact, verbal bullying, or disruptive conduct will be permitted under any condition." },
              { title: "Academic Honesty", desc: "All code committed must be written during the 24-hour sprint. Open-source libraries are permitted with proper attribution." },
              { title: "Campus Safety & Property", desc: "Handle lab hardware, computing terminals, furniture, and electrical sockets with extreme caution. Respect campus security." },
              { title: "Professional Collaboration", desc: "Communicate constructively during jury Q&A and mentor critiques. Foster peer learning across competing teams." },
              { title: "Prompt Incident Reporting", desc: "Any safety violation, medical emergency, or unfair conduct should immediately be reported to the student or faculty coordinators." }
            ].map((pillar, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D83A43]" />
                  <h3 className="font-display font-semibold text-white text-sm">
                    {pillar.title}
                  </h3>
                </div>
                <p className="text-xs text-[#A8A8A8] leading-relaxed pl-3.5">
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AboutShell>
  );
}
