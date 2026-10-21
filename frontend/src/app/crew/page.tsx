"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Phone,
  MessageSquare,
  Mail,
  Github,
  Linkedin,
  ArrowRight,
  Code2,
  GraduationCap,
  Layers,
  BookOpen,
  Calendar,
  X,
  ExternalLink,
  Sparkles,
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
} from "lucide-react";
import { PublicNav } from "@/components/public/nav";
import { RegistrationEntryModal } from "@/components/public/registration-entry-modal";
import { Footer } from "@/components/sections/footer";

type CrewMember = {
  id: string;
  name: string;
  role: string;
  teams: string[];
  department: string;
  section: string;
  semester: string;
  image: string;
  phone?: string | null;
  email?: string | null;
  linkedin?: string;
  github?: string;
};

const CREW_STUDENTS: CrewMember[] = [
  {
    id: "student-komal",
    name: "Komal Kirthi Mittal B",
    role: "President",
    teams: ["Organising Team", "Finance", "Documentation"],
    department: "CSE",
    section: "Section A",
    semester: "7th Semester",
    image: "/images/coordinators/komal.jpeg",
    email: "mittalkomal380@gmail.com",
    phone: "9901727510",
  },
  {
    id: "student-rohith",
    name: "Hiremata Rohith",
    role: "President",
    teams: ["Organising Team", "Finance"],
    department: "CSE",
    section: "Section B",
    semester: "7th Semester",
    image: "/images/coordinators/rohith.jpeg",
    email: "4mn24cs404@gmail.com",
    phone: "8125636397",
  },
  {
    id: "student-manasa",
    name: "Manasa M Swamy",
    role: "Vice President",
    teams: ["Organising Team", "Finance"],
    department: "CSE",
    section: "Section A",
    semester: "7th Semester",
    image: "/images/coordinators/manasa.jpeg",
    email: "manasauttam@gmail.com",
    phone: "7760882899",
  },
  {
    id: "student-kishore",
    name: "Kishore P",
    role: "Vice President",
    teams: ["Organising Team"],
    department: "CSE",
    section: "Section A",
    semester: "7th Semester",
    image: "/images/coordinators/kishore.jpeg",
    email: "kishkeerthi24@gmail.com",
    phone: "7348928249",
  },
  {
    id: "student-rakshitha",
    name: "Rakshitha K M",
    role: "Secretary",
    teams: ["Organising Team"],
    department: "CSE",
    section: "Section B",
    semester: "7th Semester",
    image: "/images/coordinators/rakshitha.jpeg",
    email: "rakshithakm1602@gmail.com",
    phone: "9845058451",
  },
  {
    id: "student-madan",
    name: "Madan Gowda B U",
    role: "Secretary",
    teams: ["Organising Team"],
    department: "CSE",
    section: "Section A",
    semester: "7th Semester",
    image: "/images/coordinators/madan.jpeg",
    email: "madangowdabu2005@gmail.com",
    phone: "7676453140",
  },
  {
    id: "student-bindu",
    name: "Bindu B S",
    role: "Joint Secretary",
    teams: ["Organising Team"],
    department: "CSE",
    section: "Section A",
    semester: "7th Semester",
    image: "/images/coordinators/bindu.jpeg",
    email: "bindu.bs807@gmail.com",
    phone: "8073709238",
  },
  {
    id: "student-arjun",
    name: "Arjun Urs R",
    role: "Joint Secretary",
    teams: ["Organising Team"],
    department: "CSE",
    section: "Section A",
    semester: "7th Semester",
    image: "/images/coordinators/arjun.jpeg",
    email: "arjunursr2005@gmail.com",
    phone: "7483522779",
  },
  {
    id: "student-divya",
    name: "Divya H",
    role: "Joint Secretary",
    teams: ["Organising Team"],
    department: "AI&ML",
    section: "Section A",
    semester: "3rd Year",
    image: "/images/coordinators/divya.jpeg",
    email: "divyahgowda0901@gmail.com",
    phone: "7019231891",
  },
  {
    id: "student-srinidhi",
    name: "Srinidhi TG",
    role: "Joint Secretary",
    teams: ["Organising Team"],
    department: "AI&ML",
    section: "Section A",
    semester: "3rd Year",
    image: "/images/coordinators/Srinidhi.jpeg",
    email: "srinidhitg2006@gmail.com",
    phone: "8660586517",
  },
];

