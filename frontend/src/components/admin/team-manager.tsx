"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Pencil, X, Loader2, Crown, AlertTriangle, Search, ImagePlus, Check, AlertCircle, Upload, ShieldCheck, ExternalLink, CheckCircle2, RotateCcw } from "lucide-react";
import { fetchJson } from "@/lib/api-fetch";
import { compressImage } from "@/lib/image-compress";

type Team = {
  id: string;
  teamName: string;
  registrationId: string | null;
  status: string;
  college: string | null;
  degree?: string | null;
  domainId?: string | null;
  domainName?: string | null;
  createdAt: string;
  members: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    college: string;
    degree: string | null;
    isLeader: boolean;
    participantId: string | null;
    hasParticipantImage?: boolean;
    qrToken?: string | null;
    passVerified?: boolean;
  }[];
  payment: {
    id: string;
    status: string;
    transactionId: string | null;
    screenshots?: { id: string; fileName: string; mimeType: string; sizeBytes: number }[];
  } | null;
};

export function TeamManager() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Team | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Team | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, error: queryError } = useQuery<{ teams: Team[] }>({
    queryKey: ["admin-teams"],
    queryFn: () => fetchJson("/api/admin/teams"),
  });
  const teams: Team[] = data?.teams ?? [];
  const filtered = teams.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return t.teamName.toLowerCase().includes(q) || t.registrationId?.toLowerCase().includes(q) || t.college?.toLowerCase().includes(q);
  });

  const deleteTeam = async () => {
    if (!confirmDelete) return;
    setBusy(true); setError(null);
    try {
      const r = await fetch(`/api/admin/teams/${confirmDelete.id}`, { method: "DELETE" });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Failed");
      setConfirmDelete(null);
      qc.invalidateQueries({ queryKey: ["admin-teams"] });
      qc.invalidateQueries({ queryKey: ["admin-registrations"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="mono text-[10px] uppercase tracking-[0.3em] text-[#B52A32] mb-2">/ Teams</div>
          <h1 className="display text-2xl md:text-3xl font-bold text-white">Team Management</h1>
          <p className="text-sm text-[#A8A8A8] mt-1">{teams.length} teams · add, edit, or delete</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-full bg-[#B52A32] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#D83A43] min-h-[44px]"
        >
          <Plus size={14} /> Add Team
        </button>
      </header>

      {(error || queryError) && <div role="alert" className="glass rounded p-3 text-sm text-[#D83A43] border-l-2 border-[#B52A32]">{error || queryError?.message}</div>}

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A8A8]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search team name, ID, or college…"
          className="w-full bg-[#080808] border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-[#A8A8A8]/50 focus:border-[#B52A32] focus:outline-none"
        />
      </div>

      {isLoading ? (
        <div className="text-[#A8A8A8] text-sm">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-lg p-8 text-center">
          <div className="text-sm text-[#A8A8A8]">No teams found.</div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((team) => (
            <div key={team.id} className="glass rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="mono text-xs text-[#B52A32]">{team.registrationId ?? "—"}</div>
                  <div className="display text-lg font-bold text-white mt-1">{team.teamName}</div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-1 rounded ${
                  team.status === "APPROVED" ? "bg-[#B52A32]/20 text-[#D83A43]" :
                  team.status === "REJECTED" ? "bg-red-500/20 text-red-400" :
                  "bg-white/5 text-[#A8A8A8]"
                }`}>
                  {team.status.replace(/_/g, " ")}
                </span>
              </div>
              {team.college && <div className="text-xs text-[#A8A8A8] truncate">{team.college}</div>}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {team.degree && (
                  <span className="mono text-[10px] bg-[#B52A32]/20 border border-[#B52A32]/40 text-white px-2 py-0.5 rounded font-semibold">
                    {team.degree}
                  </span>
                )}
                {team.domainName && (
                  <span className="mono text-[10px] bg-white/10 text-white px-2 py-0.5 rounded font-medium">
                    {team.domainName}
                  </span>
                )}
                <span className="text-[11px] text-[#A8A8A8] ml-auto">{team.members.length} members</span>
              </div>
              <div className="mt-3 pt-3 border-t border-white/5 flex gap-2">
                <button
                  onClick={() => setEditing(team)}
                  className="flex items-center gap-1 text-xs text-[#A8A8A8] hover:text-white px-2 py-1 rounded hover:bg-white/5"
                >
                  <Pencil size={12} /> Edit
                </button>
                <button
                  onClick={() => setConfirmDelete(team)}
                  className="flex items-center gap-1 text-xs text-[#A8A8A8] hover:text-red-400 px-2 py-1 rounded hover:bg-white/5"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <TeamFormModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
            setShowCreate(false);
            qc.invalidateQueries({ queryKey: ["admin-teams"] });
            qc.invalidateQueries({ queryKey: ["admin-registrations"] });
            qc.invalidateQueries({ queryKey: ["admin-stats"] });
          }}
        />
      )}

      {editing && (
        <TeamFormModal
          team={editing}
          onClose={() => setEditing(null)}
          onSuccess={() => {
            setEditing(null);
            qc.invalidateQueries({ queryKey: ["admin-teams"] });
            qc.invalidateQueries({ queryKey: ["admin-registrations"] });
          }}
        />
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={20} className="text-red-400" />
              <h3 className="display text-lg font-bold text-white">Delete team?</h3>
            </div>
            <div className="mb-4 space-y-1">
              <div className="text-sm text-white">Team: <span className="font-bold">{confirmDelete.teamName}</span></div>
              <div className="text-xs text-[#A8A8A8]">Team ID: <span className="mono text-[#B52A32]">{confirmDelete.registrationId ?? "—"}</span></div>
            </div>
            <p className="text-sm text-[#A8A8A8] mb-6">
              This will permanently remove the team, all {confirmDelete.members.length} participants,
              payment records, screenshots, food check-ins, and QR/pass data. This cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmDelete(null)} disabled={busy} className="rounded-full border border-white/15 px-5 py-2 text-xs text-white hover:bg-white/5 disabled:opacity-50">Cancel</button>
              <button onClick={deleteTeam} disabled={busy} className="flex items-center gap-2 rounded-full bg-red-600 disabled:opacity-50 px-5 py-2 text-xs font-semibold text-white hover:bg-red-500">
                {busy ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />} Delete Team
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Team Form Modal (create + edit) ───────────────────────────────────────

interface MemberFormState {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  college: string;
  degree: string;
  isLeader: boolean;
  hasParticipantImage?: boolean;
  participantImageFile?: File | null;
  participantImagePreview?: string | null;
}

const GMAIL_REGEX = /^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*@gmail\.com$/i;

function TeamFormModal({
  team,
  onClose,
  onSuccess,
}: {
  team?: Team;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isEdit = !!team;
  const [teamName, setTeamName] = useState(team?.teamName ?? "");
  const [college, setCollege] = useState(team?.college ?? "");
  const [degree, setDegree] = useState<"Diploma" | "UG" | "PG" | "">(
    (team?.degree as any) ?? ""
  );
  const [domainId, setDomainId] = useState<string>(team?.domainId ?? "");

  const { data: domainsData, isLoading: domainsLoading } = useQuery<{
    domains: Array<{ id: string; name: string; degrees: string[] }>;
  }>({
    queryKey: ["admin-domains-for-degree", degree],
    queryFn: async () => {
      if (!degree) return { domains: [] };
      const r = await fetch(`/api/domains?degree=${encodeURIComponent(degree)}`);
      if (!r.ok) return { domains: [] };
      return r.json();
    },
    enabled: Boolean(degree),
  });
  const availableDomains = domainsData?.domains || [];

  // When degree is changed during editing, reset domainId if not valid for new degree
  useEffect(() => {
    if (domainId && availableDomains.length > 0) {
      const match = availableDomains.find((d) => d.id === domainId);
      if (!match) {
        setDomainId("");
      }
    }
  }, [domainId, availableDomains]);
  const [members, setMembers] = useState<MemberFormState[]>(
    team?.members?.map((m) => ({
      id: m.id,
      fullName: m.fullName,
      email: m.email,
      phone: m.phone,
      college: m.college,
      degree: m.degree ?? "",
      isLeader: m.isLeader,
      hasParticipantImage: m.hasParticipantImage,
      participantImageFile: null,
      participantImagePreview: null,
    })) ?? [
      { fullName: "", email: "", phone: "", college: "", degree: "", isLeader: true, participantImageFile: null, participantImagePreview: null },
      { fullName: "", email: "", phone: "", college: "", degree: "", isLeader: false, participantImageFile: null, participantImagePreview: null },
      { fullName: "", email: "", phone: "", college: "", degree: "", isLeader: false, participantImageFile: null, participantImagePreview: null },
    ]
  );
  const [status, setStatus] = useState<"SUBMITTED" | "APPROVED">(
    team?.status === "APPROVED" ? "APPROVED" : "SUBMITTED"
  );
  const [transactionId, setTransactionId] = useState(team?.payment?.transactionId ?? "");
  const [paymentStatus, setPaymentStatus] = useState<"SUBMITTED" | "VERIFIED" | "REJECTED">(
    (team?.payment?.status as any) || (team?.status === "APPROVED" ? "VERIFIED" : "SUBMITTED")
  );
  const [paymentScreenshotFile, setPaymentScreenshotFile] = useState<File | null>(null);
  const [paymentScreenshotPreview, setPaymentScreenshotPreview] = useState<string | null>(null);

  // Fetch full live team record in edit mode to guarantee member images and screenshots are loaded
  const { data: teamDetailData } = useQuery<{ team: Team }>({
    queryKey: ["admin-team-detail", team?.id],
    queryFn: async () => {
      if (!team?.id) return null as any;
      const r = await fetch(`/api/admin/teams/${team.id}`);
      if (!r.ok) return null as any;
      return r.json();
    },
    enabled: Boolean(isEdit && team?.id),
  });

  const detailedTeam = teamDetailData?.team ?? team;
  const existingScreenshot = detailedTeam?.payment?.screenshots?.[0] ?? null;
  const paymentId = detailedTeam?.payment?.id;

  // Sync member IDs and photo availability when live team details arrive
  useEffect(() => {
    if (teamDetailData?.team?.members) {
      setMembers((prev) =>
        prev.map((m, idx) => {
          const fresh = teamDetailData.team.members[idx];
          if (!fresh) return m;
          return {
            ...m,
            id: m.id || fresh.id,
            hasParticipantImage: fresh.hasParticipantImage ?? m.hasParticipantImage,
          };
        })
      );
      if (teamDetailData.team.payment?.transactionId && !transactionId) {
        setTransactionId(teamDetailData.team.payment.transactionId);
      }
    }
  }, [teamDetailData]);

  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverIssues, setServerIssues] = useState<string[]>([]);

  const setMember = (idx: number, patch: Partial<MemberFormState>) => {
    setMembers((ms) => ms.map((m, i) => (i === idx ? { ...m, ...patch } : m)));
  };
  const addMember = () => {
    if (members.length < 4) {
      setMembers([...members, { fullName: "", email: "", phone: "", college: "", degree: "", isLeader: false, participantImageFile: null, participantImagePreview: null }]);
    }
  };
  const removeMember = (idx: number) => {
    if (members.length > 3) {
      setMembers(members.filter((_, i) => i !== idx));
    }
  };

  // ─── Field-Level Validations matching registration steps ───────────────
  const emails = members.map((m) => m.email.toLowerCase().trim());

  // Team Name
  const teamNameHasInvalid = teamName.trim().length > 0 && !/^[a-zA-Z0-9 _\-.]+$/.test(teamName.trim());
  const teamNameTooShort = teamName.trim().length > 0 && teamName.trim().length < 2;
  const teamNameError = teamNameHasInvalid
    ? "• Team name contains invalid characters"
    : teamNameTooShort
    ? "• Team name must be at least 2 characters"
    : attemptedSubmit && !teamName.trim()
    ? "• Team name is required"
    : undefined;

  // College Name
  const collegeHasDigits = /\d/.test(college);
  const collegeTooShort = college.trim().length > 0 && college.trim().length < 2;
  const collegeError = collegeHasDigits
    ? "• Numbers are not allowed in college name"
    : collegeTooShort
    ? "• College name must be at least 2 characters"
    : attemptedSubmit && !college.trim()
    ? "• College name is required"
    : undefined;

  // Leader count
  const leaderCount = members.filter((m) => m.isLeader).length;

  const validateForm = () => {
    const issues: string[] = [];
    if (!teamName.trim() || teamName.trim().length < 2) issues.push("Team name must be at least 2 characters");
    if (teamNameHasInvalid) issues.push("Team name has invalid characters");
    if (!college.trim() || college.trim().length < 2) issues.push("College name must be at least 2 characters");
    if (collegeHasDigits) issues.push("College name cannot contain numbers");
    
    const effectiveDegree = degree || (members.find((m) => m.isLeader)?.degree as any) || members[0]?.degree;
    if (!effectiveDegree || !["Diploma", "UG", "PG"].includes(effectiveDegree)) {
      issues.push("Degree category is required (Diploma, UG, PG)");
    }
    if (!domainId || !domainId.trim()) {
      issues.push(`Please select an applicable competition domain for ${effectiveDegree || degree || "the team"}`);
    }
    if (leaderCount !== 1) issues.push("Exactly one team leader must be designated");
    if (members.length < 3 || members.length > 4) issues.push("Team must have 3 or 4 members");

    members.forEach((m, i) => {
      const label = `Member ${i + 1} (${m.fullName.trim() || "unnamed"})`;
      if (!m.fullName.trim() || m.fullName.trim().length < 2) issues.push(`${label}: Full name must be at least 2 characters`);
      if (/\d/.test(m.fullName)) issues.push(`${label}: Numbers not allowed in full name`);
      if (!m.email.trim() || !GMAIL_REGEX.test(m.email.trim())) issues.push(`${label}: Must be a valid @gmail.com address`);
      if (emails.indexOf(m.email.toLowerCase().trim()) !== i && m.email.trim()) issues.push(`${label}: Duplicate email in team`);
      if (!m.phone.trim() || !/^[6-9][0-9]{9}$/.test(m.phone.trim())) issues.push(`${label}: Must be a valid 10-digit Indian phone number`);
      if (!m.college.trim() || m.college.trim().length < 2) issues.push(`${label}: College must be at least 2 characters`);
      if (/\d/.test(m.college)) issues.push(`${label}: Numbers not allowed in member college`);
      if (!m.degree.trim()) issues.push(`${label}: Degree is required`);
      const hasPhoto = Boolean(m.participantImageFile || m.hasParticipantImage || (isEdit && m.id));
      if (!hasPhoto) {
        issues.push(`${label}: Participant photo is required`);
      }
    });

    return issues;
  };

  const submit = async () => {
    setAttemptedSubmit(true);
    setError(null);
    setServerIssues([]);

    const clientIssues = validateForm();
    if (clientIssues.length > 0) {
      setError("Please correct the errors highlighted below before proceeding.");
      setServerIssues(clientIssues);
      return;
    }

    setBusy(true);
    try {
      const formData = new FormData();
      const payloadMembers = members.map((m) => ({
        id: m.id,
        fullName: m.fullName.trim(),
        email: m.email.toLowerCase().trim(),
        phone: m.phone.trim(),
        college: m.college.trim(),
        degree: m.degree.trim(),
        isLeader: m.isLeader,
      }));

      formData.append(
        "team",
        JSON.stringify({
          teamName: teamName.trim(),
          college: college.trim() || undefined,
          degree: degree || undefined,
          domainId: domainId || undefined,
          members: payloadMembers,
          status,
          transactionId: transactionId.trim() || undefined,
          paymentStatus: status === "APPROVED" ? "VERIFIED" : paymentStatus,
        })
      );

      // Compress and append member photos
      for (let i = 0; i < members.length; i++) {
        const file = members[i].participantImageFile;
        if (file) {
          const compressed = file.size > 250 * 1024
            ? await compressImage(file, { maxWidth: 800, maxHeight: 800, quality: 0.82 })
            : file;
          formData.append(`participantImage${i}`, compressed);
        }
      }

      // Compress and append payment screenshot
      if (paymentScreenshotFile) {
        const compressedScreenshot = paymentScreenshotFile.size > 500 * 1024
          ? await compressImage(paymentScreenshotFile, { maxWidth: 1600, maxHeight: 1600, quality: 0.85 })
          : paymentScreenshotFile;
        formData.append("paymentScreenshot", compressedScreenshot);
      }

      const url = isEdit ? `/api/admin/teams/${team!.id}` : "/api/admin/teams";
      const method = isEdit ? "PATCH" : "POST";
      const r = await fetch(url, { method, body: formData });
      const j = await r.json().catch(() => ({}));

      if (!r.ok) {
        if (j.issues && Array.isArray(j.issues)) {
          const list = j.issues.map((iss: any) => {
            const p = iss.path?.join(".");
            return p ? `${p}: ${iss.message}` : iss.message;
          });
          setServerIssues(list);
        }
        throw new Error(j.error || "Submission failed");
      }

      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4" onClick={onClose}>
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/10 p-5 flex items-center justify-between z-10 shrink-0">
          <div>
            <div className="mono text-[10px] uppercase tracking-[0.25em] text-[#B52A32]">/ Admin Portal</div>
            <h3 className="display text-xl font-bold text-white">{isEdit ? "Edit Team Registration" : "Add Team Registration"}</h3>
          </div>
          <button onClick={onClose} className="text-[#A8A8A8] hover:text-white p-1 rounded hover:bg-white/5 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {/* Server / Validation Error alert banner */}
          {error && (
            <div className="glass rounded-lg p-4 text-sm text-[#D83A43] border-l-4 border-[#B52A32] bg-red-950/20 space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
              {serverIssues.length > 0 && (
                <ul className="text-xs space-y-1 text-red-300 list-disc list-inside mt-2 bg-black/40 p-2.5 rounded border border-red-900/30">
                  {serverIssues.map((iss, i) => (
                    <li key={i}>{iss}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Team Info Section */}
          <div className="glass rounded-xl p-4 border border-white/5 space-y-4">
            <div className="mono text-[11px] uppercase tracking-wider text-white font-semibold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#B52A32]" />
              Team Details
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block">
                  <span className="mono text-[10px] uppercase tracking-widest text-[#A8A8A8]">
                    Team Name <span className="text-[#D83A43]">*</span>
                  </span>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="mt-1 w-full bg-[#080808] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#B52A32] focus:outline-none transition-colors"
                    placeholder="Enter team name"
                    maxLength={60}
                  />
                </label>
                {teamNameError && (
                  <p className="text-xs text-[#D83A43] mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle size={12} className="shrink-0" /> {teamNameError}
                  </p>
                )}
              </div>

              <div>
                <label className="block">
                  <span className="mono text-[10px] uppercase tracking-widest text-[#A8A8A8]">
                    College / Institution <span className="text-[#D83A43]">*</span>
                  </span>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="mt-1 w-full bg-[#080808] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#B52A32] focus:outline-none transition-colors"
                    placeholder="Enter college / institution name"
                    maxLength={150}
                  />
                </label>
                {collegeError && (
                  <p className="text-xs text-[#D83A43] mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle size={12} className="shrink-0" /> {collegeError}
                  </p>
                )}
              </div>
            </div>

            {/* Degree and Domain selection */}
            <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-white/5">
              <div>
                <label className="block">
                  <span className="mono text-[10px] uppercase tracking-widest text-[#A8A8A8]">
                    Degree Category <span className="text-[#D83A43]">*</span>
                  </span>
                  <select
                    value={degree}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setDegree(val);
                      if (val) {
                        setMembers((ms) => ms.map((m) => ({ ...m, degree: m.degree || val })));
                      }
                    }}
                    className="mt-1 w-full bg-[#080808] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#B52A32] focus:outline-none"
                  >
                    <option value="">Select Degree Category</option>
                    <option value="Diploma">Diploma</option>
                    <option value="UG">UG (Undergraduate)</option>
                    <option value="PG">PG (Postgraduate)</option>
                  </select>
                </label>
                {attemptedSubmit && !degree && (
                  <p className="text-xs text-[#D83A43] mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle size={12} className="shrink-0" /> Degree category is required
                  </p>
                )}
              </div>

              <div>
                <label className="block">
                  <span className="mono text-[10px] uppercase tracking-widest text-[#A8A8A8]">
                    Competition Domain <span className="text-[#D83A43]">*</span>
                  </span>
                  <select
                    value={domainId}
                    onChange={(e) => setDomainId(e.target.value)}
                    disabled={!degree || domainsLoading}
                    className={`mt-1 w-full bg-[#080808] border rounded-lg px-3 py-2 text-sm text-white focus:border-[#B52A32] focus:outline-none disabled:opacity-50 transition-colors ${
                      attemptedSubmit && !domainId ? "border-[#B52A32] bg-red-950/20" : "border-white/10"
                    }`}
                  >
                    <option value="">
                      {!degree
                        ? "Select Degree First"
                        : domainsLoading
                        ? "Loading domains…"
                        : availableDomains.length === 0
                        ? "No domains registered for this degree"
                        : "Select Domain *"}
                    </option>
                    {availableDomains.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </label>
                {attemptedSubmit && !domainId && (
                  <p className="text-xs text-[#D83A43] mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle size={12} className="shrink-0" /> Domain selection is required
                  </p>
                )}
              </div>
            </div>

            {/* Status selection */}
            <div>
              <label className="block">
                <span className="mono text-[10px] uppercase tracking-widest text-[#A8A8A8]">Registration Status</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="mt-1 w-full bg-[#080808] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#B52A32] focus:outline-none"
                >
                  <option value="SUBMITTED">Submitted (pending admin review / approval)</option>
                  <option value="APPROVED">Approved (generates sequential IDs + QR passes + emails passes to all members)</option>
                </select>
              </label>
              {status === "APPROVED" && (
                <div className="mt-2 text-xs text-[#D83A43] bg-[#B52A32]/10 border border-[#B52A32]/30 p-2.5 rounded-lg flex items-center gap-2">
                  <ShieldCheck size={14} className="shrink-0" />
                  <span>Immediate pass generation: All crew members will be issued digital pass credentials with food QR tokens and sent pass emails.</span>
                </div>
              )}
            </div>
          </div>

          {/* Members Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="mono text-[11px] uppercase tracking-wider text-white font-semibold flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#B52A32]" />
                Team Members ({members.length} / 4)
              </div>
              <span className="text-xs text-[#A8A8A8]">Exactly 1 Leader required</span>
            </div>

            <div className="space-y-4">
              {members.map((m, i) => {
                const nameHasDigits = /\d/.test(m.fullName);
                const nameTooShort = m.fullName.trim().length > 0 && m.fullName.trim().length < 2;
                const nameError = nameHasDigits
                  ? "• Numbers are not allowed in full name"
                  : nameTooShort
                  ? "• Full name must be at least 2 characters"
                  : attemptedSubmit && !m.fullName.trim()
                  ? "• Full name is required"
                  : undefined;

                const memCollegeDigits = /\d/.test(m.college);
                const memCollegeTooShort = m.college.trim().length > 0 && m.college.trim().length < 2;
                const memCollegeError = memCollegeDigits
                  ? "• Numbers are not allowed in college name"
                  : memCollegeTooShort
                  ? "• College name must be at least 2 characters"
                  : attemptedSubmit && !m.college.trim()
                  ? "• College name is required"
                  : undefined;

                const emailError = m.email.trim().length > 0 && !GMAIL_REGEX.test(m.email.trim())
                  ? "• Enter a valid Gmail address (e.g. name@gmail.com)"
                  : emails.indexOf(m.email.toLowerCase().trim()) !== i && m.email.trim()
                  ? "• This email is duplicated within the team"
                  : attemptedSubmit && !m.email.trim()
                  ? "• Gmail address is required"
                  : undefined;

                const phoneError = m.phone.trim().length > 0 && !/^[6-9][0-9]{9}$/.test(m.phone.trim())
                  ? "• Enter a valid 10-digit Indian mobile number"
                  : attemptedSubmit && !m.phone.trim()
                  ? "• Mobile number is required"
                  : undefined;

                const degreeError = attemptedSubmit && !m.degree.trim() ? "• Degree is required" : undefined;

                const hasPhoto = Boolean(m.participantImageFile || m.hasParticipantImage || (isEdit && m.id));
                const photoError = attemptedSubmit && !hasPhoto ? "• Participant photo is required" : undefined;

                return (
                  <div
                    key={i}
                    className={`glass rounded-xl p-4 border transition-all ${
                      m.isLeader ? "border-[#B52A32]/60 bg-[#B52A32]/5" : "border-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="mono text-xs font-bold text-[#B52A32]">
                          Member {String(i + 1).padStart(2, "0")}
                        </span>
                        {m.isLeader ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-[#D83A43] font-bold bg-[#D83A43]/15 px-2 py-0.5 rounded border border-[#B52A32]/30">
                            <Crown size={10} /> TEAM LEADER
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#A8A8A8] bg-white/5 px-2 py-0.5 rounded">
                            Member
                          </span>
                        )}
                        {i < 3 && <span className="text-[#A8A8A8]/60 text-[10px]">· Required</span>}
                        {i === 3 && <span className="text-[#A8A8A8]/60 text-[10px]">· Optional</span>}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setMembers((ms) => ms.map((mm, idx) => ({ ...mm, isLeader: idx === i })));
                          }}
                          className={`text-xs px-2.5 py-1 rounded transition-colors font-medium ${
                            m.isLeader ? "bg-[#B52A32] text-white" : "border border-white/15 text-[#A8A8A8] hover:text-white hover:bg-white/5"
                          }`}
                        >
                          {m.isLeader ? "Leader" : "Make Leader"}
                        </button>
                        {members.length > 3 && (
                          <button
                            type="button"
                            onClick={() => removeMember(i)}
                            className="text-[#A8A8A8] hover:text-red-400 p-1 transition-colors"
                            title="Remove member"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {/* Full Name */}
                      <div>
                        <label className="block">
                          <span className="mono text-[10px] uppercase tracking-widest text-[#A8A8A8]">
                            Full Name <span className="text-[#D83A43]">*</span>
                          </span>
                          <input
                            type="text"
                            value={m.fullName}
                            onChange={(e) => setMember(i, { fullName: e.target.value })}
                            placeholder="Enter full name"
                            className="mt-1 w-full bg-[#080808] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#B52A32] focus:outline-none"
                          />
                        </label>
                        {nameError && (
                          <p className="text-xs text-[#D83A43] mt-1 flex items-center gap-1 font-medium">
                            <AlertCircle size={12} className="shrink-0" /> {nameError}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block">
                          <span className="mono text-[10px] uppercase tracking-widest text-[#A8A8A8]">
                            Gmail Address <span className="text-[#D83A43]">*</span>
                          </span>
                          <input
                            type="email"
                            value={m.email}
                            onChange={(e) => setMember(i, { email: e.target.value })}
                            placeholder="example@gmail.com"
                            className="mt-1 w-full bg-[#080808] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#B52A32] focus:outline-none"
                          />
                        </label>
                        {emailError && (
                          <p className="text-xs text-[#D83A43] mt-1 flex items-center gap-1 font-medium">
                            <AlertCircle size={12} className="shrink-0" /> {emailError}
                          </p>
                        )}
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block">
                          <span className="mono text-[10px] uppercase tracking-widest text-[#A8A8A8]">
                            Phone (10 digits) <span className="text-[#D83A43]">*</span>
                          </span>
                          <input
                            type="tel"
                            value={m.phone}
                            onChange={(e) => setMember(i, { phone: e.target.value })}
                            placeholder="e.g. 9876543210"
                            maxLength={10}
                            className="mt-1 w-full bg-[#080808] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#B52A32] focus:outline-none"
                          />
                        </label>
                        {phoneError && (
                          <p className="text-xs text-[#D83A43] mt-1 flex items-center gap-1 font-medium">
                            <AlertCircle size={12} className="shrink-0" /> {phoneError}
                          </p>
                        )}
                      </div>

                      {/* Member College */}
                      <div>
                        <label className="block">
                          <span className="mono text-[10px] uppercase tracking-widest text-[#A8A8A8]">
                            College <span className="text-[#D83A43]">*</span>
                          </span>
                          <input
                            type="text"
                            value={m.college}
                            onChange={(e) => setMember(i, { college: e.target.value })}
                            placeholder="College name"
                            className="mt-1 w-full bg-[#080808] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#B52A32] focus:outline-none"
                          />
                        </label>
                        {memCollegeError && (
                          <p className="text-xs text-[#D83A43] mt-1 flex items-center gap-1 font-medium">
                            <AlertCircle size={12} className="shrink-0" /> {memCollegeError}
                          </p>
                        )}
                      </div>

                      {/* Degree Field */}
                      <div className="sm:col-span-2">
                        <AdminDegreeField
                          value={m.degree}
                          readOnly={!m.isLeader}
                          subtitle="Auto-synced with Leader (Read-only)"
                          onChange={(v) => {
                            setMember(i, { degree: v });
                            if (m.isLeader) {
                              setDegree(v as any);
                              // Auto-select for all team members
                              setMembers((ms) => ms.map((mm) => ({ ...mm, degree: v })));
                            }
                          }}
                          error={degreeError}
                        />
                      </div>

                      {/* Participant Photo Picker & Preview */}
                      <div className="sm:col-span-2 space-y-2 pt-2 border-t border-white/5">
                        <div className="mono text-[10px] uppercase tracking-widest text-[#A8A8A8] flex items-center justify-between">
                          <span>
                            Participant Photo <span className="text-[#D83A43]">*</span>
                          </span>
                          <span className="text-[10px] text-[#A8A8A8]/60">JPEG / PNG / WebP · Max 5MB</span>
                        </div>

                        <div className="space-y-3 p-3 rounded-lg border border-white/10 bg-[#080808]/80 hover:border-[#B52A32]/40 transition-colors">
                          <AdminMemberImagePreview
                            memberId={m.id}
                            hasSavedImage={m.hasParticipantImage}
                            newFile={m.participantImageFile}
                            newPreview={m.participantImagePreview}
                            onClearNewFile={() => {
                              setMember(i, { participantImageFile: null, participantImagePreview: null });
                            }}
                          />

                          <div>
                            <label className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-[#B52A32] hover:bg-[#D83A43] text-white px-4 py-2 text-xs font-semibold tracking-wide transition-all shadow-md active:scale-95">
                              <ImagePlus size={14} />
                              <span>{m.participantImageFile || m.hasParticipantImage || (isEdit && m.id) ? "Change Image" : "Select Image"}</span>
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) {
                                    const preview = URL.createObjectURL(f);
                                    setMember(i, { participantImageFile: f, participantImagePreview: preview });
                                  }
                                }}
                                className="sr-only"
                              />
                            </label>
                          </div>
                        </div>

                        {photoError && (
                          <p className="text-xs text-[#D83A43] flex items-center gap-1 font-medium">
                            <AlertCircle size={12} className="shrink-0" /> Image is not selected. Participant photo is required.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {members.length < 4 && (
              <button
                type="button"
                onClick={addMember}
                className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs text-white hover:border-[#B52A32] hover:bg-white/5 transition-all"
              >
                <Plus size={14} /> Add Optional 4th Member
              </button>
            )}
          </div>

          {/* Payment Section */}
          <div className="glass rounded-xl p-4 border border-white/5 space-y-4">
            <div className="mono text-[11px] uppercase tracking-wider text-white font-semibold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#B52A32]" />
              Payment Information
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block">
                  <span className="mono text-[10px] uppercase tracking-widest text-[#A8A8A8]">Transaction ID</span>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g. UPI-9876543210 (leave empty for auto MANUAL ID)"
                    className="mt-1 w-full bg-[#080808] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#B52A32] focus:outline-none"
                  />
                </label>
              </div>

              <div>
                <label className="block">
                  <span className="mono text-[10px] uppercase tracking-widest text-[#A8A8A8]">Payment Status</span>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="mt-1 w-full bg-[#080808] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#B52A32] focus:outline-none"
                  >
                    <option value="SUBMITTED">Submitted (Pending Verification)</option>
                    <option value="VERIFIED">Verified (Payment Confirmed)</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </label>
              </div>

              {/* Payment Screenshot Upload */}
              <div className="sm:col-span-2 space-y-2">
                <span className="mono text-[10px] uppercase tracking-widest text-[#A8A8A8] block">Payment Screenshot</span>
                <div className="space-y-3 p-3 rounded-lg border border-white/10 bg-[#080808]/80 hover:border-[#B52A32]/40 transition-colors">
                  <AdminPaymentScreenshotPreview
                    paymentId={paymentId}
                    existingScreenshot={existingScreenshot}
                    newFile={paymentScreenshotFile}
                    newPreview={paymentScreenshotPreview}
                    onClearNewFile={() => {
                      setPaymentScreenshotFile(null);
                      setPaymentScreenshotPreview(null);
                    }}
                  />

                  <div>
                    <label className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 text-white px-4 py-2 text-xs font-semibold tracking-wide transition-all shadow-md active:scale-95">
                      <Upload size={14} />
                      <span>{paymentScreenshotFile || existingScreenshot || paymentId ? "Replace Screenshot" : "Upload Screenshot"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            setPaymentScreenshotFile(f);
                            setPaymentScreenshotPreview(URL.createObjectURL(f));
                          }
                        }}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0a0a0a] border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-[#A8A8A8]">
            {isEdit ? "Updates will be logged and notified via email" : "Creation generates secure records"}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="rounded-full border border-white/15 px-5 py-2 text-xs font-semibold text-white hover:bg-white/5 disabled:opacity-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={busy}
              className="flex items-center gap-2 rounded-full bg-[#B52A32] disabled:opacity-50 px-6 py-2 text-xs font-bold text-white hover:bg-[#D83A43] transition-all shadow-md active:scale-95"
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : null}
              {isEdit ? "Save Changes" : "Create Team"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Degree Field (dropdown + custom text input) ──────────────────────

const ADMIN_DEGREE_OPTIONS = [
  "UG",
  "PG",
  "Diploma",
];

function AdminDegreeField({
  value,
  onChange,
  error,
  readOnly,
  subtitle,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
  readOnly?: boolean;
  subtitle?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block">
        <div className="flex items-center justify-between">
          <span className="mono text-[10px] uppercase tracking-widest text-[#A8A8A8]">
            Degree <span className="text-[#D83A43]">*</span>
          </span>
          {readOnly && (
            <span className="mono text-[10px] text-[#D83A43] uppercase tracking-wider font-semibold">
              {subtitle || "Auto-selected with Leader (Read-only)"}
            </span>
          )}
        </div>
        {readOnly ? (
          <div className="mt-1 w-full bg-[#080808]/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 flex items-center justify-between cursor-not-allowed select-none">
            <span className="font-medium text-white">{value || "Awaiting Leader's selection"}</span>
            <span className="text-[10px] text-[#A8A8A8] mono">Fixed for all members</span>
          </div>
        ) : (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1 w-full bg-[#080808] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#B52A32] focus:outline-none"
          >
            <option value="" disabled>Select degree *</option>
            {!ADMIN_DEGREE_OPTIONS.includes(value) && value && (
              <option value={value}>{value}</option>
            )}
            {ADMIN_DEGREE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        )}
      </label>
      {error && (
        <p className="text-xs text-[#D83A43] flex items-center gap-1 font-medium">
          <AlertCircle size={12} className="shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}

// ─── Admin Member Photo Preview & Fetcher ───────────────────────────────────

function AdminMemberImagePreview({
  memberId,
  hasSavedImage,
  newFile,
  newPreview,
  onClearNewFile,
}: {
  memberId?: string;
  hasSavedImage?: boolean;
  newFile?: File | null;
  newPreview?: string | null;
  onClearNewFile?: () => void;
}) {
  const [fetchedUrl, setFetchedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchFailed, setFetchFailed] = useState<boolean>(false);

  useEffect(() => {
    if (!memberId || newFile) {
      return;
    }
    let cancelled = false;
    let objectUrl: string | null = null;
    setLoading(true);
    setFetchFailed(false);

    (async () => {
      try {
        const res = await fetch(`/api/admin/participants/${memberId}/image`, {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error("No image found");
        }
        const blob = await res.blob();
        if (blob.size === 0) throw new Error("Empty image payload");
        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) {
          setFetchedUrl(objectUrl);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setFetchFailed(true);
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [memberId, newFile]);

  // If a new replacement file is chosen by the admin
  if (newFile && newPreview) {
    return (
      <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-2.5 max-w-md">
        <img
          src={newPreview}
          alt="New photo preview"
          className="h-16 w-16 rounded-lg object-cover border border-white/20 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-white truncate">{newFile.name}</div>
          <div className="text-[10px] text-green-400 font-mono mt-0.5 flex items-center gap-1">
            <Check size={10} /> {Math.ceil(newFile.size / 1024)} KB · Ready to save
          </div>
          {onClearNewFile && (
            <button
              type="button"
              onClick={onClearNewFile}
              className="mt-1.5 text-[11px] text-[#D83A43] hover:text-red-300 transition-colors flex items-center gap-1 font-medium"
            >
              <RotateCcw size={10} /> Revert to saved photo
            </button>
          )}
        </div>
      </div>
    );
  }

  // If actively fetching existing saved photo from server
  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-xs text-[#A8A8A8]">
        <Loader2 size={14} className="animate-spin text-[#B52A32] shrink-0" />
        <span>Fetching photo from secure server…</span>
      </div>
    );
  }

  // If image was successfully fetched
  if (fetchedUrl) {
    return (
      <div className="flex items-center gap-3 bg-[#080808] border border-white/15 rounded-xl p-2.5 max-w-md">
        <a
          href={fetchedUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Click to view full photo in new tab"
          className="group relative h-16 w-16 rounded-lg overflow-hidden border border-white/20 shrink-0 hover:border-[#B52A32] transition-colors"
        >
          <img
            src={fetchedUrl}
            alt="Participant photo"
            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
            <ExternalLink size={12} />
          </div>
        </a>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-white flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-green-400 shrink-0" />
            <span>Saved Photo on File</span>
          </div>
          <div className="text-[10px] text-[#A8A8A8] mt-0.5">Fetched from storage</div>
          <a
            href={fetchedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-[#B52A32] hover:text-[#D83A43] font-medium transition-colors"
          >
            <ExternalLink size={10} /> View full photo ↗
          </a>
        </div>
      </div>
    );
  }

  // If in edit mode with participant ID but no photo exists
  if (memberId && fetchFailed) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-950/20 border border-amber-600/30 text-xs text-amber-300">
        <AlertTriangle size={13} className="shrink-0" />
        <span>No photo on file for this participant</span>
      </div>
    );
  }

  return <span className="text-xs text-[#A8A8A8]">No photo selected</span>;
}

// ─── Admin Payment Screenshot Preview & Fetcher ──────────────────────────────

function AdminPaymentScreenshotPreview({
  paymentId,
  existingScreenshot,
  newFile,
  newPreview,
  onClearNewFile,
}: {
  paymentId?: string;
  existingScreenshot?: { id: string; fileName: string; sizeBytes: number } | null;
  newFile?: File | null;
  newPreview?: string | null;
  onClearNewFile?: () => void;
}) {
  const [fetchedUrl, setFetchedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchFailed, setFetchFailed] = useState<boolean>(false);

  useEffect(() => {
    if (!paymentId || newFile) {
      return;
    }
    let cancelled = false;
    let objectUrl: string | null = null;
    setLoading(true);
    setFetchFailed(false);

    (async () => {
      try {
        const query = existingScreenshot?.id ? `?screenshotId=${encodeURIComponent(existingScreenshot.id)}` : "";
        const res = await fetch(`/api/admin/payments/${paymentId}/screenshot${query}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error("No screenshot found");
        }
        const blob = await res.blob();
        if (blob.size === 0) throw new Error("Empty screenshot payload");
        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) {
          setFetchedUrl(objectUrl);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setFetchFailed(true);
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [paymentId, existingScreenshot?.id, newFile]);

  // If replacement screenshot selected
  if (newFile && newPreview) {
    return (
      <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-2.5 max-w-md">
        <img
          src={newPreview}
          alt="New screenshot preview"
          className="h-20 w-20 rounded-lg object-cover border border-white/20 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-white truncate">{newFile.name}</div>
          <div className="text-[10px] text-green-400 font-mono mt-0.5 flex items-center gap-1">
            <Check size={10} /> {Math.ceil(newFile.size / 1024)} KB · Ready to save
          </div>
          {onClearNewFile && (
            <button
              type="button"
              onClick={onClearNewFile}
              className="mt-1.5 text-[11px] text-[#D83A43] hover:text-red-300 transition-colors flex items-center gap-1 font-medium"
            >
              <RotateCcw size={10} /> Revert to original screenshot
            </button>
          )}
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-xs text-[#A8A8A8]">
        <Loader2 size={14} className="animate-spin text-[#B52A32] shrink-0" />
        <span>Fetching payment screenshot from secure server…</span>
      </div>
    );
  }

  // Screenshot fetched successfully
  if (fetchedUrl) {
    return (
      <div className="flex items-center gap-3 bg-[#080808] border border-white/15 rounded-xl p-2.5 max-w-md">
        <a
          href={fetchedUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Click to view full screenshot in new tab"
          className="group relative h-20 w-20 rounded-lg overflow-hidden border border-white/20 shrink-0 hover:border-[#B52A32] transition-colors"
        >
          <img
            src={fetchedUrl}
            alt="Payment screenshot"
            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
            <ExternalLink size={14} />
          </div>
        </a>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-white flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-green-400 shrink-0" />
            <span>Screenshot on File</span>
          </div>
          {existingScreenshot?.fileName && (
            <div className="text-[11px] text-white/80 font-mono truncate max-w-[200px] mt-0.5">
              {existingScreenshot.fileName}
            </div>
          )}
          {existingScreenshot?.sizeBytes && (
            <div className="text-[10px] text-[#A8A8A8] font-mono">
              {Math.ceil(existingScreenshot.sizeBytes / 1024)} KB · Verified
            </div>
          )}
          <a
            href={fetchedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-[#B52A32] hover:text-[#D83A43] font-medium transition-colors"
          >
            <ExternalLink size={10} /> View full screenshot ↗
          </a>
        </div>
      </div>
    );
  }

  if (paymentId && fetchFailed) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-950/20 border border-amber-600/30 text-xs text-amber-300">
        <AlertTriangle size={13} className="shrink-0" />
        <span>No screenshot found on file</span>
      </div>
    );
  }

  return <span className="text-xs text-[#A8A8A8]">No screenshot attached</span>;
}
