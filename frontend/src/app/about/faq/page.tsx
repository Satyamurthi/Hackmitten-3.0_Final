"use client";

import React, { useState, useMemo } from "react";
import {
  HelpCircle,
  Search,
  ChevronDown,
  Filter
} from "lucide-react";
import { AboutShell } from "@/components/about/about-shell";
import { FAQ_DATA } from "@/data/about-data";

export default function FAQPage() {
  const [faqSearch, setFaqSearch] = useState("");
  const [faqCategory, setFaqCategory] = useState<string>("all");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(1);

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCat = faqCategory === "all" || item.category === faqCategory;
      const q = faqSearch.toLowerCase().trim();
      const matchesQuery =
        q === "" ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [faqSearch, faqCategory]);

  return (
    <AboutShell
      currentChapter="faq"
      prevChapter={{ label: "06 // TEAM", href: "/about/team" }}
      nextChapter={{ label: "01 // OVERVIEW", href: "/about" }}
    >
      <section id="faq" className="space-y-8">
        <div className="border-b border-white/10 pb-5">
          <div className="mono text-xs uppercase tracking-[0.3em] text-[#D83A43] mb-2">
            07 // KNOWLEDGE BASE
          </div>
          <h1 className="display text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Frequently Asked Questions (FAQ)
          </h1>
          <p className="text-[#A8A8A8] text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
            Instant answers to all common questions covering eligibility, domain rules, prizes, team formation, and venue guidelines.
          </p>
        </div>

        {/* Search Bar & Category Filter Controls */}
        <div className="bg-[#080808] border border-white/10 rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-[#A8A8A8] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              placeholder="Search questions (e.g. fees, refund, domain, prize, accommodation)..."
              className="w-full pl-11 pr-4 py-3 bg-[#030303] border border-white/10 rounded-xl text-white placeholder-[#A8A8A8]/60 text-sm focus:outline-none focus:border-[#D83A43] transition-colors"
            />
            {faqSearch && (
              <button
                onClick={() => setFaqSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-[#A8A8A8] hover:text-white cursor-pointer"
              >
                CLEAR
              </button>
            )}
          </div>

          {/* Filter Category Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="text-[#A8A8A8] mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Filter:
            </span>
            {[
              { id: "all", label: "All Questions" },
              { id: "general", label: "General & Prizes" },
              { id: "teams", label: "Teams & Eligibility" },
              { id: "domains", label: "Domains & Statements" },
              { id: "logistics", label: "Venue & Logistics" }
            ].map((pill) => (
              <button
                key={pill.id}
                onClick={() => setFaqCategory(pill.id)}
                className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  faqCategory === pill.id
                    ? "bg-[#D83A43] text-white border-[#D83A43] font-semibold"
                    : "bg-[#030303] text-[#A8A8A8] border-white/10 hover:border-white/20 hover:text-white"
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Results counter */}
          <div className="text-[11px] font-mono text-[#A8A8A8] pt-1">
            Showing {filteredFaqs.length} of {FAQ_DATA.length} verified questions
          </div>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="bg-[#080808] border border-white/10 rounded-2xl p-12 text-center space-y-3">
              <HelpCircle className="w-8 h-8 text-[#A8A8A8] mx-auto opacity-50" />
              <h3 className="font-display font-bold text-white text-base">
                No matching queries found
              </h3>
              <p className="text-xs text-[#A8A8A8]">
                Try adjusting your search keywords or clear the category filter to view all questions.
              </p>
              <button
                onClick={() => {
                  setFaqSearch("");
                  setFaqCategory("all");
                }}
                className="mt-2 px-4 py-1.5 rounded-lg bg-white/10 text-white text-xs font-mono hover:bg-white/15 cursor-pointer"
              >
                Reset Search
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = expandedFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`rounded-xl border transition-all overflow-hidden ${
                    isOpen
                      ? "bg-[#0d0d0d] border-[#D83A43]/50 shadow-md"
                      : "bg-[#080808] border-white/10 hover:border-white/20"
                  }`}
                >
                  <button
                    onClick={() => setExpandedFaq(isOpen ? null : faq.id)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs shrink-0 ${
                          isOpen ? "bg-[#D83A43] text-white" : "bg-white/5 text-[#A8A8A8]"
                        }`}
                      >
                        {faq.id}
                      </span>
                      <span className="font-display font-semibold text-white text-sm sm:text-base">
                        {faq.question}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-[#A8A8A8] shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-[#D83A43]" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#A8A8A8] leading-relaxed border-t border-white/5">
                      <p className="mt-2 text-white/90 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>
    </AboutShell>
  );
}
