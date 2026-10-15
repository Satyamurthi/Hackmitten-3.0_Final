"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Building,
  ArrowRight,
  Mail,
  ShieldCheck,
  Award,
  Users,
  Shuffle,
  Sparkles,
  Layers,
  Search,
  DollarSign,
  Terminal,
  Radio,
  Utensils,
  Palette,
  HeartHandshake,
  Megaphone,
  Package,
  Bus,
  ClipboardCheck,
  FileText,
  Gift,
} from "lucide-react";
import { PublicNav } from "@/components/public/nav";
import { RegistrationEntryModal } from "@/components/public/registration-entry-modal";
import { Footer } from "@/components/sections/footer";
import { FACULTY_COORDINATORS, FacultyMember } from "@/data/faculty-coordinators";

const FACULTY_COMMITTEE_DIRECTORY = [
  {
    name: "Organising Team",
    category: "Core Operational Body",
    icon: Users,
    coordinators: [
      { name: "Dr. Mahadeva Prasad Y N", dept: "CSE", qual: "M.Tech, Ph.D", role: "Associate Professor" },
      { name: "Dr. Malathi M", dept: "CSE", qual: "M. Tech and Ph.D", role: "Professor" },
      { name: "Prof. Karthik V S", dept: "CSE", qual: "MCA", role: "Assistant Professor" },
      { name: "Prof. Srinidhi N Koppal", dept: "AI&ML", qual: "M.Sc", role: "Assistant Professor" },
    ],
  },
  {
    name: "Finance",
    category: "Budget & Fiscal Oversight",
    icon: DollarSign,
    coordinators: [
      { name: "Dr. Ranjit K N", dept: "CSE", qual: "M.Tech, Ph.D", role: "Professor and HOD" },
    ],
  },
  {
    name: "Technical",
    category: "Infrastructure & Platform",
    icon: Terminal,
    coordinators: [
      { name: "Dr. Mahadeva Prasad Y N", dept: "CSE", qual: "M.Tech, Ph.D", role: "Associate Professor" },
      { name: "Dr. Malathi M", dept: "CSE", qual: "M. Tech and Ph.D", role: "Professor" },
      { name: "Prof. Karthik V S", dept: "CSE", qual: "MCA", role: "Assistant Professor" },
      { name: "Prof. Srinidhi N Koppal", dept: "AI&ML", qual: "M.Sc", role: "Assistant Professor" },
      { name: "Prof. Shivumanjesh P", dept: "MCA", qual: "B.Sc, MCA", role: "Assistant Professor" },
    ],
  },
  {
    name: "Media and Communication",
    category: "PR & Media Relations",
    icon: Radio,
    coordinators: [
      { name: "Prof. Muskan Sultana", dept: "CSE", qual: "M.Tech", role: "Assistant Professor" },
      { name: "Prof. Bhavana M K", dept: "AI&ML", qual: "M.Tech", role: "Assistant Professor" },
    ],
  },
  {
    name: "Food and Refreshments",
    category: "Catering & Refreshments",
    icon: Utensils,
    coordinators: [
      { name: "Mr. Karthik Gowda A J", dept: "CSE", qual: "Diploma (E & C)", role: "Lab Instructor" },
      { name: "Mr. Vinay Kumar V K", dept: "AI&ML", qual: "BE (CSE)", role: "Programmer" },
      { name: "Prof. Abhilash R", dept: "AI&ML", qual: "MSC", role: "Assistant Professor" },
      { name: "Prof. Usha M", dept: "CSE", qual: "M.Tech", role: "Assistant Professor" },
      { name: "Prof. Bhavana C K", dept: "CSE", qual: "M.Sc", role: "Assistant Professor" },
    ],
  },
  {
    name: "Stage and Decoration",
    category: "Aesthetics & Stagecraft",
    icon: Palette,
    coordinators: [
      { name: "Prof. Sumaiya", dept: "CSE", qual: "M.Tech (Ph.D)", role: "Assistant Professor" },
      { name: "Prof. Gowthami C N", dept: "AI&ML", qual: "M.Tech, (Ph.D)", role: "Assistant Professor" },
      { name: "Prof. Sandhya R", dept: "AI&ML", qual: "MCA", role: "Assistant Professor" },
    ],
  },
  {
    name: "Hospitality",
    category: "Dignitary & Guest Protocol",
    icon: HeartHandshake,
    coordinators: [
      { name: "Prof. Swathi Suresh", dept: "CSE", qual: "M.Tech", role: "Assistant Professor" },
      { name: "Prof. Rumana Rahman", dept: "CSE", qual: "M.Tech", role: "Assistant Professor" },
      { name: "Prof. Mamatha N B", dept: "AI&ML", qual: "MCA", role: "Assistant Professor" },
    ],
  },
  {
    name: "Marketing and Sponsorship",
    category: "Corporate Outreach",
    icon: Megaphone,
    coordinators: [
      { name: "Prof. Bharath Bharadwaj B S", dept: "CSE", qual: "M.Tech(Ph.D)", role: "Assistant Professor" },
    ],
  },
  {
    name: "Logistic and Infrastructure",
    category: "Facilities & Lab Hardware",
    icon: Package,
    coordinators: [
      { name: "Dr. Mahadeva Prasad Y N", dept: "CSE", qual: "M.Tech, Ph.D", role: "Associate Professor" },
      { name: "Dr. Malathi M", dept: "CSE", qual: "M. Tech and Ph.D", role: "Professor" },
      { name: "Prof. Karthik V S", dept: "CSE", qual: "MCA", role: "Assistant Professor" },
      { name: "Prof. Srinidhi N Koppal", dept: "AI&ML", qual: "M.Sc", role: "Assistant Professor" },
    ],
  },
  {
    name: "Transport and Accomodation",
    category: "Transit & Residential Support",
    icon: Bus,
    coordinators: [
      { name: "Prof. Promodh Kumar P", dept: "CSE", qual: "M.Tech", role: "Placement Officer" },
    ],
  },
  {
    name: "Registration",
    category: "Verification & Entry Desk",
    icon: ClipboardCheck,
    coordinators: [
      { name: "Prof. Ashwini G", dept: "CSE", qual: "M.Tech (Ph.D)", role: "Assistant Professor" },
      { name: "Prof. Harisha B K", dept: "CSE", qual: "M. Tech", role: "Assistant Professor" },
      { name: "Prof. Shivashankara N", dept: "CSE", qual: "M. Tech", role: "Assistant Professor" },
      { name: "Prof. Supriya S", dept: "CSE", qual: "M.Tech", role: "Assistant Professor" },
      { name: "Prof. Sagar", dept: "AI&ML", qual: "M.Tech", role: "Assistant Professor" },
    ],
  },
  {
    name: "Cultural Events",
    category: "Valedictory & Ceremonies",
    icon: Sparkles,
    coordinators: [
      { name: "Prof. Chandana S", dept: "MCA", qual: "M.Tech", role: "Assistant Professor" },
      { name: "Prof. Anitha Urs M K", dept: "CSE", qual: "M.Tech", role: "Assistant Professor" },
      { name: "Prof. Gowthami V", dept: "AI&ML", qual: "M.Tech", role: "Assistant Professor" },
    ],
  },
  {
    name: "Documentation",
    category: "Accreditation & Archive",
    icon: FileText,
    coordinators: [
      { name: "Prof. Shruthi S", dept: "CSE", qual: "M.Tech (Ph.D)", role: "Assistant Professor" },
    ],
  },
  {
    name: "Goodies Incharge",
    category: "Swag & Kit Distribution",
    icon: Gift,
    coordinators: [
      { name: "Prof. Sumithra K N", dept: "CSE", qual: "MCA", role: "Assistant Professor" },
    ],
  },
];

