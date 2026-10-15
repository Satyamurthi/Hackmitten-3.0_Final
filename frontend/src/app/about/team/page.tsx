"use client";

import React from "react";
import {
  Building,
  Users,
  Phone,
  MessageSquare
} from "lucide-react";
import { AboutShell } from "@/components/about/about-shell";

export default function TeamPage() {
  return (
    <AboutShell
      currentChapter="team"
      prevChapter={{ label: "05 // RULES", href: "/about/rules" }}
      nextChapter={{ label: "07 // FAQ", href: "/about/faq" }}
    >
      <section id="contacts" className="space-y-8">
        <div className="border-b border-white/10 pb-5">
          <div className="mono text-xs uppercase tracking-[0.3em] text-[#D83A43] mb-2">
            06 // DIRECTORY & COMMAND NETWORK
          </div>
          <h1 className="display text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Organizing Leadership & Student Coordinators
          </h1>
          <p className="text-[#A8A8A8] text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
            Connect directly with faculty chairs, department leadership, and the student coordination team for event clarifications.
          </p>
        </div>

        {/* Leadership & Faculty Cards */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Heads of Department (HODs) */}
          <div className="bg-[#080808] border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="font-mono text-xs text-[#D83A43] uppercase tracking-wider flex items-center gap-2 font-bold">
              <Building className="w-4 h-4 text-[#D83A43]" />
              HEADS OF DEPARTMENT (HODs)
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-[#030303] border border-white/5 space-y-1">
                <div className="font-display font-bold text-white text-base">
                  Dr. Ranjit K. N
                </div>
                <div className="text-xs text-[#A8A8A8]">
                  Head, Dept. of Computer Science & Engineering
                </div>
                <div className="text-[11px] font-mono text-[#D83A43] pt-1">
                  MIT Thandavapura
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#030303] border border-white/5 space-y-1">
                <div className="font-display font-bold text-white text-base">
                  Dr. Sunil
                </div>
                <div className="text-xs text-[#A8A8A8]">
                  Head, Dept. of CS&E (AI & ML)
                </div>
                <div className="text-[11px] font-mono text-[#D83A43] pt-1">
                  MIT Thandavapura
                </div>
              </div>
            </div>
          </div>

          {/* Faculty Coordinators */}
          <div className="bg-[#080808] border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="font-mono text-xs text-[#D83A43] uppercase tracking-wider flex items-center gap-2 font-bold">
              <Users className="w-4 h-4 text-[#D83A43]" />
              FACULTY COORDINATORS
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { name: "Dr. Mahadeva Prasad Y. N", dept: "Faculty Coordinator" },
                { name: "Dr. Malathi M", dept: "Faculty Coordinator" },
                { name: "Prof. Karthik", dept: "Faculty Coordinator" },
                { name: "Prof. Sreenidhi", dept: "Faculty Coordinator" }
              ].map((f, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-[#030303] border border-white/5">
                  <div className="font-display font-semibold text-white text-sm">
                    {f.name}
                  </div>
                  <div className="text-xs text-[#A8A8A8]">
                    {f.dept}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Student Coordinators Directory (One-Click Actions) */}
        <div className="bg-[#0a0a0a] border border-white/15 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
            <div>
              <div className="font-mono text-xs text-[#D83A43] uppercase tracking-wider font-bold">
                STUDENT COORDINATION DESK
              </div>
              <h2 className="font-display text-xl font-bold text-white mt-0.5">
                Direct Line for Participant Inquiries
              </h2>
            </div>
            <span className="font-mono text-xs text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              SUPPORT TIMINGS: ACTIVE
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Hiremata Rohith", phone: "8125636397", raw: "918125636397" },
              { name: "Komal Mittal", phone: "9901727510", raw: "919901727510" },
              { name: "Manasa M Swamy", phone: "7760882899", raw: "917760882899" },
              { name: "Kishore P", phone: "7348928249", raw: "917348928249" }
            ].map((coord, i) => (
              <div
                key={i}
                className="p-5 rounded-xl bg-[#030303] border border-white/10 hover:border-[#D83A43]/50 transition-all space-y-4 group"
              >
                <div>
                  <span className="text-[10px] font-mono text-[#D83A43] uppercase tracking-wider font-bold">
                    STUDENT COORDINATOR
                  </span>
                  <h3 className="font-display font-bold text-white text-base group-hover:text-[#D83A43] transition-colors">
                    {coord.name}
                  </h3>
                  <div className="font-mono text-xs text-[#A8A8A8] mt-1">
                    +91 {coord.phone}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                  <a
                    href={`tel:${coord.phone}`}
                    className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
                    title={`Call ${coord.name}`}
                  >
                    <Phone className="w-3.5 h-3.5 text-[#D83A43]" />
                    Call
                  </a>
                  <a
                    href={`https://wa.me/${coord.raw}?text=Hi%20${encodeURIComponent(coord.name)},%20I%20have%20an%20inquiry%20regarding%20HackMITTEN%203.0`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-lg bg-[#D83A43]/15 hover:bg-[#D83A43]/25 border border-[#D83A43]/30 text-white text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
                    title={`WhatsApp message to ${coord.name}`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#D83A43]" />
                    Chat
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AboutShell>
  );
}
