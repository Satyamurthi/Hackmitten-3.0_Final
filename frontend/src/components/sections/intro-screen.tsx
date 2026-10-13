"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { resolveSponsors } from "@/data/sponsors";
import { getSponsorLogoUrl, SponsorItem } from "./sponsors";
import { Sparkles, ArrowRight, Pause } from "lucide-react";

export function IntroScreen() {
  const [stage, setStage] = useState<"visible" | "exiting" | "gone">("visible");
  const [isHolding, setIsHolding] = useState(false);

  const isHoldingRef = useRef(false);
  isHoldingRef.current = isHolding;

  const elapsedRef = useRef(0);
  const totalDuration = 4500; // 4.5s comfortable viewing window before smooth animated glide
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Fetch dynamic sponsors from API (fresh data so admin changes reflect immediately)
  const { data } = useQuery<{ sponsors?: SponsorItem[] }>({
    queryKey: ["public-sponsors"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/sponsors");
        if (res.ok) return await res.json();
      } catch {}
      const backend = (
        process.env.NEXT_PUBLIC_BACKEND_API_ORIGIN ||
        "https://hackmitten-3-0-api.mitt.edu.in"
      ).replace(/\/$/, "");
      try {
        const res = await fetch(`${backend}/api/sponsors`);
        if (res.ok) return await res.json();
      } catch {}
      return { sponsors: [] };
    },
    staleTime: 5_000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const staticSponsors: SponsorItem[] = resolveSponsors();
  const dbSponsors: SponsorItem[] = (data?.sponsors ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    logoUrl: getSponsorLogoUrl(s.logoUrl),
    websiteUrl: s.websiteUrl ?? null,
    tier: s.tier,
    customTier: s.customTier ?? null,
    sortOrder: s.sortOrder ?? 0,
  }));

  const sponsorMap = new Map<string, SponsorItem>();
  staticSponsors.forEach((s) => sponsorMap.set(s.name.toLowerCase().trim(), s));
  dbSponsors.forEach((s) => sponsorMap.set(s.name.toLowerCase().trim(), s));
  const allSponsors = Array.from(sponsorMap.values());

  const departmentLogos = [
    { name: "Dept. of CSE", logo: "/images/sponsors/cse.png" },
    { name: "Dept. of AI & ML", logo: "/images/sponsors/aiml.png" },
  ];

  // Filter out academic departments
  const unifiedSponsors = allSponsors.filter((s) => {
    const name = s.name.toLowerCase().trim();
    const custom = (s.customTier ?? "").toLowerCase().trim();
    if (
      name === "cse" ||
      name === "ai&ml" ||
      name.includes("department") ||
      custom.includes("department")
    )
      return false;
    return true;
  });

  // Strict Sequence: 1. VigyanLabs  2. CYNEFIAN Pvt. Ltd.  3. SJCE-STEP  4. 1by0grit.com  5. Admin sponsors
  const getSponsorPriority = (name: string): number => {
    const n = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (n.includes("vigyan")) return 1;
    if (n.includes("cynefian")) return 2;
    if (n.includes("step") || n.includes("sjce") || n.includes("suce")) return 3;
    if (n.includes("1by0") || n.includes("grit")) return 4;
    return 100;
  };

  const getDisplayName = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes("suce") || lower.includes("step")) return "SJCE-STEP";
    return name;
  };

  unifiedSponsors.sort((a, b) => {
    const pA = getSponsorPriority(a.name);
    const pB = getSponsorPriority(b.name);
    if (pA !== pB) return pA - pB;
    return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
  });

  // Body scroll lock while intro is active
  useEffect(() => {
    if (stage !== "gone") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [stage]);

  // Global pointer release listeners
  useEffect(() => {
    const handleRelease = () => {
      if (isHoldingRef.current) {
        setIsHolding(false);
      }
    };
    window.addEventListener("pointerup", handleRelease);
    window.addEventListener("pointercancel", handleRelease);
    window.addEventListener("mouseup", handleRelease);
    window.addEventListener("touchend", handleRelease);
    return () => {
      window.removeEventListener("pointerup", handleRelease);
      window.removeEventListener("pointercancel", handleRelease);
      window.removeEventListener("mouseup", handleRelease);
      window.removeEventListener("touchend", handleRelease);
    };
  }, []);

  // 60fps GPU requestAnimationFrame timer with pause-on-hold
  useEffect(() => {
    const isReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isReduced) {
      setStage("gone");
      return;
    }

    let lastTime = performance.now();
    let animId: number;

    const tick = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;

      if (!isHoldingRef.current && stage === "visible") {
        elapsedRef.current += delta;
        const pct = Math.min(100, (elapsedRef.current / totalDuration) * 100);
        if (progressBarRef.current) {
          progressBarRef.current.style.width = `${pct}%`;
        }
        if (elapsedRef.current >= totalDuration) {
          setStage("exiting");
          return;
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [stage]);

  // Smooth unmount after exit transition completes
  useEffect(() => {
    if (stage === "exiting") {
      const timer = setTimeout(() => {
        setStage("gone");
      }, 820);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  if (stage === "gone") return null;

  const isExiting = stage === "exiting";

  return (
    <>
      <style>{`
        /* Antigravity Arrival: Left Logo floats in smoothly from deep left and settles */
        @keyframes antigravityLeftIn {
          0% {
            opacity: 0;
            transform: translate3d(-48px, 8px, 0) scale(0.88);
          }
          70% {
            transform: translate3d(4px, -2px, 0) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        /* Antigravity Arrival: Right Logo floats in smoothly from deep right and settles */
        @keyframes antigravityRightIn {
          0% {
            opacity: 0;
            transform: translate3d(48px, 8px, 0) scale(0.88);
          }
          70% {
            transform: translate3d(-4px, -2px, 0) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        /* College Title: smooth cosmic reveal and settle */
        @keyframes antigravityTitleIn {
          0% {
            opacity: 0;
            transform: translate3d(0, -18px, 0) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        /* Hackmitten 3.0 Centerpiece: arrives from deep cosmic space */
        @keyframes antigravityCoreIn {
          0% {
            opacity: 0;
            transform: translate3d(0, 24px, 0) scale(0.92);
          }
          70% {
            transform: translate3d(0, -3px, 0) scale(1.01);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        /* Sponsor & Department Logos: float up weightlessly and settle into orbit */
        @keyframes antigravitySponsorIn {
          0% {
            opacity: 0;
            transform: translate3d(0, 36px, 0) scale(0.82);
          }
          70% {
            transform: translate3d(0, -4px, 0) scale(1.03);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        /* Weightless subtle floating once in place */
        @keyframes antigravityFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -3px, 0);
          }
        }

        @keyframes antigravityFloatAlt {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, 3px, 0);
          }
        }
      `}</style>

      {/* Full-Screen Opening Intro Overlay with Hold-to-Stay & Buttery GPU Slide Transition */}
      <div
        id="intro-screen"
        onPointerDown={() => setIsHolding(true)}
        onPointerUp={() => setIsHolding(false)}
        className={`fixed inset-0 z-[100] h-[100dvh] max-h-[100dvh] flex flex-col justify-between overflow-hidden bg-[#030303] text-white select-none ${
          isExiting ? "pointer-events-none" : "cursor-pointer"
        }`}
        style={{
          transform: isExiting
            ? "translate3d(0, -100%, 0)"
            : "translate3d(0, 0, 0)",
          opacity: isExiting ? 0 : 1,
          transition:
            "transform 780ms cubic-bezier(0.16, 1, 0.3, 1), opacity 700ms cubic-bezier(0.16, 1, 0.3, 1)",
          willChange: "transform, opacity",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
        }}
      >
        {/* Clean Static Radial Glow Background */}
        <div
          className="absolute inset-0 pointer-events-none -z-10"
          style={{
            background:
              "radial-gradient(circle at 50% 32%, rgba(216,58,67,0.26) 0%, rgba(139,30,36,0.12) 38%, rgba(3,3,3,0.98) 72%, #030303 100%)",
          }}
        />

        {/* Subtle Background Grid */}
        <div
          className="absolute inset-0 pointer-events-none -z-10 opacity-15"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Top Control Bar with Skip Button & Hold Status */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 pt-2.5 sm:pt-3.5 flex items-center justify-between z-30 shrink-0">
          <div className="flex items-center gap-2">
            {isHolding && (
              <span className="inline-flex items-center gap-1 mono text-[8px] sm:text-[9px] uppercase tracking-wider text-white bg-[#B52A32] px-2.5 py-0.5 rounded-full shadow-[0_0_12px_rgba(216,58,67,0.7)] animate-pulse">
                <Pause size={10} />
                Holding • Stays Here
              </span>
            )}
          </div>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setStage("exiting");
            }}
            className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/80 px-3.5 py-1 text-[9px] sm:text-xs font-mono tracking-wider text-white/80 hover:text-white hover:border-[#D83A43] hover:bg-[#D83A43]/20 transition-all cursor-pointer shadow-lg ml-auto"
            aria-label="Skip Introduction"
          >
            <span>SKIP</span>
            <ArrowRight size={12} />
          </button>
        </div>

        {/* ────────────────────────────────────────────────────────────────
            1. TOP SECTION: Antigravity Logo Arrival & College Branding
            ──────────────────────────────────────────────────────────────── */}
        <header className="w-full max-w-7xl mx-auto pt-1 sm:pt-2 px-4 sm:px-8 flex items-center justify-between shrink-0 gap-3 sm:gap-6">
          {/* Left: MIT Thandavapura Logo (Antigravity arrival from left -> settles) */}
          <div
            className="flex items-center shrink-0"
            style={{
              animation: "antigravityLeftIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) both",
            }}
          >
            <div
              className="h-14 w-14 sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-28 lg:w-28 rounded-full bg-white/10 p-1.5 ring-2 ring-white/35 shadow-[0_0_36px_rgba(255,255,255,0.22)]"
              style={{
                animation: "antigravityFloat 3.8s ease-in-out 0.8s infinite",
              }}
            >
              <img
                src="/images/college_logo/MITT_LOGO.jpeg"
                alt="Maharaja Institute of Technology Thandavapura Logo"
                className="h-full w-full object-contain rounded-full"
              />
            </div>
          </div>

          {/* Center: Host College Name (Reveals and settles) */}
          <div
            className="text-center px-2 flex-1 max-w-3xl"
            style={{
              animation: "antigravityTitleIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both",
            }}
          >
            <h2 className="display text-xs sm:text-lg md:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight uppercase">
              Maharaja Institute of Technology Thandavapura
            </h2>
          </div>

          {/* Right: 10-Year Excellence Logo (Antigravity arrival from right -> settles) */}
          <div
            className="flex items-center shrink-0"
            style={{
              animation: "antigravityRightIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) both",
            }}
          >
            <div
              className="h-14 w-14 sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-28 lg:w-28 rounded-full bg-black/60 p-1.5 ring-2 ring-[#D83A43]/85 shadow-[0_0_36px_rgba(216,58,67,0.45)]"
              style={{
                animation: "antigravityFloatAlt 3.8s ease-in-out 0.8s infinite",
              }}
            >
              <img
                src="/images/college_logo/Ten_Year_Excellence.jpeg"
                alt="10 Years of Academic Excellence"
                className="h-full w-full object-contain rounded-full"
              />
            </div>
          </div>
        </header>

        {/* ────────────────────────────────────────────────────────────────
            2. CENTER SECTION: HACKMITTEN 3.0 & Academic Departments
            ──────────────────────────────────────────────────────────────── */}
        <main
          className="w-full max-w-4xl mx-auto px-4 text-center my-auto py-1 sm:py-2 flex flex-col items-center justify-center shrink-0"
          style={{
            animation: "antigravityCoreIn 0.85s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both",
          }}
        >
          {/* Hackathon Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#B52A32]/60 bg-[#B52A32]/20 px-3 py-0.5 sm:px-4 sm:py-1 text-[8px] sm:text-[10px] mono uppercase tracking-widest text-[#D83A43] mb-1 sm:mb-2 shadow-[0_0_18px_rgba(216,58,67,0.3)]">
            <Sparkles size={11} className="text-[#D83A43]" />
            <span>National Level 24-Hour Hackathon</span>
          </div>

          {/* Main Title */}
          <h1 className="display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-none">
            HACKMITTEN{" "}
            <span
              className="text-[#D83A43]"
              style={{
                textShadow:
                  "0 0 24px rgba(216,58,67,0.9), 0 0 50px rgba(181,42,50,0.6)",
              }}
            >
              3.0
            </span>
          </h1>

          <p className="mono text-[8px] sm:text-[10px] md:text-xs uppercase tracking-[0.25em] text-[#A8A8A8] mt-1 sm:mt-1.5">
            Ideas Beyond The Horizon
          </p>

          {/* Organizing Academic Departments */}
          <div className="mt-2.5 sm:mt-3.5 pt-2 sm:pt-2.5 border-t border-white/10 max-w-md w-full mx-auto">
            <span className="mono text-[7px] sm:text-[8px] uppercase tracking-widest text-[#A8A8A8] block mb-1.5 font-semibold">
              Organized By Departments Of
            </span>
            <div className="flex items-center justify-center gap-3.5 sm:gap-6">
              {departmentLogos.map((dept, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 sm:gap-2.5 bg-white/5 border border-white/15 rounded-full py-0.5 sm:py-1 px-3 sm:px-4 shadow-sm"
                  style={{
                    animation: `antigravitySponsorIn 0.75s cubic-bezier(0.16, 1, 0.3, 1) ${
                      0.2 + i * 0.08
                    }s both`,
                  }}
                >
                  <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-white p-0.5 sm:p-1 flex items-center justify-center shrink-0 shadow-sm">
                    <img
                      src={dept.logo}
                      alt={dept.name}
                      className="h-full w-full object-contain rounded-full"
                    />
                  </div>
                  <span className="mono text-[8px] sm:text-[10px] uppercase font-bold text-white tracking-wider whitespace-nowrap">
                    {dept.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* ────────────────────────────────────────────────────────────────
            3. BOTTOM SECTION: ANTIGRAVITY SPONSOR LOGOS (Float in -> Settle in place)
            ──────────────────────────────────────────────────────────────── */}
        <footer className="w-full max-w-6xl mx-auto pb-2 sm:pb-3.5 px-3 sm:px-6 shrink-0">
          <div className="rounded-2xl border border-white/15 bg-[#080808]/95 p-2.5 sm:p-4 shadow-2xl">
            {/* Header label */}
            <div className="mono text-[8px] sm:text-[10px] uppercase tracking-[0.25em] text-[#A8A8A8] text-center mb-2 sm:mb-2.5 font-semibold flex items-center justify-center gap-3">
              <span className="h-px w-10 sm:w-16 bg-white/15" />
              <span>Sponsors & Partners</span>
              <span className="h-px w-10 sm:w-16 bg-white/15" />
            </div>

            {/* Antigravity Float In -> Settle in place */}
            <div className="flex flex-wrap items-end justify-center gap-3 sm:gap-5 md:gap-6">
              {unifiedSponsors.map((sponsor, index) => {
                const displayName = getDisplayName(sponsor.name);
                return (
                  <div
                    key={sponsor.id}
                    className="group flex flex-col items-center cursor-pointer"
                    style={{
                      animation: `antigravitySponsorIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${
                        0.25 + index * 0.05
                      }s both`,
                    }}
                    title={displayName}
                  >
                    {/* Large Circular Emblem Logo Container with subtle weightless hover */}
                    <div
                      className="h-12 w-12 sm:h-15 sm:w-15 md:h-17 md:w-17 rounded-full bg-white p-1.5 sm:p-2 flex items-center justify-center ring-2 ring-white/25 shadow-lg transition-all duration-300 group-hover:scale-115 group-hover:ring-2 group-hover:ring-[#D83A43] group-hover:shadow-[0_0_26px_rgba(216,58,67,0.6)]"
                      style={{
                        animation: `antigravityFloat 3.6s ease-in-out ${
                          0.8 + (index % 3) * 0.4
                        }s infinite`,
                      }}
                    >
                      <img
                        src={sponsor.logoUrl}
                        alt={displayName}
                        className="h-full w-full object-contain rounded-full"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.dataset.tried) {
                            target.dataset.tried = "1";
                            if (sponsor.logoUrl.includes("/uploads/")) {
                              const uploadPath = sponsor.logoUrl.substring(
                                sponsor.logoUrl.indexOf("/uploads/")
                              );
                              target.src = `/api${uploadPath}`;
                            }
                          } else if (target.dataset.tried === "1") {
                            target.dataset.tried = "2";
                            if (sponsor.logoUrl.includes("/uploads/")) {
                              const uploadPath = sponsor.logoUrl.substring(
                                sponsor.logoUrl.indexOf("/uploads/")
                              );
                              target.src = uploadPath;
                            }
                          }
                        }}
                      />
                    </div>

                    {/* Sponsor Name clearly shown BELOW the logo */}
                    <span className="mono text-[8px] sm:text-[10px] md:text-[11px] font-semibold text-white/90 text-center tracking-wide mt-1.5 max-w-[72px] sm:max-w-[95px] md:max-w-[115px] truncate block leading-tight group-hover:text-white group-hover:text-[#D83A43] transition-colors">
                      {displayName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </footer>

        {/* ────────────────────────────────────────────────────────────────
            4. TIMED PROGRESS BAR AT THE BOTTOM EDGE
            ──────────────────────────────────────────────────────────────── */}
        <div className="w-full h-1 bg-white/10 overflow-hidden shrink-0">
          <div
            ref={progressBarRef}
            className="h-full w-0 bg-gradient-to-r from-[#B52A32] via-[#D83A43] to-white shadow-[0_0_12px_rgba(216,58,67,0.8)]"
          />
        </div>
      </div>
    </>
  );
}
