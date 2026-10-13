"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  Trash2,
  FileCode2,
  Loader2,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  Layers,
  GraduationCap,
  Download,
  Users,
} from "lucide-react";
import { QuillEditor } from "./quill-editor";

export interface AcceptedTeamSummary {
  id: string;
  teamName: string;
  registrationId: string | null;
  degree: string | null;
  domainName: string | null;
  status: string;
  createdAt: string;
}

export interface ProblemStatementItem {
  id: string;
  title: string;
  description: string;
  degrees: string[];
  domainId: string | null;
  domain: {
    id: string;
    name: string;
    degrees: string[];
    enabled: boolean;
  } | null;
  isPublished: boolean;
  acceptedByTeams?: AcceptedTeamSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface DomainOption {
  id: string;
  name: string;
  degrees: string[];
  enabled: boolean;
}

const DEGREES = ["Diploma", "UG", "PG"] as const;

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      typeof result.error === "string" ? result.error : `Request failed (${response.status})`,
    );
  }
  return result as T;
}

export function ProblemStatementsManager() {
  const queryClient = useQueryClient();

  // Queries
  const {
    data: psData,
    isLoading: psLoading,
    error: psError,
  } = useQuery<{ problemStatements: ProblemStatementItem[] }>({
    queryKey: ["admin-problem-statements"],
    queryFn: () => request("/api/admin/problem-statements"),
  });

  const { data: domainData } = useQuery<{ domains: DomainOption[] }>({
    queryKey: ["admin-domains"],
    queryFn: () => request("/api/admin/domains"),
  });

  // State
  const [selectedDegree, setSelectedDegree] = useState<string>("ALL");
  const [selectedDomain, setSelectedDomain] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProblemStatementItem | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [degrees, setDegrees] = useState<string[]>(["UG", "PG"]);
  const [domainId, setDomainId] = useState<string>("");
  const [isPublished, setIsPublished] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const problemStatements = psData?.problemStatements || [];
  const domains = domainData?.domains || [];

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-problem-statements"] });
    await queryClient.invalidateQueries({ queryKey: ["problem-statements"] });
  };

  const openAddModal = () => {
    setEditingItem(null);
    setTitle("");
    setDescription("");
    setDegrees(["UG", "PG"]);
    setDomainId("");
    setIsPublished(true);
    setActionError(null);
    setModalOpen(true);
  };

  const openEditModal = (item: ProblemStatementItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description);
    setDegrees(item.degrees || []);
    setDomainId(item.domainId || "");
    setIsPublished(item.isPublished);
    setActionError(null);
    setModalOpen(true);
  };

  const handleToggleDegree = (deg: string) => {
    setDegrees((prev) =>
      prev.includes(deg) ? prev.filter((d) => d !== deg) : [...prev, deg],
    );
  };

  const handleSelectAllDegrees = () => {
    setDegrees([...DEGREES]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setActionError("Title and description are required.");
      return;
    }
    if (degrees.length === 0) {
      setActionError("Please select at least one applicable degree category.");
      return;
    }

    setSubmitting(true);
    setActionError(null);
    setSuccessMessage(null);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      degrees,
      domainId: domainId.trim() ? domainId.trim() : null,
      isPublished,
    };

    try {
      if (editingItem) {
        await request(`/api/admin/problem-statements/${editingItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        setSuccessMessage(`Problem statement "${title}" updated successfully.`);
      } else {
        await request("/api/admin/problem-statements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        setSuccessMessage(`Problem statement "${title}" created successfully.`);
      }

      await refresh();
      setModalOpen(false);
    } catch (err: any) {
      setActionError(err.message || "Failed to save problem statement.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (item: ProblemStatementItem) => {
    setBusyId(item.id);
    setActionError(null);
    setSuccessMessage(null);
    try {
      await request(`/api/admin/problem-statements/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !item.isPublished }),
      });
      await refresh();
      setSuccessMessage(
        `Problem statement "${item.title}" is now ${
          !item.isPublished ? "Published" : "in Draft"
        }.`,
      );
    } catch (err: any) {
      setActionError(err.message || "Failed to toggle status.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (item: ProblemStatementItem) => {
    if (!confirm(`Are you sure you want to delete the problem statement "${item.title}"?`)) {
      return;
    }

    setBusyId(item.id);
    setActionError(null);
    setSuccessMessage(null);
    try {
      await request(`/api/admin/problem-statements/${item.id}`, {
        method: "DELETE",
      });
      await refresh();
      setSuccessMessage(`Problem statement "${item.title}" deleted.`);
    } catch (err: any) {
      setActionError(err.message || "Failed to delete problem statement.");
    } finally {
      setBusyId(null);
    }
  };

  // Filter logic
  const filteredItems = problemStatements.filter((item) => {
    // Degree filter
    if (selectedDegree !== "ALL" && !item.degrees.includes(selectedDegree)) {
      return false;
    }
    // Domain filter
    if (selectedDomain !== "ALL" && item.domainId !== selectedDomain) {
      return false;
    }
    // Status filter
    if (statusFilter === "PUBLISHED" && !item.isPublished) return false;
    if (statusFilter === "DRAFT" && item.isPublished) return false;
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchDomain = item.domain?.name.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchDomain) return false;
    }
    return true;
  });

  const exportProblemSelectionsCsv = () => {
    if (filteredItems.length === 0) return;

    const headers = [
      "Problem Statement ID",
      "Problem Statement Title",
      "Domain",
      "Eligible Degrees",
      "Total Teams Selected",
      "Selected Team Name",
      "Selected Team ID / Reg ID",
      "Team Degree",
      "Team Domain",
      "Team Status",
    ];

    const escapeCsv = (val: any) => {
      const str = String(val ?? "");
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows: string[] = [];
    filteredItems.forEach((ps) => {
      const teamsForPs = (ps.acceptedByTeams || []).filter((t) => {
        if (selectedDomain === "ALL") return true;
        return ps.domainId ? ps.domainId === selectedDomain : true;
      });

      if (teamsForPs.length === 0) {
        rows.push(
          [
            escapeCsv(ps.id),
            escapeCsv(ps.title),
            escapeCsv(ps.domain?.name || "General"),
            escapeCsv(ps.degrees.join("; ")),
            escapeCsv(0),
            escapeCsv("— (No team selected)"),
            escapeCsv("—"),
            escapeCsv("—"),
            escapeCsv("—"),
            escapeCsv("—"),
          ].join(",")
        );
      } else {
        teamsForPs.forEach((team) => {
          rows.push(
            [
              escapeCsv(ps.id),
              escapeCsv(ps.title),
              escapeCsv(ps.domain?.name || "General"),
              escapeCsv(ps.degrees.join("; ")),
              escapeCsv(teamsForPs.length),
              escapeCsv(team.teamName),
              escapeCsv(team.registrationId || team.id),
              escapeCsv(team.degree || "—"),
              escapeCsv(team.domainName || "—"),
              escapeCsv(team.status),
            ].join(",")
          );
        });
      }
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const domainSuffix = selectedDomain !== "ALL" ? `_domain_${selectedDomain}` : "";
    link.setAttribute(
      "download",
      `problem_statement_selections${domainSuffix}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mono mb-2 text-[10px] uppercase tracking-[0.3em] text-[#B52A32]">
            / Competitions
          </div>
          <h1 className="display text-2xl font-bold text-white md:text-3xl flex items-center gap-3">
            <FileCode2 className="text-[#B52A32]" size={28} />
            Problem Statement Management
          </h1>
          <p className="mt-1 text-sm text-[#A8A8A8]">
            Configure category-assigned (Diploma, UG, PG) and domain-specific problem statements.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={exportProblemSelectionsCsv}
            disabled={filteredItems.length === 0}
            className="flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-all disabled:opacity-40"
            title="Export CSV of which team selected which problem statement"
          >
            <Download size={15} /> Export Selections CSV
          </button>
          <button
            type="button"
            onClick={openAddModal}
            className="flex min-h-11 items-center gap-2 rounded-full bg-[#B52A32] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#D83A43] transition-all shadow-[0_0_20px_rgba(181,42,50,0.3)]"
          >
            <Plus size={16} /> Add Problem Statement
          </button>
        </div>
      </header>

      {/* Notifications */}
      {actionError && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-lg border-l-4 border-[#B52A32] bg-[#B52A32]/10 p-4 text-sm text-[#D83A43]"
        >
          <AlertCircle size={18} className="shrink-0" />
          <span>{actionError}</span>
        </div>
      )}
      {successMessage && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-lg border-l-4 border-emerald-500 bg-emerald-500/10 p-4 text-sm text-emerald-300"
        >
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Filter & Control Bar */}
      <div className="rounded-xl border border-white/5 bg-[#080808] p-4 space-y-4">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <span className="mono text-xs uppercase tracking-wider text-[#A8A8A8] flex items-center gap-1.5">
              <GraduationCap size={14} className="text-[#B52A32]" /> Category:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "ALL", label: "All Categories" },
                { id: "Diploma", label: "Diploma" },
                { id: "UG", label: "UG (Undergraduate)" },
                { id: "PG", label: "PG (Postgraduate)" },
              ].map((tab) => {
                const count =
                  tab.id === "ALL"
                    ? problemStatements.length
                    : problemStatements.filter((p) => p.degrees.includes(tab.id)).length;
                const active = selectedDegree === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedDegree(tab.id)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-all flex items-center gap-1.5 ${
                      active
                        ? "bg-[#B52A32] text-white shadow-[0_0_15px_rgba(181,42,50,0.4)]"
                        : "bg-white/5 text-[#A8A8A8] hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`mono text-[10px] px-1.5 py-0.2 rounded-full ${
                        active ? "bg-black/30 text-white" : "bg-white/10 text-[#A8A8A8]"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Published vs Draft filter */}
          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-lg border border-white/5">
            {[
              { id: "ALL", label: "All Status" },
              { id: "PUBLISHED", label: "Published" },
              { id: "DRAFT", label: "Drafts" },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id as any)}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-all ${
                  statusFilter === st.id
                    ? "bg-white/15 text-white"
                    : "text-[#A8A8A8] hover:text-white"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary filters: Domain dropdown & Search bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Domain Dropdown */}
          <div className="flex items-center gap-2">
            <span className="mono text-xs text-[#A8A8A8] flex items-center gap-1">
              <Layers size={13} /> Domain:
            </span>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="rounded-lg border border-white/10 bg-[#0d0d0d] px-3 py-1.5 text-xs text-white focus:border-[#B52A32] focus:outline-none"
            >
              <option value="ALL">All Domains ({domains.length})</option>
              {domains.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A8A8]"
            />
            <input
              type="text"
              placeholder="Search problem statements by keyword or domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0d0d0d] pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#666] focus:border-[#B52A32] focus:outline-none"
            />
          </div>

          {(searchQuery || selectedDegree !== "ALL" || selectedDomain !== "ALL" || statusFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedDegree("ALL");
                setSelectedDomain("ALL");
                setStatusFilter("ALL");
              }}
              className="text-xs text-[#A8A8A8] hover:text-white underline transition-colors"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Problem Statements List */}
      {psLoading ? (
        <div className="rounded-xl border border-white/5 bg-[#080808] p-12 text-center text-[#A8A8A8]">
          <Loader2 size={24} className="mx-auto animate-spin text-[#B52A32] mb-3" />
          <p className="text-sm">Loading problem statements...</p>
        </div>
      ) : psError ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-400">
          <AlertCircle size={24} className="mx-auto mb-2" />
          <p className="text-sm">{(psError as any)?.message || "Failed to load problem statements."}</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-[#080808] p-12 text-center">
          <FileCode2 size={40} className="mx-auto text-white/20 mb-3" />
          <h3 className="text-base font-semibold text-white">No problem statements found</h3>
          <p className="text-xs text-[#A8A8A8] max-w-md mx-auto mt-1">
            {problemStatements.length === 0
              ? "No problem statements have been configured yet. Click 'Add Problem Statement' to create your first one."
              : "No problem statements match your active category, domain, or search filters."}
          </p>
          {problemStatements.length === 0 && (
            <button
              onClick={openAddModal}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#B52A32] px-4 py-2 text-xs font-semibold text-white hover:bg-[#D83A43]"
            >
              <Plus size={14} /> Add Problem Statement
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredItems.map((item) => {
            const teamsForThisPs = (item.acceptedByTeams || []).filter((t) => {
              if (selectedDomain === "ALL") return true;
              return item.domainId ? item.domainId === selectedDomain : true;
            });

            return (
              <div
                key={item.id}
                className={`rounded-xl border transition-all p-5 ${
                  item.isPublished
                    ? "border-white/10 bg-[#080808] hover:border-white/20"
                    : "border-white/5 bg-[#080808]/50 opacity-80 hover:opacity-100"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2.5 flex-1">
                    {/* Badges row */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Status badge */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                          item.isPublished
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.isPublished ? "bg-emerald-400" : "bg-zinc-500"
                          }`}
                        />
                        {item.isPublished ? "Published" : "Draft"}
                      </span>

                      {/* Domain badge */}
                      {item.domain ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          <Layers size={12} /> {item.domain.name}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-white/5 text-[#A8A8A8] border border-white/10">
                          General Domain
                        </span>
                      )}

                      {/* Degree Category Badges */}
                      <div className="flex items-center gap-1">
                        {item.degrees.map((deg) => {
                          let colorClasses =
                            "bg-purple-500/10 text-purple-300 border-purple-500/30";
                          if (deg === "Diploma") {
                            colorClasses =
                              "bg-amber-500/10 text-amber-300 border-amber-500/30";
                          } else if (deg === "UG") {
                            colorClasses =
                              "bg-cyan-500/10 text-cyan-300 border-cyan-500/30";
                          }
                          return (
                            <span
                              key={deg}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${colorClasses}`}
                            >
                              <GraduationCap size={11} /> {deg}
                            </span>
                          );
                        })}
                      </div>

                      {/* Teams selected count badge */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          teamsForThisPs.length > 0
                            ? "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                            : "bg-white/5 text-[#888] border border-white/10"
                        }`}
                      >
                        <Users size={11} />
                        {teamsForThisPs.length} {teamsForThisPs.length === 1 ? "team" : "teams"} selected
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-white tracking-tight">{item.title}</h3>

                    {/* Description */}
                    {item.description?.includes("<") ? (
                      <div
                        className="text-sm text-[#CCCCCC] leading-relaxed prose prose-invert prose-sm max-w-none [&_p]:mb-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_pre]:bg-black/50 [&_pre]:p-2 [&_pre]:rounded [&_blockquote]:border-l-2 [&_blockquote]:border-[#B52A32] [&_blockquote]:pl-3"
                        dangerouslySetInnerHTML={{ __html: item.description }}
                      />
                    ) : (
                      <p className="text-sm text-[#A8A8A8] whitespace-pre-line leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    {/* Selected teams list */}
                    <div className="pt-2 border-t border-white/5 space-y-1.5">
                      <div className="text-xs font-semibold text-white/90 flex items-center gap-1.5">
                        <Users size={12} className="text-[#B52A32]" />
                        Selected by {teamsForThisPs.length} {teamsForThisPs.length === 1 ? "team" : "teams"}:
                      </div>
                      {teamsForThisPs.length === 0 ? (
                        <p className="text-xs text-[#666] italic">No team has selected this problem statement yet.</p>
                      ) : (
                        <div className="flex flex-wrap items-center gap-1.5">
                          {teamsForThisPs.map((t) => (
                            <span
                              key={t.id}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-white/5 border border-white/10 text-white"
                              title={`Team ID: ${t.registrationId || t.id} · Degree: ${t.degree || "—"} · Domain: ${t.domainName || "—"}`}
                            >
                              <span className="font-semibold text-white">{t.teamName}</span>
                              <span className="mono text-[10px] text-[#B52A32] font-semibold">
                                ({t.registrationId || t.id.slice(0, 8)})
                              </span>
                              {t.degree && (
                                <span className="mono text-[9px] px-1 py-0.2 rounded bg-white/10 text-[#A8A8A8]">
                                  {t.degree}
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Timestamps */}
                    <div className="mono text-[11px] text-[#666] pt-1">
                      Created: {new Date(item.createdAt).toLocaleDateString()} · Updated:{" "}
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </div>
                  </div>

                {/* Actions column */}
                <div className="flex items-center md:flex-col gap-2 shrink-0 md:pt-1">
                  {/* Publish/Unpublish toggle */}
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(item)}
                    disabled={busyId === item.id}
                    title={item.isPublished ? "Set to Draft" : "Publish to participants"}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      item.isPublished
                        ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                        : "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30"
                    } disabled:opacity-50`}
                  >
                    {busyId === item.id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : item.isPublished ? (
                      <>
                        <EyeOff size={13} /> Unpublish
                      </>
                    ) : (
                      <>
                        <Eye size={13} /> Publish
                      </>
                    )}
                  </button>

                  {/* Edit button */}
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    disabled={busyId === item.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-[#A8A8A8] hover:text-white hover:bg-white/10 transition-all border border-white/5 disabled:opacity-50"
                  >
                    <Pencil size={13} /> Edit
                  </button>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    disabled={busyId === item.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all border border-red-500/10 disabled:opacity-50"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0e0e0e] p-6 md:p-8 shadow-2xl my-8">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-5 top-5 text-[#A8A8A8] hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <div className="mono text-xs uppercase tracking-widest text-[#B52A32] mb-1">
                {editingItem ? "/ Edit Record" : "/ New Record"}
              </div>
              <h2 className="display text-xl font-bold text-white">
                {editingItem ? "Edit Problem Statement" : "Add New Problem Statement"}
              </h2>
              <p className="text-xs text-[#A8A8A8] mt-1">
                Assign this problem statement to one or more participant categories (Diploma, UG, PG).
              </p>
            </div>

            {actionError && (
              <div className="mb-4 rounded-lg border-l-4 border-[#B52A32] bg-[#B52A32]/10 p-3 text-xs text-[#D83A43]">
                {actionError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-white/90 mb-1.5">
                  Problem Statement Title <span className="text-[#B52A32]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI-Driven Real-Time Cyber Incident Response"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#141414] px-4 py-2.5 text-sm text-white placeholder-[#555] focus:border-[#B52A32] focus:outline-none"
                />
              </div>

              {/* Domain selection */}
              <div>
                <label className="block text-xs font-medium text-white/90 mb-1.5">
                  Associated Domain (Optional)
                </label>
                <select
                  value={domainId}
                  onChange={(e) => setDomainId(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#141414] px-4 py-2.5 text-sm text-white focus:border-[#B52A32] focus:outline-none"
                >
                  <option value="">-- None (Open to all domains) --</option>
                  {domains.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.degrees.join(", ")})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[#777] mt-1">
                  If selected, this problem statement will align with teams competing in this domain.
                </p>
              </div>

              {/* Applicable Degree Categories */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-white/90">
                    Applicable Degree Categories <span className="text-[#B52A32]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAllDegrees}
                    className="text-[11px] text-[#B52A32] hover:text-[#D83A43] underline transition-colors"
                  >
                    Select All Categories
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {DEGREES.map((deg) => {
                    const checked = degrees.includes(deg);
                    return (
                      <label
                        key={deg}
                        className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                          checked
                            ? "border-[#B52A32]/60 bg-[#B52A32]/10 text-white"
                            : "border-white/10 bg-[#141414] text-[#A8A8A8] hover:border-white/20"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleDegree(deg)}
                          className="w-4 h-4 rounded text-[#B52A32] focus:ring-0 bg-transparent border-white/30"
                        />
                        <span className="text-xs font-semibold">{deg}</span>
                      </label>
                    );
                  })}
                </div>
                <p className="text-[11px] text-[#777] mt-1.5">
                  Only participants in these selected degree categories will be able to see this problem statement on their dashboard.
                </p>
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-white/90">
                    Problem Description & Requirements (Rich Text) <span className="text-[#B52A32]">*</span>
                  </label>
                  <span className="mono text-[10px] text-[#A8A8A8]">
                    Styled via Quill Editor
                  </span>
                </div>
                <QuillEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="Describe the problem background, objective, expected deliverables, evaluation criteria, and constraints with styles, lists, and code blocks..."
                />
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                  className="rounded-full px-5 py-2.5 text-xs font-semibold text-[#A8A8A8] hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-full bg-[#B52A32] px-6 py-2.5 text-xs font-semibold text-white hover:bg-[#D83A43] transition-all shadow-[0_0_15px_rgba(181,42,50,0.3)] disabled:opacity-50"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  {editingItem ? "Update Problem Statement" : "Create Problem Statement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
