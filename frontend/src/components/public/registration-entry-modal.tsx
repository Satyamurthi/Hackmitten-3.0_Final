"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRegistrationModal } from "./use-registration-modal";
import { useRegisterStore, type DegreeCategory } from "@/components/register/store";
import {
  X,
  LogIn,
  UserPlus,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Check,
} from "lucide-react";

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

import { useEventState } from "@/components/auth/use-event-state";

export function RegistrationEntryModal() {
  const router = useRouter();
  const { isOpen, initialView, close } = useRegistrationModal();
  const [view, setView] = useState<"options" | "categories">("options");
  const setDegree = useRegisterStore((s) => s.setDegree);
  const eventState = useEventState();

  const ugPgFull = eventState.data?.ugPgFull ?? false;
  const diplomaFull = eventState.data?.diplomaFull ?? false;

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setView(initialView);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialView]);

  if (!isOpen) return null;

  const handleSelectCategory = (cat: DegreeCategory) => {
    const isCatFull = cat === "Diploma" ? diplomaFull : ugPgFull;
    if (isCatFull) return;
    setDegree(cat);
    close();
    router.push(`/register?degree=${cat}`);
  };

  const handleGoToLogin = () => {
    close();
    router.push("/login?role=PARTICIPANT");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 sm:p-8 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={close}
          className="absolute right-5 top-5 p-2 rounded-full text-[#A8A8A8] hover:text-white hover:bg-white/5 transition-all"
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        {/* ─── VIEW 1: CHOOSE LOGIN OR REGISTRATION ─── */}
        {view === "options" && (
          <div className="space-y-6">
            <div className="text-left">
              <div className="mono text-xs uppercase tracking-widest text-[#B52A32] mb-1">
                / Event Access
              </div>
              <h2 className="display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Welcome to HACKMITTEN 3.0
              </h2>
              <p className="text-xs sm:text-sm text-[#A8A8A8] mt-1.5">
                Select an option below to access your team dashboard or register a new team.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3.5 pt-1">
              {/* Option 1: Participant Login */}
              <button
                type="button"
                onClick={handleGoToLogin}
                className="group w-full rounded-xl border border-white/10 bg-[#121212] p-5 text-left transition-all hover:border-[#B52A32]/60 hover:bg-[#151515] hover:shadow-[0_0_30px_rgba(181,42,50,0.15)] flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-[#B52A32] group-hover:bg-[#B52A32] group-hover:text-white transition-all">
                    <LogIn size={22} />
                  </div>
                  <div>
                    <div className="display text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                      Team Login
                      <span className="mono text-[10px] uppercase px-2 py-0.5 rounded bg-white/5 text-[#A8A8A8]">
                        Registered
                      </span>
                    </div>
                    <div className="text-xs text-[#A8A8A8] mt-1">
                      Already registered? Access your team dashboard using Leader Email & Team ID.
                    </div>
                  </div>
                </div>
                <div className="text-[#A8A8A8] group-hover:text-white transition-transform group-hover:translate-x-1 pl-3 shrink-0">
                  <ArrowRight size={18} />
                </div>
              </button>

              {/* Option 2: New Registration */}
              <button
                type="button"
                onClick={() => setView("categories")}
                className="group w-full rounded-xl border border-white/10 bg-[#121212] p-5 text-left transition-all hover:border-[#B52A32]/60 hover:bg-[#151515] hover:shadow-[0_0_30px_rgba(181,42,50,0.15)] flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-cyan-400 group-hover:bg-[#B52A32] group-hover:text-white transition-all">
                    <UserPlus size={22} />
                  </div>
                  <div>
                    <div className="display text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                      New Registration
                      <span className="mono text-[10px] uppercase px-2 py-0.5 rounded bg-[#B52A32]/20 text-[#D83A43] font-semibold">
                        Apply Now
                      </span>
                    </div>
                    <div className="text-xs text-[#A8A8A8] mt-1">
                      Register a new 3-4 member team for the 24-hour hackathon.
                    </div>
                  </div>
                </div>
                <div className="text-[#A8A8A8] group-hover:text-white transition-transform group-hover:translate-x-1 pl-3 shrink-0">
                  <ArrowRight size={18} />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ─── VIEW 2: SELECT DEGREE CATEGORY ─── */}
        {view === "categories" && (
          <div className="space-y-6">
            <div className="text-left">
              <button
                type="button"
                onClick={() => setView("options")}
                className="inline-flex items-center gap-1.5 text-xs text-[#A8A8A8] hover:text-white transition-colors mb-3"
              >
                <ArrowLeft size={13} /> Back to options
              </button>
              <div className="mono text-xs uppercase tracking-widest text-[#B52A32] mb-1">
                / Step 1 of Registration
              </div>
              <h2 className="display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Select Participant Category
              </h2>
              <p className="text-xs sm:text-sm text-[#A8A8A8] mt-1">
                Choose your degree category to proceed. Registration fee and competition domains are tailored to your category.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3.5 pt-1">
              {CATEGORIES.map((cat) => {
                const isCatFull = cat.id === "Diploma" ? diplomaFull : ugPgFull;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    disabled={isCatFull}
                    onClick={() => handleSelectCategory(cat.id)}
                    className={`group w-full rounded-xl border p-4.5 sm:p-5 text-left transition-all flex items-center justify-between ${
                      isCatFull
                        ? "border-white/5 bg-[#0e0e0e] opacity-65 cursor-not-allowed"
                        : "border-white/10 bg-[#121212] hover:border-[#B52A32]/60 hover:bg-[#151515] hover:shadow-[0_0_30px_rgba(181,42,50,0.15)] cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-all ${
                          isCatFull
                            ? "bg-white/5 border-white/5 text-[#666]"
                            : "bg-white/5 border-white/10 text-white group-hover:bg-[#B52A32]"
                        }`}
                      >
                        <GraduationCap size={22} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`display text-base sm:text-lg font-bold tracking-tight ${
                              isCatFull ? "text-[#888]" : "text-white"
                            }`}
                          >
                            {cat.name}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${cat.badgeColor}`}>
                            {cat.badge}
                          </span>
                          {isCatFull && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-[#B52A32]/60 bg-[#B52A32]/20 text-[#D83A43]">
                              REGISTRATION FULL
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#A8A8A8] mt-1">
                          {cat.eligible}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-3">
                      {isCatFull ? (
                        <div className="mono text-xs font-bold text-[#D83A43] uppercase tracking-wide">
                          FULL
                        </div>
                      ) : (
                        <>
                          <div className="mono text-sm sm:text-base font-bold text-[#B52A32]">
                            {cat.fee}
                          </div>
                          <div className="text-[10px] text-[#A8A8A8] uppercase tracking-wider">
                            per team
                          </div>
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] text-[#666] text-center">
              All team members must belong to the selected degree category. The team leader&apos;s category is final for all members.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
