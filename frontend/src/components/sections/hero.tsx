"use client";

import Link from "next/link";
import { Countdown } from "./countdown";
import { useEventState } from "@/components/auth/use-event-state";
import { useRegistrationModal } from "@/components/public/use-registration-modal";

export function Hero() {
  const openRegistrationModal = useRegistrationModal((s) => s.open);
  const eventState = useEventState();
  const regOpen = eventState.data?.registrationOpen ?? false; // fail closed while loading/error
  // Registration is unavailable when the admin has closed it or capacity is reached.
  // the manual toggle is off (registrationsOpen=false) OR capacity has been reached.
  const isFull =
    !!eventState.data &&
    eventState.data.registrationOpen &&
    (!eventState.data.registrationsOpen ||
      (eventState.data.registrationCapacity > 0 &&
        eventState.data.currentCount >= eventState.data.registrationCapacity));

  const heading = "HACKMITTEN";
  const edition = "3.0";
  const subtitle = "IDEAS BEYOND THE HORIZON | NATIONAL LEVEL HACKATHON";
  const subtitleLines = subtitle.split("|").map((s) => s.trim()).filter(Boolean);
  const description = "24 HOURS. BUILD. INNOVATE. CREATE.";
  const ctaText = "REGISTER NOW";

  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] flex-col items-center justify-center px-5 pt-24 md:pt-28 text-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#030303] pointer-events-none z-[1]" />

      {/* Side College Logos: Left (MITT) & Right (10 Years of Excellence) */}
      <div className="pointer-events-none absolute inset-x-0 top-14 sm:top-16 md:top-20 z-20 px-4 sm:px-8 md:px-12 lg:px-16 flex items-center justify-between">
        <div className="pointer-events-auto">
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
              className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-[112px] lg:w-[112px] xl:h-[124px] xl:w-[124px] rounded-full object-contain ring-2 ring-white/25 bg-white/10 p-1.5 backdrop-blur-md shadow-[0_0_36px_rgba(255,255,255,0.15)]"
            />
          </a>
        </div>
        <div className="pointer-events-auto">
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
              className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-[112px] lg:w-[112px] xl:h-[124px] xl:w-[124px] rounded-full object-contain ring-2 ring-[#B52A32]/40 bg-black/60 p-1.5 backdrop-blur-md shadow-[0_0_36px_rgba(216,58,67,0.3)]"
            />
          </a>
        </div>
      </div>

      <div className="hero-content-depth relative z-10 flex flex-col items-center w-full max-w-5xl">
        {/* College Name directly above 24 Hours */}
        <div className="hero-reveal hero-reveal-delay-1 mb-2 md:mb-3 text-center px-4 max-w-5xl">
          <a
            href="https://mitt.edu.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-block focus:outline-none"
            aria-label="Maharaja Institute of Technology Thandavapura website"
          >
            <p className="display text-sm sm:text-lg md:text-2xl lg:text-[1.85rem] font-bold uppercase tracking-tight text-white/90 group-hover:text-white group-hover:text-glow-red transition-all duration-200 leading-[1.15] cursor-pointer">
              Maharaja Institute of Technology Thandavapura
            </p>
          </a>
        </div>

        <div className="hero-reveal hero-reveal-delay-1 mb-6 flex items-center gap-3 flex-wrap justify-center">
          <span className="h-px w-8 md:w-10 bg-[#B52A32]" />
          <span className="mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-[#A8A8A8] text-center">
            24 Hours
          </span>
          <span className="h-px w-8 md:w-10 bg-[#B52A32]" />
        </div>

        <h1 className="hero-title hero-reveal hero-reveal-delay-2 display text-[16vw] sm:text-[14vw] leading-[0.85] font-bold tracking-tight text-white md:text-[12vw] lg:text-[10rem]">
          <span className="block">{heading}</span>
          <span className="hero-edition block text-[#B52A32] text-glow-red">{edition}</span>
        </h1>

        <p className="hero-reveal hero-reveal-delay-3 display mt-6 text-xl md:text-3xl font-light tracking-tight text-white/90">
          {subtitleLines.length > 1 ? (
            <>
              {subtitleLines[0]}
              <br />
              <span className="text-[#A8A8A8] text-lg md:text-2xl">{subtitleLines[1]}</span>
            </>
          ) : (
            subtitle
          )}
        </p>

        <p className="hero-reveal hero-reveal-delay-4 mt-6 max-w-md text-sm md:text-base text-[#A8A8A8]">
          {description}
        </p>

        <div className="hero-reveal hero-reveal-delay-4">
          <Countdown />
        </div>

        <div className="hero-reveal hero-reveal-delay-5 mt-10 flex flex-col sm:flex-row gap-3">
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
            href="#about"
            className="flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 md:px-8 py-3.5 text-sm font-semibold tracking-wide text-white transition-all hover:border-white/40 hover:bg-white/5 min-h-[44px]"
          >
            EXPLORE
          </Link>
        </div>
      </div>

    </section>
  );
}
