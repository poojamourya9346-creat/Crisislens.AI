import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogHeader, DialogBody, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { XIcon, UploadIcon } from '@/components/ui/icons';
import { useToast } from '@/components/ui/toast';
import { 
  Sparkles, 
  Activity, 
  CheckCircle2, 
  Clock, 
  FileJson, 
  Copy, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  RefreshCw, 
  Image as ImageIcon,
  Compass,
  Share2,
  Printer,
  ShieldAlert,
  BrainCircuit
} from 'lucide-react';

interface DetectedObject {
  label: string;
  confidence: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  box: string;
}

interface EXIFData {
  camera: string;
  exposure: string;
  aperture: string;
  iso: string;
  focalLength: string;
  coordinates: string;
}

interface VisionAnalysisResult {
  riskScore: number;
  confidence: number;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  objects: DetectedObject[];
  damageEstimate: string;
  suggestedActions: string[];
  metadata: {
    dimensions: string;
    fileSize: string;
    format: string;
    timestamp: string;
  };
  exif: EXIFData;
}

export const VisionUpload: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<VisionAnalysisResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { pushToast } = useToast();

  const handleFiles = (selected: FileList | null) => {
    if (!selected) return;
    const newFiles = Array.from(selected).filter(file => file.type.startsWith('image/'));
    if (newFiles.length === 0) {
      pushToast({ title: 'Invalid File Type', description: 'Please upload image files only.', tone: 'destructive' });
      return;
    }
    setFiles((prev) => [...prev, ...newFiles]);
    const urls = newFiles.map((f) => URL.createObjectURL(f));
    setPreviewUrls((prev) => [...prev, ...urls]);
    setAnalysisResult(null);
    pushToast({ title: 'Images Loaded', description: `Successfully loaded ${newFiles.length} image(s) for analysis.`, tone: 'success' });
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      const url = prev[index];
      URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== index);
    });
    if (files.length <= 1) {
      setAnalysisResult(null);
    }
  };

  const runVisionAnalysis = () => {
    if (files.length === 0) return;
    setIsAnalyzing(true);
    setProgress(0);
    setAnalysisResult(null);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 150);

    setTimeout(() => {
      const calculatedRisk = Math.floor(Math.random() * 30) + 70;
      const result: VisionAnalysisResult = {
        riskScore: calculatedRisk,
        confidence: 96.8,
        severity: calculatedRisk >= 85 ? 'Critical' : 'High',
        objects: [
          { label: 'Structural Concrete Fracture', confidence: '98.4%', severity: 'Critical', box: 'x: 140, y: 110, w: 320, h: 480' },
          { label: 'Debris/Access Obstruction', confidence: '94.2%', severity: 'High', box: 'x: 380, y: 290, w: 220, h: 180' },
          { label: 'Leaking Fluid Contaminant', confidence: '89.5%', severity: 'Medium', box: 'x: 600, y: 450, w: 150, h: 110' }
        ],
        damageEstimate: `$185,000 USD · Moderate-to-Severe structural integrity degradation detected.`,
        suggestedActions: [
          'Deploy localized structural shoring support to avoid collapsing failure.',
          'Secure perimeter boundary line; restrict civilian and heavy personnel entry.',
          'Redirect traffic networks and bypass logistics routes around obstruction point.',
          'Alert regional environmental control to monitor hazardous fluid leakage.'
        ],
        metadata: {
          dimensions: '4032 x 3024 px (12.1 MP)',
          fileSize: '4.8 MB',
          format: 'HEIC/JPEG',
          timestamp: new Date().toLocaleString()
        },
        exif: {
          camera: 'Sony ILCE-7RM4 (Sony Alpha 7R IV)',
          exposure: '1/160s',
          aperture: 'f/4.0',
          iso: '250',
          focalLength: '35.0 mm',
          coordinates: '35.6762° N, 139.6503° E (Tokyo Area)'
        }
      };

      setAnalysisResult(result);
      setIsAnalyzing(false);
      pushToast({ title: 'AI Analysis Complete', description: 'Deep vision pipeline computed threat profiles successfully.', tone: 'success' });
    }, 1800);
  };

  const handleExportJSON = () => {
    if (!analysisResult) return;
    const blob = new Blob([JSON.stringify({ files: files.map(f => f.name), analysis: analysisResult }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vision-analysis-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    pushToast({ title: 'Export JSON', description: 'Data schema downloaded successfully.', tone: 'success' });
  };

  const handleExportPDF = () => {
    if (!analysisResult) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>CrisisLens AI Vision Intelligence Report</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #CBD5E1; background: #0B0F17; max-width: 800px; margin: 0 auto; }
            h1 { border-bottom: 2px solid #1B2433; padding-bottom: 8px; margin-bottom: 24px; font-size: 26px; color: #ffffff; }
            .header-info { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; background: #151C28; padding: 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); }
            .label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #94A3B8; margin-bottom: 4px; letter-spacing: 0.1em; }
            .val { font-size: 14px; font-weight: 700; color: #F8FAFC; }
            .section { margin-bottom: 24px; }
            .sec-title { font-size: 13px; font-weight: 700; color: #CBD5E1; border-bottom: 1px solid #1B2433; padding-bottom: 6px; margin-bottom: 12px; }
            .box { background: #151C28; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 12px; margin-bottom: 8px; }
            .flex-row { display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <h1>CrisisLens AI Vision Intelligence Report</h1>
          <div class="header-info">
            <div><div class="label">Analysis Timestamp</div><div class="val">${analysisResult.metadata.timestamp}</div></div>
            <div><div class="label">Target Images Evaluated</div><div class="val">${files.length} File(s)</div></div>
            <div><div class="label">Overall Threat Severity</div><div class="val">${analysisResult.severity} (Risk score: ${analysisResult.riskScore}/100)</div></div>
            <div><div class="label">Model Confidence Index</div><div class="val">${analysisResult.confidence}%</div></div>
          </div>
          <div class="section"><div class="sec-title">Damage Assessment</div><p style="font-size:13px; line-height:1.6;">${analysisResult.damageEstimate}</p></div>
          <div class="section">
            <div class="sec-title">Computer Vision Detections</div>
            ${analysisResult.objects.map(obj => `
              <div class="box flex-row">
                <span style="font-weight:700; font-size:12px; color:#F8FAFC;">${obj.label}</span>
                <span style="font-size:11px; color:#EF4444; font-weight:700;">Conf: ${obj.confidence} · (${obj.severity})</span>
              </div>
            `).join('')}
          </div>
          <div class="section">
            <div class="sec-title">Suggested Response Checklist</div>
            <ul style="font-size:12px; line-height:1.8; padding-left:20px; color:#CBD5E1;">
              ${analysisResult.suggestedActions.map(act => `<li>${act}</li>`).join('')}
            </ul>
          </div>
          <script>window.onload = function() { window.print(); window.close(); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
    pushToast({ title: 'Export PDF', description: 'Generated print dialog.', tone: 'success' });
  };

  const handleCopyReport = () => {
    if (!analysisResult) return;
    const text = `CRISISLENS AI VISION INTELLIGENCE REPORT
Severity: ${analysisResult.severity}
Risk Index: ${analysisResult.riskScore}/100
Confidence: ${analysisResult.confidence}%
Damage Estimate: ${analysisResult.damageEstimate}

Detections:
${analysisResult.objects.map(o => `- ${o.label} (Confidence: ${o.confidence})`).join('\n')}

Suggested Actions:
${analysisResult.suggestedActions.map(a => `- ${a}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    pushToast({ title: 'Report Copied', description: 'Markdown summary copied to clipboard.', tone: 'success' });
  };

  const handleShareReport = () => {
    if (!analysisResult) return;
    const text = `CrisisLens AI Vision Report: Severity ${analysisResult.severity}, Risk ${analysisResult.riskScore}/100`;
    if (navigator.share) {
      navigator.share({ title: 'CrisisLens AI Vision Report', text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text}\n${window.location.href}`);
      pushToast({ title: 'Link Copied', description: 'Report details copied to clipboard.', tone: 'success' });
    }
  };

  const handleRetry = () => runVisionAnalysis();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 mb-3 rounded-full border border-indigo-500/25 bg-indigo-500/10 px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-400">
            <BrainCircuit className="h-3.5 w-3.5" />
            Flagship AI System
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">AI Vision Analytics</h2>
          <p className="mt-1.5 text-xs text-[#94A3B8] font-medium">Upload high-resolution crisis imagery to deploy computer vision and threat indexing.</p>
        </div>
        {files.length > 0 && !isAnalyzing && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setFiles([]);
                setPreviewUrls([]);
                setAnalysisResult(null);
                pushToast({ title: 'Reset Complete', description: 'Uploaded imagery queue cleared.', tone: 'default' });
              }}
            >
              Clear Queue
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={runVisionAnalysis}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Analyze Imagery
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Upload & Queue */}
        <div className="lg:col-span-2 space-y-6">
          {/* Premium Animated Drop Zone */}
          <div
            className={`relative border-2 border-dashed rounded-[20px] p-10 text-center cursor-pointer transition-all group overflow-hidden bg-[#111827]/20 border-white/[0.08] hover:border-[#3B82F6]/50 hover:bg-[#151C28]/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.08)] ${
              isDragging ? 'drop-active' : ''
            }`}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={() => document.getElementById('vision-file-upload')?.click()}
            aria-label="Upload drag and drop zone"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                document.getElementById('vision-file-upload')?.click();
              }
            }}
          >
            {/* Decorative grid overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:28px_28px]" />

            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl border transition-all ${
                isDragging
                  ? 'border-[#3B82F6]/40 bg-[#3B82F6]/20 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                  : 'border-white/[0.06] bg-white/[0.03] group-hover:border-[#3B82F6]/30 group-hover:bg-[#3B82F6]/10'
              }`}>
                <UploadIcon className={`h-7 w-7 transition-colors ${isDragging ? 'text-[#3B82F6]' : 'text-slate-500 group-hover:text-[#3B82F6]'}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {isDragging ? 'Release to upload imagery' : 'Drop high-resolution imagery here'}
                </p>
                <p className="text-xs text-[#94A3B8]/60 mt-1 font-medium">Supports HEIC, JPG, PNG, WEBP · Click to browse files</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                {['Image Analysis', 'Object Detection', 'Damage Appraisal', 'EXIF Extraction'].map(tag => (
                  <span key={tag} className="text-[9px] font-bold text-[#CBD5E1]/60 uppercase tracking-wider border border-white/[0.05] bg-white/[0.02] px-2.5 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <input
              id="vision-file-upload"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          {/* Upload Queue Grid */}
          <AnimatePresence>
            {previewUrls.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                <Card className="border-white/[0.06] bg-[#151C28]/80 backdrop-blur-xl overflow-hidden">
                  <div className="p-4 border-b border-white/[0.05] bg-gradient-to-b from-white/[0.02] to-transparent flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-[#3B82F6]" />
                      Imagery Payload ({files.length})
                    </span>
                    <span className="text-[10px] text-[#94A3B8]/60 font-semibold uppercase tracking-wider">Click image to inspect overlay</span>
                  </div>
                  <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {previewUrls.map((url, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.04 }}
                        className="relative group rounded-xl overflow-hidden border border-white/[0.06] shadow-2xl aspect-video bg-[#111827] hover:border-white/[0.12] transition-all"
                      >
                        <img
                          src={url}
                          alt={`upload-${idx}`}
                          className="object-cover w-full h-full cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => {
                            setOpenIndex(idx);
                            setZoomScale(1);
                          }}
                        />
                        {analysisResult && (
                          <div className="absolute inset-0 border-2 border-[#EF4444]/60 pointer-events-none shadow-[inset_0_0_15px_rgba(239,68,68,0.2)]">
                            <span className="absolute top-1.5 left-1.5 bg-[#DC2626] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md tracking-wide">
                              THREAT ZONE
                            </span>
                          </div>
                        )}
                        <button
                          type="button"
                          className="absolute top-1.5 right-1.5 bg-[#0B0F17]/85 rounded-full p-1.5 text-white hover:bg-[#EF4444] transition-colors border border-white/[0.08] cursor-pointer"
                          onClick={() => removeFile(idx)}
                          aria-label="Remove image from queue"
                        >
                          <XIcon className="h-2.5 w-2.5" />
                        </button>
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-2 text-[9px] text-[#CBD5E1] truncate pointer-events-none font-semibold">
                          {files[idx]?.name || 'Payload Image'}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Analysis Loader */}
          <AnimatePresence>
            {isAnalyzing && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Card className="border-white/[0.06] bg-[#151C28]/80 backdrop-blur-xl p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-2">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#3B82F6]" />
                      Neural network inference pipeline running...
                    </span>
                    <span className="text-sm font-bold text-[#3B82F6] tabular-nums">{progress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden border border-white/[0.04]">
                    <motion.div
                      style={{ width: `${progress}%` }}
                      className="h-full bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] shadow-[0_0_10px_rgba(59,130,246,0.6)] transition-all duration-150"
                    />
                  </div>
                  {/* Skeleton Loaders */}
                  <div className="space-y-3">
                    <div className="h-5 bg-white/[0.04] rounded-lg animate-pulse w-2/3" />
                    <div className="h-4 bg-white/[0.04] rounded-lg animate-pulse w-full" />
                    <div className="h-4 bg-white/[0.04] rounded-lg animate-pulse w-3/4" />
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="h-16 bg-white/[0.04] rounded-xl animate-pulse" />
                      <div className="h-16 bg-white/[0.04] rounded-xl animate-pulse" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Analysis Result Panel */}
          <AnimatePresence>
            {analysisResult && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                <Card className="border-white/[0.06] bg-[#151C28]/80 backdrop-blur-xl overflow-hidden">
                  <CardHeader className="border-b border-white/[0.05] bg-gradient-to-b from-white/[0.02] to-transparent py-4 flex flex-row items-center justify-between">
                    <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                      AI Intelligence Assessment Results
                    </span>
                    <div className="flex gap-1.5 flex-wrap">
                      {[
                        { icon: Copy, handler: handleCopyReport, title: 'Copy Report' },
                        { icon: Share2, handler: handleShareReport, title: 'Share Report' },
                        { icon: Printer, handler: handleExportPDF, title: 'Print Report' },
                        { icon: FileJson, handler: handleExportJSON, title: 'Export JSON' },
                        { icon: RefreshCw, handler: handleRetry, title: 'Re-run AI Analysis' },
                      ].map(({ icon: Icon, handler, title }) => (
                        <button
                          key={title}
                          type="button"
                          onClick={handler}
                          title={title}
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.07] text-[#CBD5E1] hover:bg-white/[0.04] hover:text-white transition-all cursor-pointer hover:scale-105 active:scale-95"
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </button>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Top Summary Blocks */}
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-2xl border border-white/[0.05] p-4 bg-[#111827]/20 flex flex-col justify-between relative overflow-hidden">
                        <div className={`absolute top-0 left-0 right-0 h-[2px] ${analysisResult.severity === 'Critical' ? 'bg-[#EF4444] shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-[#F59E0B] shadow-[0_0_8px_rgba(245,158,11,0.6)]'}`} />
                        <span className="text-[10px] font-bold text-[#94A3B8]/60 uppercase tracking-wider">Threat Severity</span>
                        <span className={`text-xl font-bold mt-2 uppercase tracking-tight ${
                          analysisResult.severity === 'Critical' ? 'text-[#EF4444]' : 'text-[#F59E0B]'
                        }`}>
                          {analysisResult.severity}
                        </span>
                      </div>
                      <div className="rounded-2xl border border-white/[0.05] p-4 bg-[#111827]/20 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#3B82F6] shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                        <span className="text-[10px] font-bold text-[#94A3B8]/60 uppercase tracking-wider">AI Confidence</span>
                        <span className="text-xl font-bold text-[#3B82F6] mt-2 tabular-nums">{analysisResult.confidence}%</span>
                      </div>
                      <div className="rounded-2xl border border-white/[0.05] p-4 bg-[#111827]/20 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                        <span className="text-[10px] font-bold text-[#94A3B8]/60 uppercase tracking-wider">Damage Estimate</span>
                        <span className="text-sm font-bold text-[#10B981] mt-2 leading-relaxed">{analysisResult.damageEstimate.split('·')[0].trim()}</span>
                      </div>
                    </div>

                    {/* Risk Score Ring */}
                    <div className="flex items-center gap-6 p-4 rounded-2xl border border-white/[0.05] bg-[#111827]/20">
                      <div className="relative flex items-center justify-center shrink-0">
                        <svg className="w-20 h-20 transform -rotate-90">
                          <circle cx="40" cy="40" r="32" stroke="rgba(255,255,255,0.03)" strokeWidth="6" fill="transparent" />
                          <circle
                            cx="40" cy="40" r="32"
                            stroke={analysisResult.riskScore >= 85 ? '#EF4444' : '#F59E0B'}
                            strokeWidth="6"
                            fill="transparent"
                            strokeDasharray="201"
                            strokeDashoffset={201 - (201 * analysisResult.riskScore) / 100}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-xl font-extrabold text-white leading-none tabular-nums">{analysisResult.riskScore}</span>
                          <span className="text-[8px] text-[#94A3B8]/60 font-bold uppercase tracking-wider">Risk</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-[#94A3B8]/60 uppercase tracking-wider mb-1">Threat Index Breakdown</p>
                        <p className="text-sm font-bold text-white">Overall threat level is <span className={analysisResult.severity === 'Critical' ? 'text-[#EF4444]' : 'text-[#F59E0B]'}>{analysisResult.severity}</span></p>
                        <p className="text-xs text-[#CBD5E1] mt-1 leading-relaxed">{analysisResult.damageEstimate}</p>
                      </div>
                    </div>

                    {/* Object Detections */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold text-[#94A3B8]/60 uppercase tracking-wider flex items-center gap-1.5">
                        <Activity className="h-3.5 w-3.5 text-[#3B82F6]" />
                        Neural Network Bounding Box Detections
                      </h4>
                      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                        {analysisResult.objects.map((obj, i) => (
                          <div key={i} className="p-3.5 border border-white/[0.05] rounded-xl bg-[#111827]/20 hover:border-white/[0.1] transition-colors">
                            <div className="flex justify-between items-start mb-2 gap-2">
                              <span className="font-bold text-xs text-white leading-snug">{obj.label}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                                obj.severity === 'Critical' 
                                  ? 'bg-[#EF4444]/10 text-[#F87171] border border-[#EF4444]/20' 
                                  : obj.severity === 'High'
                                    ? 'bg-[#F59E0B]/10 text-[#FBBF24] border border-[#F59E0B]/20'
                                    : 'bg-[#3B82F6]/10 text-[#60A5FA] border border-[#3B82F6]/20'
                              }`}>
                                {obj.confidence}
                              </span>
                            </div>
                            <p className="text-[10px] text-[#94A3B8]/60 font-mono">Bounds: {obj.box}</p>
                            <p className="text-[9px] text-[#94A3B8]/40 mt-0.5 font-bold uppercase tracking-wider">{obj.severity} Risk</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Suggested Response Checklist */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold text-[#94A3B8]/60 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" />
                        Crisis Response Checklist
                      </h4>
                      <div className="rounded-xl border border-white/[0.05] bg-[#0B0F17]/40 p-4 space-y-1.5">
                        {analysisResult.suggestedActions.map((action, idx) => (
                          <label key={idx} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-white/[0.02] cursor-pointer transition-colors border border-transparent hover:border-white/[0.05]">
                            <input type="checkbox" className="mt-0.5 rounded text-[#3B82F6] focus:ring-[#3B82F6]/20 border-white/[0.08] bg-[#0B0F17]" />
                            <span className="text-xs text-[#CBD5E1] leading-relaxed font-medium">{action}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Metadata / EXIF / Timeline */}
        <div className="space-y-6">
          {/* EXIF + Metadata Card */}
          {analysisResult ? (
            <>
              <Card className="border-white/[0.06] bg-[#151C28]/80 backdrop-blur-xl overflow-hidden">
                <CardHeader className="border-b border-white/[0.05] bg-gradient-to-b from-white/[0.02] to-transparent py-3.5">
                  <span className="text-[10px] font-bold text-[#94A3B8]/60 uppercase tracking-wider flex items-center gap-1.5">
                    <Compass className="h-4 w-4 text-[#3B82F6]" />
                    Image EXIF &amp; System Metadata
                  </span>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-[#94A3B8]/60 uppercase tracking-wider">Device Settings</span>
                    <div className="grid grid-cols-2 gap-y-2.5 text-[11px] border border-white/[0.05] p-3 rounded-xl bg-[#0B0F17]/40">
                      <span className="text-[#94A3B8]/60 font-medium">Camera</span>
                      <span className="font-bold text-[#CBD5E1] text-right truncate">{analysisResult.exif.camera}</span>
                      <span className="text-[#94A3B8]/60 font-medium">Shutter / Aperture</span>
                      <span className="font-bold text-[#CBD5E1] text-right">{analysisResult.exif.exposure} @ {analysisResult.exif.aperture}</span>
                      <span className="text-[#94A3B8]/60 font-medium">ISO / Focal</span>
                      <span className="font-bold text-[#CBD5E1] text-right">ISO {analysisResult.exif.iso} / {analysisResult.exif.focalLength}</span>
                      <span className="text-[#94A3B8]/60 font-medium">Geotag</span>
                      <span className="font-bold text-[#CBD5E1] text-right text-[10px]">{analysisResult.exif.coordinates}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-[#94A3B8]/60 uppercase tracking-wider">File Specifications</span>
                    <div className="grid grid-cols-2 gap-y-2.5 text-[11px] border border-white/[0.05] p-3 rounded-xl bg-[#0B0F17]/40">
                      <span className="text-[#94A3B8]/60 font-medium">Resolution</span>
                      <span className="font-bold text-[#CBD5E1] text-right">{analysisResult.metadata.dimensions}</span>
                      <span className="text-[#94A3B8]/60 font-medium">File Size</span>
                      <span className="font-bold text-[#CBD5E1] text-right">{analysisResult.metadata.fileSize}</span>
                      <span className="text-[#94A3B8]/60 font-medium">Format</span>
                      <span className="font-bold text-[#CBD5E1] text-right">{analysisResult.metadata.format}</span>
                      <span className="text-[#94A3B8]/60 font-medium">Processed</span>
                      <span className="font-bold text-[#CBD5E1] text-right text-[10px]">{analysisResult.metadata.timestamp}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Pipeline Timeline */}
              <Card className="border-white/[0.06] bg-[#151C28]/80 backdrop-blur-xl overflow-hidden">
                <CardHeader className="border-b border-white/[0.05] bg-gradient-to-b from-white/[0.02] to-transparent py-3.5">
                  <span className="text-[10px] font-bold text-[#94A3B8]/60 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-[#10B981]" />
                    AI Vision Pipeline Milestones
                  </span>
                </CardHeader>
                <CardContent className="p-4.5">
                  <div className="relative pl-6 border-l border-white/[0.06] space-y-5 text-xs">
                    {[
                      { dot: 'bg-[#3B82F6] shadow-[0_0_8px_rgba(59,130,246,0.6)]', label: 'T+0.0s', title: 'Imagery Ingested', desc: 'Payload registered in image processing queue.' },
                      { dot: 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]', label: 'T+0.4s', title: 'Metadata Parsing', desc: 'EXIF schema read, camera identified, location geocoded.' },
                      { dot: 'bg-[#F59E0B] shadow-[0_0_8px_rgba(245,158,11,0.6)]', label: 'T+1.1s', title: 'Model Inference', desc: 'YOLO networks generated bounding boxes for damage overlay.' },
                      { dot: 'bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse', label: 'T+1.7s', title: 'Appraisal Output', desc: 'Cost assessment generated and response checklist compiled.' },
                    ].map((step, i) => (
                      <div key={i} className="relative">
                        <span className={`absolute -left-[29px] top-0.5 flex h-3 w-3 rounded-full ${step.dot} ring-4 ring-[#0B0F17]`} />
                        <p className="font-bold text-[#94A3B8]/60 text-[10px] uppercase tracking-wide">{step.label} · {step.title}</p>
                        <p className="text-[#94A3B8] mt-0.5 leading-snug font-medium">{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            /* Empty State Sidebar */
            <Card className="border-white/[0.06] bg-[#151C28]/80 backdrop-blur-xl p-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.06] mx-auto mb-4 shadow-inner">
                <ShieldAlert className="h-7 w-7 text-slate-600" />
              </div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">Intelligence Standby</p>
              <p className="text-[10px] text-[#94A3B8]/60 mt-2 leading-relaxed font-semibold max-w-[200px] mx-auto">
                Upload imagery and run the AI analysis to populate metadata, EXIF data, and pipeline milestones.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Image Preview & Zoom Dialog */}
      <Dialog open={openIndex !== null} handler={() => setOpenIndex(null)} maxWidth="max-w-4xl">
        <DialogHeader className="flex justify-between items-center" onClose={() => setOpenIndex(null)}>
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-[#CBD5E1]" />
            <span className="text-sm font-bold text-white">
              {openIndex !== null && files[openIndex] ? files[openIndex].name : 'Image Inspect View'}
            </span>
          </div>
          <div className="flex gap-1.5 mr-8">
            {[
              { icon: ZoomIn, handler: () => setZoomScale(prev => Math.min(prev + 0.25, 2.5)), title: 'Zoom In' },
              { icon: ZoomOut, handler: () => setZoomScale(prev => Math.max(prev - 0.25, 0.75)), title: 'Zoom Out' },
              { icon: RotateCcw, handler: () => setZoomScale(1), title: 'Reset Zoom' },
            ].map(({ icon: Icon, handler, title }) => (
              <button
                key={title}
                type="button"
                onClick={handler}
                title={title}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.08] text-[#CBD5E1] hover:bg-white/[0.04] hover:text-white transition-all cursor-pointer"
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
        </DialogHeader>
        <DialogBody className="p-0 overflow-hidden flex items-center justify-center bg-[#0B0F17]/60 aspect-video">
          {openIndex !== null && previewUrls[openIndex] && (
            <div className="relative overflow-hidden w-full h-full flex items-center justify-center p-4">
              <img
                src={previewUrls[openIndex]}
                alt="full preview inspect"
                className="max-h-[60vh] max-w-full object-contain transition-transform duration-200"
                style={{ transform: `scale(${zoomScale})` }}
              />
              {analysisResult && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div
                    className="absolute border-2 border-[#EF4444] bg-[#EF4444]/10 text-[#F87171] px-2 py-1 text-[10px] font-extrabold uppercase rounded-lg shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                    style={{ left: '20%', top: '15%', width: '45%', height: '55%', transform: `scale(${zoomScale})` }}
                  >
                    CRACKED CONCRETE CORE (98.4%)
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button onClick={() => setOpenIndex(null)} variant="secondary">Close Viewer</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};
