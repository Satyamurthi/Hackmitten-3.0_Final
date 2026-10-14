"use client";

import React, { useState, useMemo } from "react";
import {
  Terminal,
  Cpu,
  Layers,
  Network,
  ShieldCheck,
  Award,
  MapPin,
  Clock,
  Calendar,
  AlertTriangle,
  Users,
  CheckCircle2,
  Circle,
  HelpCircle,
  Search,
  Phone,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Compass,
  FileText,
  Building,
  CheckSquare,
  Zap,
  Globe,
  Radio,
  BookOpen,
  Monitor,
  ChevronDown,
  Filter,
  Check,
  ExternalLink
} from "lucide-react";

// -------------------------------------------------------------
// FAQ DATA SOURCE (13 Official Questions & Detailed Answers)
// -------------------------------------------------------------
interface FAQItem {
  id: number;
  question: string;
  category: "general" | "teams" | "domains" | "logistics";
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 1,
    category: "general",
    question: "What is HackMITTEN 3.0?",
    answer:
      "HackMITTEN 3.0 is a 24-hour national-level hackathon organized by the Departments of Computer Science & Engineering (CS&E) and Computer Science & Engineering (AI & ML) at Maharaja Institute of Technology Thandavapura (MITT), in collaboration with VigyanLabs. The event challenges students to solve industry-relevant problem statements through creativity, collaboration, and rapid technical execution."
  },
  {
    id: 2,
    category: "teams",
    question: "Who is eligible to participate?",
    answer:
      "Students currently enrolled in Diploma, Undergraduate (UG), and Postgraduate (PG) programs from recognized educational institutions are eligible to participate. Inter-branch and inter-college team formations are permitted, provided all members belong to the same educational tier."
  },
  {
    id: 3,
    category: "teams",
    question: "Can students from different branches or colleges form a team?",
    answer:
      "Yes! Inter-branch and inter-college teams are permitted and encouraged. For instance, students from different departments or different institutions can collaborate, provided they all belong to the exact same educational level (e.g., all Diploma, all UG, or all PG)."
  },
  {
    id: 4,
    category: "teams",
    question: "Can Diploma, UG, and PG students form a team together?",
    answer:
      "No. Mixing students from different educational levels is strictly prohibited. Diploma teams must consist exclusively of Diploma students, UG teams exclusively of Undergraduate students, and PG teams exclusively of Postgraduate students to ensure fair evaluation."
  },
  {
    id: 5,
    category: "teams",
    question: "What is the required team size?",
    answer:
      "Each team must consist of 3 to 4 members. Solo participation or teams of 2 or more than 4 are not allowed."
  },
  {
    id: 6,
    category: "general",
    question: "What are the registration fees?",
    answer:
      "The registration fees are: Diploma Category: ₹500 per team; Undergraduate (UG) Category: ₹1,000 per team; Postgraduate (PG) Category: ₹1,000 per team. Registration covers full 24-hour event participation and access to facilities."
  },
  {
    id: 7,
    category: "general",
    question: "Are registration fees refundable?",
    answer:
      "No. In accordance with the official event policy, registration fees are strictly non-refundable once registration is completed."
  },
  {
    id: 8,
    category: "domains",
    question: "What domains are available for each category?",
    answer:
      "Diploma Category domains include: 1. Banking, 2. Agriculture, and 3. Healthcare. Undergraduate (UG) and Postgraduate (PG) Categories domains include: 1. Cybersecurity, 2. Cloud Computing, 3. AIOps, and 4. Enterprise ERP."
  },
  {
    id: 9,
    category: "domains",
    question: "When will the problem statements be released?",
    answer:
      "Problem statements will be officially unveiled on the day of the event during the opening ceremony. Teams will select their domain and begin work immediately once the countdown begins."
  },
  {
    id: 10,
    category: "general",
    question: "What is the total prize pool and additional benefits?",
    answer:
      "HackMITTEN 3.0 features an overall prize pool of ₹1,00,000! Additionally, winners receive direct internship opportunities with VigyanLabs and incubation support at MIT Thandavapura for the most viable prototypes."
  },
  {
    id: 11,
    category: "logistics",
    question: "Where will HackMITTEN 3.0 take place?",
    answer:
      "The event is hosted on campus at Maharaja Institute of Technology Thandavapura (MITT), Mysuru, Karnataka. Key operational venues include the Seminar Hall, Central Library, and the MCA Lab."
  },
  {
    id: 12,
    category: "logistics",
    question: "Will accommodation, food, and transportation be provided?",
    answer:
      "Official arrangements and applicable logistics for accommodation, food & refreshments, and transportation are currently being finalized by the organizing committee and will be announced shortly."
  },
  {
    id: 13,
    category: "logistics",
    question: "What should participants bring to the event?",
    answer:
      "Participants must bring their personal laptops with chargers, multi-plug power extension cords, official college ID cards, mobile phones with personal hotspot data, comfortable hackathon attire, personal medications, and basic personal care items."
  }
];

// -------------------------------------------------------------
// PACKING GEAR LIST
// -------------------------------------------------------------
interface GearItem {
  id: string;
  name: string;
  category: "essential" | "personal";
  desc: string;
}

const GEAR_ITEMS: GearItem[] = [
  { id: "laptop", name: "Laptop & Charger", category: "essential", desc: "Core workstation with dev environments pre-installed." },
  { id: "extcord", name: "Multi-Plug Extension Cord", category: "essential", desc: "Critical for shared team charging at workstations." },
  { id: "collegeid", name: "Official College ID Card", category: "essential", desc: "Mandatory for physical check-in and security clearance." },
  { id: "hotspot", name: "Mobile Hotspot & Cable", category: "essential", desc: "Secondary connectivity backup for team resilience." },
  { id: "softwares", name: "Pre-installed SDKs & IDEs", category: "essential", desc: "Docker, Node, Python, Git, and preferred databases ready." },
  { id: "clothes", name: "Comfortable Hackathon Attire", category: "personal", desc: "Breathable clothes for 24-hour endurance coding." },
  { id: "jacket", name: "Warm Jacket / Hoodie", category: "personal", desc: "Night-time temperature in air-conditioned labs can get chilly." },
  { id: "water", name: "Reusable Water Bottle", category: "personal", desc: "Campus hydration stations available throughout 24 hours." },
  { id: "meds", name: "Personal Medication & First Aid", category: "personal", desc: "Personal prescriptions or daily health requirements." },
  { id: "toiletries", name: "Refreshment Kit & Toiletries", category: "personal", desc: "Toothbrush, face wash, small towel for midnight refresh." }
];

