import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  Download, 
  FileText, 
  PieChart, 
  TrendingUp, 
  Calendar, 
  Filter,
  TrendingDown,
  Printer
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHero } from "@/components/ui/page-hero";
import { StatCard } from "@/components/ui/stat-card";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { IncidentRecord } from "@/features/incident-dashboard/types";
import type { AnalyticsSummary, CategoryStat, RiskTrendPoint, SeverityStat } from "./types";

function downloadTextFile(filename: string, content: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = anchor.download || filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function buildCsv(records: IncidentRecord[]) {
  const rows = [
    ["title", "category", "location", "status", "risk_score", "incident_type", "severity", "created_at"],
    ...records.map((record) => [
      record.title,
      record.category,
      record.location,
      record.status,
      record.risk_score,
      record.incident_type,
      record.severity,
      record.created_at,
    ]),
  ];
  return rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
}

function buildPdfReport(records: IncidentRecord[]) {
  const summary = records.length
    ? `Total incidents: ${records.length}\nCritical incidents: ${records.filter((record) => record.risk_score >= 80).length}\nResolved incidents: ${records.filter((record) => record.status === "resolved").length}`
    : "No incidents available.";
  return `CrisisLens Analytics Report\n\n${summary}\n\nRecent incidents:\n${records
    .slice(0, 8)
    .map((record) => `- ${record.title} (${record.incident_type}) - Risk ${record.risk_score}/100`)
    .join("\n")}`;
}

export function AnalyticsPage() {
  const [records] = useLocalStorage<IncidentRecord[]>("crisislens.incidents", []);
  
  // Interactive filter states
  const [dateRange, setDateRange] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  // Dynamically filter records based on state
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      // 1. Date Range filtering
      const recDate = new Date(rec.created_at).getTime();
      const now = Date.now();
      let matchesDate = true;
      if (dateRange === "24h") {
        matchesDate = now - recDate <= 24 * 60 * 60 * 1000;
      } else if (dateRange === "7d") {
        matchesDate = now - recDate <= 7 * 24 * 60 * 60 * 1000;
      } else if (dateRange === "30d") {
        matchesDate = now - recDate <= 30 * 24 * 60 * 60 * 1000;
      }

      // 2. Category filtering
      const matchesCategory = categoryFilter === "all" || rec.category.toLowerCase() === categoryFilter;

      // 3. Severity filtering
      let severityClass = 'low';
      if (rec.risk_score >= 80) severityClass = 'critical';
      else if (rec.risk_score >= 60) severityClass = 'high';
      else if (rec.risk_score >= 40) severityClass = 'medium';

      const matchesSeverity = severityFilter === "all" || severityClass === severityFilter;

      return matchesDate && matchesCategory && matchesSeverity;
    });
  }, [records, dateRange, categoryFilter, severityFilter]);

  const summary = useMemo<AnalyticsSummary>(() => {
    const totalIncidents = filteredRecords.length;
    const criticalIncidents = filteredRecords.filter((record) => record.risk_score >= 80).length;
    const resolvedIncidents = filteredRecords.filter((record) => record.status === "resolved").length;
    const averageRiskScore =
      totalIncidents > 0 ? Math.round(filteredRecords.reduce((acc, record) => acc + record.risk_score, 0) / totalIncidents) : 0;
    return {
      totalIncidents,
      criticalIncidents,
      resolvedIncidents,
      averageRiskScore,
    };
  }, [filteredRecords]);

  const categoryStats = useMemo<CategoryStat[]>(() => {
    const map = new Map<string, number>();
    filteredRecords.forEach((record) => {
      map.set(record.category, (map.get(record.category) ?? 0) + 1);
    });
    return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
  }, [filteredRecords]);

  const severityStats = useMemo<SeverityStat[]>(() => {
    const map = new Map<string, number>();
    filteredRecords.forEach((record) => {
      map.set(record.severity, (map.get(record.severity) ?? 0) + 1);
    });
    return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
  }, [filteredRecords]);

  const riskTrend = useMemo<RiskTrendPoint[]>(() => {
    return filteredRecords
      .slice(0, 8)
      .reverse()
      .map((record) => ({
        label: record.title,
        value: record.risk_score,
      }));
  }, [filteredRecords]);

  const exportCsv = () => downloadTextFile("incident-history.csv", buildCsv(filteredRecords), "text/csv;charset=utf-8;");
  const exportPdf = () => downloadTextFile("incident-analysis-report.txt", buildPdfReport(filteredRecords), "text/plain;charset=utf-8;");

  const totalFiltered = filteredRecords.length || 1;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHero
        eyebrow="Intelligence Analytics"
        title="Turn incident history into executive visibility and response insight."
        description="Review risk momentum, operational coverage, and incident distribution with a premium analytics surface built on your existing data."
        actions={
          <>
            <Button type="button" variant="primary" onClick={exportCsv} className="gap-2 text-xs">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button type="button" variant="outline" onClick={handlePrint} className="gap-2 text-xs">
              <Printer className="h-4 w-4" />
              Print Analytics
            </Button>
            <Button type="button" variant="outline" onClick={exportPdf} className="gap-2 text-xs">
              <FileText className="h-4 w-4" />
              Download report
            </Button>
          </>
        }
      />

      {/* Interactive Filters Bar */}
      <Card className="border-white/[0.06] bg-[#151C28]/80 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="p-4 bg-gradient-to-b from-white/[0.02] to-transparent border-b border-white/[0.05] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[#3B82F6]" />
            <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Telemetry Controls</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Date picker range option */}
            <div className="flex items-center gap-1.5 border border-white/[0.07] bg-[#111827]/80 px-3.5 py-1.5 rounded-xl">
              <Calendar className="h-3.5 w-3.5 text-[#94A3B8]/60" />
              <select 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-transparent font-semibold text-[#CBD5E1] focus:outline-none cursor-pointer text-xs"
                aria-label="Date range filter"
              >
                <option value="all" className="bg-[#151C28] text-[#CBD5E1]">All-Time Period</option>
                <option value="24h" className="bg-[#151C28] text-[#CBD5E1]">Last 24 Hours</option>
                <option value="7d" className="bg-[#151C28] text-[#CBD5E1]">Last 7 Days</option>
                <option value="30d" className="bg-[#151C28] text-[#CBD5E1]">Last 30 Days</option>
              </select>
            </div>

            {/* Category selection */}
            <div className="flex items-center gap-1.5 border border-white/[0.07] bg-[#111827]/80 px-3.5 py-1.5 rounded-xl">
              <select 
                value={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent font-semibold text-[#CBD5E1] focus:outline-none cursor-pointer text-xs"
                aria-label="Category filter"
              >
                <option value="all" className="bg-[#151C28] text-[#CBD5E1]">All Categories</option>
                <option value="fire" className="bg-[#151C28] text-[#CBD5E1]">Fire / Wildfire</option>
                <option value="earthquake" className="bg-[#151C28] text-[#CBD5E1]">Earthquake</option>
                <option value="flood" className="bg-[#151C28] text-[#CBD5E1]">Flood / Inundation</option>
                <option value="storm" className="bg-[#151C28] text-[#CBD5E1]">Storm / Hurricane</option>
                <option value="hazmat" className="bg-[#151C28] text-[#CBD5E1]">Chemical / Hazmat</option>
                <option value="medical" className="bg-[#151C28] text-[#CBD5E1]">Medical Incident</option>
                <option value="other" className="bg-[#151C28] text-[#CBD5E1]">Other Events</option>
              </select>
            </div>

            {/* Severity selection */}
            <div className="flex items-center gap-1.5 border border-white/[0.07] bg-[#111827]/80 px-3.5 py-1.5 rounded-xl">
              <select 
                value={severityFilter} 
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-transparent font-semibold text-[#CBD5E1] focus:outline-none cursor-pointer text-xs"
                aria-label="Severity filter"
              >
                <option value="all" className="bg-[#151C28] text-[#CBD5E1]">All Severities</option>
                <option value="critical" className="bg-[#151C28] text-[#CBD5E1]">Critical (&gt;=80)</option>
                <option value="high" className="bg-[#151C28] text-[#CBD5E1]">High (60-79)</option>
                <option value="medium" className="bg-[#151C28] text-[#CBD5E1]">Medium (40-59)</option>
                <option value="low" className="bg-[#151C28] text-[#CBD5E1]">Low (&lt;40)</option>
              </select>
            </div>

            {/* Active Drilldown Reset Badge */}
            {(categoryFilter !== "all" || severityFilter !== "all" || dateRange !== "all") && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setCategoryFilter("all");
                  setSeverityFilter("all");
                  setDateRange("all");
                }}
                className="h-8 text-[10px] px-3 font-semibold border-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444]/10"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total incidents" value={summary.totalIncidents} subtitle="Captured in workspace" icon={<BarChart3 className="h-5 w-5" />} tone="blue" />
        <StatCard label="Critical" value={summary.criticalIncidents} subtitle="Above 80 risk threshold" icon={<TrendingUp className="h-5 w-5" />} tone="red" />
        <StatCard label="Resolved" value={summary.resolvedIncidents} subtitle="Closed & cleared cases" icon={<FileText className="h-5 w-5" />} tone="emerald" />
        <StatCard label="Average risk" value={summary.averageRiskScore} subtitle="AI-assessed confidence" unit="/100" icon={<PieChart className="h-5 w-5" />} tone="default" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <Card className="overflow-hidden border-white/[0.06] bg-[#151C28]/80 backdrop-blur-xl">
            <CardHeader className="border-b border-white/[0.05] bg-gradient-to-b from-white/[0.02] to-transparent flex flex-row justify-between items-center py-3.5">
              <CardTitle className="text-sm font-semibold text-[#F8FAFC]">Incident Categories</CardTitle>
              <span className="text-[10px] text-[#94A3B8]/60 font-semibold uppercase tracking-wider">Click to drill down</span>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 space-y-3.5">
              {categoryStats.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="h-8 w-8 text-[#94A3B8]/20 mx-auto mb-2" />
                  <p className="text-xs text-[#94A3B8]/60 font-semibold">No category data yet.</p>
                </div>
              ) : (
                categoryStats.map((stat) => {
                  const pct = Math.round((stat.value / totalFiltered) * 100);
                  const isSelected = categoryFilter === stat.label.toLowerCase();
                  return (
                    <div
                      key={stat.label}
                      onClick={() => setCategoryFilter(isSelected ? "all" : stat.label.toLowerCase())}
                      className={`space-y-2.5 p-3 border rounded-xl cursor-pointer transition-all bg-[#111827]/20 ${
                        isSelected 
                          ? "border-[#3B82F6]/45 bg-[#3B82F6]/10 shadow-[0_2px_12px_rgba(59,130,246,0.1)]" 
                          : "border-white/[0.05] hover:border-white/[0.1] hover:bg-[#151C28]/20"
                      }`}
                      title={`Drill down category: ${stat.label} (${pct}% of total)`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#CBD5E1] capitalize">{stat.label}</span>
                        <span className="text-[#94A3B8]/80 font-semibold tabular-nums">{stat.value} <span className="text-[#3B82F6]">({pct}%)</span></span>
                      </div>
                      <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden flex border border-white/[0.04]">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (stat.value / totalFiltered) * 100)}%` }}
                          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full rounded-full bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] shadow-[0_0_8px_rgba(59,130,246,0.4)]"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.04 }}>
          <Card className="overflow-hidden border-white/[0.06] bg-[#151C28]/80 backdrop-blur-xl">
            <CardHeader className="border-b border-white/[0.05] bg-gradient-to-b from-white/[0.02] to-transparent flex flex-row justify-between items-center py-3.5">
              <CardTitle className="text-sm font-semibold text-[#F8FAFC]">Severity Distribution</CardTitle>
              <span className="text-[10px] text-[#94A3B8]/60 font-semibold uppercase tracking-wider">Click to drill down</span>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 space-y-3.5">
              {severityStats.length === 0 ? (
                <div className="text-center py-8">
                  <PieChart className="h-8 w-8 text-[#94A3B8]/20 mx-auto mb-2" />
                  <p className="text-xs text-[#94A3B8]/60 font-semibold">No severity data yet.</p>
                </div>
              ) : (
                severityStats.map((stat) => {
                  const pct = Math.round((stat.value / totalFiltered) * 100);
                  const isSelected = severityFilter === stat.label.toLowerCase();
                  const isHigh = ['critical', 'high'].includes(stat.label.toLowerCase());
                  return (
                    <div
                      key={stat.label}
                      onClick={() => setSeverityFilter(isSelected ? "all" : stat.label.toLowerCase())}
                      className={`space-y-2.5 p-3 border rounded-xl cursor-pointer transition-all bg-[#111827]/20 ${
                        isSelected 
                          ? "border-[#F59E0B]/40 bg-[#F59E0B]/10 shadow-[0_2px_12px_rgba(245,158,11,0.1)]" 
                          : "border-white/[0.05] hover:border-white/[0.1] hover:bg-[#151C28]/20"
                      }`}
                      title={`Drill down severity: ${stat.label} (${pct}% of total)`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#CBD5E1] capitalize">{stat.label}</span>
                        <span className="text-[#94A3B8]/80 font-semibold tabular-nums">{stat.value} <span className={isHigh ? "text-[#F59E0B]" : "text-[#10B981]"}>({pct}%)</span></span>
                      </div>
                      <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden flex border border-white/[0.04]">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (stat.value / totalFiltered) * 100)}%` }}
                          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                          className={`h-full rounded-full ${isHigh ? "bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] shadow-[0_0_8px_rgba(245,158,11,0.4)]" : "bg-gradient-to-r from-[#10B981] to-[#34D399] shadow-[0_0_8px_rgba(16,185,129,0.4)]"}`}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.08 }}>
        <Card className="overflow-hidden border-white/[0.06] bg-[#151C28]/80 backdrop-blur-xl">
          <CardHeader className="border-b border-white/[0.05] bg-gradient-to-b from-white/[0.02] to-transparent py-3.5 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-[#F8FAFC]">AI Risk Trend Profile</CardTitle>
            <span className="text-[10px] text-[#94A3B8]/60 font-semibold uppercase tracking-wider">Most Recent Incidents</span>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 space-y-3.5">
            {riskTrend.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="h-8 w-8 text-[#94A3B8]/20 mx-auto mb-2" />
                <p className="text-xs text-[#94A3B8]/60 font-semibold">No trend data yet. Submit incidents via Intake.</p>
              </div>
            ) : (
              riskTrend.map((point, idx) => (
                <div key={`${point.label}-${idx}`} className="space-y-2.5 p-3 border border-white/[0.05] bg-[#111827]/20 rounded-xl hover:bg-[#151C28]/20 transition-colors">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#CBD5E1] truncate pr-4">{point.label}</span>
                    <span className="text-[#CBD5E1] flex items-center gap-1.5 shrink-0 font-bold tabular-nums">
                      <span className={point.value >= 80 ? "text-[#EF4444]" : point.value >= 60 ? "text-[#F59E0B]" : "text-[#10B981]"}>
                        {point.value}/100
                      </span>
                      {point.value >= 80 ? (
                        <TrendingUp className="h-3.5 w-3.5 text-[#EF4444]" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5 text-[#10B981]" />
                      )}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden flex border border-white/[0.04]">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${point.value}%` }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: idx * 0.04 }}
                      className={`h-full rounded-full ${
                        point.value >= 80 
                          ? "bg-gradient-to-r from-[#DC2626] to-[#EF4444] shadow-[0_0_8px_rgba(220,38,38,0.4)]" 
                          : point.value >= 60 
                            ? "bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] shadow-[0_0_6px_rgba(245,158,11,0.3)]"
                            : "bg-gradient-to-r from-[#10B981] to-[#34D399] shadow-[0_0_6px_rgba(16,185,129,0.3)]"
                      }`} 
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
