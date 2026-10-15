"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PublicNav } from "@/components/public/nav";
import { RegistrationEntryModal } from "@/components/public/registration-entry-modal";
import { Footer } from "@/components/sections/footer";
import { AboutSubNav } from "./about-subnav";

interface AboutShellProps {
  currentChapter: string;
  prevChapter?: { label: string; href: string };
  nextChapter?: { label: string; href: string };
  children: React.ReactNode;
}

export function AboutShell({
  prevChapter,
  nextChapter,
  children,
}: AboutShellProps) {
  return (
    <div className="min-h-screen bg-[#030303] text-[#F2F2F2] selection:bg-[#B52A32] selection:text-white font-sans antialiased relative overflow-x-hidden">
      {/* ---------------- SCI-FI CYBER ANIMATIONS & KEYFRAMES ---------------- */}
      <style>{`
        @keyframes cyberScan {
          0% { top: -5%; opacity: 0; }
          10% { opacity: 0.75; }
          90% { opacity: 0.75; }
          100% { top: 105%; opacity: 0; }
        }
      `}</style>

      {/* ---------------- RADIAL GLOW & AMBIENT SCI-FI BACKGROUND ---------------- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1200px] h-[550px] opacity-30 blur-[140px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(181,42,50,0.55), rgba(139,30,36,0.2) 55%, transparent 75%)",
          }}
        />
        <div
          className="absolute top-[40%] right-[-10%] w-[650px] h-[650px] opacity-15 blur-[160px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(181,42,50,0.4), transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-[5%] left-[-5%] w-[600px] h-[600px] opacity-15 blur-[130px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(181,42,50,0.35), transparent 70%)",
          }}
        />
        {/* Subtle grid lines */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* ── Main Site Navigation ── */}
      <PublicNav visible={true} />
      <RegistrationEntryModal />

      {/* ── Quick Chapter Anchor SubNav (Sticky) ── */}
      <div className="pt-20 sm:pt-24">
        <AboutSubNav />
      </div>

      {/* ---------------- MAIN CONTENT BODY ---------------- */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12 sm:space-y-16">
        {children}

        {/* ── Chapter Previous / Next Navigation Pills ── */}
        {(prevChapter || nextChapter) && (
          <div className="pt-10 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
            {prevChapter ? (
              <Link
                href={prevChapter.href}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/10 bg-[#080808] hover:border-white/25 hover:bg-[#121212] text-[#A8A8A8] hover:text-white transition-all group"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                <span>PREV: {prevChapter.label}</span>
              </Link>
            ) : (
              <div />
            )}

            {nextChapter && (
              <Link
                href={nextChapter.href}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[#D83A43]/50 bg-[#D83A43]/15 hover:bg-[#D83A43] text-white transition-all shadow-[0_0_20px_rgba(216,58,67,0.3)] group ml-auto"
              >
                <span>NEXT: {nextChapter.label}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>
        )}
      </main>

      {/* Site Footer */}
      <Footer />
    </div>
  );
}