const CREW_DEVELOPERS: CrewMember[] = [
  {
    id: "dev-sharath",
    name: "Sharath H N",
    role: "Technical FSD",
    teams: ["Technical", "FSD"],
    department: "CSE",
    section: "Section B",
    semester: "7th Semester",
    image: "/images/developers/SharathHN.jpeg",
    linkedin: "https://www.linkedin.com/in/sharath-hn-368449228/",
    github: "https://github.com/sharath-6363",
  },
  {
    id: "dev-jasim",
    name: "Jasim Hussain K",
    role: "Technical FSD",
    teams: ["Technical", "FSD"],
    department: "CSE",
    section: "Section B",
    semester: "7th Semester",
    image: "/images/developers/jasim.jpeg",
    linkedin:
      "https://www.linkedin.com/in/jasim-hussaain?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
    github: "https://github.com/jasimk786",
  },
  {
    id: "dev-manju",
    name: "Manju C G",
    role: "Technical Frontend",
    teams: ["Technical", "Frontend"],
    department: "CSE",
    section: "Section B",
    semester: "7th Semester",
    image: "/images/developers/manju-c-g.jpeg",
    linkedin: "https://www.linkedin.com/in/manju-c-g-48bb23335",
    github: "https://github.com/manjucg39-design",
  },
  {
    id: "dev-manjunath",
    name: "Manjunath P",
    role: "Technical FSD",
    teams: ["Technical FSD"],
    department: "CSE",
    section: "Section A",
    semester: "7th Semester",
    image: "/images/developers/manjuanath.jpeg",
    linkedin: "https://www.linkedin.com/in/manjunatha67p/",
    github: "https://github.com/namelessweakl1ng",
  },
  {
    id: "dev-harshith",
    name: "Harshith H R",
    role: "Design and Content",
    teams: ["Design and Content", "Media and Communication"],
    department: "CSE",
    section: "Section A",
    semester: "7th Semester",
    image: "/images/developers/harshith.jpeg",
    phone: "8296338351",
  },
  {
    id: "dev-pradeep",
    name: "Pradeep Bhimappa Kadakol",
    role: "Technical Frontend",
    teams: ["Technical Frontend", "Transport and Accommodation"],
    department: "CSE",
    section: "Section A",
    semester: "7th Semester",
    image: "/images/developers/person2.png",
    linkedin: "https://www.linkedin.com/in/pradeep-kadakol-602220333/",
    github: "https://github.com/pradeepkadakol",
  },
];

type Committee = {
  name: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  members: string[];
};

const EVENT_COMMITTEES: Committee[] = [
  {
    name: "Organising Team",
    category: "Core Committee",
    icon: Users,
    members: [
      "Hiremata Rohith",
      "Komal Kirthi Mittal B",
      "Kishore P",
      "Manasa M Swamy",
      "Madan Gowda B U",
      "Rakshitha K M",
      "Arjun Urs",
      "Bindu B S",
      "Divya H",
      "Srinidhi T G",
      "Manvanth M",
      "Harshil Siddarth P",
    ],
  },
  {
    name: "Finance",
    category: "Accounts & Budget",
    icon: DollarSign,
    members: ["Komal Kirthi Mittal B", "Hiremata Rohith", "Manasa M Swamy"],
  },
  {
    name: "Technical",
    category: "Systems & Infrastructure",
    icon: Terminal,
    members: ["Sharath H N", "Jasim Hussain K", "Manju C G", "Manjunath P"],
  },
  {
    name: "Media and Communication",
    category: "Broadcast & Design",
    icon: Radio,
    members: ["Harshith H R", "Abhay S Atreya", "Shivaswamy G S"],
  },
  {
    name: "Food and Refreshments",
    category: "Catering & Refreshments",
    icon: Utensils,
    members: ["Likith Sharan", "Yashwanth", "Rohan Gowda"],
  },
  {
    name: "Stage and Decoration",
    category: "Aesthetics & Production",
    icon: Palette,
    members: ["Nisha R P S", "Shaguftha", "Sadiya", "Sumaiya", "Ebenezer"],
  },
  {
    name: "Hospitality",
    category: "Guest & VIP Relations",
    icon: HeartHandshake,
    members: ["Sahana", "Spoorthi", "Kavya BA", "Nikith R"],
  },
  {
    name: "Marketing and Sponsorship",
    category: "Outreach & Partnerships",
    icon: Megaphone,
    members: [
      "Bhumika N Ghanekar",
      "Ganavi K P",
      "Nakka Shravya Reddy",
      "Darshan Gowda M G",
    ],
  },
  {
    name: "Logistic and Infrastructure",
    category: "Operations & Facilities",
    icon: Package,
    members: ["Prem", "Shreyas", "Chandan", "Chethan"],
  },
  {
    name: "Transport and Accomodation",
    category: "Transit & Housing",
    icon: Bus,
    members: ["Praveen", "Rahul", "Raghu B", "Pradeep Bhimappa"],
  },
  {
    name: "Registration",
    category: "Desk & Onboarding",
    icon: ClipboardCheck,
    members: ["Deekshitha KP", "Inchara N", "Anas Shareef", "MD Ashraf"],
  },
  {
    name: "Cultural Events",
    category: "Ceremony & Entertainment",
    icon: Sparkles,
    members: [
      "Bindu J",
      "Bhoomika H Aradhya",
      "Geethanjali",
      "Poorvika B S",
      "Kyathangouda",
    ],
  },
  {
    name: "Documentation",
    category: "Reporting & Records",
    icon: FileText,
    members: ["Komal Kirthi Mittal B", "Ganavi K P"],
  },
];

