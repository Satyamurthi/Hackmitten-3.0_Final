"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Countdown } from "./countdown";
import { useEventState } from "@/components/auth/use-event-state";
import { useRegistrationModal } from "@/components/public/use-registration-modal";
import { resolveSponsors } from "@/data/sponsors";
import { getSponsorLogoUrl, SponsorItem } from "./sponsors";

export type HeroStage =
  | "blank"          // 1. blank screen with starry background
  | "college-center" // 2. college name in center large
  | "college-move"   // 3. college name glides smoothly to its designated place
  | "logos-center"   // 4. 2sec gap: 2 logos appear and glide to left/right
  | "inaugurate"     // 5. inaugurate HACKMITTEN 3.0 with glowing energy
  | "details"        // 6. ideas beyond horizon, 24h, and countdown timing
  | "complete";      // 7. nav bar, CTAs, and all functions active

export function Hero({
  startAnimation = false,
  onShowNav,
  onComplete,
}: {
  startAnimation?: boolean;
  onShowNav?: () => void;
  onComplete?: () => void;
} = {}) {
  const openRegistrationModal = useRegistrationModal((s) => s.open);
  const eventState = useEventState();
  const regOpen = eventState.data?.registrationOpen ?? false;
  const isFull =
    !!eventState.data &&
    eventState.data.registrationOpen &&
    (!eventState.data.registrationsOpen ||
      (eventState.data.registrationCapacity > 0 &&
        eventState.data.currentCount >= eventState.data.registrationCapacity));

  const [stage, setStage] = useState<HeroStage>("blank");
  const [collegeSettled, setCollegeSettled] = useState(false);
  const [logosSettled, setLogosSettled] = useState(false);
  const [isFast, setIsFast] = useState(false);

  // Guards to ensure animation runs reliably and cleans up safely
  const hasCompletedRef = useRef(false);
  const isFastRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const onShowNavRef = useRef(onShowNav);
  onShowNavRef.current = onShowNav;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const clearAllTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  const finish = useCallback(() => {
    hasCompletedRef.current = true;
    clearAllTimers();
    setStage("complete");
    setCollegeSettled(true);
    setLogosSettled(true);
    onShowNavRef.current?.();
    onCompleteRef.current?.();
  }, []);

  // When user scrolls or touches, automatically fast-forward the remaining stages
  const fastForward = useCallback(() => {
    if (hasCompletedRef.current) return;
    if (isFastRef.current) {
      // Second scroll interaction finishes immediately
      finish();
      return;
    }
    isFastRef.current = true;
    setIsFast(true);
    clearAllTimers();

    setCollegeSettled(true);
    setLogosSettled(true);

    // Rapidly cascade through the remaining steps (~120ms each)
    setStage((prev) => {
      if (prev === "blank" || prev === "college-center" || prev === "college-move") {
        const t1 = setTimeout(() => {
          setStage("inaugurate");
          const t2 = setTimeout(() => {
            setStage("details");
            const t3 = setTimeout(() => {
              finish();
            }, 140);
            timersRef.current.push(t3);
          }, 140);
          timersRef.current.push(t2);
        }, 120);
        timersRef.current.push(t1);
        return "logos-center";
      } else if (prev === "logos-center") {
        const t1 = setTimeout(() => {
          setStage("details");
          const t2 = setTimeout(() => {
            finish();
          }, 140);
          timersRef.current.push(t2);
        }, 120);
        timersRef.current.push(t1);
        return "inaugurate";
      } else if (prev === "inaugurate") {
        const t1 = setTimeout(() => {
          finish();
        }, 140);
        timersRef.current.push(t1);
        return "details";
      } else {
        finish();
        return "complete";
      }
    });
  }, [finish]);

  useEffect(() => {
    if (!startAnimation) return;
    if (hasCompletedRef.current) return;

    let isCancelled = false;
    clearAllTimers();

    const schedule = (fn: () => void, delay: number) => {
      const id = setTimeout(() => {
        if (!isCancelled && !hasCompletedRef.current) {
          fn();
        }
      }, delay);
      timersRef.current.push(id);
      return id;
    };

    // Stage 1: Blank background -> College Name in Center Large (150ms)
    schedule(() => {
      setStage("college-center");
    }, 150);

    // Stage 2: College Name glides to its header place (1300ms)
    schedule(() => {
      setStage("college-move");
      setCollegeSettled(true);
    }, 1300);

    // Stage 3: The 2 logos appear in center together, then glide to specific place (2200ms)
    schedule(() => {
      setStage("logos-center");
      schedule(() => {
        setLogosSettled(true);
      }, 750);
    }, 2200);

    // Stage 4: Inaugurate HACKMITTEN 3.0 (4200ms)
    schedule(() => {
      setStage("inaugurate");
    }, 4200);

    // Stage 5: Ideas beyond horizon, countdown, and sponsor logos (5300ms)
    schedule(() => {
      setStage("details");
    }, 5300);

    // Stage 6: Nav bar, CTAs, and all functions active (6400ms)
    schedule(() => {
      finish();
    }, 6400);

    // Safety fallback: if stage is still blank after 600ms, advance to college-center
    schedule(() => {
      setStage((prev) => (prev === "blank" ? "college-center" : prev));
    }, 600);

    // Absolute fallback: ensure complete and navbar visible within 8 seconds
    schedule(() => {
      if (!hasCompletedRef.current) {
        finish();
      }
    }, 8000);

    // Ignore passive scroll restoration events immediately after route navigation
    let scrollAllowed = false;
    const scrollAllowTimer = setTimeout(() => {
      scrollAllowed = true;
    }, 400);
    timersRef.current.push(scrollAllowTimer);

    const handleScrollOrTouch = (e: Event) => {
      if (hasCompletedRef.current) return;
      if (e.type === "scroll" && (!scrollAllowed || window.scrollY < 20)) return;
      fastForward();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        finish();
      } else if (
        ["ArrowDown", "ArrowUp", "PageDown", "PageUp", " ", "Home", "End"].includes(e.key)
      ) {
        if (!hasCompletedRef.current) {
          fastForward();
        }
      }
    };

    window.addEventListener("wheel", handleScrollOrTouch, { passive: true });
    window.addEventListener("touchmove", handleScrollOrTouch, { passive: true });
    window.addEventListener("scroll", handleScrollOrTouch, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      isCancelled = true;
      clearAllTimers();
      window.removeEventListener("wheel", handleScrollOrTouch);
      window.removeEventListener("touchmove", handleScrollOrTouch);
      window.removeEventListener("scroll", handleScrollOrTouch);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [startAnimation, finish, fastForward]);

  const heading = "HACKMITTEN";
  const edition = "3.0";
  const subtitle = "IDEAS BEYOND THE HORIZON | NATIONAL LEVEL HACKATHON";
  const subtitleLines = subtitle.split("|").map((s) => s.trim()).filter(Boolean);
  const description = "24 HOURS. BUILD. INNOVATE. CREATE.";
  const ctaText = "REGISTER NOW";

  // Dynamic + Static Sponsors (previously on intro page, now on hero)
  const { data: sponsorData } = useQuery<{ sponsors?: SponsorItem[] }>({
    queryKey: ["public-sponsors"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/sponsors");
        if (res.ok) return await res.json();
      } catch {}
      return { sponsors: [] };
    },
    staleTime: 30_000,
  });

  const staticSponsors = resolveSponsors().filter(
    (s) =>
      !s.name.toLowerCase().includes("cse") &&
      !s.name.toLowerCase().includes("ai&ml") &&
      s.customTier !== "Departments"
  );

  const dbSponsors = (sponsorData?.sponsors ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    logoUrl: getSponsorLogoUrl(s.logoUrl),
    websiteUrl: s.websiteUrl ?? null,
    tier: s.tier,
    customTier: s.customTier ?? null,
    sortOrder: s.sortOrder ?? 0,
  }));

  const sponsorMap = new Map<string, { id: string; name: string; logoUrl: string }>();
  staticSponsors.forEach((s) =>
    sponsorMap.set(s.name.toLowerCase().trim(), { id: s.id, name: s.name, logoUrl: s.logoUrl })
  );
  dbSponsors.forEach((s) =>
    sponsorMap.set(s.name.toLowerCase().trim(), { id: s.id, name: s.name, logoUrl: s.logoUrl })
  );
  const heroSponsors = Array.from(sponsorMap.values());

  const getPriority = (name: string): number => {
    const n = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (n.includes("vigyan")) return 1;
    if (n.includes("cynefian")) return 2;
    if (n.includes("step") || n.includes("sjce") || n.includes("suce")) return 3;
    if (n.includes("1by0") || n.includes("grit")) return 4;
    return 100;
  };

  const getCleanName = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes("suce") || lower.includes("step")) return "SJCE-STEP";
    return name;
  };

  heroSponsors.sort((a, b) => getPriority(a.name) - getPriority(b.name));

  // When complete, lock all elements visible permanently (prevents any invisible flash or reset)
  const isComplete = stage === "complete" || hasCompletedRef.current;
  const showCollege = isComplete || stage !== "blank";
  const showLogos = isComplete || (stage !== "blank" && stage !== "college-center" && stage !== "college-move");
  const showTitle = isComplete || stage === "inaugurate" || stage === "details";
  const showDetails = isComplete || stage === "details";
  const isCollegeSettled = isComplete || collegeSettled;
  const isLogosSettled = isComplete || logosSettled;

  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] flex-col items-center justify-center px-5 pt-24 md:pt-28 text-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#030303] pointer-events-none z-[1]" />

      {/* ─── SKIP INTRO BUTTON ─── */}
      {!isComplete && startAnimation && (
        <button
          type="button"
          onClick={finish}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border border-white/25 bg-black/70 px-4 py-2 text-xs font-mono tracking-widest text-white/90 backdrop-blur-md transition-all hover:border-[#D83A43] hover:text-white hover:bg-black/90 shadow-[0_0_24px_rgba(0,0,0,0.8)] cursor-pointer active:scale-95"
          aria-label="Skip intro animation"
        >
          <span>SKIP INTRO</span>
          <span>→</span>
        </button>
      )}

      {/* ─── SIDE COLLEGE LOGOS: Left (MITT) & Right (10 Years of Excellence) ─── */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-14 sm:top-16 md:top-20 z-20 px-4 sm:px-8 md:px-12 lg:px-16 flex items-center justify-between transition-opacity duration-700 [--pad:1rem] sm:[--pad:2rem] md:[--pad:3rem] lg:[--pad:4rem] ${
          showLogos ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Left Logo: Starts from center and glides smoothly to top-left */}
        <div
          className="pointer-events-auto will-change-transform"
          style={{
            transform: !isLogosSettled
              ? "translate3d(calc(50vw - 100% - var(--pad) - 12px), 24vh, 0) scale(1.35)"
              : "translate3d(0, 0, 0) scale(1)",
            transition: isFast
              ? "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), filter 0.35s ease-out"
              : "transform 1.25s cubic-bezier(0.16, 1, 0.3, 1), filter 1.25s ease-out",
            filter: !isLogosSettled
              ? "drop-shadow(0 0 35px rgba(255,255,255,0.45))"
              : "drop-shadow(0 0 15px rgba(255,255,255,0.15))",
          }}
        >
          <a
            href="https://mitt.edu.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="block transition-transform duration-200 hover:scale-105 focus:outline-none"
            aria-label="Maharaja Institute of Technology Thandavapura website"
          >
            <img
              src="/images/college_logo/MITT_LOGO.jpeg"
              alt="MITT Logo"
              className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-[112px] lg:w-[112px] xl:h-[124px] xl:w-[124px] rounded-full object-contain ring-2 ring-white/25 bg-white/10 p-1.5 backdrop-blur-md shadow-[0_0_36px_rgba(255,255,255,0.25)]"
            />
          </a>
        </div>

        {/* Right Logo: Starts from center and glides smoothly to top-right */}
        <div
          className="pointer-events-auto will-change-transform"
          style={{
            transform: !isLogosSettled
              ? "translate3d(calc(-50vw + 100% + var(--pad) + 12px), 24vh, 0) scale(1.35)"
              : "translate3d(0, 0, 0) scale(1)",
            transition: isFast
              ? "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), filter 0.35s ease-out"
              : "transform 1.25s cubic-bezier(0.16, 1, 0.3, 1), filter 1.25s ease-out",
            filter: !isLogosSettled
              ? "drop-shadow(0 0 35px rgba(216,58,67,0.65))"
              : "drop-shadow(0 0 18px rgba(216,58,67,0.3))",
          }}
        >
          <a
            href="https://mitt.edu.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="block transition-transform duration-200 hover:scale-105 focus:outline-none"
            aria-label="Maharaja Institute of Technology Thandavapura 10 Years of Excellence"
          >
            <img
              src="/images/college_logo/Ten_Year_Excellence.jpeg"
              alt="10 Years of Excellence"
              className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-[112px] lg:w-[112px] xl:h-[124px] xl:w-[124px] rounded-full object-contain ring-2 ring-[#B52A32]/70 bg-black/70 p-1.5 backdrop-blur-md shadow-[0_0_36px_rgba(216,58,67,0.45)]"
            />
          </a>
        </div>
      </div>

      <div className="hero-content-depth relative z-10 flex flex-col items-center w-full max-w-5xl">
        {/* ─── COLLEGE NAME: Appears Large in Center, then glides up to its place ─── */}
        <div
          className={`mb-2 md:mb-3 text-center px-4 max-w-5xl will-change-transform transition-all ${
            isFast ? "duration-300" : "duration-900"
          } ${showCollege ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          style={{
            transform: !isCollegeSettled
              ? "translate3d(0, 22vh, 0) scale(1.3)"
              : "translate3d(0, 0, 0) scale(1)",
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            zIndex: !isCollegeSettled ? 30 : "auto",
          }}
        >
          <a
            href="https://mitt.edu.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-block focus:outline-none"
            aria-label="Maharaja Institute of Technology Thandavapura website"
          >
            <p
              className={`display uppercase tracking-tight font-bold transition-all duration-500 leading-[1.15] cursor-pointer ${
                !isCollegeSettled
                  ? "text-xl sm:text-3xl md:text-4xl lg:text-5xl text-white drop-shadow-[0_0_35px_rgba(255,255,255,0.7)]"
                  : "text-sm sm:text-lg md:text-2xl lg:text-[1.85rem] text-white/90 group-hover:text-white group-hover:text-glow-red"
              }`}
            >
              Maharaja Institute of Technology Thandavapura
            </p>
          </a>
        </div>

        {/* 24 Hours Badge */}
        <div
          className={`mb-6 flex items-center gap-3 flex-wrap justify-center transition-all ${
            isFast ? "duration-300" : "duration-700"
          } ease-out ${
            showDetails ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          <span className="h-px w-8 md:w-10 bg-[#B52A32]" />
          <span className="mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-[#A8A8A8] text-center">
            24 Hours
          </span>
          <span className="h-px w-8 md:w-10 bg-[#B52A32]" />
        </div>

        {/* ─── INAUGURATE HACKMITTEN 3.0 ─── */}
        <div className="relative">
          {stage === "inaugurate" && (
            <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
              <div className="h-64 w-64 rounded-full border-2 border-[#D83A43]/80 animate-[shockwaveRing_1.4s_cubic-bezier(0.16,1,0.3,1)_forwards] shadow-[0_0_60px_rgba(216,58,67,0.6)]" />
              <div className="h-44 w-44 rounded-full bg-gradient-to-r from-[#D83A43]/40 via-[#B52A32]/30 to-transparent blur-2xl animate-[shockwaveRing_1.2s_cubic-bezier(0.16,1,0.3,1)_forwards]" />
            </div>
          )}
          <h1
            className={`hero-title display text-[11vw] sm:text-[9.5vw] md:text-[7.5vw] lg:text-[6.2rem] xl:text-[7rem] leading-[0.88] font-bold tracking-tight text-white transition-all ${
              isFast ? "duration-300" : "duration-1000"
            } ${
              !showTitle
                ? "opacity-0 scale-75 blur-sm"
                : stage === "inaugurate"
                ? "opacity-100 scale-100 blur-0 animate-[inaugurateBurst_1.2s_cubic-bezier(0.16,1,0.3,1)_both]"
                : "opacity-100 scale-100 blur-0"
            }`}
          >
            <span className="block">{heading}</span>
            <span className="hero-edition block text-[#B52A32] text-glow-red">{edition}</span>
          </h1>
        </div>

        {/* ─── SUBTITLE & DESCRIPTION ─── */}
        <div
          className={`transition-all ${
            isFast ? "duration-300" : "duration-700"
          } ease-out ${
            showDetails ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          <p className="display mt-3 md:mt-4 text-base sm:text-xl md:text-2xl font-light tracking-tight text-white/90">
            {subtitleLines.length > 1 ? (
              <>
                {subtitleLines[0]}
                <br />
                <span className="text-[#A8A8A8] text-sm sm:text-base md:text-xl">{subtitleLines[1]}</span>
              </>
            ) : (
              subtitle
            )}
          </p>

          <p className="mt-1.5 sm:mt-2 max-w-md mx-auto text-xs md:text-sm text-[#A8A8A8]">
            {description}
          </p>
        </div>

        {/* ─── TIMING COUNTDOWN (Lifted higher) ─── */}
        <div
          className={`transition-all ${
            isFast ? "duration-300" : "duration-700"
          } ease-out ${
            showDetails ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          <Countdown className="mt-2.5 sm:mt-3" />
        </div>

        {/* ─── SPONSORS & PARTNERS (From Intro Page) ─── */}
        <div
          className={`mt-4 sm:mt-5 transition-all ${
            isFast ? "duration-300" : "duration-1000"
          } ease-out ${
            showDetails ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6 pointer-events-none"
          }`}
        >
          <div className="flex flex-col items-center">
            <div className="mono text-[8px] sm:text-[9px] uppercase tracking-[0.25em] text-[#A8A8A8]/70 mb-2.5 font-medium flex items-center justify-center gap-2">
              <span className="h-px w-6 sm:w-8 bg-white/10" />
              <span>Sponsors & Partners</span>
              <span className="h-px w-6 sm:w-8 bg-white/10" />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-5 md:gap-6">
              {heroSponsors.map((s, index) => {
                const displayName = getCleanName(s.name);
                return (
                  <div
                    key={s.id}
                    className="group flex flex-col items-center will-change-transform"
                    title={displayName}
                    style={{
                      animation: showDetails && !isFast
                        ? `heroSponsorSlowIn 1.35s cubic-bezier(0.16, 1, 0.3, 1) ${
                            0.12 + index * 0.18
                          }s both`
                        : undefined,
                    }}
                  >
                    <div
                      className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white p-1.5 flex items-center justify-center ring-2 ring-white/20 shadow-md transition-all duration-300 group-hover:scale-110 group-hover:ring-[#D83A43] group-hover:shadow-[0_0_22px_rgba(216,58,67,0.5)]"
                      style={{
                        animation: showDetails && !isFast
                          ? `heroSponsorFloat 3.8s ease-in-out ${
                              1.6 + (index % 3) * 0.5
                            }s infinite`
                          : undefined,
                      }}
                    >
                      <img
                        src={s.logoUrl}
                        alt={displayName}
                        className="h-full w-full object-contain rounded-full"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.dataset.tried) {
                            target.dataset.tried = "1";
                            if (s.logoUrl.includes("/uploads/")) {
                              const uploadPath = s.logoUrl.substring(
                                s.logoUrl.indexOf("/uploads/")
                              );
                              target.src = `/api${uploadPath}`;
                            }
                          }
                        }}
                      />
                    </div>
                    <span className="mono text-[8px] sm:text-[9px] font-semibold text-white/80 text-center tracking-wide mt-1 max-w-[70px] sm:max-w-[85px] truncate block group-hover:text-[#D83A43] transition-colors">
                      {displayName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── CTA BUTTONS & ACTIONS ─── */}
        <div
          className={`mt-5 sm:mt-6 flex flex-col sm:flex-row gap-3 transition-all ${
            isFast ? "duration-300" : "duration-700"
          } ease-out ${
            isComplete
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-6 pointer-events-none"
          }`}
        >
          {regOpen && !isFull ? (
            <button
              type="button"
              onClick={() => openRegistrationModal("options")}
              className="hero-primary-cta group flex items-center justify-center gap-2 rounded-full bg-[#B52A32] px-6 md:px-8 py-3.5 text-sm font-semibold tracking-wide text-white transition-all hover:bg-[#D83A43] hover:shadow-[0_0_40px_-8px_rgba(216,58,67,0.8)] min-h-[44px]"
            >
              {ctaText}
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </button>
          ) : isFull ? (
            <div className="flex items-center justify-center gap-2 rounded-full border border-[#B52A32]/40 bg-[#B52A32]/10 px-6 md:px-8 py-3.5 text-sm font-semibold tracking-wide text-[#D83A43] min-h-[44px]">
              REGISTRATIONS FULL
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 md:px-8 py-3.5 text-sm font-semibold tracking-wide text-[#A8A8A8] min-h-[44px]">
              REGISTRATION CLOSED
            </div>
          )}
          <Link
            href="/about"
            className="flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 md:px-8 py-3.5 text-sm font-semibold tracking-wide text-white transition-all hover:border-white/40 hover:bg-white/5 min-h-[44px]"
          >
            EXPLORE
          </Link>
        </div>
      </div>
    </section>
  );
}

