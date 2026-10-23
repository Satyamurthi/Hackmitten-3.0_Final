"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRegisterStore, type DegreeCategory } from "@/components/register/store";
import {
  RegisterStepper,
  StepTeam,
  StepMembers,
  StepDetails,
  StepPayment,
  StepSubmit,
} from "@/components/register/steps";
import { useEventState } from "@/components/auth/use-event-state";
import { GraduationCap, ArrowRight, ShieldCheck } from "lucide-react";

const CATEGORIES: {
  id: DegreeCategory;
  name: string;
  badge: string;
  fee: string;
  eligible: string;
  badgeColor: string;
}[] = [
  {
    id: "UG",
    name: "UG (Undergraduate)",
    badge: "Undergraduate",
    fee: "₹1,000",
    eligible: "B.E, B.Tech, B.Sc, BCA, B.Com, etc.",
    badgeColor: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
  },
  {
    id: "PG",
    name: "PG (Postgraduate)",
    badge: "Postgraduate",
    fee: "₹1,000",
    eligible: "M.Tech, M.E, MCA, M.Sc, MBA, etc.",
    badgeColor: "bg-purple-500/10 text-purple-300 border-purple-500/30",
  },
  {
    id: "Diploma",
    name: "Diploma",
    badge: "Polytechnic / Diploma",
    fee: "₹500",
    eligible: "Polytechnic / Engineering Diploma students",
    badgeColor: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  },
];

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <main className="relative min-h-screen bg-[#030303] text-white flex items-center justify-center">
          <div className="text-[#A8A8A8]">Loading registration…</div>
        </main>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}