export default function FacultyCoordinatorPage() {
  const [facultyList, setFacultyList] = useState<FacultyMember[]>(FACULTY_COORDINATORS);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Shuffle feature
  const handleShuffle = () => {
    setFacultyList((prev) => {
      const copy = [...prev];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    });
  };

  const filteredFaculty = facultyList.filter((faculty) => {
    const matchesDept =
      selectedDeptFilter === "ALL" ||
      faculty.department.toLowerCase().includes(selectedDeptFilter.toLowerCase());

    const matchesSearch =
      faculty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faculty.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faculty.qualification.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faculty.committees.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesDept && matchesSearch;
  });

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen bg-[#030303] text-white selection:bg-[#B52A32] selection:text-white font-sans antialiased overflow-x-hidden"
    >
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
      </div>

      <PublicNav />
      <RegistrationEntryModal />

      <main className="relative z-10 pt-28 md:pt-36 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* ── Top Breadcrumb / Navigation ── */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-[#A8A8A8]">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-[#D83A43]">Coordinators</span>
            </div>

            <Link
              href="/crew"
              className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-mono uppercase tracking-wider text-[#D6C8C8] transition-all hover:border-[#B52A32] hover:bg-[#B52A32]/10 hover:text-white"
            >
              <span>Meet The Student Crew</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#D83A43] transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* ── Hero / Header ── */}
          <div className="mb-14 md:mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#B52A32]/40 bg-[#B52A32]/10 px-3.5 py-1 text-xs font-mono uppercase tracking-[0.25em] text-[#F07C84] mb-4">
              <GraduationCap className="h-3.5 w-3.5 text-[#F07C84]" />
              Academic Leadership &amp; Faculty Mentorship
            </div>
            <h1 className="display text-4xl sm:text-6xl md:text-7xl font-bold leading-[0.95] tracking-tight text-white max-w-4xl">
              FACULTY COORDINATORS
              <br />
              <span className="text-[#A8A8A8]">&amp; ACADEMIC MENTORS.</span>
            </h1>
            <p className="mt-5 max-w-3xl text-sm sm:text-base md:text-lg text-[#A8A8A8] leading-relaxed">
              Distinguished professors, deans, and academic coordinators from Maharaja Institute of Technology Thandavapura leading the technical architecture, domain evaluation, and institutional patronage for Hackmitten 3.0.
            </p>

            {/* Controls Bar: Shuffle + Search + Filters */}
            <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-white/10 pt-6">
              {/* Dept Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { label: "All Faculty", value: "ALL" },
                  { label: "CSE", value: "CSE" },
                  { label: "AI & ML", value: "AI&ML" },
                  { label: "MCA", value: "MCA" },
                ].map((tab) => (
                  <button
                    suppressHydrationWarning
                    key={tab.value}
                    type="button"
                    onClick={() => setSelectedDeptFilter(tab.value)}
                    className={`rounded-full px-4 py-1.5 text-xs font-mono uppercase tracking-wider transition-all ${
                      selectedDeptFilter === tab.value
                        ? "bg-[#B52A32] text-white shadow-[0_0_20px_rgba(181,42,50,0.5)]"
                        : "border border-white/10 bg-white/5 text-[#A8A8A8] hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Action buttons: Shuffle & Search */}
              <div className="flex items-center gap-3">
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={handleShuffle}
                  className="group inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-mono font-medium text-white transition-all hover:border-[#B52A32] hover:bg-[#B52A32]/20 hover:shadow-[0_0_20px_rgba(181,42,50,0.4)]"
                  title="Shuffle faculty grid order"
                >
                  <Shuffle className="h-4 w-4 text-[#D83A43] transition-transform group-hover:rotate-180 duration-500" />
                  <span>Shuffle Roster</span>
                </button>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#A8A8A8]" />
                  <input
                    suppressHydrationWarning
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search faculty..."
                    className="rounded-xl border border-white/10 bg-black/60 pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#777] focus:border-[#B52A32] focus:outline-none focus:ring-1 focus:ring-[#B52A32]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Faculty Coordinators Grid (33 Faculty Members) ── */}
          <div className="mb-24">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="mono whitespace-nowrap text-xs uppercase tracking-[0.3em] text-[#D83A43]">
                  / Faculty Coordinator Roster ({filteredFaculty.length})
                </span>
                <div className="h-px w-24 sm:w-48 bg-white/10" />
              </div>
              <span className="text-xs font-mono text-white/50">
                Click photo or card to view academic credentials
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredFaculty.map((faculty) => (
                <div
                  key={faculty.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#080808] transition-all duration-300 hover:border-[#B52A32]/60 hover:shadow-[0_10px_35px_-10px_rgba(181,42,50,0.4)]"
                >
                  <div>
                    {/* Photo with Overlay */}
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#151515]">
                      {faculty.image ? (
                        <img
                          src={faculty.image}
                          alt={faculty.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <span className="display text-4xl font-bold text-[#252525]">
                            {faculty.name
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent opacity-90" />

                      {/* Department Tag Overlay */}
                      <div className="absolute top-3 right-3 rounded-full border border-white/15 bg-black/60 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[#D6C8C8] backdrop-blur-md">
                        {faculty.department}
                      </div>

                      {/* Committee Badge (Primary) */}
                      {faculty.committees[0] && (
                        <div className="absolute bottom-3 left-3 rounded-md bg-[#B52A32]/85 px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-white backdrop-blur">
                          {faculty.committees[0]}
                        </div>
                      )}
                    </div>

                    {/* Faculty Details */}
                    <div className="p-4 sm:p-5 space-y-1.5">
                      <div className="text-[11px] font-mono uppercase tracking-widest text-[#D83A43]">
                        {faculty.role}
                      </div>
                      <h3 className="display text-lg font-bold tracking-tight text-white group-hover:text-[#F07C84] transition-colors leading-snug">
                        {faculty.name}
                      </h3>

                      {faculty.qualification && (
                        <div className="flex items-center gap-1.5 text-xs text-[#A8A8A8] pt-1">
                          <Award className="h-3.5 w-3.5 text-[#B52A32] shrink-0" />
                          <span className="truncate">{faculty.qualification}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Committees Pill List */}
                  <div className="p-4 sm:p-5 pt-0 border-t border-white/5 mt-auto">
                    <div className="pt-3 flex flex-wrap gap-1.5">
                      {faculty.committees.map((com, cIdx) => (
                        <span
                          key={cIdx}
                          className="rounded bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-mono text-[#A8A8A8]"
                        >
                          {com}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Committee Faculty Coordinators Directory Section ── */}
          <div className="mb-24">
            <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <div className="mono mb-2 text-xs uppercase tracking-[0.3em] text-[#D83A43]">
                  / Committee Governance
                </div>
                <h2 className="display text-3xl sm:text-5xl font-bold tracking-tight text-white">
                  COMMITTEE FACULTY COORDINATORS
                </h2>
                <p className="mt-2 text-sm sm:text-base text-[#A8A8A8] max-w-2xl leading-relaxed">
                  Official delegation of faculty mentors appointed across all operational committees of Hackmitten 3.0 at Maharaja Institute of Technology Thandavapura.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                14 Academic Committees
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FACULTY_COMMITTEE_DIRECTORY.map((committee, idx) => {
                const IconComponent = committee.icon;
                return (
                  <div
                    key={idx}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#080808] p-6 transition-all duration-300 hover:border-[#B52A32]/60 hover:shadow-[0_10px_35px_-10px_rgba(181,42,50,0.35)]"
                  >
                    <div>
                      {/* Committee Header */}
                      <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#B52A32]/30 bg-[#B52A32]/10 text-[#D83A43] group-hover:bg-[#B52A32] group-hover:text-white transition-colors duration-300">
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-[#E07179]">
                              {committee.category}
                            </span>
                            <h3 className="display text-lg font-bold text-white group-hover:text-[#F07C84] transition-colors">
                              {committee.name}
                            </h3>
                          </div>
                        </div>

                        <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-mono text-[#D6C8C8]">
                          {committee.coordinators.length}
                        </span>
                      </div>

                      {/* Faculty Members List */}
                      <div className="pt-4 space-y-3">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-[#A8A8A8]">
                          Assigned Faculty Coordinators
                        </div>
                        <div className="space-y-2">
                          {committee.coordinators.map((c, cIdx) => (
                            <div
                              key={cIdx}
                              className="rounded-xl border border-white/5 bg-white/[0.03] p-2.5 hover:border-white/20 transition-colors"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold text-xs sm:text-sm text-white">
                                  {c.name}
                                </span>
                                <span className="rounded bg-[#B52A32]/20 px-1.5 py-0.5 text-[9px] font-mono text-[#E5535D]">
                                  {c.dept}
                                </span>
                              </div>
                              <div className="mt-1 flex items-center justify-between text-[11px] text-[#A8A8A8] font-mono">
                                <span>{c.role}</span>
                                <span>{c.qual}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-end text-[11px] font-mono text-[#A8A8A8]">
                      <span className="text-emerald-400">● Confirmed</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Institutional Patronage & Support ── */}
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0c0506] to-[#040404] p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-[#B52A32]/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#F07C84]">
                <Users className="h-4 w-4" />
                Maharaja Institute of Technology Thandavapura
              </div>
              <h2 className="display text-2xl sm:text-4xl font-bold text-white leading-tight">
                Empowering Engineers &amp; Pioneers Beyond Boundaries
              </h2>
              <p className="text-sm sm:text-base text-[#A8A8A8] leading-relaxed">
                Hackmitten 3.0 is proudly hosted under the academic patronage of the Department of Computer Science &amp; Engineering and Dept. of AI &amp; ML at MIT Thandavapura. For official academic inquiries or institutional collaborations, reach out to the department desk.
              </p>

              <div className="pt-2 flex flex-wrap gap-4">
                <a
                  href="mailto:hodcse@mitt.edu.in"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#B52A32] px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-[#8B1E24] hover:shadow-[0_0_30px_rgba(181,42,50,0.5)]"
                >
                  <Mail className="h-4 w-4" />
                  Contact Department Desk
                </a>

                <Link
                  href="/crew"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-all hover:border-[#B52A32] hover:bg-[#B52A32]/10"
                >
                  <Users className="h-4 w-4 text-[#D83A43]" />
                  View Student Coordinators &amp; Crew
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
