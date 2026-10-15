"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Terminal,
  ChevronLeft,
  ChevronRight,
  X,
  Search,
  Filter,
  Calendar,
  MapPin,
  Sparkles,
  Maximize2,
  Radio,
  Layers,
  Award,
  Zap,
  Clock,
  ArrowUpRight,
  CheckCircle2
} from "lucide-react";
import { PublicNav } from "@/components/public/nav";
import { RegistrationEntryModal } from "@/components/public/registration-entry-modal";
import { GALLERY_ARCHIVE, GalleryArchiveItem } from "@/data/gallery";

type FilterTab = "all" | "2.0" | "1.0" | "sprints" | "mentorship" | "ceremony" | "teams";

export default function GalleryPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Filter items based on active tab and search query
  const filteredItems = useMemo(() => {
    return GALLERY_ARCHIVE.filter((item) => {
      // Tab filter
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "2.0" && item.edition === "HackMITTEN 2.0") ||
        (activeTab === "1.0" && item.edition === "HackMITTEN 1.0") ||
        (activeTab === "sprints" && item.category === "sprints") ||
        (activeTab === "mentorship" && item.category === "mentorship") ||
        (activeTab === "ceremony" && item.category === "ceremony") ||
        (activeTab === "teams" && item.category === "teams");

      if (!matchesTab) return false;

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.badge.toLowerCase().includes(q) ||
        item.edition.toLowerCase().includes(q)
      );
    });
  }, [activeTab, searchQuery]);

  // Lightbox navigation callbacks
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const showNext = useCallback(() => {
    if (lightboxIndex === null || filteredItems.length === 0) return;
    setLightboxIndex((lightboxIndex + 1) % filteredItems.length);
  }, [lightboxIndex, filteredItems.length]);

  const showPrev = useCallback(() => {
    if (lightboxIndex === null || filteredItems.length === 0) return;
    setLightboxIndex((lightboxIndex - 1 + filteredItems.length) % filteredItems.length);
  }, [lightboxIndex, filteredItems.length]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") showNext();
      if (e.key === "ArrowLeft") showPrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, showNext, showPrev]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [lightboxIndex]);

  const currentLightboxItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-[#B52A32] selection:text-white font-sans antialiased overflow-x-hidden">
      {/* ── Space Background Radial Glows ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1200px] h-[550px] opacity-35 blur-[140px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, rgba(181,42,50,0.55), rgba(139,30,36,0.2) 55%, transparent 75%)",
          }}
        />
        <div
          className="absolute top-[35%] right-[-10%] w-[650px] h-[650px] opacity-20 blur-[150px] rounded-full pointer-events-none"
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
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* ── Main Site Navigation ── */}
      <PublicNav visible={true} />
      <RegistrationEntryModal />

      {/* ── Main Content Area ── */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-12 sm:pb-16 space-y-10 sm:space-y-12">
        {/* Page Hero Header */}
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-[#f2636a]">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#B52A32]" />
            <span className="tracking-widest uppercase">HISTORICAL TIMELINE & MEDIA VAULT</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[0.95]">
                PREVIOUS
                <br />
                <span className="bg-gradient-to-r from-[#f2636a] via-[#B52A32] to-[#A8A8A8] bg-clip-text text-transparent">
                  MISSIONS ARCHIVE.
                </span>
              </h1>
              <p className="mt-4 text-base sm:text-lg text-[#A8A8A8] max-w-2xl leading-relaxed">
                Relive the most intense, high-energy moments from past editions of{" "}
                <strong className="text-white">HackMITTEN</strong>. From midnight distributed system debugging to
                high-stakes jury presentations and triumph on the grand podium.
              </p>
            </div>

            {/* Quick Stat Counter Cards */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <div className="bg-[#0b0b0b] border border-white/10 rounded-xl p-3 sm:p-4 text-center min-w-[85px] sm:min-w-[100px]">
                <div className="text-2xl sm:text-3xl font-display font-bold text-white">{GALLERY_ARCHIVE.length}</div>
                <div className="text-[10px] font-mono text-[#A8A8A8] uppercase tracking-wider mt-0.5">Captures</div>
              </div>
              <div className="bg-[#0b0b0b] border border-white/10 rounded-xl p-3 sm:p-4 text-center min-w-[85px] sm:min-w-[100px]">
                <div className="text-2xl sm:text-3xl font-display font-bold text-emerald-400">24H</div>
                <div className="text-[10px] font-mono text-[#A8A8A8] uppercase tracking-wider mt-0.5">Continuous</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Filters & Search Control Deck ── */}
        <section className="bg-[#0a0a0a]/80 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-xl space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs font-mono">
              {[
                { id: "all", label: `ALL (${GALLERY_ARCHIVE.length})` },
                { id: "2.0", label: "HACKMITTEN 2.0 (2025)" },
                { id: "1.0", label: "HACKMITTEN 1.0 (2024)" },
                { id: "sprints", label: "MIDNIGHT SPRINTS" },
                { id: "mentorship", label: "MENTORSHIP" },
                { id: "ceremony", label: "CEREMONIES & AWARDS" },
                { id: "teams", label: "TEAM SYNERGY" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as FilterTab)}
                  className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap border ${
                    activeTab === tab.id
                      ? "bg-[#B52A32] text-white border-[#f2636a] shadow-[0_0_12px_rgba(181,42,50,0.5)] font-semibold"
                      : "bg-[#111] text-[#A8A8A8] hover:text-white border-white/5 hover:border-white/20 hover:bg-[#161616]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input Box */}
            <div className="relative min-w-[240px] sm:min-w-[280px]">
              <Search className="w-4 h-4 text-[#A8A8A8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search archive nodes..."
                className="w-full bg-[#121212] border border-white/15 focus:border-[#B52A32] rounded-xl pl-10 pr-9 py-2 text-xs font-mono text-white placeholder-[#777] outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777] hover:text-white"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Status readout */}
          <div className="flex items-center justify-between text-[11px] font-mono text-[#888] pt-1 border-t border-white/5">
            <span>
              SHOWING <strong className="text-white">{filteredItems.length}</strong> OF{" "}
              {GALLERY_ARCHIVE.length} ARCHIVE NODES
            </span>
            {searchQuery && (
              <span className="text-[#f2636a]">
                FILTERED BY &quot;{searchQuery}&quot;
              </span>
            )}
          </div>
        </section>

        {/* ── Photo Grid / Vault Matrix ── */}
        {filteredItems.length === 0 ? (
          <div className="bg-[#090909] border border-white/10 rounded-2xl py-20 px-4 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#B52A32]/15 border border-[#B52A32]/30 flex items-center justify-center mx-auto text-[#f2636a]">
              <Filter className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg text-white font-semibold">No matching archive nodes found</h3>
            <p className="text-xs font-mono text-[#A8A8A8] max-w-sm mx-auto">
              Try adjusting your search criteria or resetting filters to view all historical records.
            </p>
            <button
              onClick={() => {
                setActiveTab("all");
                setSearchQuery("");
              }}
              className="px-4 py-2 rounded-lg bg-[#B52A32] text-white text-xs font-mono hover:bg-[#9a2128] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                onClick={() => openLightbox(index)}
                className="group relative bg-[#0b0b0b] border border-white/10 hover:border-[#B52A32]/80 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[0_0_28px_rgba(181,42,50,0.25)] hover:-translate-y-1 flex flex-col"
              >
                {/* Image Container */}
                <div className="relative aspect-[16/11] overflow-hidden bg-[#141414]">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover grayscale-[0.25] sepia-[0.08] saturate-[0.88] contrast-[1.08] group-hover:scale-105 group-hover:grayscale-0 group-hover:saturate-100 transition-all duration-500"
                  />

                  {/* Gradient overlays for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0b] via-transparent to-transparent opacity-85 group-hover:opacity-60 transition-opacity" />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#8B1E24]/20 via-transparent to-transparent pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                    <span className="px-2.5 py-1 rounded-md text-[9px] font-mono tracking-widest uppercase bg-black/75 backdrop-blur-md text-[#f2636a] border border-[#B52A32]/40 font-semibold shadow-sm">
                      {item.badge}
                    </span>
                    <span className="px-2 py-1 rounded-md text-[9px] font-mono tracking-wider bg-black/70 backdrop-blur-md text-[#D6C8C8] border border-white/15">
                      {item.year}
                    </span>
                  </div>

                  {/* Expand icon on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="w-10 h-10 rounded-full bg-[#B52A32]/90 border border-white/30 text-white flex items-center justify-center shadow-[0_0_15px_rgba(181,42,50,0.8)] scale-90 group-hover:scale-100 transition-transform">
                      <Maximize2 className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Card Information */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#f2636a] uppercase tracking-wider mb-1">
                      <Clock className="w-3 h-3" />
                      <span>{item.edition}</span>
                    </div>

                    <h3 className="font-display text-base font-semibold text-white group-hover:text-[#f2636a] transition-colors line-clamp-1">
                      {item.title}
                    </h3>

                    <p className="mt-1 text-xs text-[#A8A8A8] line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Location & Highlight Footer */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-[#888]">
                    <div className="flex items-center gap-1 truncate max-w-[170px]" title={item.location}>
                      <MapPin className="w-3 h-3 text-[#B52A32] shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                    <span className="text-[#f2636a] shrink-0 group-hover:translate-x-0.5 transition-transform">
                      EXPLORE ↗
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Bottom Call To Action Banner ── */}
        <section className="relative overflow-hidden rounded-3xl border border-[#B52A32]/40 bg-gradient-to-r from-[#200507] via-[#0d0304] to-[#1a0507] p-8 sm:p-12 text-center shadow-[0_0_50px_rgba(181,42,50,0.15)]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(181,42,50,0.35),_transparent_70%)] pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#f2636a]">
              <Sparkles className="w-3.5 h-3.5 text-[#B52A32]" />
              <span>THE NEXT CHAPTER AWAITS</span>
            </div>

            <h2 className="font-display text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
              WRITE YOUR LEGACY IN
              <br />
              <span className="text-[#f2636a]">HACKMITTEN 3.0</span>
            </h2>

            <p className="text-sm sm:text-base text-[#D6C8C8] leading-relaxed">
              24 Hours. ₹1,00,000 Prize Pool. Industry-grade Problem Statements from VigyanLabs.
              Represent your institution and be immortalized in our next historical gallery.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#B52A32] hover:bg-[#9a2128] text-white font-mono text-xs font-semibold tracking-wider transition-all shadow-[0_0_20px_rgba(181,42,50,0.5)] hover:scale-105"
              >
                <span>REGISTER YOUR TEAM</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-mono text-xs tracking-wider transition-all"
              >
                <span>RETURN TO MAIN PORTAL</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Interactive Fullscreen Lightbox Modal ── */}
      {lightboxIndex !== null && currentLightboxItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 sm:p-6 transition-all animate-in fade-in duration-200"
          onClick={closeLightbox}
        >
          {/* Top Control HUD */}
          <div
            className="absolute top-4 left-4 right-4 sm:top-6 sm:left-8 sm:right-8 flex items-center justify-between text-xs font-mono text-white z-50 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded bg-[#B52A32] text-white font-semibold">
                NODE {String(lightboxIndex + 1).padStart(2, "0")} / {String(filteredItems.length).padStart(2, "0")}
              </span>
              <span className="hidden sm:inline-block text-[#A8A8A8]">
                {currentLightboxItem.edition} • {currentLightboxItem.year}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={closeLightbox}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-[#B52A32] border border-white/20 text-white transition-all"
                title="Close viewer (Esc)"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">CLOSE</span>
              </button>
            </div>
          </div>

          {/* Navigation: Prev Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              showPrev();
            }}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-black/70 hover:bg-[#B52A32] border border-white/20 hover:border-[#B52A32] text-white flex items-center justify-center transition-all z-50 shadow-2xl group focus:outline-none"
            aria-label="Previous capture"
          >
            <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 group-hover:-translate-x-0.5 transition-transform" />
          </button>

          {/* Navigation: Next Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              showNext();
            }}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-black/70 hover:bg-[#B52A32] border border-white/20 hover:border-[#B52A32] text-white flex items-center justify-center transition-all z-50 shadow-2xl group focus:outline-none"
            aria-label="Next capture"
          >
            <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Center Lightbox Card Container */}
          <div
            className="relative max-w-5xl w-full max-h-[85vh] flex flex-col bg-[#080808] border border-white/15 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.9)] z-40"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Main Stage Image */}
            <div className="relative flex-1 min-h-[300px] sm:min-h-[460px] max-h-[62vh] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={currentLightboxItem.imageUrl}
                alt={currentLightboxItem.title}
                className="w-full h-full object-contain max-h-[62vh]"
              />

              {/* Tag pill overlay */}
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider bg-black/85 backdrop-blur-md text-[#f2636a] border border-[#B52A32]/60 font-semibold shadow-lg">
                  {currentLightboxItem.badge}
                </span>
              </div>
            </div>

            {/* Bottom Metadata Drawer */}
            <div className="p-4 sm:p-6 bg-[#0c0c0c] border-t border-white/10 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] font-mono text-[#f2636a] uppercase tracking-widest flex items-center gap-2">
                    <span>{currentLightboxItem.edition}</span>
                    <span>•</span>
                    <span>{currentLightboxItem.year}</span>
                    {currentLightboxItem.highlight && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-400">{currentLightboxItem.highlight}</span>
                      </>
                    )}
                  </div>
                  <h2 className="font-display text-lg sm:text-xl font-bold text-white mt-0.5">
                    {currentLightboxItem.title}
                  </h2>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-mono text-[#A8A8A8] bg-[#161616] px-3 py-1.5 rounded-lg border border-white/10 shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-[#B52A32]" />
                  <span>{currentLightboxItem.location}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#C8C8C8] leading-relaxed max-w-4xl">
                {currentLightboxItem.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="border-t border-[#A8333B]/30 bg-[#060203] py-8 px-4 text-center text-xs font-mono text-[#888]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 HackMITTEN 3.0 • Departments of CS&E & AIML, MIT Thandavapura</p>
          <div className="flex items-center gap-4 text-[#A8A8A8]">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>•</span>
            <Link href="/about" className="hover:text-white transition-colors">About & FAQ</Link>
            <span>•</span>
            <Link href="/register" className="hover:text-[#f2636a] transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
