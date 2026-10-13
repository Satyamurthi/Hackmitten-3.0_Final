"use client";

import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  Loader2,
  Save,
  Upload,
  QrCode,
  Globe,
  Settings,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  X,
  Power,
} from "lucide-react";

type Config = {
  registrationEnabled: boolean;
  registrationLimit: number | null;
  diplomaRegistrationLimit?: number | null;
  eventStartDate?: string | null;
  eventStartTime?: string | null;
  problemStatementsReleaseTime?: string | null;
  problemStatementsReleased?: boolean;
};

export interface DomainItem {
  id: string;
  name: string;
  degrees: string[];
  enabled: boolean;
  teamCount?: number;
  createdAt: string;
}

export interface PaymentQrItem {
  id: string;
  label: string | null;
  degrees: string[];
  filePath: string;
  fileName: string;
  upiId: string | null;
  isActive: boolean;
  url: string;
  createdAt: string;
  updatedAt: string;
}

const DEGREES = ["Diploma", "UG", "PG"] as const;

export function EventSettingsEditor() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"controls" | "domains" | "payment-qrs">("controls");

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. EVENT CONTROLS
  // ─────────────────────────────────────────────────────────────────────────────
  const { data: configData, isLoading: configLoading } = useQuery<{ config: Config }>({
    queryKey: ["config"],
    queryFn: async () => {
      const response = await fetch("/api/admin/config");
      if (!response.ok) throw new Error("Unable to load registration settings");
      return response.json();
    },
  });

  const [draft, setDraft] = useState<Config | null>(null);
  const form = draft ?? configData?.config ?? {
    registrationEnabled: false,
    registrationLimit: null,
    diplomaRegistrationLimit: null,
    eventStartDate: null,
    eventStartTime: null,
    problemStatementsReleaseTime: null,
    problemStatementsReleased: false,
  };

  const [savingConfig, setSavingConfig] = useState(false);
  const [savedConfig, setSavedConfig] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  const saveConfig = async () => {
    setSavingConfig(true);
    setSavedConfig(false);
    setConfigError(null);
    try {
      const response = await fetch("/api/admin/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          diplomaRegistrationLimit: form.diplomaRegistrationLimit !== undefined ? form.diplomaRegistrationLimit : null,
          eventStartDate: form.eventStartDate || null,
          eventStartTime: form.eventStartTime || null,
          problemStatementsReleaseTime: form.problemStatementsReleaseTime || null,
          problemStatementsReleased: Boolean(form.problemStatementsReleased),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save registration settings");
      setDraft(result.config);
      setSavedConfig(true);
      await queryClient.invalidateQueries({ queryKey: ["event-state"] });
      await queryClient.invalidateQueries({ queryKey: ["config"] });
    } catch (cause) {
      setConfigError(cause instanceof Error ? cause.message : "Save failed");
    } finally {
      setSavingConfig(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. DOMAIN MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────
  const {
    data: domainsData,
    isLoading: domainsLoading,
    refetch: refetchDomains,
  } = useQuery<{ domains: DomainItem[] }>({
    queryKey: ["admin-domains"],
    queryFn: async () => {
      const res = await fetch("/api/admin/domains");
      if (!res.ok) throw new Error("Failed to load domains");
      return res.json();
    },
  });

  const domains = domainsData?.domains || [];

  const [domainModalOpen, setDomainModalOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<DomainItem | null>(null);
  const [domainFormName, setDomainFormName] = useState("");
  const [domainFormDegrees, setDomainFormDegrees] = useState<string[]>([]);
  const [domainFormEnabled, setDomainFormEnabled] = useState(true);
  const [domainFormSubmitting, setDomainFormSubmitting] = useState(false);
  const [domainFormError, setDomainFormError] = useState<string | null>(null);

  const openAddDomainModal = () => {
    setEditingDomain(null);
    setDomainFormName("");
    setDomainFormDegrees(["Diploma", "UG", "PG"]);
    setDomainFormEnabled(true);
    setDomainFormError(null);
    setDomainModalOpen(true);
  };

  const openEditDomainModal = (d: DomainItem) => {
    setEditingDomain(d);
    setDomainFormName(d.name);
    setDomainFormDegrees(d.degrees);
    setDomainFormEnabled(d.enabled);
    setDomainFormError(null);
    setDomainModalOpen(true);
  };

  const toggleDomainDegree = (deg: string) => {
    setDomainFormDegrees((prev) =>
      prev.includes(deg) ? prev.filter((d) => d !== deg) : [...prev, deg],
    );
  };

  const submitDomainForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainFormName.trim()) {
      setDomainFormError("Domain name is required");
      return;
    }
    if (domainFormDegrees.length === 0) {
      setDomainFormError("Select at least one applicable degree category");
      return;
    }

    setDomainFormSubmitting(true);
    setDomainFormError(null);

    try {
      const url = editingDomain
        ? `/api/admin/domains/${editingDomain.id}`
        : "/api/admin/domains";
      const method = editingDomain ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: domainFormName.trim(),
          degrees: domainFormDegrees,
          enabled: domainFormEnabled,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || "Failed to save domain");
      }

      setDomainModalOpen(false);
      await refetchDomains();
    } catch (err) {
      setDomainFormError(err instanceof Error ? err.message : "Failed to save domain");
    } finally {
      setDomainFormSubmitting(false);
    }
  };

  const toggleDomainStatus = async (d: DomainItem) => {
    try {
      const res = await fetch(`/api/admin/domains/${d.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !d.enabled }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j.error || "Failed to update domain status");
        return;
      }
      await refetchDomains();
    } catch {
      alert("Failed to toggle domain status");
    }
  };

  const deleteDomain = async (d: DomainItem) => {
    const confirmMsg =
      d.teamCount && d.teamCount > 0
        ? `Warning: ${d.teamCount} team(s) are registered with domain "${d.name}". Deleting it will keep the teams intact while unlinking the domain. Proceed?`
        : `Are you sure you want to delete the domain "${d.name}"?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/admin/domains/${d.id}`, {
        method: "DELETE",
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(j.error || "Failed to delete domain");
        return;
      }
      await refetchDomains();
    } catch {
      alert("Failed to delete domain");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. PAYMENT QR CODE MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────
  const {
    data: qrsData,
    isLoading: qrsLoading,
    refetch: refetchQrs,
  } = useQuery<{ qrs: PaymentQrItem[] }>({
    queryKey: ["admin-payment-qrs"],
    queryFn: async () => {
      const res = await fetch("/api/admin/payment-qrs");
      if (!res.ok) throw new Error("Failed to load payment QR codes");
      return res.json();
    },
  });

  const paymentQrs = qrsData?.qrs || [];

  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [editingQr, setEditingQr] = useState<PaymentQrItem | null>(null);
  const [qrFormDegrees, setQrFormDegrees] = useState<string[]>([]);
  const [qrFormLabel, setQrFormLabel] = useState("");
  const [qrFormUpiId, setQrFormUpiId] = useState("");
  const [qrFormFile, setQrFormFile] = useState<File | null>(null);
  const [qrFormFilePreview, setQrFormFilePreview] = useState<string | null>(null);
  const [qrFormActive, setQrFormActive] = useState(true);
  const [qrFormSubmitting, setQrFormSubmitting] = useState(false);
  const [qrFormError, setQrFormError] = useState<string | null>(null);
  const qrFileInputRef = useRef<HTMLInputElement>(null);

  const openAddQrModal = () => {
    setEditingQr(null);
    setQrFormDegrees(["UG"]);
    setQrFormLabel("");
    setQrFormUpiId("9364008472@kotak");
    setQrFormFile(null);
    setQrFormFilePreview(null);
    setQrFormActive(true);
    setQrFormError(null);
    setQrModalOpen(true);
  };

  const openEditQrModal = (qr: PaymentQrItem) => {
    setEditingQr(qr);
    setQrFormDegrees(qr.degrees);
    setQrFormLabel(qr.label || "");
    setQrFormUpiId(qr.upiId || "");
    setQrFormFile(null);
    setQrFormFilePreview(
      qr.url ||
      (qr.filePath?.startsWith("/api/")
        ? qr.filePath
        : qr.fileName
        ? `/api/uploads/${qr.fileName}`
        : "/api/payment-qr")
    );
    setQrFormActive(qr.isActive !== undefined ? Boolean(qr.isActive) : true);
    setQrFormError(null);
    setQrModalOpen(true);
  };

  const toggleQrDegree = (deg: string) => {
    setQrFormDegrees((prev) =>
      prev.includes(deg) ? prev.filter((d) => d !== deg) : [...prev, deg],
    );
  };

  const handleQrFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setQrFormError("Please select a PNG, JPG, or WEBP image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setQrFormError("File size exceeds 10MB limit");
      return;
    }

    setQrFormError(null);
    setQrFormFile(file);
    if (qrFormFilePreview && qrFormFilePreview.startsWith("blob:")) {
      URL.revokeObjectURL(qrFormFilePreview);
    }
    setQrFormFilePreview(URL.createObjectURL(file));
  };

  const submitQrForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (qrFormDegrees.length === 0) {
      setQrFormError("Select at least one applicable degree (Diploma, UG, PG)");
      return;
    }
    if (!editingQr && !qrFormFile) {
      setQrFormError("Please choose a QR image to upload");
      return;
    }

    setQrFormSubmitting(true);
    setQrFormError(null);

    try {
      const formData = new FormData();
      formData.append("degrees", JSON.stringify(qrFormDegrees));
      if (qrFormLabel.trim()) formData.append("label", qrFormLabel.trim());
      if (qrFormUpiId.trim()) formData.append("upiId", qrFormUpiId.trim());
      formData.append("isActive", String(qrFormActive));
      if (qrFormFile) {
        formData.append("file", qrFormFile);
      }

      const url = editingQr
        ? `/api/admin/payment-qrs/${editingQr.id}`
        : "/api/admin/payment-qrs";
      const method = editingQr ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        body: formData,
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || "Failed to save payment QR code");
      }

      setQrModalOpen(false);
      await refetchQrs();
    } catch (err) {
      setQrFormError(err instanceof Error ? err.message : "Failed to save payment QR code");
    } finally {
      setQrFormSubmitting(false);
    }
  };

  const deleteQr = async (qr: PaymentQrItem) => {
    if (!window.confirm(`Are you sure you want to delete this payment QR code (${qr.degrees.join(", ")})?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/payment-qrs/${qr.id}`, {
        method: "DELETE",
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(j.error || "Failed to delete payment QR code");
        return;
      }
      await refetchQrs();
    } catch {
      alert("Failed to delete payment QR code");
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Top Header & Submenu Navigation */}
      <div>
        <div className="mono mb-1 text-[10px] uppercase tracking-[0.3em] text-[#B52A32]">
          / Admin Configuration
        </div>
        <h1 className="display text-3xl font-bold text-white">Event Settings & Controls</h1>
        <p className="mt-1 text-sm text-[#A8A8A8]">
          Manage event registration rules, degree-specific competition domains, and payment QR codes.
        </p>

        {/* Submenu Tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
          <button
            onClick={() => setActiveTab("controls")}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold transition-all ${
              activeTab === "controls"
                ? "bg-[#B52A32] text-white shadow-lg shadow-[#B52A32]/20"
                : "border border-white/10 bg-white/5 text-[#A8A8A8] hover:bg-white/10 hover:text-white"
            }`}
          >
            <Settings size={14} /> Event Controls
          </button>
          <button
            onClick={() => setActiveTab("domains")}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold transition-all ${
              activeTab === "domains"
                ? "bg-[#B52A32] text-white shadow-lg shadow-[#B52A32]/20"
                : "border border-white/10 bg-white/5 text-[#A8A8A8] hover:bg-white/10 hover:text-white"
            }`}
          >
            <Globe size={14} /> Domain Management
            {domains.length > 0 && (
              <span className="mono text-[10px] bg-black/40 px-1.5 py-0.5 rounded-full">
                {domains.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("payment-qrs")}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold transition-all ${
              activeTab === "payment-qrs"
                ? "bg-[#B52A32] text-white shadow-lg shadow-[#B52A32]/20"
                : "border border-white/10 bg-white/5 text-[#A8A8A8] hover:bg-white/10 hover:text-white"
            }`}
          >
            <QrCode size={14} /> Payment QR Codes
            {paymentQrs.length > 0 && (
              <span className="mono text-[10px] bg-black/40 px-1.5 py-0.5 rounded-full">
                {paymentQrs.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 1: EVENT CONTROLS
          ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "controls" && (
        <div className="glass space-y-6 rounded-lg p-6">
          <header>
            <h2 className="display text-xl font-bold text-white">Event Controls</h2>
            <p className="mt-1 text-sm text-[#A8A8A8]">
              Control registration availability, team capacity limit, and start dates.
            </p>
          </header>

          {configLoading ? (
            <div className="text-sm text-[#A8A8A8]">Loading registration controls...</div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="mono text-[10px] uppercase tracking-widest text-[#A8A8A8]">
                    Event Start Date
                  </span>
                  <input
                    type="date"
                    value={form.eventStartDate ?? ""}
                    onChange={(event) =>
                      setDraft({ ...form, eventStartDate: event.target.value })
                    }
                    className="mt-1 w-full rounded border border-white/10 bg-[#080808] px-3 py-2 text-sm text-white"
                  />
                  <span className="mt-1 block text-xs text-[#A8A8A8]">Leave blank for default.</span>
                </label>
                <label className="block">
                  <span className="mono text-[10px] uppercase tracking-widest text-[#A8A8A8]">
                    Event Start Time
                  </span>
                  <input
                    type="time"
                    value={form.eventStartTime ?? ""}
                    onChange={(event) =>
                      setDraft({ ...form, eventStartTime: event.target.value })
                    }
                    className="mt-1 w-full rounded border border-white/10 bg-[#080808] px-3 py-2 text-sm text-white"
                  />
                  <span className="mt-1 block text-xs text-[#A8A8A8]">Leave blank for default.</span>
                </label>
              </div>

              <label className="flex items-center justify-between gap-4 rounded border border-white/10 bg-[#080808] p-4">
                <span>
                  <span className="block font-medium text-white">Registration Enabled</span>
                  <span className="text-xs text-[#A8A8A8]">The API strictly enforces this setting.</span>
                </span>
                <input
                  aria-label="Registration enabled"
                  type="checkbox"
                  checked={form.registrationEnabled}
                  onChange={(event) =>
                    setDraft({ ...form, registrationEnabled: event.target.checked })
                  }
                  className="h-5 w-5 accent-[#B52A32]"
                />
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="mono text-[10px] uppercase tracking-widest text-[#A8A8A8]">
                    General / UG &amp; PG Capacity Limit
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={form.registrationLimit ?? ""}
                    onChange={(event) =>
                      setDraft({
                        ...form,
                        registrationLimit:
                          event.target.value === "" ? null : Math.max(1, Number(event.target.value)),
                      })
                    }
                    placeholder="Unlimited"
                    className="mt-1 w-full rounded border border-white/10 bg-[#080808] px-3 py-2 text-sm text-white"
                  />
                  <span className="mt-1 block text-xs text-[#A8A8A8]">Leave blank for no limit on UG &amp; PG.</span>
                </label>

                <label className="block">
                  <span className="mono text-[10px] uppercase tracking-widest text-[#A8A8A8]">
                    Diploma Registration Capacity Limit
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={form.diplomaRegistrationLimit ?? ""}
                    onChange={(event) =>
                      setDraft({
                        ...form,
                        diplomaRegistrationLimit:
                          event.target.value === "" ? null : Math.max(1, Number(event.target.value)),
                      })
                    }
                    placeholder="Unlimited"
                    className="mt-1 w-full rounded border border-white/10 bg-[#080808] px-3 py-2 text-sm text-white"
                  />
                  <span className="mt-1 block text-xs text-[#A8A8A8]">Leave blank for no limit on Diploma teams.</span>
                </label>
              </div>

              {/* Problem Statements Release Schedule & Countdown */}
              <div className="rounded-lg border border-white/10 bg-[#080808] p-4 space-y-4">
                <div>
                  <span className="block font-medium text-white text-sm">
                    Problem Statements Release Timer
                  </span>
                  <span className="text-xs text-[#A8A8A8]">
                    Set the exact date & time when problem statements will automatically unlock on participant dashboards. Participants see a live countdown timer until this moment.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="mono text-[10px] uppercase tracking-widest text-[#A8A8A8]">
                      Release Date & Time
                    </span>
                    <input
                      type="datetime-local"
                      value={form.problemStatementsReleaseTime ? form.problemStatementsReleaseTime.slice(0, 16) : ""}
                      onChange={(e) =>
                        setDraft({
                          ...form,
                          problemStatementsReleaseTime: e.target.value ? new Date(e.target.value).toISOString() : null,
                        })
                      }
                      className="mt-1 w-full rounded border border-white/10 bg-[#121212] px-3 py-2 text-sm text-white focus:border-[#B52A32] focus:outline-none"
                    />
                    <span className="mt-1 block text-[11px] text-[#A8A8A8]">
                      {form.problemStatementsReleaseTime
                        ? `Scheduled: ${new Date(form.problemStatementsReleaseTime).toLocaleString()}`
                        : "No release time set (locked until unlocked)."}
                    </span>
                  </label>

                  <label className="flex items-center justify-between gap-4 rounded border border-white/10 bg-[#121212] p-3.5 self-start cursor-pointer">
                    <span>
                      <span className="block text-xs font-semibold text-white">Unlock Problem Statements Now</span>
                      <span className="text-[10px] text-[#A8A8A8]">Immediate override to reveal questions to participants.</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={Boolean(form.problemStatementsReleased)}
                      onChange={(e) =>
                        setDraft({
                          ...form,
                          problemStatementsReleased: e.target.checked,
                        })
                      }
                      className="h-5 w-5 accent-[#B52A32]"
                    />
                  </label>
                </div>
              </div>

              {configError && (
                <p role="alert" className="text-sm text-red-400">
                  {configError}
                </p>
              )}

              <button
                onClick={saveConfig}
                disabled={savingConfig}
                className="flex min-h-11 items-center gap-2 rounded-full bg-[#B52A32] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50 hover:bg-[#D83A43] transition-all"
              >
                {savingConfig ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : savedConfig ? (
                  <Check size={14} />
                ) : (
                  <Save size={14} />
                )}
                {savingConfig ? "Saving..." : savedConfig ? "Saved" : "Save Settings"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 2: DOMAIN MANAGEMENT
          ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "domains" && (
        <div className="space-y-6">
          <div className="glass space-y-5 rounded-lg p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="display text-xl font-bold text-white flex items-center gap-2">
                  <Globe size={20} className="text-[#D83A43]" /> Domain Management
                </h2>
                <p className="mt-1 text-sm text-[#A8A8A8]">
                  Define hackathon domains and map them to compatible degree categories (Diploma, UG, PG).
                </p>
              </div>
              <button
                onClick={openAddDomainModal}
                className="inline-flex items-center gap-2 rounded-full bg-[#B52A32] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#D83A43] transition-all shadow-md self-start sm:self-auto"
              >
                <Plus size={14} /> Add Domain
              </button>
            </div>

            {domainsLoading ? (
              <div className="text-sm text-[#A8A8A8] py-8 text-center">Loading domains...</div>
            ) : domains.length === 0 ? (
              <div className="rounded-lg border border-white/10 bg-[#080808] p-8 text-center">
                <Globe size={32} className="mx-auto text-[#A8A8A8]/40 mb-3" />
                <p className="text-white font-medium text-sm">No Domains Configured</p>
                <p className="text-xs text-[#A8A8A8] mt-1 max-w-sm mx-auto">
                  Click &ldquo;Add Domain&rdquo; above to create competition domains mapped to Diploma, UG, or PG degrees.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5 border border-white/10 rounded-lg overflow-hidden bg-[#080808]">
                {domains.map((dom) => (
                  <div
                    key={dom.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5">
                        <span className="font-semibold text-white text-base">{dom.name}</span>
                        <span
                          className={`mono text-[10px] px-2 py-0.5 rounded-full ${
                            dom.enabled
                              ? "bg-green-500/10 text-green-400 border border-green-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {dom.enabled ? "Active" : "Disabled"}
                        </span>
                        {dom.teamCount !== undefined && dom.teamCount > 0 && (
                          <span className="mono text-[10px] bg-white/5 text-[#A8A8A8] px-2 py-0.5 rounded border border-white/10">
                            {dom.teamCount} team{dom.teamCount === 1 ? "" : "s"}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#A8A8A8]">
                        <span className="mono text-[10px] uppercase text-[#A8A8A8]/70">Degrees:</span>
                        {dom.degrees.map((d) => (
                          <span
                            key={d}
                            className="rounded bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white border border-white/10"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => toggleDomainStatus(dom)}
                        title={dom.enabled ? "Disable domain" : "Enable domain"}
                        className={`rounded-lg p-2 border transition-all ${
                          dom.enabled
                            ? "border-green-500/30 text-green-400 hover:bg-green-500/10"
                            : "border-white/10 text-[#A8A8A8] hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <Power size={14} />
                      </button>
                      <button
                        onClick={() => openEditDomainModal(dom)}
                        title="Edit domain"
                        className="rounded-lg p-2 border border-white/10 text-[#A8A8A8] hover:text-white hover:bg-white/5 transition-all"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => deleteDomain(dom)}
                        title="Delete domain"
                        className="rounded-lg p-2 border border-white/10 text-[#D83A43] hover:bg-[#D83A43]/10 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 3: PAYMENT QR CODE MANAGEMENT
          ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "payment-qrs" && (
        <div className="space-y-6">
          <div className="glass space-y-5 rounded-lg p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="display text-xl font-bold text-white flex items-center gap-2">
                  <QrCode size={20} className="text-[#D83A43]" /> Payment QR Code Management
                </h2>
                <p className="mt-1 text-sm text-[#A8A8A8]">
                  Upload and manage separate UPI payment QR codes for Diploma, UG, and PG degree categories.
                </p>
              </div>
              <button
                onClick={openAddQrModal}
                className="inline-flex items-center gap-2 rounded-full bg-[#B52A32] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#D83A43] transition-all shadow-md self-start sm:self-auto"
              >
                <Plus size={14} /> Add Payment QR
              </button>
            </div>

            {qrsLoading ? (
              <div className="text-sm text-[#A8A8A8] py-8 text-center">Loading payment QR codes...</div>
            ) : paymentQrs.length === 0 ? (
              <div className="rounded-lg border border-white/10 bg-[#080808] p-8 text-center">
                <QrCode size={32} className="mx-auto text-[#A8A8A8]/40 mb-3" />
                <p className="text-white font-medium text-sm">No Degree-Specific QR Codes Configured</p>
                <p className="text-xs text-[#A8A8A8] mt-1 max-w-sm mx-auto">
                  Click &ldquo;Add Payment QR&rdquo; to configure dedicated QR codes for Diploma, UG, and PG participants.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paymentQrs.map((qr) => (
                  <div
                    key={qr.id}
                    className="rounded-xl border border-white/10 bg-[#080808] p-4 flex gap-4 hover:border-white/20 transition-all"
                  >
                    <div className="relative shrink-0">
                      <img
                        src={
                          qr.url ||
                          (qr.filePath?.startsWith("/api/")
                            ? qr.filePath
                            : qr.fileName
                            ? `/api/uploads/${qr.fileName}`
                            : "/api/payment-qr")
                        }
                        alt={qr.label || "Payment QR"}
                        className="w-28 h-28 object-contain rounded-lg bg-white p-1.5 border border-white/15"
                      />
                      <span
                        className={`absolute bottom-1 right-1 mono text-[9px] px-1.5 py-0.5 rounded font-medium ${
                          qr.isActive ? "bg-green-600 text-white" : "bg-black/80 text-white/70"
                        }`}
                      >
                        {qr.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="font-semibold text-white text-sm truncate flex items-center gap-2">
                          <span>{qr.label || "Payment QR Code"}</span>
                          {qr.id === "default-ug-pg-qr" && (
                            <span className="mono text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded font-normal shrink-0">
                              System Default
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-1">
                          {qr.degrees.map((d) => (
                            <span
                              key={d}
                              className="rounded bg-[#B52A32]/20 border border-[#B52A32]/40 px-2 py-0.5 text-[10px] font-semibold text-white"
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                        {qr.upiId && (
                          <div className="mono text-[11px] text-[#A8A8A8] truncate">
                            UPI: <span className="text-white">{qr.upiId}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-white/5 mt-2">
                        <button
                          onClick={() => openEditQrModal(qr)}
                          className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white hover:bg-white/10 transition-all"
                        >
                          <Pencil size={12} /> Edit / Replace
                        </button>
                        <button
                          onClick={() => deleteQr(qr)}
                          className="rounded-md border border-white/10 bg-white/5 p-1 text-[#D83A43] hover:bg-[#D83A43]/10 transition-all"
                          title="Delete QR"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          MODAL: ADD / EDIT DOMAIN
          ───────────────────────────────────────────────────────────────────────────── */}
      {domainModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass rounded-xl max-w-md w-full p-6 space-y-5 border border-white/15 relative">
            <button
              onClick={() => setDomainModalOpen(false)}
              className="absolute top-4 right-4 text-[#A8A8A8] hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <header>
              <h3 className="display text-xl font-bold text-white">
                {editingDomain ? "Edit Domain" : "Add New Domain"}
              </h3>
              <p className="text-xs text-[#A8A8A8] mt-1">
                Configure the domain name and select which degree categories can choose it during registration.
              </p>
            </header>

            <form onSubmit={submitDomainForm} className="space-y-4">
              <div>
                <label className="block mono text-[10px] uppercase tracking-widest text-[#A8A8A8] mb-1.5">
                  Domain Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI & Machine Learning, Web3, FinTech"
                  value={domainFormName}
                  onChange={(e) => setDomainFormName(e.target.value)}
                  className="w-full rounded border border-white/15 bg-[#080808] px-3.5 py-2 text-sm text-white placeholder:text-[#A8A8A8]/40 focus:border-[#B52A32] focus:outline-none"
                />
              </div>

              <div>
                <label className="block mono text-[10px] uppercase tracking-widest text-[#A8A8A8] mb-2">
                  Applicable Degree Categories *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {DEGREES.map((deg) => {
                    const checked = domainFormDegrees.includes(deg);
                    return (
                      <button
                        type="button"
                        key={deg}
                        onClick={() => toggleDomainDegree(deg)}
                        className={`flex items-center justify-center gap-2 rounded-lg border py-2.5 text-xs font-semibold transition-all ${
                          checked
                            ? "bg-[#B52A32] text-white border-[#B52A32]"
                            : "bg-[#080808] text-[#A8A8A8] border-white/10 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {checked && <Check size={12} />} {deg}
                      </button>
                    );
                  })}
                </div>
                <span className="block text-[11px] text-[#A8A8A8] mt-1.5">
                  Participants will only see this domain if their selected degree matches.
                </span>
              </div>

              <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-[#080808] p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={domainFormEnabled}
                  onChange={(e) => setDomainFormEnabled(e.target.checked)}
                  className="h-4 w-4 accent-[#B52A32]"
                />
                <span className="text-xs text-white">Active (Visible during participant registration)</span>
              </label>

              {domainFormError && (
                <div className="p-3 rounded bg-[#B52A32]/10 border border-[#B52A32]/30 text-xs text-[#D83A43] flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{domainFormError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDomainModalOpen(false)}
                  className="rounded-full px-4 py-2 text-xs text-[#A8A8A8] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={domainFormSubmitting}
                  className="inline-flex items-center gap-2 rounded-full bg-[#B52A32] px-5 py-2 text-xs font-semibold text-white hover:bg-[#D83A43] disabled:opacity-50 transition-all"
                >
                  {domainFormSubmitting && <Loader2 size={12} className="animate-spin" />}
                  {editingDomain ? "Save Changes" : "Create Domain"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          MODAL: ADD / EDIT PAYMENT QR CODE
          ───────────────────────────────────────────────────────────────────────────── */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass rounded-xl max-w-lg w-full p-6 space-y-5 border border-white/15 relative">
            <button
              onClick={() => setQrModalOpen(false)}
              className="absolute top-4 right-4 text-[#A8A8A8] hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <header>
              <h3 className="display text-xl font-bold text-white">
                {editingQr ? "Edit / Replace Payment QR" : "Add Payment QR Code"}
              </h3>
              <p className="text-xs text-[#A8A8A8] mt-1">
                Upload a UPI QR code and bind it to degree categories (Diploma, UG, PG).
              </p>
            </header>

            <form onSubmit={submitQrForm} className="space-y-4">
              {/* QR Image Selection and Preview */}
              <div>
                <label className="block mono text-[10px] uppercase tracking-widest text-[#A8A8A8] mb-2">
                  QR Image {editingQr ? "(Leave unchanged or select replacement)" : "*"}
                </label>
                <div className="flex items-center gap-4 p-3 rounded-lg border border-white/10 bg-[#080808]">
                  <div className="w-24 h-24 rounded bg-white p-1 border border-white/20 shrink-0 flex items-center justify-center overflow-hidden">
                    {qrFormFilePreview ? (
                      <img
                        src={qrFormFilePreview}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <QrCode size={28} className="text-black/40" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      ref={qrFileInputRef}
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleQrFileInputChange}
                      className="hidden"
                      id="modal-qr-file-input"
                    />
                    <label
                      htmlFor="modal-qr-file-input"
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:border-[#B52A32] hover:bg-[#B52A32]/10 transition-all cursor-pointer"
                    >
                      <Upload size={13} className="text-[#D83A43]" />
                      {qrFormFilePreview ? "Change Image" : "Choose Image (PNG, JPG, WEBP)"}
                    </label>
                    <p className="text-[11px] text-[#A8A8A8]">Maximum file size: 10MB</p>
                  </div>
                </div>
              </div>

              {/* Degrees mapping */}
              <div>
                <label className="block mono text-[10px] uppercase tracking-widest text-[#A8A8A8] mb-2">
                  Applicable Degrees *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {DEGREES.map((deg) => {
                    const checked = qrFormDegrees.includes(deg);
                    return (
                      <button
                        type="button"
                        key={deg}
                        onClick={() => toggleQrDegree(deg)}
                        className={`flex items-center justify-center gap-2 rounded-lg border py-2.5 text-xs font-semibold transition-all ${
                          checked
                            ? "bg-[#B52A32] text-white border-[#B52A32]"
                            : "bg-[#080808] text-[#A8A8A8] border-white/10 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {checked && <Check size={12} />} {deg}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* UPI ID */}
              <div>
                <label className="block mono text-[10px] uppercase tracking-widest text-[#A8A8A8] mb-1.5">
                  UPI ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9364008472@kotak"
                  value={qrFormUpiId}
                  onChange={(e) => setQrFormUpiId(e.target.value)}
                  className="w-full rounded border border-white/15 bg-[#080808] px-3.5 py-2 text-sm text-white placeholder:text-[#A8A8A8]/40 focus:border-[#B52A32] focus:outline-none"
                />
              </div>

              {/* Label */}
              <div>
                <label className="block mono text-[10px] uppercase tracking-widest text-[#A8A8A8] mb-1.5">
                  Display Label (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. UG Registration Payment QR"
                  value={qrFormLabel}
                  onChange={(e) => setQrFormLabel(e.target.value)}
                  className="w-full rounded border border-white/15 bg-[#080808] px-3.5 py-2 text-sm text-white placeholder:text-[#A8A8A8]/40 focus:border-[#B52A32] focus:outline-none"
                />
              </div>

              {/* Active Toggle */}
              <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-[#080808] p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(qrFormActive)}
                  onChange={(e) => setQrFormActive(e.target.checked)}
                  className="h-4 w-4 accent-[#B52A32]"
                />
                <span className="text-xs text-white">Active (Shown to participants of mapped degrees)</span>
              </label>

              {qrFormError && (
                <div className="p-3 rounded bg-[#B52A32]/10 border border-[#B52A32]/30 text-xs text-[#D83A43] flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{qrFormError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setQrModalOpen(false)}
                  className="rounded-full px-4 py-2 text-xs text-[#A8A8A8] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={qrFormSubmitting}
                  className="inline-flex items-center gap-2 rounded-full bg-[#B52A32] px-5 py-2 text-xs font-semibold text-white hover:bg-[#D83A43] disabled:opacity-50 transition-all"
                >
                  {qrFormSubmitting && <Loader2 size={12} className="animate-spin" />}
                  {editingQr ? "Save QR Code" : "Upload QR Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