function RegisterContent() {
  const searchParams = useSearchParams();
  const step = useRegisterStore((s) => s.step);
  const degree = useRegisterStore((s) => s.degree);
  const setDegree = useRegisterStore((s) => s.setDegree);
  const teamId = useRegisterStore((s) => s.teamId);

  // Sync degree from search params if present
  useEffect(() => {
    const degreeParam = searchParams.get("degree");
    if (degreeParam && (degreeParam === "UG" || degreeParam === "PG" || degreeParam === "Diploma")) {
      if (degree !== degreeParam) {
        setDegree(degreeParam as DegreeCategory);
      }
    }
  }, [searchParams, degree, setDegree]);
  // An existing registration can finish payment even when new registrations
  // have closed or filled up. The backend still checks its access cookie.
  const continuingRegistration = Boolean(teamId) && step >= 3;
  const eventState = useEventState();
  const regOpen = eventState.data?.registrationOpen;
  const loading = eventState.isLoading;
  const registrationsOpen = eventState.data?.registrationsOpen ?? true;
  const totalCapacity = eventState.data?.totalCapacity ?? eventState.data?.registrationCapacity ?? 50;
  const ugPgFull = eventState.data?.ugPgFull ?? false;
  const diplomaFull = eventState.data?.diplomaFull ?? false;
  const isFull = eventState.data?.isFull ?? false;

  const currentDegree = degree || searchParams.get("degree");
  const isCurrentCategoryFull =
    currentDegree === "Diploma"
      ? diplomaFull
      : currentDegree === "UG" || currentDegree === "PG"
      ? ugPgFull
      : isFull;

  // Manual close (toggle off) is controlled by the admin.
  const manuallyClosed = !!eventState.data && !registrationsOpen && regOpen !== false;

  // While loading event state, show a neutral state (don't flash closed)
  if (loading) {
    return (
      <main className="relative min-h-screen bg-[#030303] text-white flex items-center justify-center">
        <div className="text-[#A8A8A8]">Loading…</div>
      </main>
    );
  }

  // If registration is manually closed (admin toggle off), show that
  if (manuallyClosed && !continuingRegistration) {
    return (
      <main className="relative min-h-screen bg-[#030303] text-white flex items-center justify-center px-5">
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at top, #151515 0%, #080808 50%, #030303 100%)",
          }}
        />
        <div className="relative z-10 text-center max-w-md">
          <div className="mono text-xs uppercase tracking-[0.3em] text-[#B52A32] mb-4">
            / Registration Closed
          </div>
          <h1 className="display text-4xl md:text-6xl font-bold text-white mb-4">
            REGISTRATION
            <br />
            <span className="text-[#B52A32]">CLOSED.</span>
          </h1>
          <p className="text-[#A8A8A8] mb-8">
            Registrations are currently closed. Please check back later or contact the coordinator.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white hover:border-white/40 hover:bg-white/5 transition-all min-h-[44px]"
          >
            ← Return Home
          </Link>
        </div>
      </main>
    );
  }

  // If registration is full for this specific category (or entirely full)
  if (isCurrentCategoryFull && !continuingRegistration) {
    return (
      <main className="relative min-h-screen bg-[#030303] text-white flex items-center justify-center px-5">
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at top, #151515 0%, #080808 50%, #030303 100%)",
          }}
        />
        <div className="relative z-10 text-center max-w-md">
          <div className="mono text-xs uppercase tracking-[0.3em] text-[#B52A32] mb-4">
            / {currentDegree ? `${currentDegree} Registration Full` : "Registrations Full"}
          </div>
          <h1 className="display text-4xl md:text-6xl font-bold text-white mb-4">
            {currentDegree ? currentDegree.toUpperCase() : "REGISTRATION"}
            <br />
            <span className="text-[#B52A32]">FULL.</span>
          </h1>
          <p className="text-[#A8A8A8] mb-8">
            {currentDegree === "Diploma"
              ? "All Diploma category spots have been taken. Thank you for the overwhelming response."
              : currentDegree
              ? `All ${currentDegree} category spots have been taken. Thank you for the overwhelming response.`
              : `All ${totalCapacity} spots have been taken. Thank you for the overwhelming response.`}
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white hover:border-white/40 hover:bg-white/5 transition-all min-h-[44px]"
          >
            ← Return Home
          </Link>
        </div>
      </main>
    );
  }

  // If registration is manually closed, show a clean closed state
  if (regOpen === false && !continuingRegistration) {
    return (
      <main className="relative min-h-screen bg-[#030303] text-white flex items-center justify-center px-5">
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at top, #151515 0%, #080808 50%, #030303 100%)",
          }}
        />
        <div className="relative z-10 text-center max-w-md">
          <div className="mono text-xs uppercase tracking-[0.3em] text-[#B52A32] mb-4">
            / Registration Closed
          </div>
          <h1 className="display text-4xl md:text-6xl font-bold text-white mb-4">
            REGISTRATION
            <br />
            <span className="text-[#B52A32]">CLOSED.</span>
          </h1>
          <p className="text-[#A8A8A8] mb-8">
            {eventState.data?.registrationMessage || "Registrations are currently closed. Please check back later."}
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white hover:border-white/40 hover:bg-white/5 transition-all min-h-[44px]"
          >
            ← Return Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-[#030303] text-white">
      {/* Subtle backdrop — radial gradient + grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top, #151515 0%, #080808 50%, #030303 100%)",
        }}
      />
      <div className="fixed inset-0 bg-grid pointer-events-none opacity-30" />

      <div className="relative z-10">
        <header className="border-b border-white/5">
          <div className="mx-auto max-w-7xl px-4 md:px-10 py-5 flex items-center justify-between">
            <Link href="/" className="flex items-baseline gap-2">
              <span className="display text-lg font-bold text-white">HACKMITTEN</span>
              <span className="mono text-xs text-[#B52A32]">3.0</span>
            </Link>
            <Link href="/" className="text-xs text-[#A8A8A8] hover:text-white transition-colors">
              ← Back to site
            </Link>
          </div>
        </header>

        <section className="mx-auto max-w-7xl px-4 md:px-10 py-8 md:py-16">
          {step === 0 && !degree ? (
            <div className="max-w-2xl mx-auto">
              <div className="mono text-xs uppercase tracking-widest text-[#B52A32] mb-2">
                / Step 1 of Registration
              </div>
              <h2 className="display text-3xl md:text-5xl font-bold text-white mb-3">
                SELECT PARTICIPANT CATEGORY.
              </h2>
              <p className="text-sm md:text-base text-[#A8A8A8] mb-8">
                Select your category before proceeding with registration. The registration fee and competition domains are tailored to your category.
              </p>

              <div className="grid grid-cols-1 gap-4">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setDegree(cat.id)}
                    className="group w-full rounded-xl border border-white/10 bg-[#121212] p-5 text-left transition-all hover:border-[#B52A32]/60 hover:bg-[#151515] hover:shadow-[0_0_30px_rgba(181,42,50,0.15)] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white group-hover:bg-[#B52A32] transition-all">
                        <GraduationCap size={22} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="display text-base sm:text-lg font-bold text-white tracking-tight">
                            {cat.name}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${cat.badgeColor}`}>
                            {cat.badge}
                          </span>
                        </div>
                        <div className="text-xs text-[#A8A8A8] mt-1">
                          {cat.eligible}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-3">
                      <div className="mono text-base sm:text-lg font-bold text-[#B52A32]">
                        {cat.fee}
                      </div>
                      <div className="text-[10px] text-[#A8A8A8] uppercase tracking-wider">
                        per team
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-8 text-center text-xs text-[#666]">
                All team members must belong to the selected degree category. The team leader&apos;s category applies to all members.
              </div>
            </div>
          ) : (
            <>
              {step === 0 && degree && (
                <div className="max-w-2xl mx-auto mb-6 flex items-center justify-between rounded-xl border border-white/10 bg-[#121212] px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <GraduationCap size={16} className="text-[#B52A32]" />
                    <span className="text-xs text-[#A8A8A8]">Selected Category:</span>
                    <span className="text-xs font-semibold text-white">
                      {CATEGORIES.find((c) => c.id === degree)?.name || degree}
                    </span>
                    <span className="mono text-[11px] font-bold text-[#B52A32]">
                      ({CATEGORIES.find((c) => c.id === degree)?.fee || (degree === "Diploma" ? "₹500" : "₹1,000")})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDegree("")}
                    className="text-[11px] text-[#A8A8A8] hover:text-white transition-colors underline"
                  >
                    Change category
                  </button>
                </div>
              )}
              <RegisterStepper />
              <div className="mt-8 md:mt-10">
                {step === 0 && <StepTeam />}
                {step === 1 && <StepMembers />}
                {step === 2 && <StepDetails />}
                {step === 3 && <StepPayment />}
                {step === 4 && <StepSubmit />}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
