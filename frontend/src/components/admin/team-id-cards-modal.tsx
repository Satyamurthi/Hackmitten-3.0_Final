"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  X, Download, AlertTriangle, CheckCircle2, 
  RotateCw, Loader2, User, CreditCard, ExternalLink, ShieldAlert
} from "lucide-react";

interface ParticipantCardItem {
  participantId: string;
  fullName: string;
  college: string | null;
  degree: string | null;
  isLeader: boolean;
  officialId: string;
  hasPhoto: boolean;
  missingFields: string[];
  frontDataUrl: string;
  backDataUrl: string;
}

interface TeamIdCardsResponse {
  team: {
    id: string;
    teamName: string;
    registrationId: string | null;
    status: string;
    degree: string | null;
    college: string | null;
  };
  cards: ParticipantCardItem[];
  hasMissingPhotos: boolean;
}

interface TeamIdCardsModalProps {
  teamId: string;
  teamName: string;
  onClose: () => void;
}

export function TeamIdCardsModal({ teamId, teamName, onClose }: TeamIdCardsModalProps) {
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<"pair" | "flip">("pair");

  const { data, isLoading, error } = useQuery<TeamIdCardsResponse>({
    queryKey: ["admin-team-id-cards", teamId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/teams/${teamId}/id-cards`);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Failed to generate ID cards");
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 2,
  });

  const toggleFlip = (pid: string) => {
    setFlippedCards((prev) => ({ ...prev, [pid]: !prev[pid] }));
  };

  const downloadTeamPdf = async () => {
    try {
      setDownloadingPdf(true);
      const res = await fetch(`/api/admin/teams/${teamId}/id-cards/pdf`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to download team PDF");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const regId = data?.team.registrationId || teamName;
      a.download = `${regId.replace(/[^a-zA-Z0-9_-]/g, "_")}_ID_Cards.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.message || "Failed to download PDF");
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div 
        className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 bg-[#0F0F0F]">
          <div>
            <div className="flex items-center gap-2">
              <span className="mono text-[10px] uppercase tracking-widest text-[#B52A32] bg-[#B52A32]/10 px-2 py-0.5 rounded border border-[#B52A32]/30">
                Automatic ID Card Generator
              </span>
              {data?.team.registrationId && (
                <span className="mono text-xs text-white/70 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                  {data.team.registrationId}
                </span>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-1 flex items-center gap-2">
              <CreditCard className="text-[#B52A32]" size={22} />
              {data?.team.teamName || teamName}
            </h2>
            <p className="text-xs text-[#A8A8A8] mt-0.5">
              Live preview & print-ready duplex PDF generation using official HACKMITTEN 3.0 templates.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={downloadTeamPdf}
              disabled={isLoading || downloadingPdf || Boolean(error)}
              className="flex items-center gap-2 bg-[#B52A32] hover:bg-[#D83A43] text-white px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all shadow-lg shadow-[#B52A32]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {downloadingPdf ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating PDF…
                </>
              ) : (
                <>
                  <Download size={16} />
                  Download Team PDF
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="text-[#A8A8A8] hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* View Options & Notice Banner */}
        <div className="px-4 md:px-6 py-3 border-b border-white/5 bg-[#080808] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#888]">Display Mode:</span>
            <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/10">
              <button
                onClick={() => setViewMode("pair")}
                className={`px-3 py-1 rounded-md transition-all ${
                  viewMode === "pair" ? "bg-[#B52A32] text-white font-medium" : "text-[#A8A8A8] hover:text-white"
                }`}
              >
                Side-by-Side (Pair)
              </button>
              <button
                onClick={() => setViewMode("flip")}
                className={`px-3 py-1 rounded-md transition-all ${
                  viewMode === "flip" ? "bg-[#B52A32] text-white font-medium" : "text-[#A8A8A8] hover:text-white"
                }`}
              >
                Flip Front / Back
              </button>
            </div>
          </div>

          {data && (
            <div className="flex items-center gap-2">
              {data.hasMissingPhotos ? (
                <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2.5 py-1 rounded-md text-[11px]">
                  <AlertTriangle size={13} />
                  Some members have default avatar (No photo uploaded)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 px-2.5 py-1 rounded-md text-[11px]">
                  <CheckCircle2 size={13} />
                  All member photos attached
                </span>
              )}
              <span className="text-[#A8A8A8] text-[11px]">
                {data.cards.length} members
              </span>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 space-y-6">
          {isLoading && (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <Loader2 size={36} className="text-[#B52A32] animate-spin mb-3" />
              <div className="text-white font-semibold text-sm">Rendering ID Card Templates…</div>
              <div className="text-xs text-[#888] mt-1">Generating custom QR codes & mapping participant photos</div>
            </div>
          )}

          {error && (
            <div className="p-6 rounded-xl bg-red-950/20 border border-red-500/30 text-center">
              <ShieldAlert className="mx-auto text-red-500 mb-2" size={32} />
              <div className="text-white font-bold text-sm">Error Generating ID Cards</div>
              <div className="text-xs text-red-300 mt-1">{(error as Error).message}</div>
            </div>
          )}

          {data && data.cards.length === 0 && (
            <div className="py-16 text-center text-[#888]">
              No participants found in this team.
            </div>
          )}

          {/* Cards List */}
          {data && data.cards.length > 0 && (
            <div className="space-y-6">
              {data.cards.map((card, idx) => {
                const isFlipped = Boolean(flippedCards[card.participantId]);

                return (
                  <div
                    key={card.participantId}
                    className="p-4 md:p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex flex-col lg:flex-row gap-6 items-center lg:items-start"
                  >
                    {/* Participant Details & Download Controls */}
                    <div className="w-full lg:w-72 shrink-0 space-y-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          {card.isLeader && (
                            <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded border border-amber-500/30 font-semibold uppercase tracking-wider">
                              Team Leader
                            </span>
                          )}
                          <span className="mono text-[10px] text-white/50">
                            Member #{idx + 1}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white mt-1">
                          {card.fullName}
                        </h3>
                        <p className="text-xs text-[#A8A8A8] truncate" title={card.college || ""}>
                          {card.college || "Maharaja Institute of Technology Thandavapura"}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-[#888]">ID Number:</span>
                          <span className="mono font-bold text-[#B52A32]">{card.officialId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#888]">Photo Status:</span>
                          {card.hasPhoto ? (
                            <span className="text-emerald-400 font-medium">✓ Uploaded</span>
                          ) : (
                            <span className="text-amber-400 font-medium">Avatar Default</span>
                          )}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#888]">Food QR:</span>
                          <span className="text-emerald-400 font-medium">✓ Linked</span>
                        </div>
                      </div>

                      {/* Missing info warning */}
                      {card.missingFields.length > 0 && !card.hasPhoto && (
                        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-300 flex items-start gap-1.5">
                          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                          <span>
                            No custom photo found. Card generated with vector silhouette. You can upload a photo in team details.
                          </span>
                        </div>
                      )}

                      {/* Individual Download Actions */}
                      <div className="pt-2 space-y-2">
                        <a
                          href={`/api/admin/participants/${card.participantId}/id-card?format=pdf`}
                          download
                          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all border border-white/10"
                        >
                          <Download size={13} />
                          Download Card (PDF)
                        </a>

                        <div className="grid grid-cols-2 gap-2">
                          <a
                            href={`/api/admin/participants/${card.participantId}/id-card?format=front`}
                            download
                            className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#C0C0C0] text-[11px] transition-all border border-white/5"
                          >
                            <Download size={11} /> Front PNG
                          </a>
                          <a
                            href={`/api/admin/participants/${card.participantId}/id-card?format=back`}
                            download
                            className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#C0C0C0] text-[11px] transition-all border border-white/5"
                          >
                            <Download size={11} /> Back PNG
                          </a>
                        </div>

                        {viewMode === "flip" && (
                          <button
                            onClick={() => toggleFlip(card.participantId)}
                            className="w-full flex items-center justify-center gap-1 text-[11px] text-[#A8A8A8] hover:text-white pt-1"
                          >
                            <RotateCw size={12} />
                            Flip to {isFlipped ? "Front" : "Back"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Visual Card Previews */}
                    <div className="flex-1 w-full flex items-center justify-center">
                      {viewMode === "pair" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
                          {/* Front */}
                          <div className="space-y-1.5 text-center">
                            <span className="mono text-[10px] text-[#888] uppercase tracking-wider">
                              Front Side
                            </span>
                            <div className="rounded-xl overflow-hidden border border-white/15 shadow-xl bg-black">
                              <img
                                src={card.frontDataUrl}
                                alt={`${card.fullName} - Front ID Card`}
                                className="w-full h-auto object-contain block"
                                loading="lazy"
                              />
                            </div>
                          </div>

                          {/* Back */}
                          <div className="space-y-1.5 text-center">
                            <span className="mono text-[10px] text-[#888] uppercase tracking-wider">
                              Back Side (Food QR)
                            </span>
                            <div className="rounded-xl overflow-hidden border border-white/15 shadow-xl bg-black">
                              <img
                                src={card.backDataUrl}
                                alt={`${card.fullName} - Back ID Card`}
                                className="w-full h-auto object-contain block"
                                loading="lazy"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full max-w-xs text-center space-y-2">
                          <span className="mono text-[10px] text-[#888] uppercase tracking-wider">
                            {isFlipped ? "Back Side (Food QR)" : "Front Side"}
                          </span>
                          <div 
                            onClick={() => toggleFlip(card.participantId)}
                            className="rounded-xl overflow-hidden border border-white/20 shadow-2xl bg-black cursor-pointer group relative"
                            title="Click to flip card"
                          >
                            <img
                              src={isFlipped ? card.backDataUrl : card.frontDataUrl}
                              alt={card.fullName}
                              className="w-full h-auto object-contain block transition-transform duration-300 group-hover:scale-[1.02]"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold gap-1.5 transition-opacity">
                              <RotateCw size={14} /> Click to flip
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0F0F0F] flex flex-wrap items-center justify-between gap-3 text-xs text-[#888]">
          <div className="flex items-center gap-2">
            <span>Print standard: <strong>Double-sided (Duplex / Flip on Long Edge)</strong></span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-white/15 px-4 py-1.5 text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
