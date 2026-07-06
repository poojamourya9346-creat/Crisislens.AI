import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Search,
  Sparkles,
  Share2,
  Download,
  FileJson,
  Clock,
  Trash2,
  Filter,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHero } from "@/components/ui/page-hero";
import { StatCard } from "@/components/ui/stat-card";
import { Badge, statusTone, riskTone } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { IncidentRecord } from "./types";

const PAGE_SIZE = 6;

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelative(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function IncidentDashboardPage() {
  const [records, setRecords] = useLocalStorage<IncidentRecord[]>("crisislens.incidents", []);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "highest-risk">("newest");
  const [page, setPage] = useState(1);
  const [selectedIncident, setSelectedIncident] = useState<IncidentRecord | null>(null);
  const { pushToast } = useToast();

  const filteredRecords = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const filtered = records.filter(record => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [record.title, record.description, record.category, record.location, record.incident_type]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);
      const matchesStatus = statusFilter === "all" || record.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return [...filtered].sort((l, r) => {
      if (sortOrder === "highest-risk") return r.risk_score - l.risk_score;
      const lDate = new Date(l.created_at).getTime();
      const rDate = new Date(r.created_at).getTime();
      return sortOrder === "oldest" ? lDate - rDate : rDate - lDate;
    });
  }, [records, searchTerm, statusFilter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const pagedRecords = filteredRecords.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openIncident   = (r: IncidentRecord) => setSelectedIncident(r);
  const closeIncident  = () => setSelectedIncident(null);

  const markResolved = (id: string) => {
    setRecords(cur => cur.map(r => r.id === id ? { ...r, status: "resolved" } : r));
    if (selectedIncident?.id === id) setSelectedIncident(prev => prev ? { ...prev, status: "resolved" } : null);
    pushToast({ title: "Incident resolved", description: "Status updated to resolved.", tone: "success" });
  };

  const deleteIncident = (id: string) => {
    setRecords(cur => cur.filter(r => r.id !== id));
    if (selectedIncident?.id === id) setSelectedIncident(null);
    pushToast({ title: "Incident removed", description: "Incident deleted from Command Center.", tone: "default" });
  };

  const handleExportPDF = (incident: IncidentRecord) => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>CrisisLens — ${incident.title}</title>
      <style>
        body{font-family:system-ui,sans-serif;padding:40px;color:#CBD5E1;background:#0B0F17;max-width:800px;margin:0 auto}
        h1{border-bottom:2px solid #1B2433;padding-bottom:10px;margin-bottom:24px;font-size:22px;color:#F8FAFC}
        .meta{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:28px}
        .meta-item{background:#151C28;padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,0.06)}
        .label{font-size:10px;font-weight:700;text-transform:uppercase;color:#94A3B8;margin-bottom:4px;letter-spacing:0.1em}
        .val{font-size:14px;font-weight:750;color:#F8FAFC}
        .section{margin-bottom:24px}
        .section-title{font-size:13px;font-weight:700;color:#CBD5E1;border-bottom:1px solid #1B2433;padding-bottom:6px;margin-bottom:10px}
        .content{font-size:12px;line-height:1.7;color:#CBD5E1;white-space:pre-wrap}
      </style></head><body>
        <h1>CrisisLens AI Incident Report</h1>
        <div class="meta">
          <div class="meta-item"><div class="label">Incident</div><div class="val">${incident.title}</div></div>
          <div class="meta-item"><div class="label">Location</div><div class="val">${incident.location}</div></div>
          <div class="meta-item"><div class="label">Classification</div><div class="val">${incident.incident_type} (${incident.category})</div></div>
          <div class="meta-item"><div class="label">Risk</div><div class="val">${incident.risk_score}/100 · ${incident.severity}</div></div>
        </div>
        <div class="section"><div class="section-title">Description</div><div class="content">${incident.description}</div></div>
        <div class="section"><div class="section-title">AI Assessment</div><div class="content">${incident.report_markdown}</div></div>
        <script>window.onload=function(){window.print();window.close();}</script>
      </body></html>
    `);
    win.document.close();
  };

  const handleExportJSON = (incident: IncidentRecord) => {
    const blob = new Blob([JSON.stringify(incident, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `incident-${incident.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    pushToast({ title: "Exported", description: "Incident JSON downloaded.", tone: "success" });
  };

  const handleShare = (incident: IncidentRecord) => {
    const data = {
      title: `CrisisLens: ${incident.title}`,
      text:  `Risk ${incident.risk_score}/100 (${incident.severity}) — ${incident.title}`,
      url:   window.location.href,
    };
    if (navigator.share) {
      navigator.share(data).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      pushToast({ title: "Link copied", description: "Incident link copied to clipboard.", tone: "success" });
    }
  };

  const summaryMetrics = useMemo(() => {
    const total    = records.length;
    const resolved = records.filter(r => r.status === "resolved").length;
    const reviewing= records.filter(r => r.status === "reviewing").length;
    const critical = records.filter(r => r.risk_score >= 80).length;
    const now = Date.now();
    const recentDay = records.filter(r => now - new Date(r.created_at).getTime() < 86_400_000);
    const recentTotal    = recentDay.length;
    const recentCritical = recentDay.filter(r => r.risk_score >= 80).length;
    const recentResolved = recentDay.filter(r => r.status === "resolved").length;
    return { total, resolved, reviewing, critical, recentTotal, recentCritical, recentResolved };
  }, [records]);

  const telemetryStats = useMemo(() => {
    const total = records.length || 1;
    const critical = records.filter(r => r.risk_score >= 80).length;
    const warning = records.filter(r => r.risk_score >= 40 && r.risk_score < 80).length;
    const stable = records.filter(r => r.risk_score < 40).length;

    const categories: Record<string, number> = {};
    records.forEach(r => {
      categories[r.category] = (categories[r.category] || 0) + 1;
    });

    return {
      critical,
      warning,
      stable,
      criticalPct: Math.round((critical / total) * 100),
      warningPct: Math.round((warning / total) * 100),
      stablePct: Math.round((stable / total) * 100),
      categories: Object.entries(categories).map(([name, count]) => ({
        name: name.toUpperCase(),
        count,
        pct: Math.round((count / total) * 100)
      })).sort((a, b) => b.count - a.count).slice(0, 4)
    };
  }, [records]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHero
        eyebrow="Command Center"
        title="Monitor incidents with the clarity of an enterprise operations desk."
        description="Review submitted incidents, track AI-generated risk levels, and keep response progress visible across the full crisis lifecycle."
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              className="gap-2 text-xs"
              onClick={() => {
                const csv = [
                  ["title","category","location","status","risk_score","created_at"],
                  ...records.map(r => [r.title, r.category, r.location, r.status, r.risk_score, r.created_at])
                ].map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
                const a = document.createElement("a");
                a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
                a.download = "incidents.csv";
                a.click();
                pushToast({ title: "Exported", description: "CSV downloaded.", tone: "success" });
              }}
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
          </>
        }
      />

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total incidents"  value={summaryMetrics.total}    subtitle="All time"         icon={<TrendingUp className="h-5 w-5" />}    tone="blue"    delta={summaryMetrics.recentTotal > 0 ? summaryMetrics.recentTotal : undefined} />
        <StatCard label="Critical alerts"  value={summaryMetrics.critical}  subtitle="Risk ≥ 80"        icon={<AlertTriangle className="h-5 w-5" />} tone="red"     delta={summaryMetrics.recentCritical > 0 ? summaryMetrics.recentCritical : undefined} />
        <StatCard label="Under review"     value={summaryMetrics.reviewing} subtitle="Pending closure"  icon={<Clock3 className="h-5 w-5" />}       tone="amber" />
        <StatCard label="Resolved"         value={summaryMetrics.resolved}  subtitle="Cases closed"     icon={<CheckCircle2 className="h-5 w-5" />} tone="emerald"  delta={summaryMetrics.recentResolved > 0 ? summaryMetrics.recentResolved : undefined} />
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Incident table */}
        <div className="lg:col-span-2">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <Card className="overflow-hidden border-white/[0.06] bg-[#151C28]/80 backdrop-blur-xl">
              <CardHeader className="border-b border-white/[0.05] bg-gradient-to-b from-white/[0.02] to-transparent px-5 py-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-[#F8FAFC]">Incident Intelligence</CardTitle>
                    <p className="mt-0.5 text-xs text-[#94A3B8]">Filter, sort, and review incident history.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {/* Search */}
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94A3B8]/60" />
                      <input
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                        placeholder="Search…"
                        className="h-9 w-44 pl-8.5 pr-2.5 text-xs rounded-xl border border-white/[0.07] bg-[#111827]/80 text-[#F8FAFC] placeholder:text-[#94A3B8]/60 focus:border-[#3B82F6]/50 focus:ring-2 focus:ring-[#3B82F6]/10 focus:bg-[#151C28] transition-all outline-none"
                        aria-label="Search incidents"
                      />
                    </div>
                    {/* Status filter */}
                    <div className="flex items-center gap-1 rounded-xl border border-white/[0.07] bg-[#111827]/80 px-2.5 text-xs text-[#CBD5E1]">
                      <Filter className="h-3.5 w-3.5 text-[#94A3B8]" />
                      <select
                        className="h-9 bg-transparent text-xs font-semibold text-[#CBD5E1] focus:outline-none cursor-pointer"
                        value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                        aria-label="Filter by status"
                      >
                        <option value="all" className="bg-[#151C28] text-[#F8FAFC]">All statuses</option>
                        <option value="submitted" className="bg-[#151C28] text-[#F8FAFC]">Submitted</option>
                        <option value="reviewing" className="bg-[#151C28] text-[#F8FAFC]">Reviewing</option>
                        <option value="resolved" className="bg-[#151C28] text-[#F8FAFC]">Resolved</option>
                      </select>
                    </div>
                    {/* Sort */}
                    <select
                      className="h-9 rounded-xl border border-white/[0.07] bg-[#111827]/80 px-2.5 text-xs font-semibold text-[#CBD5E1] focus:outline-none cursor-pointer"
                      value={sortOrder}
                      onChange={e => { setSortOrder(e.target.value as typeof sortOrder); setPage(1); }}
                      aria-label="Sort incidents"
                    >
                      <option value="newest" className="bg-[#151C28] text-[#F8FAFC]">Newest first</option>
                      <option value="oldest" className="bg-[#151C28] text-[#F8FAFC]">Oldest first</option>
                      <option value="highest-risk" className="bg-[#151C28] text-[#F8FAFC]">Highest risk</option>
                    </select>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-xs">
                    <thead className="border-b border-white/[0.05] bg-gradient-to-b from-white/[0.02] to-transparent">
                      <tr>
                        <th className="px-5 py-3.5 font-semibold text-[#94A3B8] uppercase tracking-wider">Incident</th>
                        <th className="px-5 py-3.5 font-semibold text-[#94A3B8] uppercase tracking-wider">Status</th>
                        <th className="px-5 py-3.5 font-semibold text-[#94A3B8] uppercase tracking-wider">Risk</th>
                        <th className="px-5 py-3.5 font-semibold text-[#94A3B8] uppercase tracking-wider hidden md:table-cell">Classification</th>
                        <th className="px-5 py-3.5 font-semibold text-[#94A3B8] uppercase tracking-wider hidden lg:table-cell">Submitted</th>
                        <th className="px-5 py-3.5 font-semibold text-[#94A3B8] uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {pagedRecords.length === 0 ? (
                        <tr>
                          <td colSpan={6}>
                            <div className="flex flex-col items-center gap-3 py-16 text-[#94A3B8]/60">
                              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.06] shadow-inner">
                                <Activity className="h-6 w-6 text-[#94A3B8]/40" />
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-semibold text-[#F8FAFC]">No incidents found</p>
                                <p className="text-xs text-[#94A3B8]/60 mt-1">Try adjusting the search query or status filter.</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        pagedRecords.map((record, idx) => (
                          <motion.tr
                            key={record.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.03 }}
                            className="hover:bg-white/[0.02] transition-colors cursor-pointer border-b border-white/[0.03]"
                            onClick={() => openIncident(record)}
                          >
                            <td className="px-5 py-4">
                              <div className="text-left group">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-[#F8FAFC] group-hover:text-[#60A5FA] transition-colors text-sm leading-snug">
                                    {record.title}
                                  </span>
                                  <ChevronRight className="h-3.5 w-3.5 text-[#94A3B8]/60 opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0" />
                                </div>
                                <div className="mt-0.5 text-xs text-[#94A3B8]/60 font-medium">{record.location}</div>
                              </div>
                            </td>
                            <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                              <Badge tone={statusTone(record.status)} dot>
                                {record.status}
                              </Badge>
                            </td>
                            <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                              <Badge tone={riskTone(record.risk_score)}>
                                {record.risk_score}/100
                              </Badge>
                            </td>
                            <td className="px-5 py-4 text-[#CBD5E1] font-medium hidden md:table-cell">{record.incident_type}</td>
                            <td className="px-5 py-4 text-[#94A3B8] font-semibold hidden lg:table-cell">{formatDate(record.created_at)}</td>
                            <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button" size="sm" variant="outline"
                                  onClick={() => openIncident(record)}
                                  className="h-8 px-3 text-[10px] font-bold"
                                >
                                  View
                                </Button>
                                <button
                                  type="button"
                                  onClick={() => deleteIncident(record.id)}
                                  className="flex h-8 w-8 items-center justify-center rounded-xl text-[#94A3B8] hover:bg-[#EF4444]/10 hover:text-[#EF4444] transition-all cursor-pointer border border-transparent hover:border-[#EF4444]/20"
                                  aria-label="Delete incident"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col gap-3 border-t border-white/[0.05] bg-[#111827]/20 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-[#94A3B8]/60 font-medium">
                    Showing <span className="font-semibold text-[#CBD5E1]">{pagedRecords.length}</span> of{" "}
                    <span className="font-semibold text-[#CBD5E1]">{filteredRecords.length}</span> incidents
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button" variant="outline" size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="h-8 px-3 text-[10px]"
                    >
                      Prev
                    </Button>
                    <span className="px-2.5 text-xs font-semibold text-[#CBD5E1]">
                      {page} / {totalPages}
                    </span>
                    <Button
                      type="button" variant="outline" size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="h-8 px-3 text-[10px]"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Live Feed & Telemetry sidebar */}
        <div className="space-y-5">
          {/* Active Telemetry Matrix */}
          {records.length > 0 && (
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: 0.04 }}>
              <Card className="overflow-hidden border-white/[0.06] bg-[#151C28]/80 backdrop-blur-xl">
                <CardHeader className="border-b border-white/[0.05] bg-gradient-to-b from-white/[0.02] to-transparent px-4 py-3">
                  <CardTitle className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                    <Sparkles className="h-4 w-4 text-[#60A5FA]" />
                    Active Telemetry Matrix
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {/* Risk Level Distribution Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
                      <span>Threat Ratios</span>
                      <span className="text-[#94A3B8]/60 font-semibold">{telemetryStats.critical} Critical / {telemetryStats.warning} Warning</span>
                    </div>
                    <div className="h-3 rounded-full bg-white/[0.04] overflow-hidden flex border border-white/[0.04]">
                      {telemetryStats.critical > 0 && (
                        <div 
                          style={{ width: `${telemetryStats.criticalPct}%` }} 
                          className="bg-gradient-to-r from-[#DC2626] to-[#EF4444] shadow-[0_0_8px_rgba(220,38,38,0.4)] h-full"
                          title={`Critical Threat: ${telemetryStats.criticalPct}%`}
                        />
                      )}
                      {telemetryStats.warning > 0 && (
                        <div 
                          style={{ width: `${telemetryStats.warningPct}%` }} 
                          className="bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] shadow-[0_0_6px_rgba(245,158,11,0.3)] h-full"
                          title={`Warning Threat: ${telemetryStats.warningPct}%`}
                        />
                      )}
                      {telemetryStats.stable > 0 && (
                        <div 
                          style={{ width: `${telemetryStats.stablePct}%` }} 
                          className="bg-gradient-to-r from-[#10B981] to-[#34D399] shadow-[0_0_6px_rgba(16,185,129,0.3)] h-full"
                          title={`Operational Stable: ${telemetryStats.stablePct}%`}
                        />
                      )}
                    </div>
                  </div>

                  {/* Categories Telemetry list */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-semibold text-[#94A3B8]/60 uppercase tracking-wider block">Operational Channels</span>
                    <div className="grid grid-cols-2 gap-2">
                      {telemetryStats.categories.map((cat) => (
                        <div key={cat.name} className="p-2.5 border border-white/[0.06] bg-[#111827]/40 rounded-xl hover:border-white/[0.1] hover:bg-[#151C28]/40 transition-all">
                          <span className="text-[9px] font-bold text-[#94A3B8]/60 uppercase tracking-wider block truncate">{cat.name}</span>
                          <span className="text-sm font-bold text-white mt-1 block">{cat.count} <span className="text-[10px] font-semibold text-[#3B82F6]">({cat.pct}%)</span></span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: 0.08 }}>
            <Card className="overflow-hidden border-white/[0.06] bg-[#151C28]/80 backdrop-blur-xl">
              <CardHeader className="border-b border-white/[0.05] bg-gradient-to-b from-white/[0.02] to-transparent px-4 py-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                    <span className="h-2 w-2 rounded-full bg-[#EF4444] glow-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                    Live Incident Feed
                  </CardTitle>
                  <Badge tone="info">{records.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-3.5 space-y-2.5">
                {records.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-8 text-center text-[#94A3B8]/60">
                    <Activity className="h-8 w-8 text-[#94A3B8]/30" />
                    <p className="text-xs font-bold">No active incidents</p>
                  </div>
                ) : (
                  [...records]
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 7)
                    .map(rec => (
                      <div
                        key={rec.id}
                        onClick={() => openIncident(rec)}
                        className="group relative cursor-pointer rounded-xl border border-white/[0.05] bg-[#111827]/20 p-3 hover:border-white/[0.1] hover:bg-[#151C28]/30 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#CBD5E1] group-hover:text-[#60A5FA] transition-colors truncate">{rec.title}</p>
                            <p className="text-[10px] text-[#94A3B8]/60 mt-0.5 font-medium">{rec.location}</p>
                          </div>
                          <Badge tone={riskTone(rec.risk_score)} className="shrink-0 text-[9px] px-1.5 py-0.5">
                            {rec.risk_score}
                          </Badge>
                        </div>
                        <div className="mt-2.5 flex items-center justify-between">
                          <Badge tone={statusTone(rec.status)} dot className="text-[9px] px-1.5 py-0.5">
                            {rec.status}
                          </Badge>
                          <span className="text-[9px] font-bold text-[#94A3B8]/50 uppercase">{formatRelative(rec.created_at)}</span>
                        </div>
                      </div>
                    ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Incident Detail Panel */}
      <AnimatePresence>
        {selectedIncident && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card className="mt-2 overflow-hidden border-white/[0.06] bg-[#151C28]/80 backdrop-blur-xl shadow-2xl">
              <CardHeader className="flex flex-col gap-4 border-b border-white/[0.05] bg-gradient-to-b from-white/[0.02] to-transparent px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <CardTitle className="text-lg font-bold text-white">{selectedIncident.title}</CardTitle>
                    <Badge tone={statusTone(selectedIncident.status)} dot>{selectedIncident.status}</Badge>
                    <Badge tone={riskTone(selectedIncident.risk_score)}>Risk {selectedIncident.risk_score}/100</Badge>
                  </div>
                  <p className="text-xs text-[#94A3B8]/80 font-semibold">{selectedIncident.location} · {formatDate(selectedIncident.created_at)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button" title="Share"
                    onClick={() => handleShare(selectedIncident)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.07] text-[#CBD5E1] hover:bg-white/[0.05] hover:text-white hover:border-white/[0.12] transition-all cursor-pointer"
                    aria-label="Share incident"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button" title="Export JSON"
                    onClick={() => handleExportJSON(selectedIncident)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.07] text-[#CBD5E1] hover:bg-white/[0.05] hover:text-white hover:border-white/[0.12] transition-all cursor-pointer"
                    aria-label="Export JSON"
                  >
                    <FileJson className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button" title="Export PDF"
                    onClick={() => handleExportPDF(selectedIncident)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.07] text-[#CBD5E1] hover:bg-white/[0.05] hover:text-white hover:border-white/[0.12] transition-all cursor-pointer"
                    aria-label="Export PDF"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                  <Button type="button" variant="outline" size="sm" onClick={closeIncident} className="h-8 text-xs font-bold">
                    Close
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-5 sm:p-6">
                {/* Meta cards */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                  {[
                    { label: "Classification", value: selectedIncident.incident_type },
                    { label: "Category",        value: selectedIncident.category.toUpperCase() },
                    { label: "Risk Score",      value: `${selectedIncident.risk_score}/100` },
                    { label: "Severity",        value: selectedIncident.severity },
                  ].map(m => (
                    <div key={m.label} className="rounded-xl border border-white/[0.05] bg-[#111827]/20 px-4 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#94A3B8]/60">{m.label}</p>
                      <p className="mt-1 text-sm font-bold text-[#F8FAFC]">{m.value}</p>
                    </div>
                  ))}
                </div>

                {/* Timeline */}
                <div className="mb-6 rounded-xl border border-white/[0.05] bg-[#0B0F17]/40 p-4.5">
                  <div className="mb-4.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]/80">
                    <Clock className="h-3.5 w-3.5 text-[#3B82F6]" />
                    Incident Timeline
                  </div>
                  <div className="relative space-y-5 pl-6 border-l border-white/[0.06]">
                    {[
                      { color: "bg-[#3B82F6] shadow-[0_0_8px_rgba(59,130,246,0.6)]",   label: "T+0m",  title: "Intake Complete",     desc: "Incident logged in Command Center" },
                      { color: "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]", label: "T+2m",  title: "AI Analysis Complete", desc: `Classified as ${selectedIncident.incident_type}, risk ${selectedIncident.risk_score}/100` },
                      { color: "bg-[#F59E0B] shadow-[0_0_8px_rgba(245,158,11,0.6)]",  label: "T+5m",  title: "Dispatch Initiated",   desc: "Emergency response units notified" },
                      {
                        color: selectedIncident.status === "resolved" 
                          ? "bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.6)]" 
                          : "bg-slate-700",
                        label: "Current Status",
                        title: "Triage State",
                        desc: `Incident is currently ${selectedIncident.status}`
                      },
                    ].map((step, i) => (
                      <div key={i} className="relative">
                        <span className={`absolute -left-[30px] top-0.5 flex h-3 w-3 items-center justify-center rounded-full ${step.color} ring-4 ring-[#0B0F17]`} />
                        <p className="text-[10px] font-semibold text-[#94A3B8]/60 uppercase tracking-wide">{step.label} · {step.title}</p>
                        <p className="mt-0.5 text-xs text-[#CBD5E1] font-medium">{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description + AI Report */}
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-xl border border-white/[0.05] bg-[#0B0F17]/40 p-4.5">
                    <div className="mb-3.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]/80">
                      <Activity className="h-3.5 w-3.5 text-[#3B82F6]" />
                      Description
                    </div>
                    <p className="text-xs leading-relaxed text-[#CBD5E1] whitespace-pre-wrap font-medium">{selectedIncident.description}</p>
                  </div>
                  <div className="rounded-xl border border-white/[0.05] bg-[#0B0F17]/40 p-4.5">
                    <div className="mb-3.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]/80">
                      <Sparkles className="h-3.5 w-3.5 text-[#60A5FA] animate-pulse" />
                      AI Assessment Report
                    </div>
                    <div className="text-xs leading-relaxed text-[#CBD5E1] whitespace-pre-wrap max-h-48 overflow-y-auto font-medium">
                      {selectedIncident.report_markdown || "No report available."}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-wrap gap-3">
                  {selectedIncident.status !== "resolved" && (
                    <Button
                      type="button" variant="success"
                      onClick={() => markResolved(selectedIncident.id)}
                      className="gap-2 text-xs"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Mark as resolved
                    </Button>
                  )}
                  <Button
                    type="button" variant="danger"
                    onClick={() => deleteIncident(selectedIncident.id)}
                    className="gap-2 text-xs"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete incident
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
