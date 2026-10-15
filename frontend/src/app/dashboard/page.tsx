"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { RoleGate } from "@/components/auth/role-gate";
import {
  GraduationCap,
  Crown,
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  LogOut,
  QrCode,
  FileText,
  Layers,
  MapPin,
  Calendar,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Lock,
  Unlock,
  Sparkles,
  RefreshCw,
  Key,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";

interface TeamMember {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  college: string;
  degree: string | null;
  isLeader: boolean;
  participantId: string | null;
  qrToken: string | null;
  passVerified: boolean;
  participantImagePath: string | null;
}

interface ProblemStatement {
  id: string;
  title: string;
  description: string;
  degrees: string[];
  domain: { id: string; name: string } | null;
  createdAt: string;
}

interface DomainItem {
  id: string;
  name: string;
  degrees: string[];
}

interface DashboardData {
  success: boolean;
  category: "UG" | "PG" | "Diploma";
  dashboardTitle: string;
  isProblemStatementsLocked: boolean;
  problemStatementsReleaseTime: string | null;
  selectedDomainName: string | null;
  team: {
    id: string;
    teamName: string;
    registrationId: string | null;
    participantPassword?: string | null;
    acceptedProblemStatementId?: string | null;
    acceptedProblemStatement?: {
      id: string;
      title: string;
      description: string;
      domain?: { id: string; name: string } | null;
    } | null;
    status: string;
    college: string | null;
    degree: string | null;
    domainId: string | null;
    domainName: string | null;
    createdAt: string;
    payment: {
      status: string;
      transactionId: string | null;
      rejectionReason: string | null;
      verifiedAt: string | null;
    } | null;
    members: TeamMember[];
  };
  problemStatements: ProblemStatement[];
  domains: DomainItem[];
}

function ProblemStatementCountdown({
  targetIso,
  onExpire,
}: {
  targetIso: string | null;
  onExpire?: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [hasExpired, setHasExpired] = useState(false);

  useEffect(() => {
    setMounted(true);
    setNow(Date.now());
    if (!targetIso) return;

    const interval = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      const targetTime = new Date(targetIso).getTime();
      if (Number.isFinite(targetTime) && targetTime <= current && !hasExpired) {
        setHasExpired(true);
        onExpire?.();
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [targetIso, hasExpired, onExpire]);

  if (!targetIso) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/40 p-6 text-center">
        <p className="mono text-xs uppercase tracking-widest text-[#A8A8A8]">
          SCHEDULE ANNOUNCEMENT PENDING
        </p>
        <p className="text-xs text-[#777] mt-1.5">
          The administrator will set the problem statement release countdown shortly.
        </p>
      </div>
    );
  }

  const targetTime = new Date(targetIso).getTime();
  const diff = Number.isFinite(targetTime) ? Math.max(0, targetTime - now) : 0;

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  const units = [
    { label: "DAYS", value: days },
    { label: "HOURS", value: hours },
    { label: "MINUTES", value: minutes },
    { label: "SECONDS", value: seconds },
  ];

  return (
    <div suppressHydrationWarning className="flex flex-col items-center">
      <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6">
        {units.map((unit, index) => (
          <div key={unit.label} className="flex items-center gap-2 sm:gap-4 md:gap-6">
            <div className="flex flex-col items-center">
              <div
                suppressHydrationWarning
                className="display min-w-[2.5ch] text-center text-3xl sm:text-5xl font-bold tabular-nums text-white"
              >
                {mounted ? String(unit.value).padStart(2, "0") : "--"}
              </div>
              <div className="mono mt-1 text-[9px] sm:text-[10px] uppercase tracking-widest text-[#A8A8A8]">
                {unit.label}
              </div>
            </div>
            {index < units.length - 1 && (
              <span className="display -mt-3 sm:-mt-4 text-2xl sm:text-4xl text-[#B52A32] font-bold">
                :
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ParticipantDashboardPage() {
  return (
    <RoleGate roles={["PARTICIPANT", "SUPER_ADMIN"]}>
      <DashboardContent />
    </RoleGate>
  );
}

function DashboardContent() {
  const router = useRouter();
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedPsId, setExpandedPsId] = useState<string | null>(null);

  // Credentials update state
  const [showPassword, setShowPassword] = useState(false);
  const [isEditingCredentials, setIsEditingCredentials] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [credSubmitting, setCredSubmitting] = useState(false);
  const [credSuccessMsg, setCredSuccessMsg] = useState<string | null>(null);
  const [credErrorMsg, setCredErrorMsg] = useState<string | null>(null);

  // Problem statement accept state
  const [confirmAcceptPs, setConfirmAcceptPs] = useState<ProblemStatement | null>(null);
  const [acceptSubmitting, setAcceptSubmitting] = useState(false);
  const [acceptSuccessMsg, setAcceptSuccessMsg] = useState<string | null>(null);
  const [acceptErrorMsg, setAcceptErrorMsg] = useState<string | null>(null);

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredErrorMsg(null);
    setCredSuccessMsg(null);

    const payload: { username?: string; password?: string } = {};
    if (newUsername.trim()) payload.username = newUsername.trim();
    if (newPassword.trim()) payload.password = newPassword.trim();

    if (!payload.username && !payload.password) {
      setCredErrorMsg("Please enter a new username (email) or a new password.");
      return;
    }

    setCredSubmitting(true);
    try {
      const res = await fetch("/api/participant/credentials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const resJson = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resJson.error || "Failed to update credentials.");
      }

      setCredSuccessMsg(resJson.message || "Credentials updated successfully!");
      if (data) {
        setData({
          ...data,
          team: {
            ...data.team,
            participantPassword: resJson.password || data.team.participantPassword,
            members: data.team.members.map((m) =>
              m.isLeader && resJson.username ? { ...m, email: resJson.username } : m
            ),
          },
        });
      }
      setNewPassword("");
      setTimeout(() => {
        setIsEditingCredentials(false);
        setCredSuccessMsg(null);
      }, 3000);
    } catch (err) {
      setCredErrorMsg(err instanceof Error ? err.message : "Failed to update credentials.");
    } finally {
      setCredSubmitting(false);
    }
  };

  const handleAcceptProblem = async (ps: ProblemStatement) => {
    setAcceptErrorMsg(null);
    setAcceptSuccessMsg(null);
    setAcceptSubmitting(true);
    try {
      const res = await fetch("/api/participant/accept-problem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemStatementId: ps.id }),
      });
      const resJson = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resJson.error || "Failed to accept problem statement.");
      }

      setAcceptSuccessMsg(`Success! Problem statement "${ps.title}" locked for your team.`);
      if (data) {
        setData({
          ...data,
          team: {
            ...data.team,
            acceptedProblemStatementId: ps.id,
            acceptedProblemStatement: ps,
          },
        });
      }
      setConfirmAcceptPs(null);
    } catch (err) {
      setAcceptErrorMsg(err instanceof Error ? err.message : "Failed to accept problem statement.");
    } finally {
      setAcceptSubmitting(false);
    }
  };

  const fetchDashboard = useCallback(async (isSilent = false) => {
    try {
      if (isSilent) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const res = await fetch("/api/participant/dashboard", { cache: "no-store" });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to load dashboard data");
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching dashboard");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard(false);
  }, [fetchDashboard]);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    window.location.href = "/login?role=PARTICIPANT";
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#030303] text-white flex flex-col items-center justify-center p-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#B52A32] border-t-transparent mb-4" />
        <p className="mono text-xs uppercase tracking-widest text-[#A8A8A8]">
          Authenticating & Loading Dashboard…
        </p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-[#030303] text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 text-center shadow-xl">
          <AlertCircle size={40} className="text-[#D83A43] mx-auto mb-3" />
          <h2 className="display text-xl font-bold text-white mb-2">Dashboard Error</h2>
          <p className="text-xs text-[#A8A8A8] mb-6">{error || "Unable to retrieve dashboard information"}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="rounded-full bg-[#B52A32] px-5 py-2 text-xs font-semibold text-white hover:bg-[#D83A43] transition-all"
            >
              Retry
            </button>
            <button
              onClick={handleSignOut}
              className="rounded-full border border-white/15 px-5 py-2 text-xs font-semibold text-white hover:bg-white/5 transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </main>
    );
  }

  const { team, category, dashboardTitle, problemStatements, domains } = data;
  const isApproved = team.status === "VERIFIED" || Boolean(team.registrationId);
  const isRejected = team.status === "REJECTED";
  const isPending = !isApproved && !isRejected;

  const leader = team.members.find((m) => m.isLeader) || team.members[0];
  const leaderEmail = leader?.email || session?.user?.email || "";

  const categoryBadgeColor =
    category === "Diploma"
      ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
      : category === "PG"
        ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
        : "bg-cyan-500/10 text-cyan-300 border-cyan-500/30";

  return (
    <main className="min-h-screen bg-[#030303] text-white selection:bg-[#B52A32] selection:text-white pb-20">
      {/* Background radial effects */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at top, #151515 0%, #080808 60%, #030303 100%)",
        }}
      />
      <div className="fixed inset-0 bg-grid pointer-events-none opacity-20" />

      {/* ─── HEADER / NAVIGATION ─── */}
      <header className="relative z-20 border-b border-white/10 bg-[#030303]/80 backdrop-blur-md sticky top-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-baseline gap-2">
              <span className="display text-lg font-bold tracking-tight text-white">HACKMITTEN</span>
              <span className="mono text-xs text-[#B52A32]">3.0</span>
            </Link>
            <span className="text-white/20">/</span>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${categoryBadgeColor}`}>
              {dashboardTitle}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-medium text-white">{session?.user?.name || team.teamName}</span>
              <span className="mono text-[10px] text-[#A8A8A8]">{session?.user?.email}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-1.5 text-xs text-[#A8A8A8] hover:text-white hover:border-white/30 hover:bg-white/5 transition-all"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-8">
        {/* ─── DASHBOARD HERO / CATEGORY BANNER ─── */}
        <div className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 sm:p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 h-48 w-48 rounded-full bg-[#B52A32]/10 blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="mono text-xs uppercase tracking-widest text-[#B52A32]">
                  / Participant Portal
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${categoryBadgeColor}`}>
                  {category} Category
                </span>
              </div>
              <h1 className="display text-3xl sm:text-5xl font-bold text-white tracking-tight">
                {dashboardTitle}
              </h1>
              <p className="text-xs sm:text-sm text-[#A8A8A8] mt-2 max-w-2xl leading-relaxed">
                Welcome, team <strong className="text-white">{team.teamName}</strong>. This portal is tailored for participants in the{" "}
                <strong className="text-white">{category}</strong> category. Access your team registration status, digital passes, and category-assigned problem statements.
              </p>
            </div>

            {/* Quick Status Pill Box */}
            <div className="rounded-xl border border-white/10 bg-[#121212] p-4 sm:p-5 flex flex-col gap-2 min-w-[240px]">
              <span className="mono text-[10px] uppercase tracking-wider text-[#A8A8A8]">
                Registration Status
              </span>
              <div className="flex items-center gap-2">
                {isApproved ? (
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-400">
                    <CheckCircle2 size={16} /> Approved
                  </span>
                ) : isRejected ? (
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#D83A43]">
                    <XCircle size={16} /> Rejected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-400">
                    <Clock size={16} /> Under Review
                  </span>
                )}
              </div>
              <div className="border-t border-white/5 pt-2 flex items-center justify-between text-xs">
                <span className="text-[#A8A8A8]">Registration ID:</span>
                <span className="mono font-semibold text-white">
                  {team.registrationId || "Pending Verification"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── STATUS NOTICE CARDS ─── */}
        {isPending && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5 text-xs sm:text-sm flex items-start gap-3.5">
            <Clock size={20} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-200">Payment & Registration Under Admin Review</h4>
              <p className="text-amber-200/80 text-xs mt-1 leading-relaxed">
                Your payment and team details are currently being verified by the hackathon committee. Once approved, your official Registration ID and personal Digital QR Passes will be activated here automatically.
              </p>
            </div>
          </div>
        )}

        {isApproved && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 sm:p-5 text-xs sm:text-sm flex items-start gap-3.5">
            <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-emerald-300">Registration Approved & Confirmed!</h4>
              <p className="text-emerald-300/80 text-xs mt-1 leading-relaxed">
                Your team is officially registered for HACKMITTEN 3.0! Digital QR Passes for all members have been issued below. You can download and bring them to the offline event registration desk.
              </p>
            </div>
          </div>
        )}

        {isRejected && (
          <div className="rounded-xl border border-[#B52A32]/40 bg-[#B52A32]/10 p-4 sm:p-5 text-xs sm:text-sm flex items-start gap-3.5">
            <AlertCircle size={20} className="text-[#D83A43] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white">Registration Rejected</h4>
              <p className="text-[#A8A8A8] text-xs mt-1 leading-relaxed">
                Reason: {team.payment?.rejectionReason || "Payment verification or eligibility issue."} Please contact the event coordinators for assistance.
              </p>
            </div>
          </div>
        )}

        {/* ─── 2-COLUMN GRID: TEAM DETAILS & CATEGORY STATS ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Team Info Card (Col 1-2) */}
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-[#B52A32]" />
                <h3 className="display text-lg font-bold text-white">Team Information</h3>
              </div>
              <span className="mono text-xs text-[#A8A8A8]">ID: {team.id}</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl bg-[#121212] p-3.5 border border-white/5 space-y-1">
                <span className="mono text-[10px] text-[#A8A8A8] uppercase tracking-wider">Team Name</span>
                <p className="font-semibold text-white text-sm">{team.teamName}</p>
              </div>
              <div className="rounded-xl bg-[#121212] p-3.5 border border-white/5 space-y-1">
                <span className="mono text-[10px] text-[#A8A8A8] uppercase tracking-wider">Degree Category</span>
                <p className="font-semibold text-white text-sm flex items-center gap-2">
                  {category}
                  <span className={`text-[10px] font-semibold px-2 py-0.2 rounded border ${categoryBadgeColor}`}>
                    {category === "Diploma" ? "₹500 / team" : "₹1,000 / team"}
                  </span>
                </p>
              </div>
              <div className="rounded-xl bg-[#121212] p-3.5 border border-white/5 space-y-1">
                <span className="mono text-[10px] text-[#A8A8A8] uppercase tracking-wider">Selected Domain</span>
                <p className="font-semibold text-[#D83A43] text-sm">{team.domainName || "Not assigned"}</p>
              </div>
              <div className="rounded-xl bg-[#121212] p-3.5 border border-white/5 space-y-1">
                <span className="mono text-[10px] text-[#A8A8A8] uppercase tracking-wider">College / Institution</span>
                <p className="font-semibold text-white text-sm truncate">{team.college || "Maharaja Institute of Technology"}</p>
              </div>
              {team.payment?.transactionId && (
                <div className="rounded-xl bg-[#121212] p-3.5 border border-white/5 space-y-1 sm:col-span-2">
                  <span className="mono text-[10px] text-[#A8A8A8] uppercase tracking-wider">UPI Transaction ID</span>
                  <p className="font-mono text-white text-xs select-all">{team.payment.transactionId}</p>
                </div>
              )}
            </div>
          </div>

          {/* Event Quick Info Card (Col 3) */}
          <div className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <Calendar size={18} className="text-[#B52A32]" />
                <h3 className="display text-lg font-bold text-white">Event Venue & Info</h3>
              </div>
              <div className="space-y-3 text-xs text-[#CCCCCC]">
                <div className="flex items-start gap-2.5">
                  <MapPin size={16} className="text-[#B52A32] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Maharaja Institute of Technology Thandavapura</strong>
                    <p className="text-[#A8A8A8] text-[11px] mt-0.5">NH 766, Thandavapura, Nanjangud Taluk, Mysuru, Karnataka</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Calendar size={16} className="text-[#B52A32] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">24-Hour Non-stop Hackathon</strong>
                    <p className="text-[#A8A8A8] text-[11px] mt-0.5">National Level Championship</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white/5 p-3.5 border border-white/5 text-[11px] text-[#A8A8A8]">
              Need help? Reach out to your student coordinator or contact the event hotline.
            </div>
          </div>
        </div>

        {/* ─── TEAM LOGIN CREDENTIALS & ACCOUNT MANAGEMENT ─── */}
        <div className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 space-y-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#B52A32]/5 blur-3xl pointer-events-none rounded-full" />
          <div className="flex items-center justify-between flex-wrap gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#B52A32]/10 border border-[#B52A32]/30 text-[#D83A43]">
                <Key size={18} />
              </div>
              <div>
                <h3 className="display text-lg font-bold text-white">Team Login Credentials</h3>
                <p className="text-xs text-[#A8A8A8]">
                  Manage the login credentials used to access your participant dashboard.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsEditingCredentials(!isEditingCredentials);
                setCredErrorMsg(null);
                setCredSuccessMsg(null);
                if (!newUsername) setNewUsername(leaderEmail);
              }}
              className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-semibold text-white hover:border-[#B52A32] hover:bg-[#B52A32]/10 transition-all flex items-center gap-1.5"
            >
              <Key size={13} className="text-[#D83A43]" />
              {isEditingCredentials ? "Cancel Editing" : "Update Username / Password"}
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            {/* Username / Email */}
            <div className="rounded-xl bg-[#121212] p-4 border border-white/5 space-y-1.5">
              <span className="mono text-[10px] text-[#A8A8A8] uppercase tracking-wider">
                Login Username (Leader Email)
              </span>
              <p className="font-mono text-white text-sm select-all font-semibold break-all">
                {leaderEmail}
              </p>
            </div>

            {/* Password */}
            <div className="rounded-xl bg-[#121212] p-4 border border-white/5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="mono text-[10px] text-[#A8A8A8] uppercase tracking-wider">
                  Login Password
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-white/60 hover:text-white transition-colors flex items-center gap-1 text-[11px]"
                >
                  {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  <span>{showPassword ? "Hide" : "Show"}</span>
                </button>
              </div>
              <p className="font-mono text-[#D83A43] text-sm select-all font-bold break-all">
                {showPassword ? (team.participantPassword || team.id) : "••••••••••••"}
              </p>
            </div>
          </div>

          {/* Inline Edit Form */}
          {isEditingCredentials && (
            <form
              onSubmit={handleUpdateCredentials}
              className="rounded-xl border border-[#B52A32]/40 bg-[#121212] p-5 space-y-4"
            >
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Key size={15} className="text-[#D83A43]" /> Change Team Login Details
                </h4>
                <p className="text-xs text-[#A8A8A8] mt-1">
                  Update your login username (email) and/or password. These credentials will be used for your next login.
                </p>
              </div>

              {credSuccessMsg && (
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>{credSuccessMsg}</span>
                </div>
              )}

              {credErrorMsg && (
                <div className="rounded-lg bg-[#B52A32]/10 border border-[#B52A32]/30 p-3 text-xs text-[#D83A43] flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{credErrorMsg}</span>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mono text-[10px] uppercase tracking-wider text-[#A8A8A8] mb-1.5">
                    New Username / Email
                  </label>
                  <input
                    type="email"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder={leaderEmail}
                    className="w-full rounded-lg bg-black/60 border border-white/10 px-3.5 py-2.5 text-xs text-white placeholder:text-[#666] focus:border-[#B52A32] focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block mono text-[10px] uppercase tracking-wider text-[#A8A8A8] mb-1.5">
                    New Password
                  </label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 4 chars)"
                    className="w-full rounded-lg bg-black/60 border border-white/10 px-3.5 py-2.5 text-xs text-white placeholder:text-[#666] focus:border-[#B52A32] focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingCredentials(false)}
                  disabled={credSubmitting}
                  className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-[#A8A8A8] hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={credSubmitting}
                  className="rounded-full bg-[#B52A32] hover:bg-[#D83A43] px-5 py-2 text-xs font-semibold text-white transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {credSubmitting ? "Saving…" : "Save New Credentials"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ─── TEAM MEMBERS ROSTER & QR PASSES ─── */}
        <div className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Users size={18} className="text-[#B52A32]" />
                <h3 className="display text-xl font-bold text-white">Team Members & Digital Passes</h3>
              </div>
              <p className="text-xs text-[#A8A8A8] mt-1">
                {team.members.length} registered members ({category} category). All team members share the leader&apos;s category.
              </p>
            </div>
            {isApproved && (
              <span className="mono text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Digital QR Passes Active
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {team.members.map((m, idx) => (
              <div
                key={m.id}
                className={`rounded-xl border p-4 flex flex-col justify-between transition-all bg-[#121212] ${
                  m.isLeader ? "border-[#B52A32]/60 shadow-[0_0_20px_rgba(181,42,50,0.15)]" : "border-white/10"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="mono text-[10px] uppercase tracking-wider text-[#A8A8A8]">
                      Member {String(idx + 1).padStart(2, "0")}
                    </span>
                    {m.isLeader && (
                      <span className="inline-flex items-center gap-1 mono text-[10px] font-bold text-[#D83A43] bg-[#B52A32]/10 border border-[#B52A32]/30 px-2 py-0.5 rounded">
                        <Crown size={10} /> Leader
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-sm sm:text-base">{m.fullName}</h4>
                    <p className="text-[11px] text-[#A8A8A8] truncate mt-0.5">{m.email}</p>
                    <p className="mono text-[11px] text-[#A8A8A8] mt-0.5">{m.phone}</p>
                    <div className="mt-2 inline-block">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/80 border border-white/5">
                        {m.degree || category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Digital Pass Button */}
                <div className="pt-4 border-t border-white/5 mt-4">
                  {isApproved && m.qrToken ? (
                    <Link
                      href={`/pass?token=${encodeURIComponent(m.qrToken)}`}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#B52A32] hover:bg-[#D83A43] text-white py-2 px-3 text-xs font-semibold transition-all shadow-md"
                    >
                      <QrCode size={14} /> View Digital Pass
                    </Link>
                  ) : (
                    <div className="w-full text-center py-2 px-3 text-[11px] text-[#A8A8A8] bg-white/5 rounded-lg border border-white/5">
                      Pass unlocks upon approval
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── PROBLEM STATEMENTS SECTION (LOCKED VS UNLOCKED) ─── */}
        {data.isProblemStatementsLocked ? (
          <div className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#B52A32]/10 blur-3xl pointer-events-none rounded-full" />
            
            <div className="flex items-center justify-between flex-wrap gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <Lock size={18} className="text-[#D83A43]" />
                <h3 className="display text-xl font-bold text-white">
                  Problem Statements Locked
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fetchDashboard(true)}
                  disabled={isRefreshing}
                  className="mono text-xs px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white flex items-center gap-1.5 transition-all disabled:opacity-50"
                  title="Check if problem statements were unlocked"
                >
                  <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
                  {isRefreshing ? "Checking…" : "Check Status"}
                </button>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${categoryBadgeColor}`}>
                  {category} Track
                </span>
              </div>
            </div>

            <div className="py-6 sm:py-8 text-center space-y-6">
              <div className="space-y-2">
                <div className="mono text-xs uppercase tracking-widest text-[#B52A32]">
                  / Track: {data.selectedDomainName || team.domainName || "Assigned Domain"}
                </div>
                <h4 className="display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Problem Statements Unlock Countdown
                </h4>
                <p className="text-xs sm:text-sm text-[#A8A8A8] max-w-xl mx-auto leading-relaxed">
                  Problem statements for your registered domain (
                  <strong className="text-white">
                    {data.selectedDomainName || team.domainName || "Selected Track"}
                  </strong>
                  ) will be unlocked and revealed automatically when the timer reaches zero.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#121212] p-6 sm:p-8 inline-block min-w-[280px] sm:min-w-[460px] shadow-inner">
                <ProblemStatementCountdown
                  targetIso={data.problemStatementsReleaseTime}
                  onExpire={() => fetchDashboard(true)}
                />
              </div>

              {data.problemStatementsReleaseTime && (
                <p className="mono text-[11px] text-[#A8A8A8]">
                  Scheduled Release:{" "}
                  <span className="text-white">
                    {new Date(data.problemStatementsReleaseTime).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-500/30 bg-[#0A0A0A] p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />
            <div className="flex items-center justify-between flex-wrap gap-3 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <FileText size={18} className="text-emerald-400" />
                  <h3 className="display text-xl font-bold text-white">
                    Problem Statements — {data.selectedDomainName || team.domainName || category} Track
                  </h3>
                </div>
                <p className="text-xs text-[#A8A8A8] mt-1">
                  Statements for your selected track:{" "}
                  <strong className="text-emerald-400">
                    {data.selectedDomainName || team.domainName || "Registered Track"}
                  </strong>{" "}
                  ({category} Category).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="mono text-xs px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold flex items-center gap-1.5">
                  <Unlock size={12} /> Unlocked
                </span>
                <span className="mono text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/80">
                  {problemStatements.length} Statement{problemStatements.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            {/* Success message banner */}
            {acceptSuccessMsg && (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs sm:text-sm text-emerald-300 flex items-center gap-2.5">
                <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
                <span>{acceptSuccessMsg}</span>
              </div>
            )}

            {/* Accepted Problem Statement Banner */}
            {team.acceptedProblemStatementId && (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-5 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mono">
                    <CheckCircle2 size={16} /> Problem Statement Locked for Your Team
                  </div>
                  <span className="mono text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                    1 of 1 Limit Enforced
                  </span>
                </div>
                <h4 className="display text-lg sm:text-xl font-bold text-white">
                  {team.acceptedProblemStatement?.title || problemStatements.find((p) => p.id === team.acceptedProblemStatementId)?.title || "Accepted Problem Statement"}
                </h4>
                <p className="text-xs text-[#CCCCCC]">
                  Your team has officially selected and locked this problem statement for HACKMITTEN 3.0. Under hackathon rules, each team can accept only 1 problem statement.
                </p>
              </div>
            )}

            {!team.acceptedProblemStatementId && problemStatements.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-[#A8A8A8] flex items-start gap-3">
                <Sparkles size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Choose Your Team&apos;s Problem Statement:</strong>
                  <p className="mt-0.5">
                    Review the statements below and click &quot;Accept Problem Statement&quot;. Note: each team is strictly limited to <strong>ONLY ONE</strong> problem statement. Once locked, it cannot be changed.
                  </p>
                </div>
              </div>
            )}

            {problemStatements.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/15 p-8 text-center bg-[#121212]/50">
                <FileText size={32} className="text-[#A8A8A8] mx-auto mb-2 opacity-50" />
                <h4 className="text-sm font-semibold text-white">
                  No problem statements released yet for {data.selectedDomainName || team.domainName || category}
                </h4>
                <p className="text-xs text-[#A8A8A8] mt-1 max-w-md mx-auto">
                  The organizing committee will publish problem statements for your selected domain shortly. Please stay tuned.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {problemStatements.map((ps) => {
                  const isExpanded = expandedPsId === ps.id || problemStatements.length === 1;
                  const isAcceptedByThisTeam = team.acceptedProblemStatementId === ps.id;
                  const isLockedOut = Boolean(team.acceptedProblemStatementId && !isAcceptedByThisTeam);

                  return (
                    <div
                      key={ps.id}
                      className={`rounded-xl border transition-all overflow-hidden bg-[#121212] ${
                        isAcceptedByThisTeam
                          ? "border-emerald-500/60 shadow-[0_0_25px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30"
                          : isLockedOut
                            ? "border-white/5 opacity-70"
                            : "border-white/10 hover:border-emerald-500/40"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedPsId(isExpanded ? null : ps.id)}
                        className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-4"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {ps.domain && (
                              <span className="mono text-[10px] uppercase font-bold text-[#D83A43] bg-[#B52A32]/10 border border-[#B52A32]/30 px-2 py-0.5 rounded">
                                {ps.domain.name} Track
                              </span>
                            )}
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${categoryBadgeColor}`}>
                              {category} Eligible
                            </span>
                            {isAcceptedByThisTeam && (
                              <span className="mono text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                                <Check size={10} /> ACCEPTED BY TEAM
                              </span>
                            )}
                            {isLockedOut && (
                              <span className="mono text-[10px] text-[#A8A8A8] bg-white/5 border border-white/10 px-2 py-0.5 rounded flex items-center gap-1">
                                <Lock size={10} /> Locked
                              </span>
                            )}
                          </div>
                          <h4 className="display text-base sm:text-lg font-bold text-white tracking-tight">
                            {ps.title}
                          </h4>
                          {!isExpanded && ps.description && (
                            <p className="text-xs text-[#A8A8A8] line-clamp-2">
                              {ps.description.replace(/<[^>]+>/g, " ")}
                            </p>
                          )}
                        </div>
                        <div className="p-1 text-[#A8A8A8] shrink-0">
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-4 sm:px-5 pb-5 pt-3 border-t border-white/5 space-y-4">
                          <div>
                            <span className="mono text-[10px] uppercase tracking-wider text-[#A8A8A8]">
                              Problem Description & Scope
                            </span>
                            <div className="mt-2 text-xs sm:text-sm text-[#E0E0E0] leading-relaxed rounded-lg bg-black/50 p-4 sm:p-5 border border-white/5 overflow-x-auto">
                              {ps.description?.includes("<") ? (
                                <div
                                  className="prose prose-invert prose-sm sm:prose-base max-w-none [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_pre]:bg-black/70 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-white/10 [&_code]:text-emerald-400 [&_blockquote]:border-l-2 [&_blockquote]:border-[#B52A32] [&_blockquote]:pl-3 [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_a]:text-[#D83A43] [&_a]:underline"
                                  dangerouslySetInnerHTML={{ __html: ps.description }}
                                />
                              ) : (
                                <div className="whitespace-pre-wrap">{ps.description}</div>
                              )}
                            </div>
                          </div>

                          {/* Problem Acceptance CTA or Status */}
                          <div className="pt-3 border-t border-white/5 flex items-center justify-between flex-wrap gap-3">
                            <div>
                              {isAcceptedByThisTeam ? (
                                <span className="inline-flex items-center gap-1.5 mono text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full">
                                  <Check size={14} /> Accepted & Locked by Your Team
                                </span>
                              ) : isLockedOut ? (
                                <span className="inline-flex items-center gap-1.5 mono text-xs text-[#A8A8A8] bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                                  <Lock size={12} /> Another Problem Statement Accepted
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmAcceptPs(ps);
                                  }}
                                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 text-xs font-bold tracking-wide transition-all shadow-lg active:scale-95"
                                >
                                  <Check size={14} /> Accept Problem Statement
                                </button>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-[#A8A8A8]">
                              <span className="mono text-[10px]">Categories: {ps.degrees.join(", ")}</span>
                              <span className="mono text-[10px]">Track: {data.selectedDomainName || team.domainName || "Assigned"}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── COMPETITION DOMAINS AVAILABLE FOR THIS CATEGORY ─── */}
        <div className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <Layers size={18} className="text-[#B52A32]" />
                <h3 className="display text-xl font-bold text-white">
                  Eligible Domains — {category} Category
                </h3>
              </div>
              <p className="text-xs text-[#A8A8A8] mt-1">
                Domains configured for {category} participants by the administration.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {domains.map((d) => (
              <div
                key={d.id}
                className="rounded-xl border border-white/10 bg-[#121212] p-4.5 space-y-2 hover:border-[#B52A32]/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="display font-bold text-white text-base">{d.name}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${categoryBadgeColor}`}>
                    {category}
                  </span>
                </div>
                <p className="text-xs text-[#A8A8A8]">
                  Available track for innovation and problem statement assignment.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── CONFIRM ACCEPT PROBLEM STATEMENT MODAL ─── */}
      {confirmAcceptPs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl border border-emerald-500/50 bg-[#0A0A0A] p-6 sm:p-8 text-left shadow-[0_0_50px_rgba(16,185,129,0.25)] space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <span className="mono text-[10px] uppercase tracking-widest text-emerald-400 font-semibold">
                  Confirm Selection
                </span>
                <h3 className="display text-xl font-bold text-white">
                  Lock Problem Statement?
                </h3>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-[#CCCCCC] leading-relaxed">
              <div className="rounded-xl bg-[#121212] border border-white/10 p-4 space-y-2">
                <span className="mono text-[10px] uppercase tracking-wider text-[#A8A8A8]">
                  Selected Statement
                </span>
                <h4 className="font-bold text-white text-base">
                  {confirmAcceptPs.title}
                </h4>
                {confirmAcceptPs.domain && (
                  <span className="inline-block mono text-[10px] text-[#D83A43] bg-[#B52A32]/10 border border-[#B52A32]/30 px-2 py-0.5 rounded">
                    {confirmAcceptPs.domain.name} Track
                  </span>
                )}
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200 space-y-1">
                <p className="font-bold text-amber-300">⚠️ Rule: One Problem Statement Per Team</p>
                <p>
                  Each team can select and accept <strong>ONLY ONE</strong> problem statement for the entire competition. Once locked, this decision cannot be undone or switched.
                </p>
              </div>
            </div>

            {acceptErrorMsg && (
              <div className="rounded-lg bg-[#B52A32]/10 border border-[#B52A32]/30 p-3 text-xs text-[#D83A43]">
                {acceptErrorMsg}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmAcceptPs(null);
                  setAcceptErrorMsg(null);
                }}
                disabled={acceptSubmitting}
                className="rounded-full border border-white/10 px-5 py-2.5 text-xs font-semibold text-[#A8A8A8] hover:text-white hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleAcceptProblem(confirmAcceptPs)}
                disabled={acceptSubmitting}
                className="rounded-full bg-emerald-600 hover:bg-emerald-500 px-6 py-2.5 text-xs font-semibold text-white transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
              >
                {acceptSubmitting ? "Locking…" : "Yes, Lock Problem Statement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
