"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, CheckCircle2, Clock, ShieldCheck, UtensilsCrossed, Download, X, Filter, CreditCard, RotateCcw } from "lucide-react";
import Link from "next/link";
import { fetchJson } from "@/lib/api-fetch";

type Stats = {
  counts: {
    totalTeams: number;
    approvedTeams: number;
    pendingPayments: number;
    verifiedPayments: number;
    rejectedPayments: number;
    totalParticipants: number;
    totalFoodCheckIns: number;
  };
  meals: { id: string; type: string; label: string; checkInCount: number }[];
  recentCheckIns: {
    id: string;
    createdAt: string;
    participant: { fullName: string; team: { teamName: string } };
    meal: { label: string };
  }[];
  recentRegistrations: {
    id: string;
    teamName: string;
    status: string;
    college: string | null;
    members: { id: string }[];
    payment: { status: string } | null;
  }[];
};

const STAT_CARDS = [
  { key: "totalTeams", label: "Total Registrations", icon: Users },
  { key: "approvedTeams", label: "Approved Teams", icon: CheckCircle2 },
  { key: "pendingPayments", label: "Pending Payments", icon: Clock },
  { key: "verifiedPayments", label: "Verified Payments", icon: ShieldCheck },
  { key: "totalParticipants", label: "Total Participants", icon: Users },
  { key: "totalFoodCheckIns", label: "Food Check-ins", icon: UtensilsCrossed },
] as const;

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "text-[#A8A8A8]",
  SUBMITTED: "text-[#A8A8A8]",
  PAYMENT_PENDING: "text-yellow-400",
  PAYMENT_VERIFIED: "text-blue-400",
  APPROVED: "text-[#D83A43]",
  REJECTED: "text-red-500",
  PENDING: "text-yellow-400",
  VERIFIED: "text-[#D83A43]",
};

