"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Navigation,
  Phone,
  ExternalLink,
  Copy,
  Check,
  Building,
  ArrowRight,
  AlertCircle,
  Clock,
  Compass,
  DollarSign
} from "lucide-react";
import { PublicNav } from "@/components/public/nav";
import { RegistrationEntryModal } from "@/components/public/registration-entry-modal";
import { Footer } from "@/components/sections/footer";

export default function AccommodationPage() {
  const [hostelCopied, setHostelCopied] = useState(false);

  const hostelAddress =
    "Hudco, 2nd Stage, Gangothri Layout, opp. Sri Maruti Temple, Saraswathipuram, Mysuru, Karnataka 570009";
  const hostelGoogleMapsUrl = "https://share.google/DKJpatfaB7pkGBIb3";

  const handleCopyHostel = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(hostelAddress);
      setHostelCopied(true);
      setTimeout(() => setHostelCopied(false), 2000);
    }
  };

  const coordinators = [
    { name: "Manju C G", role: "Accommodation Coordinator", phone: "6363389759" },
    { name: "Jasim Hussain K", role: "Accommodation Coordinator", phone: "8310439565" },
  ];

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
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 pt-24 sm:pt-32 pb-16 sm:pb-24 space-y-12 sm:space-y-16">
        {/* ── Page Hero Header ── */}
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#B52A32]/40 bg-[#B52A32]/10 px-3.5 py-1 text-xs font-mono text-[#f2636a] tracking-wider uppercase">
            <Compass className="w-3.5 h-3.5" />
            / Outstation Logistics // Accommodation Partner
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <h1 className="display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white">
                OFFICIAL
                <br />
                <span className="text-[#f2636a]">ACCOMMODATION.</span>
              </h1>
              <p className="text-base sm:text-lg text-[#D6C8C8] leading-relaxed">
                Safe, verified, and budget-friendly lodging at <strong className="text-emerald-400 font-bold">₹250 per person</strong> arranged in association with <strong className="text-white">Youth Hostel Mysuru</strong> for outstation HackMITTEN 3.0 teams.
              </p>
            </div>

            {/* Quick Action Navigation */}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={hostelGoogleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#B52A32] hover:bg-[#c9323b] px-5 py-3 text-sm font-semibold text-white shadow-[0_0_25px_-5px_rgba(216,58,67,0.5)] transition-all hover:scale-[1.02]"
              >
                <Navigation className="w-4 h-4" />
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
              <Link
                href="/venue"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-5 py-3 text-sm font-semibold text-[#D6C8C8] hover:text-white transition-all"
              >
                <span>View Hackathon Venue</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            <div className="bg-[#0b0b0b]/90 border border-emerald-500/30 rounded-xl p-4 flex flex-col justify-between">
              <div className="text-emerald-400 uppercase tracking-wider text-[11px] font-mono font-semibold flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" />
                Nominal Tariff
              </div>
              <div className="text-white font-bold text-xl sm:text-2xl mt-1">₹250 <span className="text-xs text-[#A8A8A8] font-normal font-mono">/ person</span></div>
            </div>
            <div className="bg-[#0b0b0b]/90 border border-amber-500/30 rounded-xl p-4 flex flex-col justify-between">
              <div className="text-amber-400 uppercase tracking-wider text-[11px] font-mono font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Booking Rule
              </div>
              <div className="text-amber-200 font-bold text-xl sm:text-2xl mt-1">5 Days <span className="text-xs text-[#A8A8A8] font-normal font-mono">Pre-book min</span></div>
            </div>
            <div className="bg-[#0b0b0b]/90 border border-white/10 rounded-xl p-4 flex flex-col justify-between">
              <div className="text-[#A8A8A8] uppercase tracking-wider text-[11px] font-mono">Hostel Facility</div>
              <div className="text-white font-bold text-base sm:text-lg mt-1">Youth Hostel</div>
              <div className="text-xs text-[#A8A8A8]">Saraswathipuram</div>
            </div>
            <div className="bg-[#0b0b0b]/90 border border-white/10 rounded-xl p-4 flex flex-col justify-between">
              <div className="text-[#A8A8A8] uppercase tracking-wider text-[11px] font-mono">Wing Allocation</div>
              <div className="text-emerald-400 font-bold text-base sm:text-lg mt-1">Segregated</div>
              <div className="text-xs text-[#A8A8A8]">Boys & Girls Separate</div>
            </div>
          </div>
        </section>

        {/* ── Mandatory Pre-Booking Alert Banner ── */}
        <section className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent p-5 sm:p-7 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center gap-4 text-amber-200 shadow-lg">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="font-mono text-xs uppercase tracking-wider text-amber-400 font-bold flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Mandatory 5-Day Pre-Booking Requirement
            </div>
            <p className="text-xs sm:text-sm text-amber-200/95 leading-relaxed">
              All outstation participants and teams requiring accommodation <strong>must confirm and pre-book at least 5 days prior to the event</strong> (₹250 per person). Spot bookings or arrival-day requests cannot be entertained due to prior bed allotment limits.
            </p>
          </div>
        </section>

        {/* ── Accommodation Cards Grid (Hostel Details & Coordinator Desk) ── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Card: Hostel Information & Address */}
          <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#090909] p-6 sm:p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="inline-flex items-center gap-2 rounded-lg bg-[#B52A32]/10 border border-[#B52A32]/30 px-3 py-1 font-mono text-xs text-[#f2636a]">
                  <Building className="w-3.5 h-3.5" />
                  <span>OFFICIAL PARTNER HOSTEL</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                    ₹250 / Person
                  </span>
                  <span className="font-mono text-xs text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Verified Facility
                  </span>
                </div>
              </div>

              <div>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">Youth Hostel Mysuru</h2>
                <p className="font-mono text-xs text-[#A8A8A8] mt-1">Saraswathipuram • Gangothri Layout, Mysuru</p>
              </div>

              <div className="rounded-xl border border-white/5 bg-[#040404] p-4 sm:p-5 space-y-2">
                <div className="font-mono text-[11px] uppercase tracking-wider text-[#A8A8A8] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#f2636a]" />
                  Hostel Location & Postal Address
                </div>
                <p className="text-xs sm:text-sm text-[#D6C8C8] leading-relaxed font-mono">
                  {hostelAddress}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs">
                  <div className="font-mono text-[10px] text-emerald-400 uppercase font-semibold">Tariff</div>
                  <div className="font-bold text-white text-base mt-0.5">₹250 <span className="text-xs font-normal text-[#D6C8C8]">/ person</span></div>
                </div>
                <div className="rounded-xl border border-white/5 bg-[#050505] p-3.5 text-xs">
                  <div className="font-mono text-[10px] text-[#A8A8A8] uppercase">Room Allocation</div>
                  <div className="font-semibold text-white mt-1">Segregated wings for boys & girls</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-5 border-t border-white/10 flex flex-wrap items-center gap-3">
              <a
                href={hostelGoogleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#B52A32] hover:bg-[#c9323b] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.02]"
              >
                <Navigation className="w-4 h-4" />
                Open in Google Maps
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
              <button
                type="button"
                onClick={handleCopyHostel}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-sm font-mono text-[#A8A8A8] hover:text-white transition-all"
              >
                {hostelCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Hostel Address Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Address</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Card: Accommodation Coordinators & Booking Desk */}
          <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-[#090909] p-6 sm:p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 font-mono text-xs text-emerald-400">
                  <Phone className="w-3.5 h-3.5" />
                  <span>BOOKING ASSISTANCE DESK</span>
                </div>
              </div>

              <div>
                <h2 className="font-display font-bold text-xl sm:text-2xl text-white">Contact Coordinators</h2>
                <p className="text-xs text-[#A8A8A8] mt-1">
                  Call our student leads to reserve beds, submit team member lists, or request travel advice.
                </p>
              </div>

              <div className="space-y-2.5">
                {coordinators.map((coordinator) => (
                  <div
                    key={coordinator.phone}
                    className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-[#040404] hover:border-white/15 transition-all"
                  >
                    <div>
                      <div className="font-display font-semibold text-sm text-white">{coordinator.name}</div>
                      <div className="font-mono text-[11px] text-[#A8A8A8]">{coordinator.role}</div>
                    </div>
                    <a
                      href={`tel:${coordinator.phone}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#B52A32]/40 bg-[#B52A32]/10 hover:bg-[#B52A32] text-[#f2636a] hover:text-white px-3 py-1.5 text-xs font-mono font-bold transition-all"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{coordinator.phone}</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-white/5 bg-[#040404] text-[11px] text-[#A8A8A8] font-mono leading-relaxed">
              💡 <strong className="text-white">Note:</strong> Accommodation charge is <strong className="text-emerald-400 font-bold">₹250 per person</strong>. Please keep your <strong>Team ID</strong>, arrival time, and member count ready when calling.
            </div>
          </div>
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
              EXPLORE THE
              <br />
              <span className="text-[#f2636a]">CAMPUS VENUE.</span>
            </h2>
            <p className="text-sm sm:text-base text-[#D6C8C8]">
              Ready for the 24-hour sprint? Check out the labs, seminar halls, and campus blueprint at MIT Thandavapura.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/venue"
                className="inline-flex items-center gap-2 rounded-xl bg-[#B52A32] hover:bg-[#c9323b] px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all"
              >
                Visit Venue Page
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-6 py-3 text-sm font-mono text-[#D6C8C8] hover:text-white transition-all"
              >
                Read Guidelines & FAQs
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
