"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Pencil, X, Loader2, Crown, AlertTriangle, Search, ImagePlus, Check, AlertCircle, Upload, ShieldCheck } from "lucide-react";
import { fetchJson } from "@/lib/api-fetch";
import { compressImage } from "@/lib/image-compress";

type Team = {
  id: string;
  teamName: string;
  registrationId: string | null;
  status: string;
  college: string | null;
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
              <div className="mt-2 text-xs text-[#A8A8A8]">{team.members.length} members</div>
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
  const existingScreenshot = team?.payment?.screenshots?.[0] ?? null;

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
      if (!isEdit && !m.participantImageFile) {
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

                const hasPhoto = Boolean(m.participantImageFile || m.hasParticipantImage);
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
                          onChange={(v) => setMember(i, { degree: v })}
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

                        <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg border border-white/10 bg-[#080808]/80 hover:border-[#B52A32]/40 transition-colors">
                          <label className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-[#B52A32] hover:bg-[#D83A43] text-white px-4 py-2 text-xs font-semibold tracking-wide transition-all shadow-md active:scale-95">
                            <ImagePlus size={14} />
                            <span>{m.participantImageFile || m.hasParticipantImage ? "Change Image" : "Select Image"}</span>
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

                          {/* Preview for newly selected image */}
                          {m.participantImagePreview && m.participantImageFile && (
                            <div className="flex items-center gap-2 text-xs text-white bg-white/5 border border-white/10 rounded-lg p-1.5 pr-3">
                              <img src={m.participantImagePreview} alt="Preview" className="h-9 w-9 rounded object-cover" />
                              <div className="min-w-0">
                                <div className="truncate max-w-[150px] font-medium">{m.participantImageFile.name}</div>
                                <div className="text-[10px] text-green-400 font-mono">
                                  {Math.ceil(m.participantImageFile.size / 1024)} KB · Ready
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setMember(i, { participantImageFile: null, participantImagePreview: null })}
                                className="text-[#D83A43] hover:text-white p-1 ml-1"
                                title="Remove photo"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          )}

                          {/* Existing image display in edit mode when no new file is picked */}
                          {!m.participantImageFile && m.hasParticipantImage && m.id && (
                            <div className="flex items-center gap-2 text-xs text-white bg-white/5 border border-white/10 rounded-lg p-1.5 pr-3">
                              <img
                                src={`/api/admin/participants/${m.id}/image`}
                                alt="Current photo"
                                className="h-9 w-9 rounded object-cover"
                              />
                              <div className="min-w-0">
                                <div className="font-medium text-white">Current photo on file</div>
                                <div className="text-[10px] text-green-400 flex items-center gap-1">
                                  <Check size={10} /> Saved
                                </div>
                              </div>
                            </div>
                          )}

                          {!m.participantImageFile && !m.hasParticipantImage && (
                            <span className="text-xs text-[#A8A8A8]">No photo selected</span>
                          )}
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
                <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg border border-white/10 bg-[#080808]/80 hover:border-[#B52A32]/40 transition-colors">
                  <label className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 text-white px-4 py-2 text-xs font-semibold tracking-wide transition-all">
                    <Upload size={14} />
                    <span>{paymentScreenshotFile || existingScreenshot ? "Replace Screenshot" : "Upload Screenshot"}</span>
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

                  {paymentScreenshotPreview && paymentScreenshotFile && (
                    <div className="flex items-center gap-2 text-xs text-white bg-white/5 border border-white/10 rounded-lg p-1.5 pr-3">
                      <img src={paymentScreenshotPreview} alt="Screenshot preview" className="h-9 w-9 rounded object-cover" />
                      <div className="min-w-0">
                        <div className="truncate max-w-[150px] font-medium">{paymentScreenshotFile.name}</div>
                        <div className="text-[10px] text-green-400 font-mono">
                          {Math.ceil(paymentScreenshotFile.size / 1024)} KB · Ready
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentScreenshotFile(null);
                          setPaymentScreenshotPreview(null);
                        }}
                        className="text-[#D83A43] hover:text-white p-1 ml-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  {!paymentScreenshotFile && existingScreenshot && team?.payment && (
                    <div className="flex items-center gap-2 text-xs text-white bg-white/5 border border-white/10 rounded-lg p-1.5 pr-3">
                      <img
                        src={`/api/admin/payments/${team.payment.id}/screenshot?screenshotId=${existingScreenshot.id}`}
                        alt="Existing screenshot"
                        className="h-9 w-9 rounded object-cover"
                      />
                      <div className="min-w-0">
                        <div className="truncate max-w-[180px] font-medium">{existingScreenshot.fileName}</div>
                        <div className="text-[10px] text-[#A8A8A8] font-mono">
                          {Math.ceil(existingScreenshot.sizeBytes / 1024)} KB · Stored
                        </div>
                      </div>
                    </div>
                  )}

                  {!paymentScreenshotFile && !existingScreenshot && (
                    <span className="text-xs text-[#A8A8A8]">No screenshot attached</span>
                  )}
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
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block">
        <span className="mono text-[10px] uppercase tracking-widest text-[#A8A8A8]">
          Degree <span className="text-[#D83A43]">*</span>
        </span>
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
      </label>
      {error && (
        <p className="text-xs text-[#D83A43] flex items-center gap-1 font-medium">
          <AlertCircle size={12} className="shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}
