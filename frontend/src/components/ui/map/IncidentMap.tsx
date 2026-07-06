import React, { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { IncidentRecord } from '@/features/incident-dashboard/types';

interface IncidentMapProps {
  incidents: IncidentRecord[];
  selectedIncident: IncidentRecord | null;
  onSelectIncident: (inc: IncidentRecord) => void;
  showHeatmap: boolean;
  viewportCenter?: [number, number] | null;
  viewportZoom?: number | null;
}

// Controller component to dynamically pan and zoom leaflet viewport when selected incident changes
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true, duration: 0.8 });
  }, [center, zoom, map]);
  return null;
};

// Helper to map location strings to [lat, lng] deterministically
function getCoordinatesForLocation(location: string): [number, number] {
  const norm = location.trim().toLowerCase();
  const presets: Record<string, [number, number]> = {
    london: [51.505, -0.09],
    tokyo: [35.6762, 139.6503],
    'new york': [40.7128, -74.006],
    nyc: [40.7128, -74.006],
    paris: [48.8566, 2.3522],
    'san francisco': [37.7749, -122.4194],
    sf: [37.7749, -122.4194],
    berlin: [52.52, 13.405],
    sydney: [-33.8688, 151.2093],
    mumbai: [19.076, 72.8777],
    delhi: [28.6139, 77.209],
    chicago: [41.8781, -87.6298],
    toronto: [43.6532, -79.3832],
    dubai: [25.2048, 55.2708],
    singapore: [1.3521, 103.8198],
    beijing: [39.9042, 116.4074],
    shanghai: [31.2304, 121.4737],
    moscow: [55.7558, 37.6173],
    downtown: [40.7128, -74.006],
  };

  for (const key of Object.keys(presets)) {
    if (norm.includes(key)) {
      return presets[key];
    }
  }

  // Deterministic hash-based scatter around London default
  let hash = 0;
  for (let i = 0; i < norm.length; i++) {
    hash = norm.charCodeAt(i) + ((hash << 5) - hash);
  }
  const latOffset = ((hash % 100) / 500) - 0.1;
  const lngOffset = (((hash >> 8) % 100) / 500) - 0.1;
  return [51.505 + latOffset, -0.09 + lngOffset];
}

// Severity color resolvers
function getMarkerColor(inc: IncidentRecord): string {
  if (inc.status === 'resolved') return '#10b981'; // emerald
  if (inc.risk_score >= 80) return '#ef4444'; // red
  if (inc.risk_score >= 60) return '#f59e0b'; // amber
  if (inc.status === 'reviewing') return '#3b82f6'; // blue
  return '#6366f1'; // indigo
}

function getMarkerGlow(inc: IncidentRecord): string {
  if (inc.status === 'resolved') return 'rgba(16,185,129,0.5)';
  if (inc.risk_score >= 80) return 'rgba(239,68,68,0.7)';
  if (inc.risk_score >= 60) return 'rgba(245,158,11,0.5)';
  return 'rgba(59,130,246,0.5)';
}