export default function CrewPage() {
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("ALL");
  const [activeModalMember, setActiveModalMember] = useState<CrewMember | null>(null);

  const filteredStudents =
    selectedRoleFilter === "ALL"
      ? CREW_STUDENTS
      : CREW_STUDENTS.filter(
          (c) => c.role.toLowerCase() === selectedRoleFilter.toLowerCase()
        );

  const roleFilters = [
    { label: "All Crew", value: "ALL" },
    { label: "Presidents", value: "President" },
    { label: "Vice Presidents", value: "Vice President" },
    { label: "Secretaries", value: "Secretary" },
    { label: "Joint Secretaries", value: "Joint Secretary" },
  ];

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
              <span className="text-[#D83A43]">Crew</span>
            </div>

            <Link
              href="/coordinator"
              className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-mono uppercase tracking-wider text-[#D6C8C8] transition-all hover:border-[#B52A32] hover:bg-[#B52A32]/10 hover:text-white"
            >
              <span>View Faculty Coordinators</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#D83A43] transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* ── Hero / Header ── */}
          <div className="mb-14 md:mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#B52A32]/40 bg-[#B52A32]/10 px-3.5 py-1 text-xs font-mono uppercase tracking-[0.25em] text-[#F07C84] mb-4">
              <Users className="h-3.5 w-3.5 text-[#F07C84]" />
              Mission Operatives &amp; Technical Squad
            </div>
            <h1 className="display text-4xl sm:text-6xl md:text-7xl font-bold leading-[0.95] tracking-tight text-white max-w-4xl">
              THE CREW
              <br />
              <span className="text-[#A8A8A8]">BEHIND THE MISSION.</span>
            </h1>
            <p className="mt-5 max-w-3xl text-sm sm:text-base md:text-lg text-[#A8A8A8] leading-relaxed">
              Meet the student coordinators, organizers, and development team driving Hackmitten 3.0. Click on any member's photo to view detailed assignments, operational roles, branch, section, and semester details.
            </p>

            {/* Role Filter Tabs */}
            <div className="mt-8 flex flex-wrap gap-2">
              {roleFilters.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setSelectedRoleFilter(tab.value)}
                  className={`rounded-full px-4 py-1.5 text-xs font-mono uppercase tracking-wider transition-all ${
                    selectedRoleFilter === tab.value
                      ? "bg-[#B52A32] text-white shadow-[0_0_20px_rgba(181,42,50,0.5)]"
                      : "border border-white/10 bg-white/5 text-[#A8A8A8] hover:border-white/20 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Student Coordinators Grid ── */}
          <div className="mb-24">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="mono whitespace-nowrap text-xs uppercase tracking-[0.3em] text-[#D83A43]">
                  / Student Coordinators Directory
                </span>
                <div className="h-px w-24 sm:w-48 bg-white/10" />
              </div>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active Lines
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredStudents.map((coord) => (
                <div
                  key={coord.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#080808] transition-all duration-300 hover:border-[#B52A32]/60 hover:shadow-[0_10px_35px_-10px_rgba(181,42,50,0.4)]"
                >
                  <div>
                    {/* Photo with Overlay & Click for Details Trigger */}
                    <button
                      type="button"
                      onClick={() => setActiveModalMember(coord)}
                      className="relative block w-full aspect-[4/5] overflow-hidden bg-[#151515] text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D83A43]"
                      title={`Click to view roles & academic details for ${coord.name}`}
                    >
                      <img
                        src={coord.image}
                        alt={coord.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent opacity-90" />

                      {/* Click overlay indicator on hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]">
                        <span className="rounded-full bg-[#B52A32] px-3.5 py-1.5 text-xs font-mono font-semibold tracking-wider text-white shadow-lg flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          View Details
                        </span>
                      </div>

                      {/* Department Tag */}
                      <div className="absolute top-3 right-3 rounded-full border border-white/15 bg-black/60 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[#D6C8C8] backdrop-blur-md">
                        {coord.department}
                      </div>

                      {/* Role Badge */}
                      <div className="absolute bottom-3 left-3 rounded-md bg-[#B52A32]/80 px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-wider text-white backdrop-blur">
                        {coord.role}
                      </div>
                    </button>

                    {/* Member Details */}
                    <div className="p-4 sm:p-5">
                      <h3
                        onClick={() => setActiveModalMember(coord)}
                        className="display text-lg font-bold tracking-tight text-white group-hover:text-[#F07C84] transition-colors cursor-pointer"
                      >
                        {coord.name}
                      </h3>
                      <div className="mt-1 flex items-center justify-between text-xs font-mono text-[#A8A8A8]">
                        <span>Dept. of {coord.department}</span>
                        {coord.phone && (
                          <span className="text-[#D6C8C8]">+91 {coord.phone}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact Action Bar */}
                  <div className="p-4 sm:p-5 pt-0 border-t border-white/5 mt-auto">
                    <div className="grid grid-cols-2 gap-2 pt-3">
                      {coord.phone && (
                        <>
                          <a
                            href={`tel:${coord.phone}`}
                            className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-2 text-xs font-mono font-medium text-white transition-colors hover:border-[#B52A32] hover:bg-[#B52A32]/20"
                            title={`Call ${coord.name}`}
                          >
                            <Phone className="h-3.5 w-3.5 text-[#D83A43]" />
                            Call
                          </a>
                          <a
                            href={`https://wa.me/91${coord.phone}?text=Hi%20${encodeURIComponent(
                              coord.name
                            )},%20I%20have%20an%20inquiry%20regarding%20HackMITTEN%203.0`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 rounded-lg border border-[#22C55E]/30 bg-[#22C55E]/10 py-2 text-xs font-mono font-medium text-white transition-colors hover:bg-[#22C55E]/20"
                            title={`WhatsApp ${coord.name}`}
                          >
                            <MessageSquare className="h-3.5 w-3.5 text-[#22C55E]" />
                            WhatsApp
                          </a>
                        </>
                      )}

                      {coord.email && !coord.phone && (
                        <a
                          href={`mailto:${coord.email}`}
                          className="col-span-2 flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-2 text-xs font-mono font-medium text-white transition-colors hover:border-[#B52A32] hover:bg-[#B52A32]/20"
                        >
                          <Mail className="h-3.5 w-3.5 text-[#D83A43]" />
                          Email
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Developing & Design Team ── */}
          <div className="mb-24">
            <div className="mb-8 flex items-center gap-4">
              <span className="mono whitespace-nowrap text-xs uppercase tracking-[0.3em] text-[#D83A43]">
                / Developing &amp; Technical Team
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
              {CREW_DEVELOPERS.map((dev) => (
                <div
                  key={dev.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#080808] p-3 transition-all duration-300 hover:border-[#B52A32]/60 hover:shadow-[0_10px_35px_-10px_rgba(181,42,50,0.4)]"
                >
                  <div>
                    {/* Photo with Click to View Details */}
                    <button
                      type="button"
                      onClick={() => setActiveModalMember(dev)}
                      className="relative block w-full aspect-[4/5] overflow-hidden rounded-xl bg-[#151515] text-left cursor-pointer focus:outline-none"
                      title={`Click to view details for ${dev.name}`}
                    >
                      <img
                        src={dev.image}
                        alt={dev.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent opacity-80" />
                      
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]">
                        <span className="rounded-full bg-[#B52A32] px-2.5 py-1 text-[10px] font-mono font-semibold tracking-wider text-white shadow-lg">
                          Details
                        </span>
                      </div>
                    </button>

                    <div className="pt-3 pb-1">
                      <h4
                        onClick={() => setActiveModalMember(dev)}
                        className="display text-sm font-bold text-white group-hover:text-[#F07C84] transition-colors truncate cursor-pointer"
                      >
                        {dev.name}
                      </h4>
                      <p className="text-[11px] font-mono uppercase tracking-wider text-[#D83A43]">
                        {dev.role}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 border-t border-white/5 pt-2.5">
                    {dev.linkedin && (
                      <a
                        href={dev.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[#A8A8A8] transition-colors hover:border-[#0A66C2] hover:text-[#4DA3FF]"
                        title="LinkedIn Profile"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    )}
                    {dev.github && (
                      <a
                        href={dev.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[#A8A8A8] transition-colors hover:border-white/40 hover:text-white"
                        title="GitHub Profile"
                      >
                        <Github className="h-4 w-4" />
                      </a>
                    )}
                    {dev.phone && (
                      <a
                        href={`tel:${dev.phone}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[#A8A8A8] transition-colors hover:border-[#22C55E] hover:text-[#22C55E]"
                        title={`Call ${dev.phone}`}
                      >
                        <Phone className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Committee Organising Teams Section ── */}
          <div className="mb-24">
            <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <div className="mono mb-2 text-xs uppercase tracking-[0.3em] text-[#D83A43]">
                  / Operational Units &amp; Desks
                </div>
                <h2 className="display text-3xl sm:text-5xl font-bold tracking-tight text-white">
                  COMMITTEE ORGANISING TEAMS
                </h2>
                <p className="mt-2 text-sm sm:text-base text-[#A8A8A8] max-w-2xl leading-relaxed">
                  Specialized student taskforces and operational committees driving execution across logistics, stagecraft, hospitality, technical infrastructure, and coordination for Hackmitten 3.0.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                13 Operational Committees
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {EVENT_COMMITTEES.map((committee, idx) => {
                const IconComponent = committee.icon;
                return (
                  <div
                    key={idx}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#080808] p-6 transition-all duration-300 hover:border-[#B52A32]/60 hover:shadow-[0_10px_35px_-10px_rgba(181,42,50,0.35)]"
                  >
                    <div>
                      {/* Top Header of Committee Card */}
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
                          {committee.members.length}
                        </span>
                      </div>

                      {/* Member Names Roster */}
                      <div className="pt-4">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-[#A8A8A8] mb-2.5">
                          Assigned Members
                        </div>
                        <ul className="space-y-1.5">
                          {committee.members.map((member, mIdx) => (
                            <li
                              key={mIdx}
                              className="flex items-center gap-2 text-xs sm:text-sm text-white/90 group/member hover:text-white transition-colors"
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-[#B52A32] group-hover/member:scale-125 transition-transform" />
                              <span className="font-medium tracking-wide">
                                {member}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Bottom Status Pill */}
                    <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-[#A8A8A8]">
                      <span>Operational Desk</span>
                      <span className="text-emerald-400">● Active</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Helpdesk / Registration CTA ── */}
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0c0506] to-[#040404] p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-[#B52A32]/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#F07C84]">
                <Code2 className="h-4 w-4" />
                24/7 Event Operational Readiness
              </div>
              <h2 className="display text-2xl sm:text-4xl font-bold text-white leading-tight">
                Have questions before entering the arena?
              </h2>
              <p className="text-sm sm:text-base text-[#A8A8A8] leading-relaxed">
                Whether you need assistance regarding problem statements, team formation, campus accommodation, or transit guidelines, our student coordinators are active and ready to support you.
              </p>

              <div className="pt-2 flex flex-wrap gap-4">
                <Link
                  href="/coordinator"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#B52A32] px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-[#8B1E24] hover:shadow-[0_0_30px_rgba(181,42,50,0.5)]"
                >
                  <Users className="h-4 w-4" />
                  View Faculty Mentors &amp; HODs
                </Link>

                <Link
                  href="/venue"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-all hover:border-[#B52A32] hover:bg-[#B52A32]/10"
                >
                  <span>Explore Venue &amp; Directions</span>
                  <ArrowRight className="h-4 w-4 text-[#D83A43]" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── INTERACTIVE CREW MEMBER DETAILS MODAL ── */}
      {activeModalMember && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveModalMember(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-[#0a0607] p-6 sm:p-8 text-white shadow-[0_20px_60px_-15px_rgba(181,42,50,0.4)] overflow-hidden"
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => setActiveModalMember(null)}
              className="absolute right-4 top-4 rounded-full p-2 text-[#A8A8A8] transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close details"
            >
              <X size={20} />
            </button>

            {/* Header / Avatar */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 border-b border-white/10 pb-6">
              <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-2xl border-2 border-[#B52A32]/70 shadow-[0_0_25px_rgba(181,42,50,0.35)]">
                <img
                  src={activeModalMember.image}
                  alt={activeModalMember.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="text-center sm:text-left space-y-1 sm:pr-8">
                <div className="mono text-[10px] uppercase tracking-[0.25em] text-[#E07179]">
                  Member Profile
                </div>
                <h3 className="display text-xl sm:text-2xl font-bold text-white">
                  {activeModalMember.name}
                </h3>
                <div className="inline-block rounded-md bg-[#B52A32]/25 border border-[#B52A32]/40 px-2.5 py-0.5 text-xs font-mono font-semibold text-[#F07C84]">
                  {activeModalMember.role}
                </div>
              </div>
            </div>

            {/* Assigned Teams / Functional Roles */}
            <div className="py-5 space-y-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#E07179] font-bold">
                <Layers className="w-4 h-4 text-[#D83A43]" />
                Assigned Teams &amp; Functional Roles
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {activeModalMember.teams.map((team, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#B52A32]/40 bg-[#B52A32]/15 px-3 py-1 text-xs font-mono font-medium text-white"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E5535D]" />
                    {team}
                  </span>
                ))}
              </div>
            </div>

            {/* Academic Information: Branch, Section, Semester */}
            <div className="py-5 space-y-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#E07179] font-bold">
                <GraduationCap className="w-4 h-4 text-[#D83A43]" />
                Academic Details
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#A8A8A8]">
                    Branch
                  </div>
                  <div className="mt-1 font-display font-bold text-sm sm:text-base text-white">
                    {activeModalMember.department}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#A8A8A8]">
                    Section
                  </div>
                  <div className="mt-1 font-display font-bold text-sm sm:text-base text-white">
                    {activeModalMember.section}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#A8A8A8]">
                    Semester
                  </div>
                  <div className="mt-1 font-display font-bold text-sm sm:text-base text-white">
                    {activeModalMember.semester}
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Connect Actions */}
            <div className="pt-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#E07179] font-bold">
                <Phone className="w-4 h-4 text-[#D83A43]" />
                Direct Communication
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {activeModalMember.phone && (
                  <>
                    <a
                      href={`tel:${activeModalMember.phone}`}
                      className="flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-xs font-mono text-white hover:bg-white/10 hover:border-[#B52A32] transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#D83A43]" />
                      Call (+91 {activeModalMember.phone})
                    </a>

                    <a
                      href={`https://wa.me/91${activeModalMember.phone}?text=Hi%20${encodeURIComponent(
                        activeModalMember.name
                      )},%20I%20have%20an%20inquiry%20regarding%20HackMITTEN%203.0`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 px-4 py-2.5 text-xs font-mono text-white hover:bg-[#22C55E]/25 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#22C55E]" />
                      WhatsApp Chat
                    </a>
                  </>
                )}

                {activeModalMember.email && (
                  <a
                    href={`mailto:${activeModalMember.email}`}
                    className={`flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-xs font-mono text-white hover:border-[#B52A32] transition-colors ${
                      !activeModalMember.phone ? "sm:col-span-2" : "sm:col-span-2"
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5 text-[#D83A43]" />
                    {activeModalMember.email}
                  </a>
                )}

                {activeModalMember.linkedin && (
                  <a
                    href={activeModalMember.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#0A66C2]/15 border border-[#0A66C2]/30 px-4 py-2.5 text-xs font-mono text-white hover:bg-[#0A66C2]/25 transition-colors"
                  >
                    <Linkedin className="w-3.5 h-3.5 text-[#4DA3FF]" />
                    LinkedIn Profile
                  </a>
                )}

                {activeModalMember.github && (
                  <a
                    href={activeModalMember.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/15 px-4 py-2.5 text-xs font-mono text-white hover:bg-white/10 transition-colors"
                  >
                    <Github className="w-3.5 h-3.5 text-white" />
                    GitHub Profile
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
