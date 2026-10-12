"use client";

import { useRegisterStore } from "./store";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowRight, ArrowLeft, Plus, X, Check, Crown, AlertCircle, ImagePlus, Mail } from "lucide-react";
import Link from "next/link";
import { normalizeTeamName } from "@/lib/team-name";
import { compressImage } from "@/lib/image-compress";

const STEPS = ["TEAM", "MEMBERS", "DETAILS", "PAYMENT", "SUBMIT"];

export function RegisterStepper() {
  const step = useRegisterStore((s) => s.step);
  return (
    <div className="flex items-center justify-between max-w-2xl mx-auto mb-10 md:mb-12">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-2">
            <div
              className={`flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full border text-xs font-semibold transition-all ${i < step
                  ? "border-[#B52A32] bg-[#B52A32] text-white"
                  : i === step
                    ? "border-[#B52A32] bg-transparent text-[#B52A32] red-glow"
                    : "border-white/15 text-[#A8A8A8]"
                }`}
            >
              {i < step ? <Check size={14} /> : String(i + 1).padStart(2, "0")}
            </div>
            <span
              className={`mono text-[9px] md:text-[10px] uppercase tracking-widest text-center ${i === step ? "text-white" : "text-[#A8A8A8]"
                }`}
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className="flex-1 h-px mx-1.5 md:mx-4 bg-white/10 relative overflow-hidden">
              <div
                className={`absolute inset-0 bg-[#B52A32] transition-transform duration-500 origin-left ${i < step ? "scale-x-100" : "scale-x-0"
                  }`}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── STEP 0: TEAM ─────────────────────────────────────────────────────────────

export function StepTeam() {
  const {
    teamName,
    setTeamName,
    degree,
    setDegree,
    domainId,
    domainName,
    setDomain,
    next,
  } = useRegisterStore();
  const normalizedTeamName = normalizeTeamName(teamName);
  const validFormat = normalizedTeamName.length >= 2 && /^[a-zA-Z0-9 _\-.]+$/.test(teamName.trim());
  const [debouncedTeamName, setDebouncedTeamName] = useState(normalizedTeamName);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedTeamName(normalizedTeamName), 400);
    return () => window.clearTimeout(timeout);
  }, [normalizedTeamName]);

  const { data: checkData, isFetching, isError } = useQuery<{ available: boolean; reason?: string }>({
    queryKey: ["team-name-check", debouncedTeamName],
    queryFn: async () => {
      const r = await fetch(`/api/registrations/check-team-name?name=${encodeURIComponent(debouncedTeamName)}`);
      if (!r.ok) throw new Error("Unable to verify team name availability");
      return r.json();
    },
    enabled: validFormat && debouncedTeamName === normalizedTeamName,
    staleTime: 30_000,
  });

  // Degree-based domain filtering
  const { data: domainsData, isLoading: domainsLoading } = useQuery<{ domains: Array<{ id: string; name: string; degrees: string[] }> }>({
    queryKey: ["domains-for-degree", degree],
    queryFn: async () => {
      if (!degree) return { domains: [] };
      const r = await fetch(`/api/domains?degree=${encodeURIComponent(degree)}`);
      if (!r.ok) return { domains: [] };
      return r.json();
    },
    enabled: Boolean(degree),
  });

  const availableDomains = domainsData?.domains || [];

  // Reset selected domain if no longer valid for selected degree
  useEffect(() => {
    if (domainId && availableDomains.length > 0) {
      const match = availableDomains.find((d) => d.id === domainId);
      if (!match) {
        setDomain("", "");
      }
    }
  }, [domainId, availableDomains, setDomain]);

  const checking = validFormat && (debouncedTeamName !== normalizedTeamName || isFetching);
  const availability = !validFormat
    ? "invalid"
    : checking
      ? "checking"
      : isError
        ? "error"
        : checkData?.available === false
          ? "taken"
          : checkData?.available === true
            ? "available"
            : "error";

  const hasDomains = availableDomains.length > 0;
  const domainSelected = !hasDomains || Boolean(domainId);
  const degreeSelected = Boolean(degree);
  const valid = availability === "available" && degreeSelected && domainSelected;

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h2 className="display text-3xl md:text-5xl font-bold text-white mb-3">NAME YOUR CREW.</h2>
        <p className="text-sm md:text-base text-[#A8A8A8]">
          Pick your team name, select your degree, and choose your competition domain.
        </p>
      </div>

      {/* Team Name */}
      <div>
        <label className="block">
          <span className="mono text-[10px] uppercase tracking-widest text-[#A8A8A8]">
            Team Name *
          </span>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Enter your team name"
            maxLength={60}
            className="mt-2 w-full bg-transparent border-b border-white/15 py-3 text-xl md:text-2xl text-white placeholder:text-[#A8A8A8]/40 focus:border-[#B52A32] focus:outline-none transition-colors"
          />
        </label>
        {teamName.length > 0 && (
          <div className="mt-2 text-xs">
            {checking ? (
              <span className="text-[#A8A8A8]">Checking availability…</span>
            ) : availability === "taken" ? (
              <span className="text-[#D83A43] flex items-center gap-1.5">
                <AlertCircle size={12} /> Team name already exists. Please choose a different team name.
              </span>
            ) : availability === "available" ? (
              <span className="text-green-400 flex items-center gap-1.5">
                <Check size={12} /> Team name is available.
              </span>
            ) : availability === "error" ? (
              <span className="text-[#D83A43] flex items-center gap-1.5">
                <AlertCircle size={12} /> Unable to verify team name. Please try again.
              </span>
            ) : (
              <span className="text-[#D83A43]">Team name contains invalid characters.</span>
            )}
          </div>
        )}
      </div>

      {/* Degree Category Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="mono text-[10px] uppercase tracking-widest text-[#A8A8A8]">
            Degree Category *
          </span>
          <span className="text-xs text-[#A8A8A8]/60">Select Diploma, UG, or PG</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {(["Diploma", "UG", "PG"] as const).map((deg) => {
            const isSelected = degree === deg;
            return (
              <button
                type="button"
                key={deg}
                onClick={() => setDegree(deg)}
                className={`py-3.5 px-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 min-h-[58px] ${
                  isSelected
                    ? "border-[#B52A32] bg-[#B52A32]/15 text-white shadow-lg shadow-[#B52A32]/10"
                    : "border-white/10 bg-[#080808] text-[#A8A8A8] hover:border-white/20 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="font-bold text-sm tracking-wide">{deg}</span>
                {isSelected && (
                  <span className="mono text-[9px] text-[#D83A43] uppercase tracking-widest flex items-center gap-1">
                    <Check size={10} /> Selected
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Domain Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="mono text-[10px] uppercase tracking-widest text-[#A8A8A8]">
            Competition Domain {hasDomains && "*"}
          </span>
          {degree && (
            <span className="text-xs text-[#B52A32] font-mono">
              Filtered for {degree}
            </span>
          )}
        </div>

        {!degree ? (
          <div className="p-4 rounded-lg border border-dashed border-white/10 bg-[#080808]/50 text-center text-xs text-[#A8A8A8]">
            Select your Degree above to view compatible domains.
          </div>
        ) : domainsLoading ? (
          <div className="p-4 rounded-lg border border-white/10 bg-[#080808] text-center text-xs text-[#A8A8A8]">
            Loading available domains for {degree}…
          </div>
        ) : availableDomains.length === 0 ? (
          <div className="p-4 rounded-lg border border-white/10 bg-[#080808] text-center text-xs text-[#A8A8A8]">
            No domains currently registered for {degree}. (General participation)
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {availableDomains.map((dom) => {
              const isSelected = domainId === dom.id;
              return (
                <button
                  type="button"
                  key={dom.id}
                  onClick={() => setDomain(dom.id, dom.name)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? "border-[#B52A32] bg-[#B52A32]/15 text-white shadow-md shadow-[#B52A32]/10"
                      : "border-white/10 bg-[#080808] text-[#A8A8A8] hover:border-white/25 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="font-medium text-sm text-white truncate">{dom.name}</div>
                    <div className="text-[10px] text-[#A8A8A8] mt-0.5 mono">Eligible: {degree}</div>
                  </div>
                  {isSelected && <Check size={16} className="text-[#D83A43] shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-2 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-[#A8A8A8] hover:text-white transition-colors min-h-[44px]"
        >
          <ArrowLeft size={14} /> Cancel
        </Link>
        <button
          disabled={!valid}
          onClick={next}
          className="group flex items-center gap-2 rounded-full bg-[#B52A32] disabled:opacity-30 disabled:cursor-not-allowed px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#D83A43] min-h-[44px]"
        >
          CONTINUE <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}

// ─── STEP 1: MEMBERS ──────────────────────────────────────────────────────────

export function StepMembers() {
  const { members, setMember, addMember, removeMember, next, prev } = useRegisterStore();
  const [attemptedContinue, setAttemptedContinue] = useState(false);

  const GMAIL_REGEX = /^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*@gmail\.com$/i;

  const memberValid = (m: (typeof members)[0]) => {
    const nameValid = m.fullName.trim().length >= 2 && !/\d/.test(m.fullName);
    const collegeValid = m.college.trim().length >= 2 && !/\d/.test(m.college);
    const emailValid = GMAIL_REGEX.test(m.email.trim());
    const phoneValid = /^[6-9][0-9]{9}$/.test(m.phone.trim());
    const degreeValid = m.degree.trim().length > 0;
    const imgSelected = Boolean(m.participantImage);
    const imgValid =
      imgSelected &&
      (m.participantImage!.type.startsWith("image/") ||
        ["image/jpeg", "image/png", "image/webp"].includes(m.participantImage!.type)) &&
      m.participantImage!.size <= 5 * 1024 * 1024;

    return nameValid && collegeValid && emailValid && phoneValid && degreeValid && imgValid;
  };

  const allValid = members.every(memberValid);
  const emails = members.map((m) => m.email.toLowerCase().trim());
  const hasDuplicate = emails.some((e, i) => e && emails.indexOf(e) !== i);
  const valid = allValid && !hasDuplicate;

  const handleContinue = () => {
    if (!valid) {
      setAttemptedContinue(true);
      return;
    }
    next();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="display text-3xl md:text-5xl font-bold text-white mb-3">ASSEMBLE THE CREW.</h2>
      <p className="text-sm md:text-base text-[#A8A8A8] mb-8 md:mb-10">
        Minimum 3, maximum 4. Each member must have a unique email. The first member is always the team leader.
      </p>

      <div className="space-y-4 md:space-y-6">
        {members.map((m, i) => {
          const isLeader = i === 0;

          // Full Name Validation (strictly no numbers allowed)
          const nameHasDigits = /\d/.test(m.fullName);
          const nameTooShort = m.fullName.trim().length > 0 && m.fullName.trim().length < 2;
          const nameError = nameHasDigits
            ? "• Numbers are not allowed in full name"
            : nameTooShort
              ? "• Full name must be at least 2 characters"
              : attemptedContinue && !m.fullName.trim()
                ? "• Full name is required"
                : undefined;

          // College Validation (strictly required and no numbers allowed)
          const collegeHasDigits = /\d/.test(m.college);
          const collegeTooShort = m.college.trim().length > 0 && m.college.trim().length < 2;
          const collegeError = collegeHasDigits
            ? "• Numbers are not allowed in college name"
            : collegeTooShort
              ? "• College name must be at least 2 characters"
              : attemptedContinue && !m.college.trim()
                ? "• College name is required"
                : undefined;

          // Email Validation
          const emailError = m.email.trim().length > 0 && !GMAIL_REGEX.test(m.email.trim())
            ? "• Enter a valid Gmail address (e.g. name@gmail.com)"
            : hasDuplicate && emails.indexOf(emails[i]) !== i && emails[i]
              ? "• This email is duplicated within the team"
              : attemptedContinue && !m.email.trim()
                ? "• Gmail address is required"
                : undefined;

          // Phone Validation
          const phoneError = m.phone.trim().length > 0 && !/^[6-9][0-9]{9}$/.test(m.phone.trim())
            ? "• Enter a valid 10-digit Indian mobile number"
            : attemptedContinue && !m.phone.trim()
              ? "• Mobile number is required"
              : undefined;

          // Degree Validation
          const degreeError = attemptedContinue && !m.degree.trim() ? "• Degree is required" : undefined;

          // Image Validation
          const imgSelected = Boolean(m.participantImage);
          const imgTypeValid =
            imgSelected &&
            (m.participantImage!.type.startsWith("image/") ||
              ["image/jpeg", "image/png", "image/webp"].includes(m.participantImage!.type));
          const imgSizeValid = imgSelected && m.participantImage!.size <= 5 * 1024 * 1024;

          return (
            <div
              key={i}
              className={`glass rounded-lg p-4 md:p-5 border transition-all ${isLeader ? "border-[#B52A32]/50" : "border-transparent"
                }`}
            >
              <div className="flex items-center justify-between mb-3 md:mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="mono text-xs uppercase tracking-widest text-[#B52A32]">
                    Member {String(i + 1).padStart(2, "0")}
                  </span>
                  {i < 3 && <span className="text-[#A8A8A8] text-xs">· Required</span>}
                  {i === 3 && <span className="text-[#A8A8A8] text-xs">· Optional</span>}
                  <span className="inline-flex items-center gap-1 mono text-[10px] uppercase tracking-widest text-[#D83A43] border border-[#B52A32] px-2 py-0.5 rounded">
                    {isLeader && <Crown size={10} />} {isLeader ? "Team Leader" : "Team Member"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {i >= 3 && (
                    <button
                      onClick={() => removeMember(i)}
                      className="text-[#A8A8A8] hover:text-[#B52A32] transition-colors p-1"
                      aria-label="Remove member"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  label="Full Name"
                  value={m.fullName}
                  onChange={(v) => setMember(i, { fullName: v })}
                  placeholder="Enter full name"
                  error={nameError}
                />
                <Input
                  label="Email"
                  type="email"
                  value={m.email}
                  onChange={(v) => setMember(i, { email: v })}
                  placeholder="example@gmail.com"
                  error={emailError}
                />
                <Input
                  label="Phone"
                  type="tel"
                  value={m.phone}
                  onChange={(v) => setMember(i, { phone: v })}
                  placeholder="10 digit number"
                  error={phoneError}
                />
                <Input
                  label="College"
                  value={m.college}
                  onChange={(v) => setMember(i, { college: v })}
                  placeholder="Enter your college / institution name"
                  error={collegeError}
                />
                <div className="md:col-span-2">
                  <DegreeField
                    value={m.degree}
                    onChange={(v) => setMember(i, { degree: v })}
                    error={degreeError}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <div className="mono text-xs uppercase tracking-widest text-[#A8A8A8] flex items-center justify-between">
                    <span>
                      Participant Photo <span className="text-[#D83A43]">· Required</span>
                    </span>
                    <span className="text-[10px] text-[#A8A8A8]/60">JPEG / PNG / WebP · Auto-optimized</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg border border-white/10 bg-[#080808]/80 hover:border-[#B52A32]/50 transition-colors">
                    <label className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-[#B52A32] hover:bg-[#D83A43] text-white px-5 py-2.5 text-xs font-bold tracking-wide transition-all shadow-md active:scale-95 min-h-[38px]">
                      <ImagePlus size={16} />
                      <span>Select Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const compressed = await compressImage(file, { maxWidth: 800, maxHeight: 800, quality: 0.82 });
                            setMember(i, { participantImage: compressed });
                          } else {
                            setMember(i, { participantImage: null });
                          }
                        }}
                        className="sr-only"
                      />
                    </label>
                    {m.participantImage ? (
                      <div className="flex items-center gap-2 text-xs text-white bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                        <Check size={14} className="text-green-400" />
                        <span className="truncate max-w-[180px] sm:max-w-[260px] font-medium">
                          {m.participantImage.name}
                        </span>
                        <span className="text-[#A8A8A8]">
                          ({Math.ceil(m.participantImage.size / 1024)} KB)
                        </span>
                        <button
                          type="button"
                          onClick={() => setMember(i, { participantImage: null })}
                          className="text-[#D83A43] hover:text-white p-0.5 ml-1 transition-colors"
                          title="Remove photo"
                          aria-label="Remove photo"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : null}
                  </div>
                  {!imgSelected ? (
                    <div className="text-xs text-[#D83A43] flex items-center gap-1.5 mt-1.5">
                      <AlertCircle size={12} /> Image is not selected. Participant photo is required.
                    </div>
                  ) : !imgTypeValid || !imgSizeValid ? (
                    <div className="text-xs text-[#D83A43] flex items-center gap-1.5 mt-1.5">
                      <AlertCircle size={12} /> Invalid image format or size exceeds 5MB
                    </div>
                  ) : null}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {members.length < 4 && (
        <button
          onClick={addMember}
          className="mt-4 flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm text-white hover:border-[#B52A32] hover:bg-white/5 transition-all min-h-[44px]"
        >
          <Plus size={14} /> Add Optional 4th Member
        </button>
      )}

      {!valid && (
        <div className="mt-6 p-4 rounded-lg bg-[#B52A32]/10 border border-[#B52A32]/30 text-xs text-[#D83A43] flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>Please complete all member fields correctly (college and full name without numbers) and select a photo for every member to continue.</span>
        </div>
      )}

      <div className="mt-8 md:mt-10 flex items-center justify-between">
        <button
          onClick={prev}
          className="flex items-center gap-2 text-sm text-[#A8A8A8] hover:text-white transition-colors min-h-[44px]"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <button
          disabled={!valid}
          onClick={handleContinue}
          className="group flex items-center gap-2 rounded-full bg-[#B52A32] disabled:opacity-30 disabled:cursor-not-allowed px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#D83A43] min-h-[44px]"
        >
          CONTINUE <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}

// ─── STEP 2: DETAILS REVIEW ───────────────────────────────────────────────────

export function StepDetails() {
  const { teamName, degree, domainName, members, next, prev } = useRegisterStore();

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="display text-3xl md:text-5xl font-bold text-white mb-3">CONFIRM THE BRIEF.</h2>
      <p className="text-sm md:text-base text-[#A8A8A8] mb-8 md:mb-10">
        Review your team details before proceeding to payment.
      </p>

      <div className="glass rounded-lg p-5 md:p-8">
        <div className="pb-4 md:pb-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="mono text-[10px] uppercase tracking-widest text-[#A8A8A8]">Team</div>
            <div className="display text-xl md:text-2xl text-white mt-1 truncate">{teamName}</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {degree && (
              <span className="mono text-xs px-2.5 py-1 rounded bg-[#B52A32]/20 border border-[#B52A32]/40 text-white font-semibold">
                Degree: {degree}
              </span>
            )}
            {domainName && (
              <span className="mono text-xs px-2.5 py-1 rounded bg-white/10 border border-white/10 text-white font-semibold">
                Domain: {domainName}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 md:mt-6 space-y-3 md:space-y-4">
          {members.map((m, i) => (
            <div key={i} className="flex items-start gap-3 md:gap-4 pb-3 md:pb-4 border-b border-white/5 last:border-0 last:pb-0">
              <div className={`flex h-9 w-9 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full mono text-xs ${i === 0
                  ? "bg-[#B52A32] text-white"
                  : "bg-[#151515] border border-white/10 text-[#B52A32]"
                }`}>
                {i === 0 ? <Crown size={14} /> : String(i + 1).padStart(2, "0")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium text-sm md:text-base truncate">
                  {m.fullName}
                  <span className="ml-2 text-[10px] text-[#D83A43]">· {i === 0 ? "TEAM LEADER" : "TEAM MEMBER"}</span>
                </div>
                <div className="text-xs md:text-sm text-[#A8A8A8] truncate">{m.email}</div>
                <div className="text-xs text-[#A8A8A8] mt-0.5 truncate">{m.phone} · {m.college}</div>
                {m.degree && (
                  <div className="text-xs text-[#A8A8A8] mt-0.5 truncate">Degree: {m.degree}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 md:mt-10 flex items-center justify-between">
        <button
          onClick={prev}
          className="flex items-center gap-2 text-sm text-[#A8A8A8] hover:text-white transition-colors min-h-[44px]"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <button
          onClick={next}
          className="group flex items-center gap-2 rounded-full bg-[#B52A32] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#D83A43] min-h-[44px]"
        >
          PROCEED TO PAYMENT <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}

// ─── STEP 3: PAYMENT ─────────────────────────────────────────────────────────

const REGISTRATION_FEE = "₹1,000";
const OFFICIAL_UPI_ID = "9364008472@kotak";
const PAYMENT_QR = "/api/payment-qr";

export function StepPayment() {
  const {
    transactionId, setTransactionId,
    screenshot, screenshotPreview, setScreenshot,
    next, prev, serverError, submitting,
    teamId, setTeamId, setAcknowledgementEmailSent,
    teamName, college, degree, domainId, members,
    setServerError, setSubmitting,
  } = useRegisterStore();

  const fee = REGISTRATION_FEE;

  // Query degree-specific payment QR info
  const { data: qrInfo, isLoading: qrLoading } = useQuery<{
    configured: boolean;
    qrUrl: string | null;
    upiId: string;
    label?: string;
    message?: string;
  }>({
    queryKey: ["payment-qr-info", degree],
    queryFn: async () => {
      const res = await fetch(`/api/payment-qr/info?degree=${encodeURIComponent(degree || "")}`);
      if (!res.ok) throw new Error("Failed to load payment QR info");
      return res.json();
    },
    staleTime: 30_000,
  });

  const effectiveUpiId = qrInfo?.upiId || OFFICIAL_UPI_ID;
  const effectiveQrUrl = qrInfo?.qrUrl || (degree ? `/api/payment-qr?degree=${encodeURIComponent(degree)}` : PAYMENT_QR);

  const validTxn = transactionId.trim().length >= 4 && transactionId.trim().length <= 100;
  const screenshotValid = screenshot ? (
    ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(screenshot.type) &&
    screenshot.size <= 8 * 1024 * 1024
  ) : false;
  const valid = validTxn && screenshotValid;
  const transactionError = transactionId.trim().length > 0 && !validTxn
    ? transactionId.trim().length < 4
      ? "• Transaction ID must be at least 4 characters"
      : "• Transaction ID must be 100 characters or fewer"
    : undefined;

  const submitAll = async () => {
    setServerError(null);
    setSubmitting(true);
    try {
      // A payment or upload may fail after the team was created. Resume that
      // registration on retry instead of creating a duplicate team.
      let activeTeamId = teamId;
      if (!activeTeamId) {
        const registrationForm = new FormData();
        registrationForm.append(
          "registration",
          JSON.stringify({
            teamName,
            college: members[0]?.college || "",
            degree: degree || undefined,
            domainId: domainId || undefined,
            members: members.map(({ participantImage: _image, ...member }) => member),
          }),
        );
        for (let index = 0; index < members.length; index++) {
          const member = members[index];
          if (member.participantImage) {
            const imgToUpload = member.participantImage.size > 250 * 1024
              ? await compressImage(member.participantImage, { maxWidth: 800, maxHeight: 800, quality: 0.82 })
              : member.participantImage;
            registrationForm.append(`participantImage${index}`, imgToUpload);
          }
        }
        const regRes = await fetch("/api/registrations", { method: "POST", body: registrationForm, credentials: "include" });
        const regJson = await regRes.json().catch(() => ({}));
        if (!regRes.ok) {
          if (regRes.status === 413) {
            throw new Error("Registration payload exceeds server limits. Please select smaller images and retry.");
          }
          throw new Error(regJson.error || "Registration failed");
        }
        activeTeamId = regJson.team.id;
        setTeamId(activeTeamId);
        setAcknowledgementEmailSent(regJson.acknowledgementEmailSent === true);
      }

      // Repeating this call with the same transaction ID is safe and preserves
      // its proof. A changed ID resets the old proof on the server.
      const payRes = await fetch(`/api/registrations/${activeTeamId}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: transactionId.trim() }),
        credentials: "include",
      });
      const payJson = await payRes.json().catch(() => ({}));
      if (!payRes.ok) {
        throw new Error(payJson.error || "Payment submission failed");
      }

      const form = new FormData();
      const screenshotToUpload = screenshot && screenshot.size > 500 * 1024
        ? await compressImage(screenshot, { maxWidth: 1600, maxHeight: 1600, quality: 0.85 })
        : screenshot!;
      form.append("file", screenshotToUpload);
      const upRes = await fetch(`/api/registrations/${activeTeamId}/payment-screenshot`, {
        method: "POST",
        body: form,
        credentials: "include",
      });
      const upJson = await upRes.json().catch(() => ({}));
      if (!upRes.ok) {
        if (upRes.status === 413) {
          throw new Error("Screenshot file exceeds server limits. Please select a smaller screenshot and retry.");
        }
        throw new Error(upJson.error || "Screenshot upload failed");
      }

      next();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="display text-3xl md:text-5xl font-bold text-white mb-3">TRANSMIT PAYMENT.</h2>
      <p className="text-sm md:text-base text-[#A8A8A8] mb-8 md:mb-10">
        Pay the registration fee via UPI, then enter the transaction ID and upload the screenshot.
      </p>

      <div className="glass rounded-lg p-5 md:p-8 mb-6 md:mb-8">
        <div className="grid md:grid-cols-2 gap-4 md:gap-6 items-center">
          <div>
            <div className="mono text-[10px] uppercase tracking-widest text-[#A8A8A8] mb-2">
              Registration Fee
            </div>
            <div className="display text-4xl md:text-5xl text-white font-bold">{fee}</div>
            {degree && (
              <div className="mono text-[10px] text-[#D83A43] uppercase tracking-wider mt-1 font-semibold">
                Category: {degree}
              </div>
            )}
            <div className="mono text-[10px] uppercase tracking-widest text-[#A8A8A8] mt-4 md:mt-6 mb-2">
              UPI ID
            </div>
            <div className="font-mono text-sm md:text-base text-[#B52A32] select-all break-all">
              {effectiveUpiId}
            </div>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(effectiveUpiId);
              }}
              className="mt-2 text-xs text-[#A8A8A8] hover:text-white transition-colors min-h-[36px]"
            >
              Tap to copy
            </button>
          </div>
          <div className="flex flex-col items-center justify-center">
            {qrLoading ? (
              <div className="aspect-square w-44 max-w-full bg-[#151515] border border-white/10 rounded flex items-center justify-center text-xs text-[#A8A8A8]">
                Loading QR code…
              </div>
            ) : qrInfo && !qrInfo.configured ? (
              <div className="aspect-square w-44 max-w-full bg-[#151515] border border-amber-500/30 p-3 rounded flex flex-col items-center justify-center text-center">
                <AlertCircle size={24} className="text-amber-400 mb-2" />
                <span className="text-[11px] text-amber-200">
                  {qrInfo.message || `No QR configured for ${degree || "selected degree"}.`}
                </span>
                <span className="mono text-[9px] text-[#A8A8A8] mt-2">Use UPI ID on left</span>
              </div>
            ) : (
              <div className="space-y-1.5 text-center">
                <div className="aspect-square w-44 max-w-full bg-white p-2 rounded shadow-lg">
                  <img
                    src={effectiveQrUrl}
                    alt={qrInfo?.label || `${degree || ""} Payment QR code`}
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.dataset.retried) {
                        target.dataset.retried = "true";
                        target.src = `${effectiveQrUrl}${effectiveQrUrl.includes("?") ? "&" : "?"}t=${Date.now()}`;
                      }
                    }}
                    className="block h-full w-full object-contain"
                  />
                </div>
                {degree && (
                  <span className="mono text-[10px] text-[#A8A8A8]">
                    {qrInfo?.label || (degree === "UG" || degree === "PG" ? "UG & PG Payment QR" : `${degree} Payment QR`)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <label className="block mb-6">
        <span className="mono text-[10px] uppercase tracking-widest text-[#A8A8A8]">
          Transaction ID
        </span>
        <input
          type="text"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          placeholder="Enter your UPI transaction ID"
          className="mt-2 w-full bg-transparent border-b border-white/15 py-3 text-base md:text-lg text-white placeholder:text-[#A8A8A8]/40 focus:border-[#B52A32] focus:outline-none transition-colors"
        />
        {transactionError && <div className="mt-1 text-xs text-[#D83A43]">{transactionError}</div>}
      </label>

      <label className="block">
        <span className="mono text-[10px] uppercase tracking-widest text-[#A8A8A8]">
          Payment Screenshot (JPEG / PNG / WebP · Auto-optimized)
        </span>
        <div className="mt-2 glass rounded-lg p-4 border border-dashed border-white/15 hover:border-[#B52A32] transition-colors">
          <div className="flex flex-wrap items-center gap-3">
            <label className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-[#B52A32] hover:bg-[#D83A43] text-white px-5 py-2.5 text-xs font-bold tracking-wide transition-all shadow-md active:scale-95 min-h-[38px]">
              <ImagePlus size={16} />
              <span>Select Screenshot Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const compressed = await compressImage(file, { maxWidth: 1600, maxHeight: 1600, quality: 0.85 });
                    setScreenshot(compressed);
                  } else {
                    setScreenshot(null);
                  }
                }}
                className="sr-only"
              />
            </label>
            {screenshot ? (
              <div className="flex items-center gap-2 text-xs text-white bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                <span className="truncate max-w-[200px] font-medium">{screenshot.name}</span>
                <span className="text-[#A8A8A8]">({Math.round(screenshot.size / 1024)} KB)</span>
                <button
                  type="button"
                  onClick={() => setScreenshot(null)}
                  className="text-[#D83A43] hover:text-white p-0.5 ml-1 transition-colors"
                  title="Remove screenshot"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <span className="text-xs text-[#A8A8A8]/60 italic">No screenshot selected</span>
            )}
          </div>
          {screenshot && (!screenshot.type.startsWith("image/") || screenshot.size > 8 * 1024 * 1024) && (
            <div className="mt-2 text-xs text-[#D83A43] flex items-center gap-1.5">
              <AlertCircle size={12} /> Invalid format or size &gt; 8MB
            </div>
          )}
          {screenshot && screenshotPreview && (
            <img
              src={screenshotPreview}
              alt="Payment screenshot preview"
              className="mt-3 max-h-40 rounded border border-white/10"
            />
          )}
        </div>
      </label>

      {serverError && (
        <div className="mt-4 glass rounded-lg p-4 border-l-2 border-[#B52A32] text-sm text-[#D83A43]">
          {serverError}
        </div>
      )}

      <div className="mt-8 md:mt-10 flex items-center justify-between">
        {teamId ? (
          <span className="text-xs text-[#A8A8A8]">Team details submitted</span>
        ) : (
          <button
            onClick={prev}
            disabled={submitting}
            className="flex items-center gap-2 text-sm text-[#A8A8A8] hover:text-white transition-colors disabled:opacity-50 min-h-[44px]"
          >
            <ArrowLeft size={14} /> Back
          </button>
        )}
        <button
          disabled={!valid || submitting}
          onClick={submitAll}
          className="group flex items-center gap-2 rounded-full bg-[#B52A32] disabled:opacity-30 disabled:cursor-not-allowed px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#D83A43] min-h-[44px]"
        >
          {submitting ? "SUBMITTING…" : "SUBMIT PAYMENT"}
          {!submitting && <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />}
        </button>
      </div>
    </div>
  );
}

// ─── STEP 4: SUBMIT / CONFIRMATION ────────────────────────────────────────────

export function StepSubmit() {
  const { teamId, teamName, acknowledgementEmailSent, reset } = useRegisterStore();
  const [showEmailModal, setShowEmailModal] = useState(true);

  return (
    <div className="max-w-2xl mx-auto text-center relative">
      {/* ─── POPUP MODAL FOR SPAM / INBOX ALERT ─── */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl border border-[#B52A32] bg-[#0A0A0A] p-6 md:p-8 text-left shadow-[0_0_50px_rgba(181,42,50,0.35)]">
            <button
              onClick={() => setShowEmailModal(false)}
              className="absolute top-4 right-4 text-[#A8A8A8] hover:text-white transition-colors p-2 rounded-full hover:bg-white/5"
              aria-label="Close notification"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#B52A32]/20 border border-[#B52A32] text-[#D83A43]">
                <Mail size={24} />
              </div>
              <div>
                <span className="mono text-[10px] uppercase tracking-widest text-[#B52A32] font-semibold">
                  Important Notice
                </span>
                <h3 className="display text-xl md:text-2xl font-bold text-white">
                  Check Inbox & Spam Folder!
                </h3>
              </div>
            </div>

            <div className="space-y-3 text-sm text-[#CCCCCC] leading-relaxed">
              <p>
                A registration confirmation email has been dispatched for team <strong className="text-white">{teamName}</strong>.
              </p>
              <div className="rounded-xl bg-[#151515] border border-white/10 p-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <span className="text-[#B52A32] font-bold text-base mt-[-2px]">•</span>
                  <p className="text-xs md:text-sm">
                    <strong>Check both folders:</strong> Depending on your email provider, the automated mail might arrive in your <span className="text-[#D83A43] font-semibold">Spam / Junk</span> folder.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-[#B52A32] font-bold text-base mt-[-2px]">•</span>
                  <p className="text-xs md:text-sm">
                    <strong>If received in Spam:</strong> Please open the message and click <span className="text-emerald-400 font-semibold">&quot;Report not spam&quot;</span> or <span className="text-emerald-400 font-semibold">&quot;Move to Inbox&quot;</span> to accept it as normal mail.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-[#B52A32] font-bold text-base mt-[-2px]">•</span>
                  <p className="text-xs md:text-sm">
                    Doing this guarantees that your team receives the <span className="text-white font-medium">Digital QR Passes</span> and official WhatsApp group invitations upon admin approval!
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#B52A32] hover:bg-[#D83A43] text-white px-6 py-3 text-sm font-semibold transition-all shadow-lg min-h-[44px]"
              >
                <Check size={16} /> I Understand, I Will Check Inbox & Spam
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center mb-6">
        <div className="h-16 w-16 rounded-full bg-[#B52A32] flex items-center justify-center red-glow">
          <Check size={28} className="text-white" />
        </div>
      </div>
      <h2 className="display text-3xl md:text-6xl font-bold text-white mb-3">PAYMENT UNDER REVIEW.</h2>
      <p className="text-sm md:text-base text-[#A8A8A8] mb-2">
        Your registration for <span className="text-white">{teamName}</span> has been received.
      </p>
      {acknowledgementEmailSent ? (
        <p className="text-sm md:text-base text-[#A8A8A8] mb-2">
          Confirmation emails have been dispatched to all team members.
        </p>
      ) : (
        <p className="text-sm md:text-base text-[#A8A8A8] mb-2">
          Your registration has been recorded. Please keep your reference details safe.
        </p>
      )}

      {/* ─── PERSISTENT IN-PAGE EMAIL NOTIFICATION CARD ─── */}
      <div className="my-6 rounded-xl border border-[#B52A32]/50 bg-[#B52A32]/10 p-5 text-left md:p-6 text-sm">
        <div className="flex items-center gap-2.5 mb-2 text-[#D83A43] font-semibold">
          <Mail size={18} />
          <span className="mono text-xs uppercase tracking-wider">Email Check Alert (Inbox & Spam)</span>
        </div>
        <p className="text-[#DDDDDD] text-xs md:text-sm leading-relaxed mb-2">
          Please check both your <strong>Inbox</strong> and your <strong>Spam / Junk folder</strong>. If the email arrived in Spam, please open it and click <strong>&quot;Report not spam&quot;</strong> or <strong>&quot;Move to Inbox&quot;</strong> to accept it as normal mail.
        </p>
        <p className="text-[#A8A8A8] text-xs leading-relaxed">
          The super admin will verify your payment shortly. Once approved, all team members will receive their personalized digital pass QR token and WhatsApp group link.
        </p>
      </div>

      {teamId && (
        <div className="glass rounded-lg p-6 mb-8">
          <div className="mono text-[10px] uppercase tracking-widest text-[#A8A8A8]">Reference</div>
          <div className="mono text-sm md:text-lg text-[#B52A32] mt-1 select-all break-all">{teamId}</div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/"
          className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white hover:border-white/40 hover:bg-white/5 transition-all min-h-[44px] flex items-center justify-center"
        >
          Return Home
        </Link>
        <button
          onClick={() => reset()}
          className="rounded-full bg-[#B52A32] px-6 py-3 text-sm font-semibold text-white hover:bg-[#D83A43] transition-all min-h-[44px]"
        >
          Register Another Team
        </button>
      </div>
    </div>
  );
}

// ─── SHARED INPUT ─────────────────────────────────────────────────────────────

function Input({
  label, value, onChange, placeholder, type = "text", error,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; error?: string;
}) {
  return (
    <label className="block">
      <span className="mono text-xs uppercase tracking-widest text-[#A8A8A8]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full bg-transparent border-b border-white/15 py-2 text-base text-white placeholder:text-[#A8A8A8]/40 focus:border-[#B52A32] focus:outline-none transition-colors"
      />
      {error && <div className="mt-1 text-xs text-[#D83A43]">{error}</div>}
    </label>
  );
}

// ─── DEGREE FIELD (UG / PG / Diploma only) ───────────────────────────────────

const DEGREE_OPTIONS = [
  "UG",
  "PG",
  "Diploma",
];

function DegreeField({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div>
      <label className="block">
        <span className="mono text-xs uppercase tracking-widest text-[#A8A8A8]">Degree</span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full bg-transparent border-b border-white/15 py-2 text-base text-white focus:border-[#B52A32] focus:outline-none transition-colors appearance-none cursor-pointer"
        >
          <option value="" disabled className="bg-[#080808] text-[#A8A8A8]">Select degree</option>
          {DEGREE_OPTIONS.map((opt) => (
            <option key={opt} value={opt} className="bg-[#080808] text-white">
              {opt}
            </option>
          ))}
        </select>
      </label>
      {error && <div className="mt-1 text-xs text-[#D83A43]">{error}</div>}
    </div>
  );
}
