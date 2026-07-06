import React, { useState, useMemo } from 'react';
import { IncidentMap } from '@/components/ui/map/IncidentMap';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { IncidentRecord } from '@/features/incident-dashboard/types';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { 
  ShieldAlert, 
  Layers, 
  Filter, 
  MapPin, 
  Activity, 
  Sparkles,
  RefreshCw,
  Compass,
  Maximize2,
  Minimize2,
  Search
} from 'lucide-react';

export const MapPage: React.FC = () => {
  const [incidents] = useLocalStorage<IncidentRecord[]>('crisislens.incidents', []);
  const [selectedIncident, setSelectedIncident] = useState<IncidentRecord | null>(null);
  
  // Filtering states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Geolocation & Viewport states
  const [viewportCenter, setViewportCenter] = useState<[number, number] | null>(null);
  const [viewportZoom, setViewportZoom] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const { pushToast } = useToast();

  // Filter incidents list
  const filteredIncidents = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return incidents.filter((inc) => {
      const matchesStatus = statusFilter === 'all' || inc.status === statusFilter;
      
      let severityClass = 'low';
      if (inc.risk_score >= 80) severityClass = 'critical';
      else if (inc.risk_score >= 60) severityClass = 'high';
      else if (inc.risk_score >= 40) severityClass = 'medium';

      const matchesSeverity = severityFilter === 'all' || severityClass === severityFilter;
      
      const matchesSearch = search === '' || 
        inc.title.toLowerCase().includes(search) || 
        inc.location.toLowerCase().includes(search) ||
        inc.category.toLowerCase().includes(search);

      return matchesStatus && matchesSeverity && matchesSearch;
    });
  }, [incidents, statusFilter, severityFilter, searchTerm]);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      pushToast({ title: 'Geolocation unsupported', description: 'Your browser does not support GPS.', tone: 'destructive' });
      return;
    }
    pushToast({ title: 'Requesting coordinates', description: 'Acquiring GPS location lock…', tone: 'default' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setViewportCenter([pos.coords.latitude, pos.coords.longitude]);
        setViewportZoom(13);
        pushToast({ title: 'Location acquired', description: 'Centered map viewport on GPS position.', tone: 'success' });
      },
      (err) => {
        pushToast({ title: 'GPS lock failed', description: err.message, tone: 'destructive' });
      }
    );
  };

  const handleResetMap = () => {
    setStatusFilter('all');
    setSeverityFilter('all');
    setSearchTerm('');
    setSelectedIncident(null);
    setViewportCenter(null);
    setViewportZoom(null);
    pushToast({ title: 'Map reset', description: 'Cleared telemetry filters and reset viewport center.', tone: 'default' });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">GIS Incident Mapping</h2>
          <p className="mt-1 text-xs text-[#94A3B8] font-medium">Real-time geographical telemetry visualizer with threat intelligence overlays.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-[#CBD5E1] bg-[#111827]/40 px-3.5 py-2.5 rounded-xl border border-white/[0.06] cursor-pointer hover:bg-white/[0.04] hover:border-white/[0.1] transition-all">
            <input 
              type="checkbox" 
              checked={showHeatmap} 
              onChange={(e) => setShowHeatmap(e.target.checked)}
              className="rounded text-[#3B82F6] focus:ring-[#3B82F6]/20 border-white/[0.08] bg-[#0B0F17]"
            />
            <Layers className="h-3.5 w-3.5 text-[#3B82F6]" />
            Heatmap Density
          </label>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={handleResetMap}
            className="gap-1.5 h-9"
          >
            <RefreshCw className="h-3.5 w-3.5 text-[#CBD5E1]" />
            Reset Map
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar Filters & Incident list */}
        <div className="space-y-6">
          {/* Legend and Filters */}
          <Card className="border-white/[0.06] bg-[#151C28]/80 backdrop-blur-xl shadow-2xl">
            <CardHeader className="bg-gradient-to-b from-white/[0.02] to-transparent border-b border-white/[0.05] py-3.5 flex flex-row items-center gap-1.5">
              <Filter className="h-4 w-4 text-[#3B82F6]" />
              <CardTitle className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider">Operational Filters</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              {/* Status filter selection */}
              <div className="space-y-1.5">
                <label className="font-semibold text-[#94A3B8]/60 text-[10px] uppercase tracking-wider">Intake Status</label>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full h-9 rounded-xl border border-white/[0.07] bg-[#111827]/80 px-3.5 py-1 text-[#CBD5E1] focus:border-[#3B82F6]/50 focus:ring-[3px] focus:ring-[#3B82F6]/10 outline-none cursor-pointer"
                >
                  <option value="all" className="bg-[#151C28] text-[#CBD5E1]">All Statuses</option>
                  <option value="submitted" className="bg-[#151C28] text-[#CBD5E1]">Submitted</option>
                  <option value="reviewing" className="bg-[#151C28] text-[#CBD5E1]">Reviewing</option>
                  <option value="resolved" className="bg-[#151C28] text-[#CBD5E1]">Resolved</option>
                </select>
              </div>

              {/* Severity filter selection */}
              <div className="space-y-1.5">
                <label className="font-semibold text-[#94A3B8]/60 text-[10px] uppercase tracking-wider">Threat Threshold</label>
                <select 
                  value={severityFilter} 
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="w-full h-9 rounded-xl border border-white/[0.07] bg-[#111827]/80 px-3.5 py-1 text-[#CBD5E1] focus:border-[#3B82F6]/50 focus:ring-[3px] focus:ring-[#3B82F6]/10 outline-none cursor-pointer"
                >
                  <option value="all" className="bg-[#151C28] text-[#CBD5E1]">All Severities</option>
                  <option value="critical" className="bg-[#151C28] text-[#CBD5E1]">Critical Risk (&gt;=80)</option>
                  <option value="high" className="bg-[#151C28] text-[#CBD5E1]">High Risk (60-79)</option>
                  <option value="medium" className="bg-[#151C28] text-[#CBD5E1]">Medium Risk (40-59)</option>
                  <option value="low" className="bg-[#151C28] text-[#CBD5E1]">Low Risk (&lt;40)</option>
                </select>
              </div>

              {/* Color Code Legend */}
              <div className="pt-3 border-t border-white/[0.05] space-y-2">
                <span className="font-semibold text-[#94A3B8]/60 text-[10px] uppercase tracking-wider">Map Indicators Legend</span>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-[#94A3B8]">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444] shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                    <span>Critical Alert</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#3B82F6] shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                    <span>Reviewing</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B] shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                    <span>Warning</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                    <span>Resolved</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Incidents List Panel */}
          <Card className="border-white/[0.06] bg-[#151C28]/80 backdrop-blur-xl shadow-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-b from-white/[0.02] to-transparent border-b border-white/[0.05] py-3.5 flex flex-row items-center justify-between">
              <CardTitle className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-[#3B82F6]" />
                Detections Queue
              </CardTitle>
              <Badge tone="info">{filteredIncidents.length}</Badge>
            </CardHeader>
            <CardContent className="p-3 border-b border-white/[0.05] bg-[#111827]/10">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94A3B8]/60" />
                <input
                  type="text"
                  placeholder="Search incidents…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 text-xs rounded-xl border border-white/[0.07] bg-[#111827]/80 text-[#F8FAFC] placeholder:text-[#94A3B8]/60 focus:outline-none focus:border-[#3B82F6]/50 focus:ring-2 focus:ring-[#3B82F6]/10 transition-all font-semibold"
                  aria-label="Search incidents in sidebar"
                />
              </div>
            </CardContent>
            <CardContent className="p-2 max-h-64 overflow-y-auto space-y-1">
              {filteredIncidents.length === 0 ? (
                <p className="text-xs text-[#94A3B8]/60 text-center py-6 font-semibold">No matching telemetry points.</p>
              ) : (
                filteredIncidents.map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => {
                      setSelectedIncident(inc);
                      setViewportCenter(null);
                      setViewportZoom(null);
                    }}
                    className={`p-2.5 border rounded-xl cursor-pointer transition text-xs flex justify-between items-center ${
                      selectedIncident?.id === inc.id 
                        ? 'border-[#3B82F6]/40 bg-[#3B82F6]/10 shadow-[0_2px_12px_rgba(59,130,246,0.1)]' 
                        : 'border-transparent hover:bg-white/[0.02] hover:border-white/[0.05]'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <p className="font-bold text-[#F8FAFC] truncate">{inc.title}</p>
                      <p className="text-[10px] text-[#94A3B8]/60 truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 inline text-[#94A3B8]/40" />
                        {inc.location}
                      </p>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                      inc.risk_score >= 80 ? 'bg-[#EF4444]/10 text-[#F87171] border border-[#EF4444]/20' : 'bg-[#1B2433] text-[#94A3B8] border border-white/[0.05]'
                    }`}>
                      {inc.risk_score}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Leaflet Map Main Viewport */}
        <div className={`lg:col-span-2 border border-white/[0.06] rounded-[20px] overflow-hidden shadow-2xl relative bg-[#0B0F17] transition-all ${
          isFullscreen 
            ? 'fixed inset-4 z-[999] h-[92vh] w-[96vw] lg:col-span-4' 
            : 'h-[65vh]'
        }`}>
          {/* Overlay Map Controls (Locate Me, Fullscreen) */}
          <div className="absolute top-3 right-3 z-[400] flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setIsFullscreen(p => !p)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#111827]/90 border border-white/[0.08] text-[#CBD5E1] shadow-md hover:bg-[#1B2433] hover:text-white transition-all cursor-pointer hover:scale-105 active:scale-95"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
              aria-label="Toggle map fullscreen"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={handleLocateMe}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#111827]/90 border border-white/[0.08] text-[#CBD5E1] shadow-md hover:bg-[#1B2433] hover:text-white transition-all cursor-pointer hover:scale-105 active:scale-95"
              title="Locate Me"
              aria-label="GPS locate user"
            >
              <Compass className="h-4 w-4 animate-spin-slow" />
            </button>
          </div>

          <IncidentMap 
            incidents={filteredIncidents} 
            selectedIncident={selectedIncident}
            onSelectIncident={setSelectedIncident}
            showHeatmap={showHeatmap}
            viewportCenter={viewportCenter}
            viewportZoom={viewportZoom}
          />
        </div>

        {/* Selected Incident Details Panel */}
        <div className="space-y-6">
          {selectedIncident ? (
            <Card className="border-white/[0.06] bg-[#151C28]/80 backdrop-blur-xl shadow-2xl h-[65vh] flex flex-col overflow-hidden">
              <CardHeader className="bg-gradient-to-b from-white/[0.02] to-transparent border-b border-white/[0.05] py-3 flex flex-row items-center justify-between">
                <CardTitle className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-[#EF4444]" />
                  Telemetry Inspector
                </CardTitle>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedIncident(null)}
                  className="h-7 text-[10px] px-2.5 py-0.5 font-semibold"
                >
                  Close
                </Button>
              </CardHeader>
              <CardContent className="p-4 overflow-y-auto flex-1 space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-[#F8FAFC] text-sm leading-snug">{selectedIncident.title}</h4>
                  <p className="text-[#94A3B8] mt-1 flex items-center gap-1 font-semibold">
                    <MapPin className="h-3 w-3 text-[#94A3B8]/60" />
                    {selectedIncident.location}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 border border-white/[0.05] rounded-xl bg-[#111827]/20 shadow-inner">
                    <span className="font-semibold text-[#94A3B8]/60 text-[9px] uppercase tracking-wider">Threat Index</span>
                    <p className="font-bold text-[#EF4444] text-sm mt-1">{selectedIncident.risk_score}/100</p>
                  </div>
                  <div className="p-3 border border-white/[0.05] rounded-xl bg-[#111827]/20 shadow-inner">
                    <span className="font-semibold text-[#94A3B8]/60 text-[9px] uppercase tracking-wider">Operational Status</span>
                    <p className="font-bold text-[#F8FAFC] text-sm mt-1 capitalize">{selectedIncident.status}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="font-semibold text-[#94A3B8]/60 text-[9px] uppercase tracking-wider">Classification Details</span>
                  <div className="p-3 border border-white/[0.05] rounded-xl bg-[#0B0F17]/40 space-y-1 font-medium text-[#CBD5E1]">
                    <p className="flex justify-between"><span className="text-[#94A3B8]/60">Incident Class:</span> <span className="font-semibold text-white">{selectedIncident.incident_type}</span></p>
                    <p className="flex justify-between"><span className="text-[#94A3B8]/60">Category Tag:</span> <span className="font-semibold text-white uppercase">{selectedIncident.category}</span></p>
                    <p className="flex justify-between"><span className="text-[#94A3B8]/60">Log Timestamp:</span> <span className="font-semibold text-white text-[10px]">{new Date(selectedIncident.created_at).toLocaleString()}</span></p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="font-semibold text-[#94A3B8]/60 text-[9px] uppercase tracking-wider">Incident Narrative</span>
                  <p className="p-3 border border-white/[0.05] rounded-xl bg-[#0B0F17]/40 text-[#CBD5E1] leading-normal max-h-24 overflow-y-auto font-medium">
                    {selectedIncident.description}
                  </p>
                </div>

                {selectedIncident.report_available && (
                  <div className="space-y-1.5">
                    <span className="font-semibold text-[#94A3B8]/60 text-[9px] uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-[#60A5FA] animate-pulse" />
                      AI Response Advisory
                    </span>
                    <div className="p-3 border border-white/[0.05] rounded-xl bg-[#0B0F17]/30 text-[#CBD5E1] leading-normal whitespace-pre-wrap max-h-36 overflow-y-auto font-medium">
                      {selectedIncident.report_markdown}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-white/[0.06] bg-[#151C28]/80 backdrop-blur-xl p-8 text-center shadow-2xl h-[65vh] flex flex-col justify-center items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.06] mb-3 shadow-inner">
                <MapPin className="h-6 w-6 text-[#94A3B8]/40" />
              </div>
              <p className="text-xs font-semibold text-white uppercase tracking-wider">Inspect Coordinate</p>
              <p className="text-[10px] text-[#94A3B8]/60 mt-2 max-w-[200px] mx-auto leading-relaxed font-semibold">Select an incident marker on the map or from the detections queue sidebar to analyze detailed operational profiles.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