export default function AboutPage() {
  // Navigation active tab
  const [activeNav, setActiveNav] = useState("overview");

  // Category Selector for Domain Graph
  const [selectedCategory, setSelectedCategory] = useState<"diploma" | "ug_pg">("ug_pg");

  // Pipeline step selection
  const [activePipelineStep, setActivePipelineStep] = useState<number>(1);

  // FAQ search & filter state
  const [faqSearch, setFaqSearch] = useState("");
  const [faqCategory, setFaqCategory] = useState<string>("all");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(1);

  // Packing Checklist state
  const [packedItems, setPackedItems] = useState<Record<string, boolean>>({
    laptop: true,
    collegeid: true
  });

  const togglePacked = (id: string) => {
    setPackedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const packAll = () => {
    const all: Record<string, boolean> = {};
    GEAR_ITEMS.forEach((g) => (all[g.id] = true));
    setPackedItems(all);
  };

  const resetPacked = () => {
    setPackedItems({});
  };

  const packedCount = useMemo(() => {
    return Object.values(packedItems).filter(Boolean).length;
  }, [packedItems]);

  const packingProgress = Math.round((packedCount / GEAR_ITEMS.length) * 100);

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
    <div className="min-h-screen bg-[#030303] text-[#F2F2F2] selection:bg-[#B52A32] selection:text-white font-sans antialiased relative overflow-x-hidden">
      
      {/* ---------------- SCI-FI CYBER ANIMATIONS & KEYFRAMES ---------------- */}
      <style>{`
        @keyframes cyberScan {
          0% {
            top: -5%;
            opacity: 0;
          }
          10% {
            opacity: 0.75;
          }
          90% {
            opacity: 0.75;
          }
          100% {
            top: 105%;
            opacity: 0;
          }
        }

        @keyframes circuitDash {
          0% {
            stroke-dashoffset: 48;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        @keyframes pulseGlowRing {
          0%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 0 6px rgba(216, 58, 67, 0.4));
          }
          50% {
            transform: scale(1.1);
            filter: drop-shadow(0 0 16px rgba(216, 58, 67, 0.85));
          }
        }

        @keyframes cornerFlicker {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 0.3; }
        }
      `}</style>

      {/* ---------------- BACKGROUND CYBER GRID & GLOWS ---------------- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: "32px 32px"
          }}
        />
        {/* Top ambient blood red flare */}
        <div 
          className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[900px] h-[550px] rounded-full blur-[160px] opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, #D83A43 0%, #8B1E24 50%, transparent 80%)" }}
        />
        {/* Secondary mid flare */}
        <div 
          className="absolute top-[45%] -right-[15%] w-[600px] h-[600px] rounded-full blur-[180px] opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #B52A32 0%, transparent 70%)" }}
        />

        {/* Animated Cyber Laser Scan Beam */}
        <div
          className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#D83A43]/70 to-transparent pointer-events-none"
          style={{
            animation: "cyberScan 9s linear infinite",
            boxShadow: "0 0 18px rgba(216,58,67,0.7), 0 0 36px rgba(216,58,67,0.35)",
          }}
        />

        {/* Ambient Tech Circuit Lines on Left & Right Margins */}
        <div className="hidden 2xl:block absolute left-8 top-32 bottom-32 w-px border-l border-white/5">
          <div className="absolute top-1/4 -left-1.5 w-3 h-3 rounded-full border border-[#D83A43]/40 bg-[#030303] flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-[#D83A43] animate-ping" />
          </div>
          <div className="absolute top-1/2 -left-1 text-[9px] font-mono text-white/30 rotate-90 origin-left">
            SYS.NODE.LEFT // 12°18'N
          </div>
        </div>
        <div className="hidden 2xl:block absolute right-8 top-32 bottom-32 w-px border-r border-white/5">
          <div className="absolute top-2/3 -right-1.5 w-3 h-3 rounded-full border border-[#D83A43]/40 bg-[#030303] flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-[#D83A43] animate-ping" />
          </div>
          <div className="absolute top-1/3 -right-1 text-[9px] font-mono text-white/30 -rotate-90 origin-right">
            SYS.NODE.RIGHT // 76°71'E
          </div>
        </div>
      </div>

      {/* ---------------- FLOATING TOP COMMAND HUD BAR ---------------- */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#030303]/85 border-b border-white/[0.08] px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand Identity with Orange & Taller MITT */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D83A43] to-[#8B1E24] p-[1px] flex items-center justify-center shadow-[0_0_15px_rgba(216,58,67,0.4)]">
              <div className="w-full h-full bg-[#080808] rounded-[7px] flex items-center justify-center">
                <Terminal className="w-4 h-4 text-[#D83A43]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold tracking-wider text-sm sm:text-base text-white">
                  HACK<span className="text-[#FF8A00] inline-block font-black scale-y-110 text-[1.08em]" style={{ textShadow: "0 0 18px rgba(255,138,0,0.85)" }}>MITT</span>EN 3.0
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono tracking-widest uppercase bg-[#D83A43]/15 text-[#D83A43] border border-[#D83A43]/30">
                  INFO MATRIX
                </span>
              </div>
              <p className="text-[11px] text-[#A8A8A8] hidden md:block">
                MIT Thandavapura × VigyanLabs
              </p>
            </div>
          </div>

          {/* Quick HUD Navigation Anchor Pills */}
          <nav className="hidden lg:flex items-center gap-1.5 text-xs font-mono">
            {[
              { id: "overview", label: "01 // OVERVIEW", href: "#overview" },
              { id: "pipeline", label: "02 // PIPELINE", href: "#pipeline" },
              { id: "topology", label: "03 // TOPOLOGY", href: "#topology" },
              { id: "prizes", label: "04 // REWARDS", href: "#prizes" },
              { id: "venue", label: "05 // VENUE", href: "#venue" },
              { id: "rules", label: "06 // RULES", href: "#rules" },
              { id: "checklist", label: "07 // GEAR", href: "#checklist" },
              { id: "contacts", label: "08 // TEAM", href: "#contacts" },
              { id: "faq", label: "09 // FAQ", href: "#faq" }
            ].map((tab) => (
              <a
                key={tab.id}
                href={tab.href}
                onClick={() => setActiveNav(tab.id)}
                className={`px-3 py-1.5 rounded-md transition-colors border ${
                  activeNav === tab.id
                    ? "bg-white/10 text-white border-white/20 shadow-sm"
                    : "text-[#A8A8A8] hover:text-white border-transparent hover:border-white/10 hover:bg-white/[0.04]"
                }`}
              >
                {tab.label}
              </a>
            ))}
          </nav>

          {/* Live Node Status Badge */}
          <div className="flex items-center gap-2 text-xs font-mono bg-[#080808] border border-white/10 px-3 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D83A43] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D83A43]"></span>
            </span>
            <span className="text-[#A8A8A8] hidden sm:inline">OCT 28–29, 2026</span>
            <span className="text-white font-medium">24H SPRINT</span>
          </div>
        </div>
      </header>

      {/* ---------------- REAL-TIME SYSTEM TELEMETRY STRIP ---------------- */}
      <div className="border-b border-white/[0.08] bg-[#050505]/95 py-1.5 px-4 sm:px-8 text-[10px] font-mono text-[#888] overflow-x-auto whitespace-nowrap z-40 relative flex items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
            SYS.STATUS: OPERATIONAL
          </span>
          <span className="text-white/20">|</span>
          <span className="text-white/80">LAT: 12°11'06"N • LNG: 76°42'44"E (MITT MYSURU)</span>
          <span className="text-white/20">|</span>
          <span className="text-white/80">CIRCUIT: 24-HOUR DISTRIBUTED MATRIX</span>
          <span className="text-white/20">|</span>
          <span className="text-[#D83A43] font-bold">VIGYANLABS COLLABORATIVE</span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-white/50">
          <span>EVENT HORIZON: LOCKED</span>
          <span>•</span>
          <span>NODES: LIVE TELEMETRY</span>
          <span>•</span>
          <span className="text-white/90 font-bold">EDITION: 3.0.26</span>
        </div>
      </div>

      {/* ---------------- MAIN CONTENT BODY ---------------- */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-20 sm:space-y-28">

        {/* ---------------- HERO NODE / HUD SHOWCASE ---------------- */}
        <section id="overview" className="relative pt-4 sm:pt-8">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Headlines & High-Tech Decals */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Terminal Breadcrumb */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-xs font-mono text-[#D83A43]">
                <Radio className="w-3.5 h-3.5 animate-pulse text-[#D83A43]" />
                <span className="tracking-widest uppercase">OFFICIAL PARTICIPANT INTELLIGENCE & GUIDELINES</span>
              </div>

              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05]">
                IDEAS BEYOND <br />
                <span className="bg-gradient-to-r from-[#D83A43] via-[#B52A32] to-[#F2F2F2] bg-clip-text text-transparent">
                  THE EVENT HORIZON
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#A8A8A8] leading-relaxed max-w-2xl">
                <strong className="text-white">
                  HACK<span className="text-[#FF8A00] inline-block font-black scale-y-110 text-[1.08em]" style={{ textShadow: "0 0 18px rgba(255,138,0,0.85)" }}>MITT</span>EN 3.0
                </strong>{" "}
                is a premier 24-hour national-level hackathon organized by the 
                Departments of <strong className="text-white">Computer Science & Engineering (CS&E)</strong> and{" "}
                <strong className="text-white">CS&E (Artificial Intelligence & Machine Learning)</strong> at{" "}
                <strong className="text-white">Maharaja Institute of Technology Thandavapura (MITT), Mysuru</strong>, 
                in direct collaboration with industry vanguard <strong className="text-[#D83A43]">VigyanLabs</strong>.
              </p>

              {/* High-level Pill Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {[
                  { label: "SPRINT DURATION", val: "24 HOURS", icon: Clock },
                  { label: "PRIZE POOL", val: "₹1,00,000", icon: Award },
                  { label: "TEAM CAPACITY", val: "3–4 CODERS", icon: Users },
                  { label: "EVENT THEME", val: "INDUSTRY PROBLEMS", icon: Cpu }
                ].map((item, idx) => (
                  <div key={idx} className="bg-[#080808] border border-white/10 rounded-xl p-3.5 hover:border-[#D83A43]/50 transition-colors">
                    <item.icon className="w-4 h-4 text-[#D83A43] mb-2" />
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#A8A8A8]">
                      {item.label}
                    </div>
                    <div className="font-display font-semibold text-sm sm:text-base text-white mt-0.5">
                      {item.val}
                    </div>
                  </div>
                ))}
              </div>

              {/* Department & Institution Badges */}
              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono text-[#A8A8A8]">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/[0.04] border border-white/5">
                  <Building className="w-3.5 h-3.5 text-[#D83A43]" />
                  MIT Thandavapura, Mysuru
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/[0.04] border border-white/5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D83A43]" />
                  In Collaboration With VigyanLabs
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/[0.04] border border-white/5">
                  <Calendar className="w-3.5 h-3.5 text-[#D83A43]" />
                  28–29 October 2026
                </span>
              </div>
            </div>

            {/* Right Column: Architectural HUD Visual Diagram */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl bg-gradient-to-b from-[#151515] to-[#080808] border border-white/10 p-6 shadow-2xl overflow-hidden group">
                
                {/* Circuit Grid Backdrop */}
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#D83A43_1px,transparent_1px)] [background-size:16px_16px]" />
                
                {/* Header terminal status */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D83A43] animate-pulse" />
                    <span className="font-mono text-xs text-white uppercase tracking-wider">
                      SYSTEM TOPOLOGY // NODE 3.0
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-[#A8A8A8]">
                    VER 3.0.26
                  </span>
                </div>

                {/* Architecture Visual Schema with connecting lines */}
                <div className="relative my-6 space-y-4 z-10">
                  
                  {/* Central Core Hub */}
                  <div className="bg-[#030303]/90 border border-[#D83A43]/50 rounded-xl p-4 shadow-[0_0_20px_rgba(216,58,67,0.15)] flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-mono text-[#D83A43] uppercase tracking-widest">
                        ORGANIZED BY
                      </div>
                      <div className="font-display font-bold text-white text-base">
                        Dept. of CS&E & Dept. of CS&E (AI & ML)
                      </div>
                      <div className="text-xs text-[#A8A8A8] mt-0.5">
                        Maharaja Institute of Technology Thandavapura
                      </div>
                    </div>
                    <Cpu className="w-8 h-8 text-[#D83A43] shrink-0" />
                  </div>

                  {/* SVG Circuit Connector Vertical Line with dynamic pulse */}
                  <div className="flex justify-center -my-2 relative z-0">
                    <svg width="24" height="28" viewBox="0 0 24 28" fill="none">
                      <line
                        x1="12"
                        y1="0"
                        x2="12"
                        y2="28"
                        stroke="#D83A43"
                        strokeWidth="2"
                        strokeDasharray="4 3"
                        style={{ animation: "circuitDash 1.2s linear infinite" }}
                      />
                      <circle cx="12" cy="14" r="3.5" fill="#D83A43" className="animate-pulse" />
                    </svg>
                  </div>

                  {/* Industry Partner Node */}
                  <div className="bg-[#0e0e0e] border border-white/10 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-mono text-[#A8A8A8] uppercase tracking-widest">
                        COLLABORATIVE INDUSTRY PARTNER
                      </div>
                      <div className="font-display font-semibold text-white text-base">
                        VigyanLabs Innovations
                      </div>
                      <div className="text-xs text-[#A8A8A8] mt-0.5">
                        Industry Problem Statements & Internship Pipeline
                      </div>
                    </div>
                    <Network className="w-7 h-7 text-white/70 shrink-0" />
                  </div>

                  {/* SVG Circuit Connector Split with animated flow */}
                  <div className="flex justify-center -my-2 relative z-0">
                    <svg width="180" height="32" viewBox="0 0 180 32" fill="none">
                      <path
                        d="M90 0 V14 H30 V32 M90 14 H150 V32"
                        stroke="#D83A43"
                        strokeWidth="1.8"
                        strokeDasharray="5 3"
                        style={{ animation: "circuitDash 1.5s linear infinite" }}
                      />
                      <circle cx="90" cy="14" r="3.5" fill="#D83A43" />
                      <circle cx="30" cy="30" r="3" fill="#D83A43" className="animate-pulse" />
                      <circle cx="150" cy="30" r="3" fill="#D83A43" className="animate-pulse" />
                    </svg>
                  </div>

                  {/* Bottom Dual Nodes */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="bg-[#050505] border border-white/10 rounded-lg p-3 text-center">
                      <span className="font-mono text-[10px] text-[#A8A8A8] uppercase block">
                        PRIZE POOL
                      </span>
                      <span className="font-display font-bold text-white text-base text-[#D83A43]">
                        ₹1,00,000
                      </span>
                    </div>
                    <div className="bg-[#050505] border border-white/10 rounded-lg p-3 text-center">
                      <span className="font-mono text-[10px] text-[#A8A8A8] uppercase block">
                        OPPORTUNITY
                      </span>
                      <span className="font-display font-bold text-white text-sm">
                        Incubation + Intern
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer status summary */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-[#A8A8A8] relative z-10">
                  <span>NATIONAL HACKATHON</span>
                  <span className="text-[#D83A43]">STANDALONE DIRECTORY</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ---------------- SECTION 2: 6-PHASE EXECUTION PIPELINE ---------------- */}
        <section id="pipeline" className="space-y-8 scroll-mt-24">
          
          <div className="border-b border-white/10 pb-5">
            <div className="mono text-xs uppercase tracking-[0.3em] text-[#D83A43] mb-2">
              02 // OPERATIONAL WORKFLOW
            </div>
            <h2 className="display text-3xl sm:text-4xl font-bold tracking-tight text-white">
              The 24-Hour Execution Pipeline
            </h2>
            <p className="text-[#A8A8A8] text-sm sm:text-base mt-1 max-w-2xl">
              An interconnected circuit of sequential stages that every participating team navigates from registration to grand valedictory.
            </p>
          </div>

          {/* Animated SVG Circuit Pipeline Trace between Steps */}
          <div className="hidden lg:block relative px-4 py-2 bg-[#060606] border border-white/5 rounded-xl">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#777] mb-2 px-2">
              <span>TRACE: LIVE SEQUENTIAL PIPELINE</span>
              <span className="text-[#D83A43]">ACTIVE NODE: PHASE 0{activePipelineStep}</span>
            </div>
            <svg className="w-full h-8 overflow-visible" viewBox="0 0 1000 32" fill="none">
              <line x1="30" y1="16" x2="970" y2="16" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
              <line
                x1="30"
                y1="16"
                x2={`${((activePipelineStep - 1) / 5) * 940 + 30}`}
                y2="16"
                stroke="#D83A43"
                strokeWidth="2.5"
                strokeDasharray="8 4"
                style={{
                  animation: "circuitDash 1.2s linear infinite",
                  filter: "drop-shadow(0 0 8px rgba(216,58,67,0.8))",
                }}
              />
              {[0, 1, 2, 3, 4, 5].map((i) => {
                const cx = (i / 5) * 940 + 30;
                const isPassed = activePipelineStep >= i + 1;
                const isCurrent = activePipelineStep === i + 1;
                return (
                  <g key={i}>
                    <circle
                      cx={cx}
                      cy="16"
                      r={isCurrent ? "8" : "5"}
                      fill={isPassed ? "#D83A43" : "#0e0e0e"}
                      stroke={isCurrent ? "#FF8A00" : isPassed ? "#D83A43" : "rgba(255,255,255,0.2)"}
                      strokeWidth={isCurrent ? "2.5" : "1.5"}
                      style={isCurrent ? { filter: "drop-shadow(0 0 10px #FF8A00)" } : undefined}
                    />
                    {isCurrent && (
                      <circle
                        cx={cx}
                        cy="16"
                        r="14"
                        fill="none"
                        stroke="#D83A43"
                        strokeWidth="1"
                        opacity="0.6"
                        className="animate-ping"
                      />
                    )}
                  </g>
                );
              })}
            </svg>
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
                    <span className={`w-6 h-6 rounded-md flex items-center justify-center font-mono text-xs font-bold ${
                      isActive ? "bg-[#D83A43] text-white" : "bg-white/10 text-[#A8A8A8]"
                    }`}>
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
                  <div className="text-[10px] font-mono text-[#D83A43] mt-2">
                    {node.time}
                  </div>

                  {/* Active bottom glowing indicator */}
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
                <h3 className="font-display text-2xl font-bold text-white">
                  Registration & Strict Degree Tier Segregation
                </h3>
                <p className="text-[#A8A8A8] text-sm sm:text-base leading-relaxed">
                  Teams of 3–4 members access the official registration portal via the QR code on the official poster or through verified 
                  WhatsApp broadcasts. All team members must strictly belong to the same educational level (Diploma, UG, or PG). 
                  Inter-branch and inter-college team formations are welcomed, but educational levels cannot be mixed. 
                  Fees (Diploma: ₹500, UG/PG: ₹1,000) are non-refundable.
                </p>
                <div className="grid sm:grid-cols-3 gap-3 pt-2 font-mono text-xs">
                  <div className="bg-[#030303] p-3 rounded-lg border border-white/10">
                    <span className="text-[#A8A8A8] block">TEAM SIZE</span>
                    <span className="text-white font-bold text-sm">3–4 Members</span>
                  </div>
                  <div className="bg-[#030303] p-3 rounded-lg border border-white/10">
                    <span className="text-[#A8A8A8] block">POLICY</span>
                    <span className="text-[#D83A43] font-bold text-sm">Strictly Non-refundable</span>
                  </div>
                  <div className="bg-[#030303] p-3 rounded-lg border border-white/10">
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
                <h3 className="font-display text-2xl font-bold text-white">
                  Reporting at MIT Thandavapura Campus
                </h3>
                <p className="text-[#A8A8A8] text-sm sm:text-base leading-relaxed">
                  Registered participants report on October 28, 2026 at Maharaja Institute of Technology Thandavapura, Mysuru. 
                  Every participant must display their official physical College Identity Card at the registration desk. 
                  Participants will receive official credentials, designated hackathon workspace allocation, and Wi-Fi credentials.
                </p>
                <div className="grid sm:grid-cols-3 gap-3 pt-2 font-mono text-xs">
                  <div className="bg-[#030303] p-3 rounded-lg border border-white/10">
                    <span className="text-[#A8A8A8] block">CAMPUS</span>
                    <span className="text-white font-bold text-sm">MIT Thandavapura, Mysuru</span>
                  </div>
                  <div className="bg-[#030303] p-3 rounded-lg border border-white/10">
                    <span className="text-[#A8A8A8] block">IDENTIFICATION</span>
                    <span className="text-amber-400 font-bold text-sm">College ID Required</span>
                  </div>
                  <div className="bg-[#030303] p-3 rounded-lg border border-white/10">
                    <span className="text-[#A8A8A8] block">REPORTING TIME</span>
                    <span className="text-white font-bold text-sm">To Be Announced Shortly</span>
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
                <h3 className="font-display text-2xl font-bold text-white">
                  Curated Industry Problem Statements Revealed
                </h3>
                <p className="text-[#A8A8A8] text-sm sm:text-base leading-relaxed">
                  Problem statements formulated in partnership with VigyanLabs will be unlocked simultaneously inside the Seminar Hall 
                  and participant dashboards. Diploma teams will choose from Banking, Agriculture, and Healthcare. UG and PG teams 
                  will tackle Cybersecurity, Cloud Computing, AIOps, or Enterprise ERP. Teams analyze, strategize, and lock their domain.
                </p>
                <div className="grid sm:grid-cols-3 gap-3 pt-2 font-mono text-xs">
                  <div className="bg-[#030303] p-3 rounded-lg border border-white/10">
                    <span className="text-[#A8A8A8] block">CURATION</span>
                    <span className="text-white font-bold text-sm">VigyanLabs & MITT</span>
                  </div>
                  <div className="bg-[#030303] p-3 rounded-lg border border-white/10">
                    <span className="text-[#A8A8A8] block">DIPLOMA DOMAINS</span>
                    <span className="text-white font-bold text-sm">3 Specializations</span>
                  </div>
                  <div className="bg-[#030303] p-3 rounded-lg border border-white/10">
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
                <h3 className="font-display text-2xl font-bold text-white">
                  Build. Break. Rebuild. (The 24-Hour Marathon)
                </h3>
                <p className="text-[#A8A8A8] text-sm sm:text-base leading-relaxed">
                  24 hours of pure ingenuity across the Seminar Hall, Central Library, and MCA Lab. Industry mentors from VigyanLabs 
                  and MITT faculty will conduct live checkpoints to guide teams through architectural hurdles, database scaling, and API integration. 
                  Strict adherence to originality—pre-built commercial repositories are prohibited.
                </p>
                <div className="grid sm:grid-cols-3 gap-3 pt-2 font-mono text-xs">
                  <div className="bg-[#030303] p-3 rounded-lg border border-white/10">
                    <span className="text-[#A8A8A8] block">DURATION</span>
                    <span className="text-[#D83A43] font-bold text-sm">Continuous 24 Hours</span>
                  </div>
                  <div className="bg-[#030303] p-3 rounded-lg border border-white/10">
                    <span className="text-[#A8A8A8] block">MENTOR ROADS</span>
                    <span className="text-white font-bold text-sm">Scheduled Checkpoints</span>
                  </div>
                  <div className="bg-[#030303] p-3 rounded-lg border border-white/10">
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
                <h3 className="font-display text-2xl font-bold text-white">
                  Live Demonstrations Before Eminent Technical Jury
                </h3>
                <p className="text-[#A8A8A8] text-sm sm:text-base leading-relaxed">
                  Following the final submission deadline, teams demonstrate live prototypes before an esteemed jury comprising 
                  industry leaders from VigyanLabs and senior academic authorities. Evaluation centers on technical innovation, 
                  practical feasibility, code robustness, UI/UX execution, and solution impact.
                </p>
                <div className="grid sm:grid-cols-3 gap-3 pt-2 font-mono text-xs">
                  <div className="bg-[#030303] p-3 rounded-lg border border-white/10">
                    <span className="text-[#A8A8A8] block">FORMAT</span>
                    <span className="text-white font-bold text-sm">Live Working Prototype</span>
                  </div>
                  <div className="bg-[#030303] p-3 rounded-lg border border-white/10">
                    <span className="text-[#A8A8A8] block">JURY PANEL</span>
                    <span className="text-white font-bold text-sm">VigyanLabs & MITT</span>
                  </div>
                  <div className="bg-[#030303] p-3 rounded-lg border border-white/10">
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
                <h3 className="font-display text-2xl font-bold text-white">
                  ₹1,00,000 Prize Pool, VigyanLabs Internships & Incubation
                </h3>
                <p className="text-[#A8A8A8] text-sm sm:text-base leading-relaxed">
                  The grand finale brings together all innovators for the official valedictory ceremony in the Seminar Hall. 
                  Winners across all categories receive cash awards from the overall ₹1,00,000 pool, verified certificates of excellence, 
                  exclusive internship opportunities at VigyanLabs, and incubation support to transform their prototype into a commercial venture.
                </p>
                <div className="grid sm:grid-cols-3 gap-3 pt-2 font-mono text-xs">
                  <div className="bg-[#030303] p-3 rounded-lg border border-white/10">
                    <span className="text-[#A8A8A8] block">CASH PRIZE POOL</span>
                    <span className="text-[#D83A43] font-bold text-sm">₹1,00,000</span>
                  </div>
                  <div className="bg-[#030303] p-3 rounded-lg border border-white/10">
                    <span className="text-[#A8A8A8] block">INTERNSHIPS</span>
                    <span className="text-white font-bold text-sm">VigyanLabs Opportunities</span>
                  </div>
                  <div className="bg-[#030303] p-3 rounded-lg border border-white/10">
                    <span className="text-[#A8A8A8] block">INCUBATION</span>
                    <span className="text-emerald-400 font-bold text-sm">Best Solution Grant</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </section>

        {/* ---------------- SECTION 3: TOPOLOGY & DOMAINS TREE DIAGRAM ---------------- */}
        <section id="topology" className="space-y-8 scroll-mt-24">
          
          <div className="border-b border-white/10 pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="mono text-xs uppercase tracking-[0.3em] text-[#D83A43] mb-2">
                03 // PARTICIPATION & DOMAIN TOPOLOGY
              </div>
              <h2 className="display text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Educational Category Tree & Domains
              </h2>
              <p className="text-[#A8A8A8] text-sm sm:text-base mt-1 max-w-xl">
                Explore the segregation matrix, registration fee structure, and dedicated industry domain branches.
              </p>
            </div>

            {/* Interactive Category Switcher */}
            <div className="inline-flex p-1 bg-[#080808] border border-white/10 rounded-xl font-mono text-xs shrink-0">
              <button
                onClick={() => setSelectedCategory("diploma")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedCategory === "diploma"
                    ? "bg-[#D83A43] text-white font-semibold shadow-md"
                    : "text-[#A8A8A8] hover:text-white"
                }`}
              >
                DIPLOMA TIER (₹500)
              </button>
              <button
                onClick={() => setSelectedCategory("ug_pg")}
                className={`px-4 py-2 rounded-lg transition-all ${
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
                <span className="font-mono text-xs text-[#D83A43] uppercase tracking-wider">
                  TIER METADATA
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-white">
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
                    {selectedCategory === "diploma" ? (
                      "Teams must consist exclusively of currently enrolled Diploma students. Inter-branch and inter-college team members are permitted, but no UG or PG students can join this team."
                    ) : (
                      "Undergraduate (UG) teams must consist exclusively of UG students. Postgraduate (PG) teams must consist exclusively of PG students. Cross-degree mixing is strictly barred."
                    )}
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
                              <h4 className="font-display text-lg font-bold text-white group-hover:text-[#D83A43] transition-colors">
                                {dom.name}
                              </h4>
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
                              <h4 className="font-display text-lg font-bold text-white group-hover:text-[#D83A43] transition-colors">
                                {dom.name}
                              </h4>
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

        {/* ---------------- SECTION 4: PRIZES & BENEFITS HUD VAULT ---------------- */}
        <section id="prizes" className="space-y-8 scroll-mt-24">
          
          <div className="border-b border-white/10 pb-5">
            <div className="mono text-xs uppercase tracking-[0.3em] text-[#D83A43] mb-2">
              04 // REWARDS & RECOGNITION
            </div>
            <h2 className="display text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Prizes, Internships & Incubation Support
            </h2>
            <p className="text-[#A8A8A8] text-sm sm:text-base mt-1 max-w-2xl">
              Competitive honors designed to elevate innovative prototypes from student hackathon builds into industry-ready ventures.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Grand Prize Card */}
            <div className="relative rounded-2xl bg-gradient-to-b from-[#151515] to-[#080808] border border-[#D83A43]/50 p-6 sm:p-8 shadow-[0_0_30px_rgba(216,58,67,0.15)] flex flex-col justify-between overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D83A43]/20 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#D83A43]/15 border border-[#D83A43]/30 flex items-center justify-center mb-6">
                  <Award className="w-6 h-6 text-[#D83A43]" />
                </div>
                <div className="font-mono text-xs text-[#D83A43] uppercase tracking-wider mb-1">
                  CUMULATIVE AWARDS
                </div>
                <div className="font-display text-4xl sm:text-5xl font-bold text-white mb-3">
                  ₹1,00,000
                </div>
                <p className="text-sm text-[#A8A8A8] leading-relaxed">
                  Overall competitive prize pool distributed across standout category winners. Individual prize breakdowns and track bonuses will be officially declared on event day.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#A8A8A8]">
                <span>NATIONAL RANKING</span>
                <span className="text-[#D83A43]">CASH AWARDS</span>
              </div>
            </div>

            {/* Internship Card */}
            <div className="rounded-2xl bg-[#080808] border border-white/10 p-6 sm:p-8 flex flex-col justify-between hover:border-white/20 transition-colors">
              <div>
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="font-mono text-xs text-[#A8A8A8] uppercase tracking-wider mb-1">
                  INDUSTRY RECRUITMENT
                </div>
                <div className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">
                  VigyanLabs Internships
                </div>
                <p className="text-sm text-[#A8A8A8] leading-relaxed">
                  Top-performing engineering and design talents will earn direct consideration for exclusive internship placements at VigyanLabs, working on live commercial technology stacks.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#A8A8A8]">
                <span>CAREER ACCELERATION</span>
                <span className="text-white font-medium">DIRECT INTERVIEW</span>
              </div>
            </div>

            {/* Incubation Card */}
            <div className="rounded-2xl bg-[#080808] border border-white/10 p-6 sm:p-8 flex flex-col justify-between hover:border-white/20 transition-colors">
              <div>
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="font-mono text-xs text-[#A8A8A8] uppercase tracking-wider mb-1">
                  VENTURE DEVELOPMENT
                </div>
                <div className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">
                  Incubation Support
                </div>
                <p className="text-sm text-[#A8A8A8] leading-relaxed">
                  The team demonstrating the highest viability and market potential will receive comprehensive incubation support, patent mentoring, and institutional infrastructure at MIT Thandavapura.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#A8A8A8]">
                <span>CAMPUS LAUNCHPAD</span>
                <span className="text-white font-medium">FULL INCUBATION</span>
              </div>
            </div>

          </div>
        </section>

        {/* ---------------- SECTION 5: VENUE & FACILITIES BLUEPRINT ---------------- */}
        <section id="venue" className="space-y-8 scroll-mt-24">
          
          <div className="border-b border-white/10 pb-5">
            <div className="mono text-xs uppercase tracking-[0.3em] text-[#D83A43] mb-2">
              05 // CAMPUS BLUEPRINT & VENUE MATRIX
            </div>
            <h2 className="display text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Venue Blueprint & Facilities
            </h2>
            <p className="text-[#A8A8A8] text-sm sm:text-base mt-1 max-w-2xl">
              Hosted at Maharaja Institute of Technology Thandavapura (MITT), Mysuru across designated operational wings.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Seminar Hall Node */}
            <div className="bg-[#080808] border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-[#D83A43]/40 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <Building className="w-5 h-5 text-[#D83A43]" />
                </div>
                <span className="font-mono text-[10px] text-[#D83A43] bg-[#D83A43]/10 px-2 py-0.5 rounded border border-[#D83A43]/20">
                  MAIN ARENA
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-2">
                Seminar Hall
              </h3>
              <p className="text-xs sm:text-sm text-[#A8A8A8] leading-relaxed mb-4">
                Central nerve center for opening ceremonies, official keynote addresses, live problem statement release, and grand valedictory awards.
              </p>
              <div className="pt-3 border-t border-white/5 text-[11px] font-mono text-[#A8A8A8] flex items-center justify-between">
                <span>STAGE PROTOCOLS</span>
                <span className="text-white">CENTRAL HUB</span>
              </div>
            </div>

            {/* Central Library Node */}
            <div className="bg-[#080808] border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-[#D83A43]/40 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-[#D83A43]" />
                </div>
                <span className="font-mono text-[10px] text-white/70 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                  IDEATION ZONE
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-2">
                Central Library Wing
              </h3>
              <p className="text-xs sm:text-sm text-[#A8A8A8] leading-relaxed mb-4">
                Designed for quiet brainstorming, algorithm synthesis, team architectural whiteboarding, and intensive mentor check-in huddles.
              </p>
              <div className="pt-3 border-t border-white/5 text-[11px] font-mono text-[#A8A8A8] flex items-center justify-between">
                <span>QUIET COLLABORATION</span>
                <span className="text-white">SPRINT WING</span>
              </div>
            </div>

            {/* MCA Lab Node */}
            <div className="bg-[#080808] border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-[#D83A43]/40 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-[#D83A43]" />
                </div>
                <span className="font-mono text-[10px] text-white/70 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                  COMPUTATION LAB
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-2">
                MCA Computing Lab
              </h3>
              <p className="text-xs sm:text-sm text-[#A8A8A8] leading-relaxed mb-4">
                Equipped with high-density power terminals, redundant network connectivity, developer workstations, and live demonstration evaluation benches.
              </p>
              <div className="pt-3 border-t border-white/5 text-[11px] font-mono text-[#A8A8A8] flex items-center justify-between">
                <span>DEV WORKSTATIONS</span>
                <span className="text-white">HIGH SPEED</span>
              </div>
            </div>

          </div>

          {/* Logistics & Facilities Status Cards */}
          <div className="bg-[#080808] border border-white/10 rounded-2xl p-6 sm:p-8">
            <div className="font-mono text-xs text-[#D83A43] uppercase tracking-wider mb-4">
              FACILITY PROVISIONING STATUS
            </div>
            
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#030303] border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-display font-semibold text-white">Accommodation</span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    TBA SHORTLY
                  </span>
                </div>
                <p className="text-xs text-[#A8A8A8]">
                  Arrangements and applicable charges are currently being finalized by the organizing committee.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#030303] border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-display font-semibold text-white">Food & Refreshments</span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    TBA SHORTLY
                  </span>
                </div>
                <p className="text-xs text-[#A8A8A8]">
                  Scheduled meals, midnight energy snacks, and hydration checkpoints will be announced before reporting.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#030303] border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-display font-semibold text-white">Transportation</span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    TBA SHORTLY
                  </span>
                </div>
                <p className="text-xs text-[#A8A8A8]">
                  Transit directions from Mysuru junction and designated campus bus stops will be shared with teams.
                </p>
              </div>
            </div>

            <p className="text-xs text-[#A8A8A8] mt-4 font-mono">
              * Note: Participants must monitor official communications before making external travel and boarding bookings.
            </p>
          </div>
        </section>

        {/* ---------------- SECTION 6: 10 RULES & 6 CODE OF CONDUCT ---------------- */}
        <section id="rules" className="space-y-8 scroll-mt-24">
          
          <div className="border-b border-white/10 pb-5">
            <div className="mono text-xs uppercase tracking-[0.3em] text-[#D83A43] mb-2">
              06 // COMPLIANCE MATRIX
            </div>
            <h2 className="display text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Rules, Regulations & Code of Conduct
            </h2>
            <p className="text-[#A8A8A8] text-sm sm:text-base mt-1 max-w-2xl">
              Strict governance principles ensuring fair competition, academic integrity, and physical safety.
            </p>
          </div>

          {/* 10 Rules Terminal Grid */}
          <div className="space-y-4">
            <div className="font-mono text-xs text-white uppercase tracking-wider flex items-center gap-2">
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
                    <h4 className="font-display font-semibold text-white text-sm mb-2">
                      {rule.title}
                    </h4>
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
            <div className="font-mono text-xs text-[#D83A43] uppercase tracking-wider">
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
                    <h5 className="font-display font-semibold text-white text-sm">
                      {pillar.title}
                    </h5>
                  </div>
                  <p className="text-xs text-[#A8A8A8] leading-relaxed pl-3.5">
                    {pillar.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- SECTION 7: INTERACTIVE PACKING GEAR CHECKLIST ---------------- */}
        <section id="checklist" className="space-y-8 scroll-mt-24">
          
          <div className="border-b border-white/10 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="mono text-xs uppercase tracking-[0.3em] text-[#D83A43] mb-2">
                07 // SURVIVAL GEAR CHECKLIST
              </div>
              <h2 className="display text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Interactive Equipment Packing List
              </h2>
              <p className="text-[#A8A8A8] text-sm sm:text-base mt-1 max-w-xl">
                Tick off items as you pack to verify that your team has all hardware, electrical, and personal items ready for the 24-hour marathon.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 font-mono text-xs shrink-0">
              <button
                onClick={packAll}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white transition-colors"
              >
                Pack All
              </button>
              <button
                onClick={resetPacked}
                className="px-3 py-1.5 rounded-lg bg-transparent hover:bg-white/5 text-[#A8A8A8] hover:text-white transition-colors border border-white/10"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Interactive Progress Bar */}
          <div className="bg-[#080808] border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-[#A8A8A8]">PACKING READINESS:</span>
              <span className={`font-bold ${packingProgress === 100 ? "text-emerald-400" : "text-[#D83A43]"}`}>
                {packedCount} of {GEAR_ITEMS.length} ITEMS PACKED ({packingProgress}%)
              </span>
            </div>
            
            <div className="w-full bg-[#151515] h-2.5 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-[#B52A32] to-[#D83A43] transition-all duration-300 rounded-full"
                style={{ width: `${packingProgress}%` }}
              />
            </div>

            {packingProgress === 100 && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>EXCELLENT! All mission essentials are packed and ready for deployment.</span>
              </div>
            )}

            {/* Interactive Grid of Gear Items */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-3 pt-2">
              {GEAR_ITEMS.map((gear) => {
                const isPacked = !!packedItems[gear.id];
                return (
                  <div
                    key={gear.id}
                    onClick={() => togglePacked(gear.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                      isPacked
                        ? "bg-[#101010] border-[#D83A43]/50 shadow-[0_0_15px_rgba(216,58,67,0.1)]"
                        : "bg-[#050505] border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isPacked ? (
                        <div className="w-5 h-5 rounded bg-[#D83A43] flex items-center justify-center text-white">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded border border-white/30 hover:border-white" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`font-display text-sm font-semibold ${isPacked ? "text-white line-through text-white/80" : "text-white"}`}>
                          {gear.name}
                        </span>
                        <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                          gear.category === "essential" ? "bg-[#D83A43]/15 text-[#D83A43]" : "bg-white/10 text-[#A8A8A8]"
                        }`}>
                          {gear.category}
                        </span>
                      </div>
                      <p className="text-xs text-[#A8A8A8] leading-relaxed">
                        {gear.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---------------- SECTION 8: ORGANIZING LEADERSHIP & CONTACT DIRECTORY ---------------- */}
        <section id="contacts" className="space-y-8 scroll-mt-24">
          
          <div className="border-b border-white/10 pb-5">
            <div className="mono text-xs uppercase tracking-[0.3em] text-[#D83A43] mb-2">
              08 // DIRECTORY & COMMAND NETWORK
            </div>
            <h2 className="display text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Organizing Leadership & Student Coordinators
            </h2>
            <p className="text-[#A8A8A8] text-sm sm:text-base mt-1 max-w-2xl">
              Connect directly with faculty chairs, department leadership, and the student coordination team for event clarifications.
            </p>
          </div>

          {/* Leadership & Faculty Cards */}
          <div className="grid lg:grid-cols-2 gap-6">
            
            {/* Heads of Department (HODs) */}
            <div className="bg-[#080808] border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="font-mono text-xs text-[#D83A43] uppercase tracking-wider flex items-center gap-2">
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
              <div className="font-mono text-xs text-[#D83A43] uppercase tracking-wider flex items-center gap-2">
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
                <div className="font-mono text-xs text-[#D83A43] uppercase tracking-wider">
                  STUDENT COORDINATION DESK
                </div>
                <h3 className="font-display text-xl font-bold text-white mt-0.5">
                  Direct Line for Participant Inquiries
                </h3>
              </div>
              <span className="font-mono text-xs text-[#A8A8A8]">
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
                    <span className="text-[10px] font-mono text-[#D83A43] uppercase tracking-wider">
                      STUDENT COORDINATOR
                    </span>
                    <h4 className="font-display font-bold text-white text-base group-hover:text-[#D83A43] transition-colors">
                      {coord.name}
                    </h4>
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

        {/* ---------------- SECTION 9: SEARCHABLE ACCORDION FAQ ---------------- */}
        <section id="faq" className="space-y-8 scroll-mt-24">
          
          <div className="border-b border-white/10 pb-5">
            <div className="mono text-xs uppercase tracking-[0.3em] text-[#D83A43] mb-2">
              09 // KNOWLEDGE BASE
            </div>
            <h2 className="display text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Frequently Asked Questions (FAQ)
            </h2>
            <p className="text-[#A8A8A8] text-sm sm:text-base mt-1 max-w-2xl">
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-[#A8A8A8] hover:text-white"
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
                  className={`px-3 py-1.5 rounded-lg border transition-all ${
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
                <h4 className="font-display font-bold text-white text-base">
                  No matching queries found
                </h4>
                <p className="text-xs text-[#A8A8A8]">
                  Try adjusting your search keywords or clear the category filter to view all questions.
                </p>
                <button
                  onClick={() => {
                    setFaqSearch("");
                    setFaqCategory("all");
                  }}
                  className="mt-2 px-4 py-1.5 rounded-lg bg-white/10 text-white text-xs font-mono hover:bg-white/15"
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
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs shrink-0 ${
                          isOpen ? "bg-[#D83A43] text-white" : "bg-white/5 text-[#A8A8A8]"
                        }`}>
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
                        <p className="mt-2 text-white/90">
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

        {/* ---------------- CLOSING SYSTEM STATUS BAR ---------------- */}
        <section className="pt-6 pb-12 border-t border-white/10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#080808] border border-white/10 text-xs font-mono text-[#A8A8A8]">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>STANDALONE OPERATIONAL MANUAL // HACKMITTEN 3.0</span>
          </div>
          <p className="text-xs text-[#A8A8A8] max-w-lg mx-auto leading-relaxed">
            Organized by Department of Computer Science & Engineering and Department of CS&E (AI & ML), 
            Maharaja Institute of Technology Thandavapura (MITT), Mysuru in collaboration with VigyanLabs.
          </p>
          <div className="text-[11px] font-mono text-white/40">
            © 2026 HackMITTEN 3.0. Official Participant Intelligence Document.
          </div>
        </section>

      </main>
    </div>
  );
}
