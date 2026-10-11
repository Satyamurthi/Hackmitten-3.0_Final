"use client";
import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Save, Upload, QrCode } from "lucide-react";

type Config = {
  registrationEnabled: boolean;
  registrationLimit: number | null;
  eventStartDate?: string | null;
  eventStartTime?: string | null;
};

export function EventSettingsEditor() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery<{ config: Config }>({
    queryKey: ["config"],
    queryFn: async () => {
      const response = await fetch("/api/admin/config");
      if (!response.ok) throw new Error("Unable to load registration settings");
      return response.json();
    },
  });

  const [draft, setDraft] = useState<Config | null>(null);
  const form = draft ?? data?.config ?? {
    registrationEnabled: false,
    registrationLimit: null,
    eventStartDate: null,
    eventStartTime: null,
  };

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Payment QR replacement states
  const [qrTimestamp, setQrTimestamp] = useState(Date.now());
  const [qrUploading, setQrUploading] = useState(false);
  const [qrSuccess, setQrSuccess] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const response = await fetch("/api/admin/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          eventStartDate: form.eventStartDate || null,
          eventStartTime: form.eventStartTime || null,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save registration settings");
      setDraft(result.config);
      setSaved(true);
      await queryClient.invalidateQueries({ queryKey: ["event-state"] });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleQrFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setQrError("Please select a PNG, JPG, or WEBP image");
      return;
    }

    setQrUploading(true);
    setQrError(null);
    setQrSuccess(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/config/payment-qr", {
        method: "POST",
        body: formData,
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || "Failed to update payment QR code");
      }

      setQrTimestamp(Date.now());
      setQrSuccess("Payment QR code replaced successfully! Registration page will now display this QR.");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setQrError(err instanceof Error ? err.message : "Failed to replace payment QR");
    } finally {
      setQrUploading(false);
    }
  };

  if (isLoading) return <div className="text-[#A8A8A8]">Loading registration settings...</div>;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Event Controls */}
      <div className="glass space-y-6 rounded-lg p-6">
        <header>
          <div className="mono mb-2 text-[10px] uppercase tracking-[0.3em] text-[#B52A32]">/ Operations</div>
          <h1 className="display text-2xl font-bold text-white">Event Control</h1>
          <p className="mt-1 text-sm text-[#A8A8A8]">Control whether teams may register and modify the event dates.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="mono text-[10px] uppercase tracking-widest text-[#A8A8A8]">Event Start Date</span>
            <input
              type="date"
              value={form.eventStartDate ?? ""}
              onChange={(event) => setDraft({ ...form, eventStartDate: event.target.value })}
              className="mt-1 w-full rounded border border-white/10 bg-[#080808] px-3 py-2 text-sm text-white"
            />
            <span className="mt-1 block text-xs text-[#A8A8A8]">Leave blank for default.</span>
          </label>
          <label className="block">
            <span className="mono text-[10px] uppercase tracking-widest text-[#A8A8A8]">Event Start Time</span>
            <input
              type="time"
              value={form.eventStartTime ?? ""}
              onChange={(event) => setDraft({ ...form, eventStartTime: event.target.value })}
              className="mt-1 w-full rounded border border-white/10 bg-[#080808] px-3 py-2 text-sm text-white"
            />
            <span className="mt-1 block text-xs text-[#A8A8A8]">Leave blank for default.</span>
          </label>
        </div>

        <label className="flex items-center justify-between gap-4 rounded border border-white/10 bg-[#080808] p-4">
          <span>
            <span className="block font-medium text-white">Registration enabled</span>
            <span className="text-xs text-[#A8A8A8]">The API enforces this setting.</span>
          </span>
          <input
            aria-label="Registration enabled"
            type="checkbox"
            checked={form.registrationEnabled}
            onChange={(event) => setDraft({ ...form, registrationEnabled: event.target.checked })}
            className="h-5 w-5 accent-[#B52A32]"
          />
        </label>

        <label className="block">
          <span className="mono text-[10px] uppercase tracking-widest text-[#A8A8A8]">Registration limit</span>
          <input
            type="number"
            min="1"
            value={form.registrationLimit ?? ""}
            onChange={(event) =>
              setDraft({
                ...form,
                registrationLimit: event.target.value === "" ? null : Math.max(1, Number(event.target.value)),
              })
            }
            placeholder="Unlimited"
            className="mt-1 w-full rounded border border-white/10 bg-[#080808] px-3 py-2 text-sm text-white"
          />
          <span className="mt-1 block text-xs text-[#A8A8A8]">Leave blank for no limit.</span>
        </label>

        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

        <button
          onClick={save}
          disabled={saving}
          className="flex min-h-11 items-center gap-2 rounded-full bg-[#B52A32] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 hover:bg-[#D83A43] transition-all"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Save size={14} />}
          {saving ? "Saving..." : saved ? "Saved" : "Save settings"}
        </button>
      </div>

      {/* Payment QR Code Replacement */}
      <div className="glass space-y-5 rounded-lg p-6 border-l-2 border-[#B52A32]/80">
        <header>
          <div className="mono mb-2 text-[10px] uppercase tracking-[0.3em] text-[#B52A32]">/ Payments</div>
          <h2 className="display text-xl font-bold text-white flex items-center gap-2">
            <QrCode size={20} className="text-[#D83A43]" /> Payment QR Code
          </h2>
          <p className="mt-1 text-sm text-[#A8A8A8]">
            Replace the existing registration payment QR code image. The new QR code will immediately be shown to participants during checkout.
          </p>
        </header>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-4 rounded-xl border border-white/10 bg-[#080808]">
          <div className="relative group shrink-0">
            <img
              src={`/api/payment-qr?t=${qrTimestamp}`}
              alt="Active payment QR code"
              className="w-40 h-40 object-contain rounded-lg bg-white p-2 border border-white/15 shadow-lg"
            />
            <span className="absolute bottom-1 right-1 mono text-[9px] bg-black/80 text-white/80 px-1.5 py-0.5 rounded">
              Active
            </span>
          </div>

          <div className="flex-1 space-y-3 text-center sm:text-left">
            <h3 className="text-sm font-semibold text-white">Upload Replacement QR Code</h3>
            <p className="text-xs text-[#A8A8A8] leading-relaxed">
              Upload your UPI payment QR code image (PNG, JPG, or WEBP up to 10MB).
              The image will be securely validated and updated across the registration flow.
            </p>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/webp"
              onChange={handleQrFileChange}
              className="hidden"
              id="payment-qr-file-input"
            />

            <div className="pt-1">
              <label
                htmlFor="payment-qr-file-input"
                className={`inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white hover:border-[#B52A32] hover:bg-[#B52A32]/10 transition-all cursor-pointer ${
                  qrUploading ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                {qrUploading ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-[#D83A43]" /> Uploading new QR...
                  </>
                ) : (
                  <>
                    <Upload size={14} className="text-[#D83A43]" /> Choose & Replace QR Code
                  </>
                )}
              </label>
            </div>

            {qrError && (
              <p role="alert" className="text-xs text-[#D83A43] pt-1">
                {qrError}
              </p>
            )}
            {qrSuccess && (
              <p className="text-xs text-green-400 flex items-center gap-1.5 pt-1">
                <Check size={14} /> {qrSuccess}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
