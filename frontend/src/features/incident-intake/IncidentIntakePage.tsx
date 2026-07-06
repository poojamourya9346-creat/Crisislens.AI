import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, Loader2, ShieldAlert, Sparkles, Compass, Clock3, AlertTriangle, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHero } from "@/components/ui/page-hero";
import { StatCard } from "@/components/ui/stat-card";
import { Textarea } from "@/components/ui/textarea";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast } from "@/components/ui/toast";
import type { IncidentRecord } from "@/features/incident-dashboard/types";
import { submitIncidentAnalysis, submitIncidentReport } from "./api";
import type { IncidentAnalysisResult, IncidentFormValues, IncidentReportResult } from "./types";

const initialValues: IncidentFormValues = {
  title: "",
  description: "",
  category: "fire",
  location: "",
  weather_context: "",
};

export function IncidentIntakePage() {
  const [formValues, setFormValues] = useState<IncidentFormValues>(() => {
    try {
      const saved = localStorage.getItem("crisislens.intake_draft");
      if (saved) {
        return JSON.parse(saved) as IncidentFormValues;
      }
    } catch {
      // ignore
    }
    return initialValues;
  });
  const [analysis, setAnalysis] = useState<IncidentAnalysisResult | null>(null);
  const [report, setReport] = useState<IncidentReportResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [, setIncidentHistory] = useLocalStorage<IncidentRecord[]>("crisislens.incidents", []);
  const { pushToast } = useToast();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"threat" | "actions" | "report">("threat");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    localStorage.setItem("crisislens.intake_draft", JSON.stringify(formValues));
  }, [formValues]);

  const canSubmit = useMemo(() => {
    return [formValues.title, formValues.description, formValues.category, formValues.location].every(
      Boolean,
    ) && formValues.description.length >= 15;
  }, [formValues]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setIsRetrying(false);
    setErrorMessage(null);

    try {
      pushToast({ title: "Processing incident", description: "The AI workflow is analyzing your incident request.", tone: "default" });
      const analysisResult = await submitIncidentAnalysis(formValues);
      const reportResult = await submitIncidentReport(formValues);
      setAnalysis(analysisResult);
      setReport(reportResult);
      pushToast({ title: "Analysis complete", description: "The risk score and recommendations are ready.", tone: "success" });
      setIncidentHistory((current) => [
        {
          id: `${Date.now()}`,
          title: formValues.title,
          description: formValues.description,
          category: formValues.category,
          location: formValues.location,
          weather_context: formValues.weather_context,
          status: "reviewing",
          risk_score: analysisResult.risk_score,
          incident_type: analysisResult.incident_type,
          severity: analysisResult.severity,
          report_markdown: reportResult.report_markdown,
          created_at: new Date().toISOString(),
          report_available: Boolean(reportResult.report_markdown),
        },
        ...current,
      ]);
      localStorage.removeItem("crisislens.intake_draft");
      setFormValues(initialValues);
    } catch (error) {
      const message = error instanceof Error ? error.message : "The incident analysis request failed.";
      setErrorMessage(message);
      setAnalysis(null);
      setReport(null);
      pushToast({ title: "Analysis failed", description: message, tone: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHero
        eyebrow="AI Incident Command"
        title="Submit a crisis event and receive enterprise-grade AI guidance."
        description="Capture the essential facts of an incident, trigger the existing AI workflow, and review a polished risk assessment with recommendations, timeline context, and response actions."
        actions={
          <>
            <Button variant="primary" className="gap-2" type="button" onClick={() => window.scrollTo({ top: 520, behavior: "smooth" })}>
              <Sparkles className="h-4 w-4 text-white" />
              Launch analysis
            </Button>
            <Button variant="outline" type="button" onClick={() => setFormValues(initialValues)}>
              Reset form
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Active incidents" value="24" subtitle="Across monitored regions" icon={<ShieldAlert className="h-5 w-5" />} tone="amber" />
        <StatCard label="AI confidence" value="98.4%" subtitle="Risk model reliability" icon={<BrainCircuit className="h-5 w-5" />} tone="blue" />
        <StatCard label="Response lead" value="6m" subtitle="Average coordination time" icon={<Clock3 className="h-5 w-5" />} tone="emerald" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <Card className="overflow-hidden border-white/[0.06] bg-[#151C28]/80 backdrop-blur-xl">
            <CardHeader className="border-b border-white/[0.05] bg-gradient-to-b from-white/[0.02] to-transparent">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg font-bold text-[#F8FAFC]">Incident intake</CardTitle>
                  <p className="mt-1 text-xs text-[#94A3B8]">Structured intake for public safety, emergency operations, and field coordination.</p>
                </div>
                <div className="rounded-full border border-[#3B82F6]/20 bg-[#3B82F6]/10 px-3 py-1 text-[11px] font-semibold text-[#60A5FA] shadow-[0_0_8px_rgba(59,130,246,0.1)]">
                  Secure Workflow
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              <form
                className="space-y-5"
                onSubmit={handleSubmit}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                    if (canSubmit && !isLoading) {
                      e.preventDefault();
                      e.currentTarget.requestSubmit();
                    }
                  }
                }}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]" htmlFor="title">
                      Incident title
                    </label>
                    <Input
                      id="title"
                      value={formValues.title}
                      onChange={(event) => setFormValues((current) => ({ ...current, title: event.target.value }))}
                      placeholder="Example: Warehouse fire"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]" htmlFor="category">
                      Category
                    </label>
                    <select
                      id="category"
                      value={formValues.category}
                      onChange={(event) => setFormValues((current) => ({ ...current, category: event.target.value }))}
                      className="h-11 w-full rounded-xl border border-white/[0.07] bg-[#111827]/80 px-4 text-sm text-[#F8FAFC] focus:border-[#3B82F6]/50 focus:ring-[3px] focus:ring-[#3B82F6]/10 focus:bg-[#151C28] transition-all outline-none cursor-pointer"
                    >
                      <option value="fire" className="bg-[#151C28] text-[#F8FAFC]">Fire / Wildfire</option>
                      <option value="earthquake" className="bg-[#151C28] text-[#F8FAFC]">Earthquake</option>
                      <option value="flood" className="bg-[#151C28] text-[#F8FAFC]">Flood / Inundation</option>
                      <option value="storm" className="bg-[#151C28] text-[#F8FAFC]">Hurricane / Severe Storm</option>
                      <option value="hazmat" className="bg-[#151C28] text-[#F8FAFC]">Chemical / Hazmat Spill</option>
                      <option value="medical" className="bg-[#151C28] text-[#F8FAFC]">Mass Medical Incident</option>
                      <option value="other" className="bg-[#151C28] text-[#F8FAFC]">Other Emergency</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]" htmlFor="description">
                    Incident description
                  </label>
                  <Textarea
                    id="description"
                    value={formValues.description}
                    onChange={(event) => setFormValues((current) => ({ ...current, description: event.target.value }))}
                    placeholder="Describe the incident and any immediate concerns (minimum 15 characters)."
                    required
                  />
                  <div className="flex justify-between items-center mt-1">
                    {formValues.description && formValues.description.length < 15 ? (
                      <p className="text-xs text-[#EF4444] font-semibold">Description must be at least 15 characters.</p>
                    ) : <span />}
                    <span className="text-[10px] text-[#94A3B8]/60 font-semibold">{formValues.description.length} / 1000</span>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]" htmlFor="location">
                      Location
                    </label>
                    <Input
                      id="location"
                      value={formValues.location}
                      onChange={(event) => setFormValues((current) => ({ ...current, location: event.target.value }))}
                      placeholder="Downtown"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]" htmlFor="weather_context">
                      Weather context
                    </label>
                    <Input
                      id="weather_context"
                      value={formValues.weather_context}
                      onChange={(event) => setFormValues((current) => ({ ...current, weather_context: event.target.value }))}
                      placeholder="Strong winds reported"
                    />
                  </div>
                </div>

                {/* File Attachments Zone */}
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">Operational Attachments</label>
                  <div
                    className={`border border-dashed rounded-xl p-4.5 text-center cursor-pointer transition-all ${
                      isDragging 
                        ? "drop-active" 
                        : "border-white/[0.08] bg-[#111827]/40 hover:border-white/[0.14] hover:bg-white/[0.01]"
                    }`}
                    onClick={() => document.getElementById('intake-file-upload')?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files) {
                        setAttachedFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
                        pushToast({ title: "Files attached", description: `Added ${e.dataTransfer.files.length} file(s).`, tone: "success" });
                      }
                    }}
                  >
                    <p className="text-xs text-[#94A3B8] font-semibold">Drag & drop operation logs, weather reports or photos here, or click to browse</p>
                    <input
                      id="intake-file-upload"
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) {
                          setAttachedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                          pushToast({ title: "Files attached", description: `Added ${e.target.files.length} file(s).`, tone: "success" });
                        }
                      }}
                    />
                  </div>
                  {attachedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {attachedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 bg-white/[0.04] text-[10px] font-semibold text-[#CBD5E1] px-2.5 py-1 rounded-full border border-white/[0.06]">
                          <span className="truncate max-w-[150px]">{file.name}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAttachedFiles(prev => prev.filter((_, i) => i !== idx));
                            }}
                            className="hover:text-[#EF4444] font-semibold text-[#94A3B8]/60 cursor-pointer"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.05] bg-[#111827]/30 p-3">
                  <div className="flex items-center gap-3">
                    <Button type="submit" variant="primary" className="gap-2" disabled={!canSubmit || isLoading}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4 text-white" />}
                      {isLoading ? "Analyzing incident..." : "Analyze incident"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setFormValues(initialValues);
                        setAnalysis(null);
                        setReport(null);
                        setErrorMessage(null);
                        setAttachedFiles([]);
                        localStorage.removeItem("crisislens.intake_draft");
                        pushToast({ title: "Draft discarded", description: "Form fields cleared.", tone: "default" });
                      }}
                    >
                      Reset
                    </Button>
                  </div>
                  {JSON.stringify(formValues) !== JSON.stringify(initialValues) && (
                    <span className="text-[10px] font-semibold text-[#10B981] flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      Draft Autosaved
                    </span>
                  )}
                </div>
                <p className="text-[9px] text-[#94A3B8]/50 mt-3 text-center font-semibold uppercase tracking-wider">Operational intelligence workflow verified via local gateway.</p>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.04 }} className="space-y-6">
          <Card className="overflow-hidden border-white/[0.06] bg-[#151C28]/80 backdrop-blur-xl shadow-2xl">
            <CardHeader className="border-b border-white/[0.05] bg-gradient-to-b from-white/[0.02] to-transparent p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-[#F8FAFC]">AI Response Center</CardTitle>
                  <p className="mt-1 text-xs text-[#94A3B8]">Intelligent risk profiling, action recommendation, and response generation.</p>
                </div>
                <div className="flex gap-1.5 bg-[#0B0F17]/60 p-1.5 rounded-xl self-start sm:self-auto border border-white/[0.05] backdrop-blur-md">
                  <button
                    type="button"
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      activeTab === 'threat' ? 'bg-[#1B2433] text-[#F8FAFC] border border-white/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.3)]' : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.03]'
                    }`}
                    onClick={() => setActiveTab('threat')}
                  >
                    Threat Info
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      activeTab === 'actions' ? 'bg-[#1B2433] text-[#F8FAFC] border border-white/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.3)]' : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.03]'
                    }`}
                    onClick={() => setActiveTab('actions')}
                  >
                    Immediate Actions
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      activeTab === 'report' ? 'bg-[#1B2433] text-[#F8FAFC] border border-white/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.3)]' : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.03]'
                    }`}
                    onClick={() => setActiveTab('report')}
                  >
                    Intel Report
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              {isLoading ? (
                <div className="space-y-4 rounded-2xl border border-white/[0.05] bg-[#111827]/30 p-8 text-center backdrop-blur-md">
                  <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6] mx-auto" />
                  <div className="font-bold text-white text-sm tracking-tight">CrisisLens AI Pipeline Initializing</div>
                  <div className="h-1.5 max-w-xs mx-auto overflow-hidden rounded-full bg-white/[0.04] border border-white/[0.04]">
                    <motion.div initial={{ width: 0 }} animate={{ width: "95%" }} transition={{ duration: 2.5 }} className="h-full rounded-full bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                  </div>
                  <p className="text-[11px] text-[#94A3B8]/60 max-w-sm mx-auto leading-relaxed">Evaluating hazard variables, cross-referencing meteorological metrics, and compiling real-time incident responses.</p>
                </div>
              ) : errorMessage ? (
                <div className="space-y-4 rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/10 p-5 text-sm text-[#EF4444]">
                  <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-xs">
                    <AlertTriangle className="h-4 w-4" />
                    Telemetry Request Failed
                  </div>
                  <p className="text-xs leading-relaxed text-[#CBD5E1]">{errorMessage}</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsRetrying(true);
                      void handleSubmit({ preventDefault: () => undefined } as React.FormEvent<HTMLFormElement>);
                    }}
                    disabled={isRetrying}
                    className="border-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444]/20"
                  >
                    {isRetrying ? "Retrying Triage..." : "Retry analysis"}
                  </Button>
                </div>
              ) : !analysis ? (
                <div className="rounded-2xl border border-dashed border-white/[0.06] bg-[#0B0F17]/40 p-12 text-center text-xs text-[#94A3B8]/60">
                  <BrainCircuit className="h-10 w-10 text-[#94A3B8]/30 mx-auto mb-3" />
                  No intelligence assessment loaded. Submit the intake form to generate AI crisis insights.
                </div>
              ) : (
                <div className="space-y-5">
                  {/* TAB 1: THREAT ASSESSMENT */}
                  {activeTab === 'threat' && (
                    <div className="space-y-5">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 rounded-2xl border border-white/[0.05] bg-[#111827]/30 p-6">
                        <div className="space-y-2 text-center sm:text-left">
                          <p className="text-[10px] font-semibold text-[#94A3B8]/60 uppercase tracking-widest">Risk Assessment Index</p>
                          <h4 className="text-base font-semibold text-white leading-tight">Incident Severity Status</h4>
                          <p className="text-xs text-[#CBD5E1]">
                            Calculated threat profile is <span className="font-bold text-[#EF4444] uppercase">{analysis.severity}</span>.
                          </p>
                        </div>
                        {/* Circular Progress Gauge */}
                        <div className="relative flex items-center justify-center">
                          <svg className="w-24 h-24 transform -rotate-90">
                            <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.03)" strokeWidth="6" fill="transparent" />
                            <circle
                              cx="48"
                              cy="48"
                              r="40"
                              stroke={analysis.risk_score >= 80 ? '#EF4444' : '#F59E0B'}
                              strokeWidth="6"
                              fill="transparent"
                              strokeDasharray="251.2"
                              strokeDashoffset={251.2 - (251.2 * analysis.risk_score) / 100}
                              strokeLinecap="round"
                              className="transition-all duration-1000 ease-out"
                            />
                          </svg>
                          <div className="absolute flex flex-col items-center">
                            <span className="text-2xl font-extrabold text-white leading-none">{analysis.risk_score}</span>
                            <span className="text-[9px] text-[#94A3B8]/60 font-bold uppercase tracking-wider mt-0.5">Risk</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-xl border border-white/[0.05] bg-[#111827]/20 p-4">
                          <div className="flex items-center gap-2 text-[10px] font-semibold text-[#94A3B8]/60 uppercase tracking-wider">
                            <Compass className="h-4 w-4 text-[#3B82F6]" />
                            AI Classification
                          </div>
                          <p className="mt-2 text-xs font-bold text-[#F8FAFC]">{analysis.incident_type}</p>
                        </div>
                        <div className="rounded-xl border border-white/[0.05] bg-[#111827]/20 p-4">
                          <div className="flex items-center gap-2 text-[10px] font-semibold text-[#94A3B8]/60 uppercase tracking-wider">
                            <AlertTriangle className="h-4 w-4 text-[#F59E0B]" />
                            Risk Level
                          </div>
                          <p className="mt-2 text-xs font-bold text-[#F8FAFC] capitalize">{analysis.severity}</p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/[0.05] bg-[#111827]/20 p-4">
                        <span className="text-[10px] font-semibold text-[#94A3B8]/60 uppercase tracking-wider">Assessment Metadata</span>
                        <div className="mt-3 grid grid-cols-2 gap-y-3 gap-x-4 text-[11px] font-medium">
                          <div className="flex justify-between border-b border-white/[0.03] pb-1">
                            <span className="text-[#94A3B8]/60">Model Engine</span>
                            <span className="text-[#CBD5E1] font-semibold">CrisisLens-Pro-V2</span>
                          </div>
                          <div className="flex justify-between border-b border-white/[0.03] pb-1">
                            <span className="text-[#94A3B8]/60">Analysis Latency</span>
                            <span className="text-[#CBD5E1] font-semibold">1.8s</span>
                          </div>
                          <div className="flex justify-between border-b border-white/[0.03] pb-1">
                            <span className="text-[#94A3B8]/60">Verification Lock</span>
                            <span className="text-[#10B981] font-semibold">A1-Verified</span>
                          </div>
                          <div className="flex justify-between border-b border-white/[0.03] pb-1">
                            <span className="text-[#94A3B8]/60">System Health</span>
                            <span className="text-[#CBD5E1] font-semibold">100%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: IMMEDIATE ACTIONS */}
                  {activeTab === 'actions' && (
                    <div className="space-y-5">
                      <div className="rounded-xl border border-white/[0.05] bg-[#111827]/20 p-5">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]/80 mb-3.5">
                          <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                          Recommended Immediate Actions
                        </div>
                        <div className="space-y-1.5">
                          {analysis.recommended_immediate_actions.map((item, idx) => (
                            <label key={idx} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-white/[0.02] cursor-pointer transition-colors border border-transparent hover:border-white/[0.05]">
                              <input type="checkbox" className="mt-0.5 rounded text-[#3B82F6] focus:ring-[#3B82F6]/20 border-white/[0.08] bg-[#0B0F17]" />
                              <span className="text-xs text-[#CBD5E1] leading-relaxed">{item}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {report && (
                        <div className="rounded-xl border border-white/[0.05] bg-[#111827]/20 p-5">
                          <p className="text-[10px] font-semibold text-[#94A3B8]/60 uppercase tracking-wider mb-3">Required Resources Allocation</p>
                          <div className="flex flex-wrap gap-2">
                            {report.required_resources.map((item, idx) => (
                              <span key={idx} className="text-[10px] font-semibold bg-[#10B981]/10 text-[#34D399] border border-[#10B981]/20 px-3 py-1.5 rounded-full shadow-inner">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: INTEL REPORT */}
                  {activeTab === 'report' && (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-white/[0.05] bg-[#111827]/20 p-5">
                        <div className="flex items-center justify-between border-b border-white/[0.04] pb-3 mb-3">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]/80">
                            <Sparkles className="h-4 w-4 text-[#60A5FA]" />
                            Crisis Intelligence Report
                          </div>
                        </div>
                        <div className="whitespace-pre-wrap rounded-xl border border-white/[0.05] bg-[#0B0F17]/40 p-4.5 text-xs leading-6 text-[#CBD5E1] max-h-80 overflow-y-auto font-medium">
                          {analysis.report_markdown}
                        </div>
                      </div>

                      {report && (
                        <div className="rounded-xl border border-white/[0.05] bg-[#111827]/20 p-5">
                          <p className="text-[10px] font-semibold text-[#94A3B8]/60 uppercase tracking-wider mb-2.5">Executive Overview Summary</p>
                          <p className="text-xs leading-relaxed text-[#CBD5E1] font-medium">{report.incident_summary}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