export const IncidentMap: React.FC<IncidentMapProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  showHeatmap,
  viewportCenter,
  viewportZoom,
}) => {
  const mapMarkers = useMemo(() => {
    return incidents.map((inc) => {
      const position = getCoordinatesForLocation(inc.location);
      const color = getMarkerColor(inc);
      const glow = getMarkerGlow(inc);
      const isSelected = selectedIncident?.id === inc.id;
      const size = isSelected ? 32 : 24;

      const icon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${size}px;
            height: ${size}px;
            pointer-events: all;
          ">
            ${isSelected ? `<span style="
              position: absolute;
              width: 100%;
              height: 100%;
              border-radius: 50%;
              background: ${color};
              opacity: 0.25;
              animation: ping 1s cubic-bezier(0,0,0.2,1) infinite;
            "></span>` : `<span style="
              position: absolute;
              width: 100%;
              height: 100%;
              border-radius: 50%;
              background: ${color};
              opacity: 0.4;
              animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
            "></span>`}
            <span style="
              position: relative;
              display: flex;
              border-radius: 50%;
              width: ${isSelected ? 14 : 10}px;
              height: ${isSelected ? 14 : 10}px;
              background: ${color};
              border: 2px solid #030712;
              box-shadow: 0 0 ${isSelected ? '14px 3px' : '8px 1px'} ${glow};
            "></span>
          </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      return { record: inc, position, icon, color };
    });
  }, [incidents, selectedIncident]);

  const mapCenter = useMemo<[number, number]>(() => {
    if (viewportCenter) return viewportCenter;
    if (selectedIncident) return getCoordinatesForLocation(selectedIncident.location);
    if (mapMarkers.length > 0) return mapMarkers[0].position;
    return [51.505, -0.09];
  }, [selectedIncident, mapMarkers, viewportCenter]);

  const mapZoom = useMemo<number>(() => {
    if (viewportZoom !== undefined && viewportZoom !== null) return viewportZoom;
    return selectedIncident ? 13 : 4;
  }, [selectedIncident, viewportZoom]);

  return (
    <MapContainer
      center={mapCenter}
      zoom={mapZoom}
      scrollWheelZoom={true}
      className="h-full w-full"
    >
      {/* Dark Map Tile Layer — Stadia Alidade Smooth Dark */}
      <TileLayer
        attribution='&copy; <a href="https://stamen.com">Stamen Design</a>, <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
      />

      {/* Pan control controller */}
      <MapController center={mapCenter} zoom={mapZoom} />

      {/* Heatmap Density Circles */}
      {showHeatmap && mapMarkers.map((m, i) => (
        <Circle
          key={`heat-${i}`}
          center={m.position}
          radius={m.record.risk_score >= 80 ? 8000 : 5000}
          pathOptions={{
            fillColor: m.record.risk_score >= 80 ? '#ef4444' : m.record.risk_score >= 60 ? '#f59e0b' : '#3b82f6',
            fillOpacity: m.record.risk_score >= 80 ? 0.2 : 0.12,
            stroke: true,
            color: m.record.risk_score >= 80 ? '#ef4444' : '#3b82f6',
            weight: 1,
            opacity: 0.3,
          }}
        />
      ))}

      {mapMarkers.map((m) => (
        <Marker
          key={m.record.id}
          position={m.position}
          icon={m.icon}
          eventHandlers={{
            click: () => onSelectIncident(m.record)
          }}
        >
          <Popup>
            <div style={{ fontFamily: 'system-ui, sans-serif', minWidth: '200px' }}>
              <div style={{ 
                borderBottom: '1px solid rgba(255,255,255,0.07)', 
                paddingBottom: '8px', 
                marginBottom: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '8px'
              }}>
                <span style={{ fontWeight: '700', fontSize: '12px', color: '#f1f5f9', lineHeight: 1.3 }}>
                  {m.record.title}
                </span>
                <span style={{ 
                  fontSize: '9px', 
                  background: 'rgba(255,255,255,0.04)', 
                  color: '#94a3b8', 
                  padding: '2px 6px', 
                  borderRadius: '4px', 
                  border: '1px solid rgba(255,255,255,0.06)',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}>
                  {m.record.category}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', display: 'grid', gap: '4px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span style={{ color: '#475569', fontWeight: '600' }}>Location:</span>
                  <span style={{ fontWeight: '600', color: '#cbd5e1' }}>{m.record.location}</span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span style={{ color: '#475569', fontWeight: '600' }}>Risk Score:</span>
                  <span style={{ 
                    fontWeight: '800', 
                    color: m.record.risk_score >= 80 ? '#f87171' : m.record.risk_score >= 60 ? '#fbbf24' : '#34d399'
                  }}>
                    {m.record.risk_score}/100
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span style={{ color: '#475569', fontWeight: '600' }}>Status:</span>
                  <span style={{ fontWeight: '700', color: '#e2e8f0', textTransform: 'capitalize' }}>{m.record.status}</span>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};