export function AdminDashboardHome() {
  const { data, isLoading, error: queryError } = useQuery<Stats>({
    queryKey: ["admin-stats"],
    queryFn: () => fetchJson("/api/admin/stats"),
    refetchInterval: 15000,
  });

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportType, setExportType] = useState<"payments" | "food" | "teams" | "participants">("payments");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("");
  const [filterTeamStatus, setFilterTeamStatus] = useState("");
  const [filterMealId, setFilterMealId] = useState("");
  const [filterCollege, setFilterCollege] = useState("");
  const [filterSearch, setFilterSearch] = useState("");
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");

  const resetFilters = () => {
    setFilterPaymentStatus("");
    setFilterTeamStatus("");
    setFilterMealId("");
    setFilterCollege("");
    setFilterSearch("");
    setFilterFromDate("");
    setFilterToDate("");
  };

  const buildExportUrl = () => {
    const params = new URLSearchParams();
    params.set("type", exportType);
    if (filterSearch.trim()) params.set("q", filterSearch.trim());
    if (filterFromDate) params.set("from", filterFromDate);
    if (filterToDate) params.set("to", filterToDate);

    if (exportType === "payments") {
      if (filterPaymentStatus) params.set("paymentStatus", filterPaymentStatus);
      if (filterTeamStatus) params.set("status", filterTeamStatus);
      if (filterCollege.trim()) params.set("college", filterCollege.trim());
    } else if (exportType === "food") {
      if (filterMealId) params.set("mealId", filterMealId);
    } else if (exportType === "teams" || exportType === "participants") {
      if (filterTeamStatus) params.set("status", filterTeamStatus);
      if (filterCollege.trim()) params.set("college", filterCollege.trim());
    }

    return `/api/admin/export?${params.toString()}`;
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="mono text-[10px] uppercase tracking-[0.3em] text-[#B52A32] mb-2">
            / Dashboard
          </div>
          <h1 className="display text-3xl md:text-4xl font-bold text-white">Mission Control</h1>
          <p className="text-sm text-[#A8A8A8] mt-1">Real-time overview of Hackmitten 3.0</p>
        </div>
        
        <div>
          <button
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs text-white hover:border-[#B52A32] hover:bg-white/5 transition-all whitespace-nowrap"
          >
            <Download size={14} /> Filter & Export CSV
          </button>
        </div>
      </header>

      {/* Filtered CSV Export Modal */}
      {isExportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass border border-white/15 rounded-xl max-w-xl w-full p-6 text-white space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <div className="mono text-[10px] uppercase tracking-[0.25em] text-[#B52A32] mb-1">
                  Custom Data Export
                </div>
                <h2 className="text-xl font-bold text-white">Export Filtered CSV</h2>
                <p className="text-xs text-[#A8A8A8] mt-0.5">
                  Select dataset and customize filters to generate a target CSV spreadsheet.
                </p>
              </div>
              <button
                onClick={() => setIsExportOpen(false)}
                className="text-[#A8A8A8] hover:text-white p-1 rounded-md transition-colors"
                aria-label="Close export dialog"
              >
                <X size={18} />
              </button>
            </div>

            {/* Dataset Type Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/90">Dataset Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setExportType("payments")}
                  className={`px-3 py-2 text-xs rounded-lg border text-left flex items-center gap-2 transition-all ${
                    exportType === "payments"
                      ? "border-[#B52A32] bg-[#B52A32]/10 text-white font-medium"
                      : "border-white/10 bg-[#080808] text-[#A8A8A8] hover:border-white/20"
                  }`}
                >
                  <CreditCard size={14} className={exportType === "payments" ? "text-[#D83A43]" : ""} />
                  <span>Payments</span>
                </button>

                <button
                  type="button"
                  onClick={() => setExportType("food")}
                  className={`px-3 py-2 text-xs rounded-lg border text-left flex items-center gap-2 transition-all ${
                    exportType === "food"
                      ? "border-[#B52A32] bg-[#B52A32]/10 text-white font-medium"
                      : "border-white/10 bg-[#080808] text-[#A8A8A8] hover:border-white/20"
                  }`}
                >
                  <UtensilsCrossed size={14} className={exportType === "food" ? "text-[#D83A43]" : ""} />
                  <span>Food</span>
                </button>

                <button
                  type="button"
                  onClick={() => setExportType("teams")}
                  className={`px-3 py-2 text-xs rounded-lg border text-left flex items-center gap-2 transition-all ${
                    exportType === "teams"
                      ? "border-[#B52A32] bg-[#B52A32]/10 text-white font-medium"
                      : "border-white/10 bg-[#080808] text-[#A8A8A8] hover:border-white/20"
                  }`}
                >
                  <Users size={14} className={exportType === "teams" ? "text-[#D83A43]" : ""} />
                  <span>Teams</span>
                </button>

                <button
                  type="button"
                  onClick={() => setExportType("participants")}
                  className={`px-3 py-2 text-xs rounded-lg border text-left flex items-center gap-2 transition-all ${
                    exportType === "participants"
                      ? "border-[#B52A32] bg-[#B52A32]/10 text-white font-medium"
                      : "border-white/10 bg-[#080808] text-[#A8A8A8] hover:border-white/20"
                  }`}
                >
                  <Users size={14} className={exportType === "participants" ? "text-[#D83A43]" : ""} />
                  <span>Members</span>
                </button>
              </div>
            </div>

            {/* Field Info Banner */}
            <div className="bg-[#121212] border border-white/10 rounded-lg p-3 text-[11px] text-[#A8A8A8] leading-relaxed">
              {exportType === "payments" && (
                <span>
                  <strong className="text-white">Fields exported:</strong> Team ID, Registration ID, Team Name, College, Leader Name/Email/Phone, Member Count, Payment ID, Transaction ID, Payment Status, Team Status, Screenshots Count, Verified By, Verified At, Registration Date.
                </span>
              )}
              {exportType === "food" && (
                <span>
                  <strong className="text-white">Fields exported:</strong> Check-in ID, Meal ID, Meal Name, Meal Type, Meal Date, Participant ID, Participant Name, Participant Email, Participant Phone, Team ID, Team Name, College, Role, Scanned By, Checked In At.
                </span>
              )}
              {exportType === "teams" && (
                <span>
                  <strong className="text-white">Fields exported:</strong> Team ID, Registration ID, Team Name, College, Team Status, Payment Status, Transaction ID, Member Count, Leader Info, Members List, Created At.
                </span>
              )}
              {exportType === "participants" && (
                <span>
                  <strong className="text-white">Fields exported:</strong> Participant ID, Full Name, Email, Phone, Role, College, Year, Branch, GitHub, LinkedIn, Team ID, Team Name, Registration ID, Created At.
                </span>
              )}
            </div>

            {/* Filter Controls */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white/90 flex items-center gap-1.5">
                  <Filter size={13} className="text-[#B52A32]" /> Filter Criteria
                </span>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-[11px] text-[#A8A8A8] hover:text-white flex items-center gap-1 transition-colors"
                >
                  <RotateCcw size={11} /> Reset filters
                </button>
              </div>

              {/* Dynamic Filter Rows */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {exportType === "payments" && (
                  <>
                    <div>
                      <label className="block text-[11px] text-[#A8A8A8] mb-1">Payment Status</label>
                      <select
                        value={filterPaymentStatus}
                        onChange={(e) => setFilterPaymentStatus(e.target.value)}
                        className="w-full bg-[#080808] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:border-[#B52A32] focus:outline-none"
                      >
                        <option value="">All Payment Statuses</option>
                        <option value="PENDING">PENDING</option>
                        <option value="VERIFIED">VERIFIED</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#A8A8A8] mb-1">Team Status</label>
                      <select
                        value={filterTeamStatus}
                        onChange={(e) => setFilterTeamStatus(e.target.value)}
                        className="w-full bg-[#080808] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:border-[#B52A32] focus:outline-none"
                      >
                        <option value="">All Team Statuses</option>
                        <option value="SUBMITTED">SUBMITTED</option>
                        <option value="PAYMENT_PENDING">PAYMENT_PENDING</option>
                        <option value="PAYMENT_VERIFIED">PAYMENT_VERIFIED</option>
                        <option value="APPROVED">APPROVED</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] text-[#A8A8A8] mb-1">College Filter</label>
                      <input
                        type="text"
                        value={filterCollege}
                        onChange={(e) => setFilterCollege(e.target.value)}
                        placeholder="e.g. MIT, Cambridge, Stanford..."
                        className="w-full bg-[#080808] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white placeholder:text-[#666] focus:border-[#B52A32] focus:outline-none"
                      />
                    </div>
                  </>
                )}

                {exportType === "food" && (
                  <div>
                    <label className="block text-[11px] text-[#A8A8A8] mb-1">Specific Meal</label>
                    <select
                      value={filterMealId}
                      onChange={(e) => setFilterMealId(e.target.value)}
                      className="w-full bg-[#080808] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:border-[#B52A32] focus:outline-none"
                    >
                      <option value="">All Meals</option>
                      {data?.meals?.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label} ({m.type})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {(exportType === "teams" || exportType === "participants") && (
                  <>
                    <div>
                      <label className="block text-[11px] text-[#A8A8A8] mb-1">Team Status</label>
                      <select
                        value={filterTeamStatus}
                        onChange={(e) => setFilterTeamStatus(e.target.value)}
                        className="w-full bg-[#080808] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:border-[#B52A32] focus:outline-none"
                      >
                        <option value="">All Team Statuses</option>
                        <option value="SUBMITTED">SUBMITTED</option>
                        <option value="PAYMENT_PENDING">PAYMENT_PENDING</option>
                        <option value="PAYMENT_VERIFIED">PAYMENT_VERIFIED</option>
                        <option value="APPROVED">APPROVED</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#A8A8A8] mb-1">College Filter</label>
                      <input
                        type="text"
                        value={filterCollege}
                        onChange={(e) => setFilterCollege(e.target.value)}
                        placeholder="College name..."
                        className="w-full bg-[#080808] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white placeholder:text-[#666] focus:border-[#B52A32] focus:outline-none"
                      />
                    </div>
                  </>
                )}

                <div className={exportType === "food" ? "sm:col-span-1" : "sm:col-span-2"}>
                  <label className="block text-[11px] text-[#A8A8A8] mb-1">Search Keywords</label>
                  <input
                    type="text"
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    placeholder={
                      exportType === "payments"
                        ? "Search by team name, email, phone, transaction ID..."
                        : exportType === "food"
                        ? "Search participant, team name, email..."
                        : "Search by keyword..."
                    }
                    className="w-full bg-[#080808] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white placeholder:text-[#666] focus:border-[#B52A32] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#A8A8A8] mb-1">From Date</label>
                  <input
                    type="date"
                    value={filterFromDate}
                    onChange={(e) => setFilterFromDate(e.target.value)}
                    className="w-full bg-[#080808] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:border-[#B52A32] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#A8A8A8] mb-1">To Date</label>
                  <input
                    type="date"
                    value={filterToDate}
                    onChange={(e) => setFilterToDate(e.target.value)}
                    className="w-full bg-[#080808] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:border-[#B52A32] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsExportOpen(false)}
                className="px-4 py-2 text-xs text-[#A8A8A8] hover:text-white transition-colors"
              >
                Close
              </button>
              <a
                href={buildExportUrl()}
                download
                onClick={() => setIsExportOpen(false)}
                className="flex items-center gap-2 bg-[#B52A32] hover:bg-[#D83A43] text-white px-5 py-2 rounded-full text-xs font-semibold shadow-lg shadow-[#B52A32]/20 transition-all"
              >
                <Download size={14} /> Download Filtered CSV
              </a>
            </div>
          </div>
        </div>
      )}

      {queryError && <div role="alert" className="glass rounded p-3 text-sm text-[#D83A43] border-l-2 border-[#B52A32]">{queryError.message}</div>}

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.key} className="glass rounded-lg p-4">
              <Icon size={16} className="text-[#A8A8A8] mb-3" />
              <div className="display text-2xl md:text-3xl font-bold text-white">
                {isLoading || queryError ? "—" : data?.counts[card.key] ?? 0}
              </div>
              <div className="mono text-[9px] uppercase tracking-widest text-[#A8A8A8] mt-1">
                {card.label}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent registrations */}
        <div className="lg:col-span-2 glass rounded-lg overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <h2 className="text-sm font-semibold text-white">Recent Registrations</h2>
            <Link href="/admin/registrations" className="text-xs text-[#B52A32] hover:text-[#D83A43]">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {isLoading ? (
              <div className="p-6 text-sm text-[#A8A8A8]">Loading…</div>
            ) : data?.recentRegistrations?.length === 0 ? (
              <div className="p-6 text-sm text-[#A8A8A8]">No registrations yet.</div>
            ) : (
              data?.recentRegistrations?.map((t) => (
                <Link
                  key={t.id}
                  href={`/admin/registrations/detail?id=${t.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{t.teamName}</div>
                    <div className="text-xs text-[#A8A8A8] truncate">
                      {t.members.length} members · {t.college ?? "No college"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-semibold ${STATUS_COLORS[t.status] ?? "text-[#A8A8A8]"}`}>
                      {t.status.replace(/_/g, " ")}
                    </div>
                    <div className="text-[10px] text-[#A8A8A8]">
                      {t.payment?.status ? `Payment: ${t.payment.status.toLowerCase()}` : "No payment"}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Meal check-in summary */}
        <div className="glass rounded-lg overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <h2 className="text-sm font-semibold text-white">Food Check-ins</h2>
            <Link href="/admin/food" className="text-xs text-[#B52A32] hover:text-[#D83A43]">
              History →
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {isLoading ? (
              <div className="p-6 text-sm text-[#A8A8A8]">Loading…</div>
            ) : (
              data?.meals?.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-4">
                  <div>
                    <div className="text-sm text-white">{m.label}</div>
                    <div className="mono text-[10px] uppercase tracking-widest text-[#A8A8A8]">
                      {m.type}
                    </div>
                  </div>
                  <div className="display text-2xl font-bold text-[#B52A32]">{m.checkInCount}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent check-ins */}
      <div className="glass rounded-lg overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h2 className="text-sm font-semibold text-white">Recent Food Check-ins</h2>
        </div>
        <div className="divide-y divide-white/5">
          {isLoading ? (
            <div className="p-6 text-sm text-[#A8A8A8]">Loading…</div>
          ) : data?.recentCheckIns?.length === 0 ? (
            <div className="p-6 text-sm text-[#A8A8A8]">No check-ins yet.</div>
          ) : (
            data?.recentCheckIns?.map((c) => (
              <div key={c.id} className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{c.participant.fullName}</div>
                  <div className="text-xs text-[#A8A8A8] truncate">
                    {c.participant.team.teamName} · {c.meal.label}
                  </div>
                </div>
                <div className="mono text-xs text-[#A8A8A8]">
                  {new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
