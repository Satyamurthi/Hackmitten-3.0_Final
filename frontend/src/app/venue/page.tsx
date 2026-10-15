"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Navigation,
  Zap,
  Phone,
  ExternalLink,
  Copy,
  Check,
  Building,
  Compass,
  ArrowRight,
  Laptop,
  AlertCircle,
  Clock
} from "lucide-react";
import { PublicNav } from "@/components/public/nav";
import { RegistrationEntryModal } from "@/components/public/registration-entry-modal";
import { Footer } from "@/components/sections/footer";

export default function VenuePage() {
  const [copied, setCopied] = useState(false);

  const coordinates = "12.1829° N, 76.6623° E";
  const fullAddress =
    "Maharaja Institute of Technology Thandavapura, Mysuru - Ooty Road, Just off NH 766, Nanjangudu Taluk, Thandavapura, Karnataka 571302";
  const googleMapsUrl = "https://maps.app.goo.gl/6eufFDAHy1xFATp76";

  const handleCopy = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(fullAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-[#B52A32] selection:text-white font-sans antialiased overflow-x-hidden">
      {/* ── Space Background Radial Glows ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1200px] h-[550px] opacity-35 blur-[140px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(181,42,50,0.55), rgba(139,30,36,0.2) 55%, transparent 75%)",
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
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* ── Main Site Navigation ── */}
      <PublicNav visible={true} />
      <RegistrationEntryModal />

      {/* ── Main Content Container ── */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 pt-24 sm:pt-32 pb-16 sm:pb-24 space-y-16 sm:space-y-24">
        {/* ── Page Hero Header ── */}
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#B52A32]/40 bg-[#B52A32]/10 px-3.5 py-1 text-xs font-mono text-[#f2636a] tracking-wider uppercase">
            <Compass className="w-3.5 h-3.5" />
            / Location Matrix // Campus Dispatch
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1 className="display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-[0.92]">
                FIND THE
                <br />
                <span className="text-[#A8A8A8]">EVENT HORIZON.</span>
              </h1>
              <p className="mt-4 text-base sm:text-lg text-white/80 max-w-2xl font-light">
                Maharaja Institute of Technology Thandavapura (MITT), located right on the Mysuru-Ooty National Highway (NH 766).
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#B52A32] hover:bg-[#c9323b] px-5 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(181,42,50,0.5)] transition-all hover:scale-[1.02]"
              >
                <Navigation className="w-4 h-4" />
                Open in Google Maps
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-3 text-sm font-mono text-[#A8A8A8] hover:text-white transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Address Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Full Address</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Telemetry Chips */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-4 font-mono text-xs">
            <div className="bg-[#0b0b0b]/90 border border-white/10 rounded-xl p-3.5 flex flex-col justify-between">
              <div className="text-[#A8A8A8] uppercase tracking-wider text-[10px]">GPS Coordinates</div>
              <div className="text-white font-bold text-sm mt-1">{coordinates}</div>
            </div>
            <div className="bg-[#0b0b0b]/90 border border-white/10 rounded-xl p-3.5 flex flex-col justify-between">
              <div className="text-[#A8A8A8] uppercase tracking-wider text-[10px]">Highway Corridor</div>
              <div className="text-white font-bold text-sm mt-1">NH 766 (Mysuru-Ooty)</div>
            </div>
            <div className="bg-[#0b0b0b]/90 border border-white/10 rounded-xl p-3.5 flex flex-col justify-between">
              <div className="text-[#A8A8A8] uppercase tracking-wider text-[10px]">Operational Hours</div>
              <div className="text-emerald-400 font-bold text-sm mt-1">24 Hours Non-Stop</div>
            </div>
            <div className="bg-[#0b0b0b]/90 border border-white/10 rounded-xl p-3.5 flex flex-col justify-between">
              <div className="text-[#A8A8A8] uppercase tracking-wider text-[10px]">Network Backbone</div>
              <div className="text-[#f2636a] font-bold text-sm mt-1">Gigabit Campus LAN</div>
            </div>
          </div>
        </section>

        {/* ── Interactive Map Section ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#B52A32]">
              <MapPin className="w-4 h-4" />
              <span>Campus Satellite Location</span>
            </div>
            <span className="text-xs font-mono text-[#A8A8A8] hidden sm:inline-block">
              Interactive • Scroll to zoom
            </span>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#090909] shadow-2xl">
            <div className="absolute top-4 left-4 z-10 pointer-events-none hidden sm:flex items-center gap-2 rounded-lg bg-black/85 backdrop-blur-md border border-white/15 px-3 py-1.5 font-mono text-[11px] text-white">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>MIT Thandavapura Main Campus</span>
            </div>

            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15865.614589310255!2d76.66231138787947!3d12.182924746985165!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3baf68ebcaaf5815%3A0xccb790eb902050cd!2sMIT%20Thandavapura!5e0!3m2!1sen!2sin!4v1788802507801!5m2!1sen!2sin"
              width="100%"
              height="500"
              style={{ border: 0, filter: "contrast(1.05)" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              title="Venue location — MIT Thandavapura"
              className="w-full h-[420px] sm:h-[500px]"
            />
          </div>

          <p className="text-xs sm:text-sm text-[#A8A8A8] font-mono leading-relaxed">
            <strong className="text-white">Full Postal Address:</strong> {fullAddress}
          </p>
        </section>

        {/* ── Campus Blueprint & Facilities ── */}
        <section className="space-y-8">
          <div>
            <div className="mono text-xs uppercase tracking-[0.3em] text-[#B52A32] mb-3">
              / Campus Blueprint
            </div>
            <h2 className="display text-3xl sm:text-5xl font-bold tracking-tight text-white">
              OPERATIONAL
              <br />
              <span className="text-[#A8A8A8]">ZONES & MATRIX.</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#A8A8A8] max-w-xl">
              Equipped with round-the-clock infrastructure for seamless 24-hour sprint development.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <div className="rounded-2xl border border-white/10 bg-[#090909] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <Building className="w-5 h-5 text-[#f2636a]" />
                <span className="font-mono text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/30">MAIN STAGE</span>
              </div>
              <h3 className="font-display font-bold text-white text-base">Central Seminar Hall</h3>
              <p className="text-xs text-[#A8A8A8] leading-relaxed">
                Air-conditioned auditorium hosting the inaugural keynote, lamp lighting ceremony, problem statement reveals, and closing prize distributions.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#090909] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <Laptop className="w-5 h-5 text-[#f2636a]" />
                <span className="font-mono text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/30">HACK BAY</span>
              </div>
              <h3 className="font-display font-bold text-white text-base">Advanced Computer Labs</h3>
              <p className="text-xs text-[#A8A8A8] leading-relaxed">
                Department of CSE & AIML labs fitted with high-density gigabit LAN, dual-redundant power backup, ergonomic seating, and multi-socket work bays.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#090909] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <Zap className="w-5 h-5 text-[#f2636a]" />
                <span className="font-mono text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/30">QUIET ZONE</span>
              </div>
              <h3 className="font-display font-bold text-white text-base">Department Reference Library</h3>
              <p className="text-xs text-[#A8A8A8] leading-relaxed">
                Spacious quiet sprint zones, mentor consultation stations, whiteboards, and reference archives for deep algorithmic brainstorming.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#090909] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <Phone className="w-5 h-5 text-[#f2636a]" />
                <span className="font-mono text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/30">HELP DESK</span>
              </div>
              <h3 className="font-display font-bold text-white text-base">Travel & Logistics Helpdesk</h3>
              <p className="text-xs text-[#A8A8A8] leading-relaxed">
                Volunteer team stationed at the college gate for participant check-in, badge issuance, local travel guidance, and luggage drop-off.
              </p>
            </div>
          </div>
        </section>

        {/* ── Official Accommodation Teaser Link Card ── */}
        <section id="accommodation" className="rounded-2xl border border-white/10 bg-[#090909] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 scroll-mt-24">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-lg bg-[#B52A32]/10 border border-[#B52A32]/30 px-3 py-1 font-mono text-xs text-[#f2636a]">
              <Building className="w-3.5 h-3.5" />
              <span>OUTSTATION LODGING // YOUTH HOSTEL MYSURU</span>
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
              Official Accommodation for Outstation Teams
            </h2>
            <p className="text-xs sm:text-sm text-[#A8A8A8] leading-relaxed">
              Safe, verified lodging arranged at <strong className="text-emerald-400 font-bold">₹250 per person</strong> in association with Youth Hostel Mysuru. Mandatory 5-day advance pre-booking required.
            </p>
          </div>
          <Link
            href="/accommodation"
            className="inline-flex items-center gap-2 rounded-xl bg-[#B52A32] hover:bg-[#c9323b] px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.02] shrink-0"
          >
            <span>View Full Accommodation Page</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>

        {/* ── Ready to Build CTA Card ── */}
        <section className="rounded-3xl border border-[#B52A32]/30 bg-gradient-to-r from-[#180406] via-[#100305] to-[#080203] p-8 sm:p-12 text-center relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              background: "radial-gradient(circle at center, rgba(216,58,67,0.5), transparent 70%)",
            }}
          />
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="display text-3xl sm:text-5xl font-bold tracking-tight text-white">
              SEE YOU AT THE
              <br />
              <span className="text-[#f2636a]">CAMPUS.</span>
            </h2>
            <p className="text-sm sm:text-base text-[#D6C8C8]">
              Ready to take on 24 hours of non-stop innovation? Review the problem statements, form your squad, and prepare for takeoff.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#B52A32] hover:bg-[#c9323b] px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all"
              >
                Navigate to MITT
                <ExternalLink className="w-4 h-4" />
              </a>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 hover:border-white/40 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-all"
              >
                Learn About Tracks & Rules
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* ── Site Footer ── */}
      <Footer />
    </div>
  );
}
