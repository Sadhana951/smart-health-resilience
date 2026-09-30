import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { PHC, RedistributionRecommendation } from '../types';
import { GlassCard } from '../components/GlassCard';
import { RiskBadge } from '../components/RiskBadge';
import {
  Layers, MapPin, Eye, ExternalLink, Activity, Wind, Users, Bed,
  Globe, Compass, Settings, AlertTriangle, CheckCircle, RefreshCw, Key, ShieldAlert,
  Sparkles, Navigation
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Fix Leaflet standard marker image path resolution
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom glowing SVG marker icons for Leaflet
const createCustomIcon = (risk: 'SAFE' | 'WATCH' | 'CRITICAL') => {
  const color = risk === 'CRITICAL' ? '#EF4444' : (risk === 'WATCH' ? '#F59E0B' : '#10B981');
  const glow = risk === 'CRITICAL' ? 'rgba(239, 68, 68, 0.7)' : (risk === 'WATCH' ? 'rgba(245, 158, 11, 0.6)' : 'rgba(16, 185, 129, 0.5)');

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44">
      <defs>
        <filter id="glow-${risk}" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="${glow}" />
        </filter>
      </defs>
      <path d="M17 1C8.71 1 2 7.71 2 16c0 11.5 15 26 15 26s15-14.5 15-26c0-8.29-6.71-15-15-15z" fill="#0B172B" stroke="${color}" stroke-width="2.5" filter="url(#glow-${risk})" />
      <circle cx="17" cy="16" r="6.5" fill="${color}" />
      <circle cx="17" cy="16" r="3" fill="#FFFFFF" />
    </svg>
  `;

  return L.divIcon({
    html: svg,
    className: 'custom-leaflet-marker',
    iconSize: [34, 44],
    iconAnchor: [17, 44],
    popupAnchor: [0, -40]
  });
};

const leafletIcons = {
  SAFE: createCustomIcon('SAFE'),
  WATCH: createCustomIcon('WATCH'),
  CRITICAL: createCustomIcon('CRITICAL')
};

// Component to handle dynamic map invalidation to prevent gray tiles and size collapse in Leaflet
function LeafletResizeHandler({ selectedPHC }: { selectedPHC?: PHC }) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 500);

    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);

  useEffect(() => {
    if (selectedPHC) {
      map.flyTo([selectedPHC.lat, selectedPHC.lng], Math.max(map.getZoom(), 10), {
        duration: 1.2
      });
    }
  }, [selectedPHC, map]);

  return null;
}

interface PHCNetworkMapProps {
  phcs: PHC[];
  redistributions?: RedistributionRecommendation[];
  selectedPHCId?: string;
  onSelectPHC?: (phc: PHC) => void;
  height?: string;
}

export type MapEngine = 'ola-krutrim' | 'leaflet-tactical' | 'leaflet-carto' | 'vector';

export const PHCNetworkMap: React.FC<PHCNetworkMapProps> = ({
  phcs,
  redistributions = [],
  selectedPHCId,
  onSelectPHC,
  height = '620px'
}) => {
  const navigate = useNavigate();

  // Map Engine selection: default to 'ola-krutrim' if key available, else 'leaflet-tactical'
  const envOlaKey = (import.meta as any).env?.VITE_OLA_MAPS_API_KEY || (import.meta as any).env?.VITE_KRUTRIM_API_KEY || '';
  const [olaKey, setOlaKey] = useState<string>(() => {
    return localStorage.getItem('ola_maps_key') || envOlaKey || '';
  });

  const [engine, setEngine] = useState<MapEngine>(() => {
    const saved = localStorage.getItem('phc_map_engine');
    if (saved && (saved === 'ola-krutrim' || saved === 'leaflet-tactical' || saved === 'leaflet-carto' || saved === 'vector')) {
      return saved as MapEngine;
    }
    return 'leaflet-tactical';
  });

  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKeyInput, setTempKeyInput] = useState('');

  // Layer toggles
  const [layers, setLayers] = useState({
    phcNetwork: true,
    medicineRisk: true,
    weatherSignal: true,
    redistributionRoutes: true
  });

  const [filterRisk, setFilterRisk] = useState<string>('ALL');

  const selectedPHC = useMemo(() => {
    return phcs.find(p => p.id === selectedPHCId);
  }, [phcs, selectedPHCId]);

  const filteredPHCs = useMemo(() => {
    return phcs.filter(p => {
      if (filterRisk === 'ALL') return true;
      return p.risk_level === filterRisk;
    });
  }, [phcs, filterRisk]);

  const handleSelectEngine = (newEngine: MapEngine) => {
    setEngine(newEngine);
    localStorage.setItem('phc_map_engine', newEngine);
    if (newEngine === 'ola-krutrim' && !olaKey) {
      setShowKeyModal(true);
    }
  };

  const handleSaveOlaKey = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = tempKeyInput.trim();
    setOlaKey(cleanKey);
    localStorage.setItem('ola_maps_key', cleanKey);
    setShowKeyModal(false);
    setEngine('ola-krutrim');
  };

  const toggleLayer = (layerKey: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  return (
    <div
      style={{ height, minHeight: height }}
      className="relative isolate z-0 w-full rounded-2xl overflow-hidden border border-slate-800 bg-[#030712] shadow-glass flex flex-col"
    >
      {/* Top Floating Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Engine Switcher & Layer Filters */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          {/* Map Engine Selector */}
          <GlassCard className="p-1 flex items-center gap-1 text-xs font-mono bg-background-panel/90 backdrop-blur-md border-cyan-500/30">
            <span className="text-[10px] uppercase font-bold text-cyan-400 px-2 py-0.5 flex items-center gap-1">
              <Globe className="h-3 w-3" /> Map:
            </span>
            <button
              onClick={() => handleSelectEngine('ola-krutrim')}
              title="Official Ola Krutrim Indian Sovereign Vector Map"
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                engine === 'ola-krutrim'
                  ? 'bg-amber-400 text-black font-bold shadow-glow-amber'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🇮🇳 Ola Krutrim</span>
              {olaKey ? (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              )}
            </button>
            <button
              onClick={() => handleSelectEngine('leaflet-tactical')}
              title="Ultra-reliable Tactical Dark OSM tiles (Zero Key Required)"
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                engine === 'leaflet-tactical'
                  ? 'bg-cyan-500 text-black font-bold shadow-glow-cyan'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tactical Dark
            </button>
            <button
              onClick={() => handleSelectEngine('leaflet-carto')}
              title="CartoDB Dark Matter tile basemap"
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                engine === 'leaflet-carto'
                  ? 'bg-cyan-500 text-black font-bold shadow-glow-cyan'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Carto Dark
            </button>
            <button
              onClick={() => handleSelectEngine('vector')}
              title="100% Offline-Ready Vector Topology Map"
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                engine === 'vector'
                  ? 'bg-cyan-500 text-black font-bold shadow-glow-cyan'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Vector Radar
            </button>
          </GlassCard>

          {/* Layer toggles */}
          <GlassCard className="p-1 hidden md:flex items-center gap-1 text-xs font-mono bg-background-panel/90 backdrop-blur-md">
            <span className="text-[10px] text-slate-400 px-2 py-0.5 flex items-center gap-1">
              <Layers className="h-3 w-3 text-slate-400" /> Layers:
            </span>
            <button
              onClick={() => toggleLayer('medicineRisk')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                layers.medicineRisk ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-500 hover:text-white'
              }`}
            >
              Risk Heatmap
            </button>
            <button
              onClick={() => toggleLayer('redistributionRoutes')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                layers.redistributionRoutes ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-500 hover:text-white'
              }`}
            >
              Corridors
            </button>
            <button
              onClick={() => toggleLayer('weatherSignal')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                layers.weatherSignal ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-500 hover:text-white'
              }`}
            >
              Weather Signal
            </button>
          </GlassCard>
        </div>

        {/* Right: Risk Filter & Key Config */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Risk Level Filter */}
          <GlassCard className="p-1 flex items-center gap-1 text-xs font-mono bg-background-panel/90 backdrop-blur-md">
            {(['ALL', 'CRITICAL', 'WATCH', 'SAFE'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setFilterRisk(r)}
                className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                  filterRisk === r
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </GlassCard>

          {/* Ola Krutrim API Key Config Button */}
          <button
            onClick={() => {
              setTempKeyInput(olaKey);
              setShowKeyModal(true);
            }}
            title="Configure Ola Krutrim Maps API Key"
            className="p-1.5 rounded-xl border border-slate-700 bg-background-panel/90 hover:border-amber-400 text-slate-300 hover:text-amber-400 transition-colors backdrop-blur-md flex items-center gap-1.5 text-xs font-mono"
          >
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline text-[10px] font-bold text-amber-400">Krutrim Key</span>
          </button>
        </div>
      </div>

      {/* Floating Operational Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-background-panel/95 border border-slate-800 rounded-xl p-3 backdrop-blur-md text-xs font-mono text-slate-300 space-y-1.5 shadow-lg hidden sm:block pointer-events-none">
        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 flex items-center justify-between gap-4">
          <span>OPERATIONAL MAP LEGEND</span>
          <span className="text-[9px] text-amber-400 font-bold">
            {engine === 'ola-krutrim' ? '🇮🇳 Ola Krutrim Vector Map' : engine === 'leaflet-tactical' ? 'Tactical Dark Tile' : engine === 'vector' ? 'Vector Radar' : 'CartoDB Dark'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shadow-glow-red animate-pulse" />
          <span>Critical Shortage (&le; 5 Days)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-glow-amber" />
          <span>Surveillance Watch (&le; 10 Days)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-glow-green" />
          <span>Optimal Buffer (&gt; 10 Days)</span>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
          <span className="w-5 h-0.5 bg-cyan-400 border border-dashed" />
          <span>Active Transit Corridor ({redistributions.length} Routes)</span>
        </div>
      </div>

      {/* MAP VIEW CONTAINER */}
      <div style={{ height: '100%', minHeight: height, width: '100%' }} className="relative flex-1">
        {/* ============================================================== */}
        {/* ENGINE 1: OLA KRUTRIM MAPS (MapLibre GL Vector Engine) */}
        {/* ============================================================== */}
        {engine === 'ola-krutrim' && (
          olaKey ? (
            <OlaKrutrimMapView
              olaKey={olaKey}
              phcs={filteredPHCs}
              redistributions={redistributions}
              selectedPHC={selectedPHC}
              onSelectPHC={onSelectPHC}
              navigate={navigate}
              layers={layers}
              onFallbackToTactical={() => setEngine('leaflet-tactical')}
            />
          ) : (
            /* Prompt for Ola Krutrim API Key or Instant Fallback */
            <div className="h-full w-full flex flex-col items-center justify-center bg-slate-950 p-6 text-center">
              <div className="max-w-md p-6 rounded-2xl bg-background-panel border border-amber-500/40 shadow-2xl space-y-4">
                <div className="h-12 w-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/50">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Ola Krutrim Maps</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  India's sovereign mapping and geospatial platform developed by Krutrim / Ola. Enter your Krutrim Cloud or Ola Maps API Key to render official vector tiles and navigation routes.
                </p>

                <div className="flex flex-col gap-2.5 pt-2">
                  <button
                    onClick={() => {
                      setTempKeyInput('');
                      setShowKeyModal(true);
                    }}
                    className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-glow-amber flex items-center justify-center gap-1.5"
                  >
                    <Key className="h-4 w-4" /> Enter Ola Krutrim API Key
                  </button>
                  <button
                    onClick={() => handleSelectEngine('leaflet-tactical')}
                    className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-all"
                  >
                    Use Tactical Dark Map (Zero Key Required)
                  </button>
                </div>
              </div>
            </div>
          )
        )}

        {/* ============================================================== */}
        {/* ENGINE 2 & 3: LEAFLET (Tactical Dark OSM or CartoDB Dark) */}
        {/* ============================================================== */}
        {(engine === 'leaflet-tactical' || engine === 'leaflet-carto') && (
          <MapContainer
            center={[20.35, 85.82]}
            zoom={8}
            scrollWheelZoom={true}
            style={{ height: '100%', minHeight: height, width: '100%', background: '#030712' }}
          >
            <LeafletResizeHandler selectedPHC={selectedPHC} />

            {/* Tile Layer with explicit subdomains and resilient fallback */}
            {engine === 'leaflet-tactical' ? (
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | India Health Resilience Grid'
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                className="dark-osm-tiles"
                maxZoom={19}
              />
            ) : (
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                subdomains={['a', 'b', 'c', 'd']}
                maxZoom={19}
              />
            )}

            {/* Weather / Surveillance Risk Heatmap Circles */}
            {layers.weatherSignal &&
              filteredPHCs
                .filter(p => p.weather_signal.includes('Rain') || p.weather_signal.includes('Flood') || p.weather_signal.includes('Alert'))
                .map(p => (
                  <Circle
                    key={`weather-circle-${p.id}`}
                    center={[p.lat, p.lng]}
                    radius={28000}
                    pathOptions={{
                      color: '#38BDF8',
                      fillColor: '#0284C7',
                      fillOpacity: 0.15,
                      weight: 1,
                      dashArray: '4, 4'
                    }}
                  />
                ))}

            {/* Redistribution Route Polylines */}
            {layers.redistributionRoutes &&
              redistributions.map(rec => (
                <Polyline
                  key={`route-${rec.id}`}
                  positions={rec.route_coordinates}
                  pathOptions={{
                    color: rec.status === 'ACCEPTED' ? '#10B981' : '#00F2FE',
                    weight: 3,
                    opacity: 0.85,
                    dashArray: '8, 8'
                  }}
                />
              ))}

            {/* PHC Markers */}
            {layers.phcNetwork &&
              filteredPHCs.map(phc => (
                <Marker
                  key={phc.id}
                  position={[phc.lat, phc.lng]}
                  icon={leafletIcons[phc.risk_level] || leafletIcons.SAFE}
                  eventHandlers={{
                    click: () => {
                      if (onSelectPHC) onSelectPHC(phc);
                    }
                  }}
                >
                  <Popup className="custom-leaflet-popup">
                    <PHCPopupContent phc={phc} navigate={navigate} />
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        )}

        {/* ============================================================== */}
        {/* ENGINE 4: 100% OFFLINE-READY VECTOR RADAR COMMAND MAP */}
        {/* ============================================================== */}
        {engine === 'vector' && (
          <VectorRadarCommandMap
            phcs={filteredPHCs}
            redistributions={redistributions}
            selectedPHC={selectedPHC}
            onSelectPHC={onSelectPHC}
            navigate={navigate}
          />
        )}
      </div>

      {/* OLA KRUTRIM KEY CONFIG MODAL */}
      {showKeyModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full p-6 rounded-2xl bg-background-panel border border-amber-500/50 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-lg">🇮🇳</span>
                <h3 className="font-bold text-white text-sm uppercase tracking-wider font-mono">Ola Krutrim Maps Key</h3>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Enter your Krutrim Cloud / Ola Maps API Key to enable sovereign Indian vector map tiles, routing, and dark cartography.
            </p>

            <form onSubmit={handleSaveOlaKey} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  OLA MAPS API KEY (STORED LOCALLY IN BROWSER)
                </label>
                <input
                  type="text"
                  value={tempKeyInput}
                  onChange={(e) => setTempKeyInput(e.target.value)}
                  placeholder="ola_map_..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="text-[11px] text-slate-400 bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>Krutrim Cloud Access:</span>
                </div>
                <div>Get your API key at <a href="https://cloud.olakrutrim.com" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline font-semibold">cloud.olakrutrim.com</a> or <a href="https://maps.olakrutrim.com" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline font-semibold">maps.olakrutrim.com</a>.</div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-black rounded-lg text-xs font-bold transition-all shadow-glow-amber"
                >
                  Save & Connect Ola Krutrim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// =========================================================================
// OLA KRUTRIM MAPS VECTOR VIEW (Powered by MapLibre GL JS)
// =========================================================================
interface OlaKrutrimMapViewProps {
  olaKey: string;
  phcs: PHC[];
  redistributions: RedistributionRecommendation[];
  selectedPHC?: PHC;
  onSelectPHC?: (phc: PHC) => void;
  navigate: (path: string) => void;
  layers: {
    phcNetwork: boolean;
    medicineRisk: boolean;
    weatherSignal: boolean;
    redistributionRoutes: boolean;
  };
  onFallbackToTactical: () => void;
}

function OlaKrutrimMapView({
  olaKey,
  phcs,
  redistributions,
  selectedPHC,
  onSelectPHC,
  navigate,
  layers,
  onFallbackToTactical
}: OlaKrutrimMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Ola Maps Dark Style endpoint
    const styleUrl = `https://api.olamaps.io/tiles/vector/v1/styles/default-dark/style.json?api_key=${olaKey}`;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: styleUrl,
      center: [85.82, 20.35], // [lng, lat]
      zoom: 7.8,
      transformRequest: (url: string) => {
        if (url.includes('api.olamaps.io')) {
          const sep = url.includes('?') ? '&' : '?';
          return {
            url: `${url}${sep}api_key=${olaKey}`
          };
        }
        return { url };
      }
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');

    map.on('error', (e: any) => {
      // Catch authentication errors or tile failure
      if (e.error && (e.error.message?.includes('401') || e.error.message?.includes('403') || e.error.message?.includes('Forbidden'))) {
        setAuthError('Ola Maps API Key Authentication failed (401/403). Please verify your Krutrim key.');
      }
    });

    map.on('load', () => {
      setAuthError(null);
      // Invalidate size once loaded
      map.resize();
    });

    mapRef.current = map;

    return () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [olaKey]);

  // Handle selectedPHC flyTo
  useEffect(() => {
    if (mapRef.current && selectedPHC) {
      mapRef.current.flyTo({
        center: [selectedPHC.lng, selectedPHC.lat],
        zoom: 11,
        essential: true,
        duration: 1200
      });
    }
  }, [selectedPHC]);

  // Update PHC Markers on map
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear previous markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (!layers.phcNetwork) return;

    phcs.forEach(phc => {
      const el = document.createElement('div');
      el.className = 'custom-leaflet-marker';
      const color = phc.risk_level === 'CRITICAL' ? '#EF4444' : phc.risk_level === 'WATCH' ? '#F59E0B' : '#10B981';
      const glow = phc.risk_level === 'CRITICAL' ? 'rgba(239, 68, 68, 0.7)' : phc.risk_level === 'WATCH' ? 'rgba(245, 158, 11, 0.6)' : 'rgba(16, 185, 129, 0.5)';

      el.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44" style="cursor: pointer; filter: drop-shadow(0 0 6px ${glow});">
          <path d="M17 1C8.71 1 2 7.71 2 16c0 11.5 15 26 15 26s15-14.5 15-26c0-8.29-6.71-15-15-15z" fill="#0B172B" stroke="${color}" stroke-width="2.5" />
          <circle cx="17" cy="16" r="6.5" fill="${color}" />
          <circle cx="17" cy="16" r="3" fill="#FFFFFF" />
        </svg>
      `;

      const popupNode = document.createElement('div');
      popupNode.className = 'p-3 bg-[#0b172b] text-white rounded-xl border border-slate-700 min-w-[240px] font-sans';
      popupNode.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-size:10px; font-family:monospace; text-transform:uppercase; padding:2px 6px; background:#1e293b; border-radius:4px; color:#cbd5e1; border:1px solid #334155;">
            ${phc.district}, ${phc.state}
          </span>
          <span style="font-size:10px; font-weight:bold; color:${color};">
            ${phc.risk_level}
          </span>
        </div>
        <h4 style="font-size:14px; font-weight:bold; color:#ffffff; margin:0 0 4px 0;">${phc.name}</h4>
        <p style="font-size:12px; color:#94a3b8; margin:0 0 8px 0;">Pop. ${phc.population_served.toLocaleString()}</p>
        <div style="font-family:monospace; font-size:11px; border-top:1px solid #1e293b; border-bottom:1px solid #1e293b; padding:6px 0; margin-bottom:8px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span style="color:#94a3b8;">Predicted Stockout:</span>
            <span style="color:${phc.risk_level === 'CRITICAL' ? '#f87171' : '#e2e8f0'}; font-weight:bold;">
              ${phc.predicted_shortage_days ? `${phc.predicted_shortage_days} Days` : 'Stable (>15d)'}
            </span>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span style="color:#94a3b8;">Beds:</span>
            <span style="color:#e2e8f0;">${phc.beds_occupied} / ${phc.bed_capacity}</span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="color:#94a3b8;">Weather:</span>
            <span style="color:#38bdf8;">${phc.weather_signal}</span>
          </div>
        </div>
        <button id="ola-btn-${phc.id}" style="width:100%; padding:6px 10px; background:#0891b2; color:#fff; border-radius:6px; border:none; font-size:11px; font-weight:bold; cursor:pointer; text-transform:uppercase; letter-spacing:0.5px;">
          View Facility Details
        </button>
      `;

      const popup = new maplibregl.Popup({ offset: 25, className: 'custom-maplibre-popup' })
        .setDOMContent(popupNode);

      popup.on('open', () => {
        const btn = document.getElementById(`ola-btn-${phc.id}`);
        if (btn) {
          btn.onclick = () => navigate(`/phc/${phc.id}`);
        }
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([phc.lng, phc.lat])
        .setPopup(popup)
        .addTo(map);

      el.onclick = () => {
        if (onSelectPHC) onSelectPHC(phc);
      };

      markersRef.current.push(marker);
    });
  }, [phcs, layers.phcNetwork, onSelectPHC, navigate]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full bg-[#030712]" />

      {/* Auth error banner with 1-click fallback */}
      {authError && (
        <div className="absolute top-16 left-4 right-4 z-30 p-3 rounded-xl bg-rose-950/90 border border-rose-500/50 backdrop-blur-md text-white text-xs flex items-center justify-between gap-3 shadow-2xl">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{authError}</span>
          </div>
          <button
            onClick={onFallbackToTactical}
            className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 rounded text-white font-bold text-[11px] shrink-0"
          >
            Switch to Tactical Dark Map
          </button>
        </div>
      )}
    </div>
  );
}

// Reusable Popup Content for Leaflet
function PHCPopupContent({ phc, navigate }: { phc: PHC; navigate: (path: string) => void }) {
  return (
    <div className="p-3 bg-background-panel text-white rounded-xl border border-slate-700 min-w-[240px] font-sans">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
          {phc.district}, {phc.state}
        </span>
        <RiskBadge level={phc.risk_level} size="sm" showIcon={false} />
      </div>

      <h4 className="text-sm font-bold text-white mb-1">{phc.name}</h4>
      <p className="text-xs text-slate-400 mb-2">
        Population Served: {phc.population_served.toLocaleString()}
      </p>

      <div className="space-y-1 py-2 border-y border-slate-800 text-xs font-mono">
        <div className="flex justify-between">
          <span className="text-slate-400">Predicted Shortage:</span>
          <span className={phc.risk_level === 'CRITICAL' ? 'text-rose-400 font-bold' : 'text-slate-200'}>
            {phc.predicted_shortage_days ? `${phc.predicted_shortage_days} Days` : 'Stable (>15d)'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Beds Occupied:</span>
          <span className="text-slate-200">{phc.beds_occupied} / {phc.bed_capacity}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Staff On Duty:</span>
          <span className="text-slate-200">{phc.staff_present} / {phc.staff_total}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Weather Signal:</span>
          <span className="text-cyan-300 text-[11px] truncate max-w-[120px]">{phc.weather_signal}</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          onClick={() => navigate(`/phc/${phc.id}`)}
          className="w-full flex items-center justify-center gap-1 py-1.5 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
        >
          <Eye className="h-3 w-3" />
          View Facility Details
        </button>
      </div>
    </div>
  );
}

// =========================================================================
// VECTOR RADAR COMMAND MAP (100% OFFLINE, ZERO EXTERNAL NETWORK DEPENDENCY)
// =========================================================================
interface VectorRadarProps {
  phcs: PHC[];
  redistributions: RedistributionRecommendation[];
  selectedPHC?: PHC;
  onSelectPHC?: (phc: PHC) => void;
  navigate: (path: string) => void;
}

function VectorRadarCommandMap({ phcs, redistributions, selectedPHC, onSelectPHC, navigate }: VectorRadarProps) {
  const [hoveredPHC, setHoveredPHC] = useState<PHC | null>(null);

  // Geographic bounds for Eastern India Healthcare Grid
  // Odisha, WB, Jharkhand, North Andhra Pradesh
  const minLat = 17.5;
  const maxLat = 24.5;
  const minLng = 81.0;
  const maxLng = 88.5;

  const width = 1000;
  const height = 620;

  // Project (lat, lng) to SVG (x, y)
  const project = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * width;
    const y = (1 - (lat - minLat) / (maxLat - minLat)) * height;
    return { x, y };
  };

  const hubCoords = project(20.2961, 85.8245); // State Center (Bhubaneswar)

  return (
    <div className="relative w-full h-full bg-[#030712] overflow-hidden select-none">
      {/* SVG Canvas Map */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full cursor-crosshair"
      >
        <defs>
          {/* Radial radar grid background */}
          <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.15" />
            <stop offset="60%" stopColor="#082f49" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#030712" stopOpacity="0" />
          </radialGradient>

          <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeOpacity="0.4" />
          </pattern>
        </defs>

        {/* Background Grid */}
        <rect width={width} height={height} fill="#030712" />
        <rect width={width} height={height} fill="url(#grid-pattern)" />
        <circle cx={hubCoords.x} cy={hubCoords.y} r={280} fill="url(#radar-glow)" />

        {/* Radar Range Rings */}
        {[80, 160, 240, 320].map((radius, i) => (
          <circle
            key={i}
            cx={hubCoords.x}
            cy={hubCoords.y}
            r={radius}
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="0.8"
            strokeDasharray="4 6"
            strokeOpacity="0.3"
          />
        ))}

        {/* Coastline / Corridor boundary aesthetic guides */}
        <path
          d={`M ${project(18.0, 84.0).x} ${project(18.0, 84.0).y} 
              Q ${project(19.8, 86.0).x} ${project(19.8, 86.0).y} 
                ${project(21.5, 87.2).x} ${project(21.5, 87.2).y}
              T ${project(22.5, 88.3).x} ${project(22.5, 88.3).y}`}
          fill="none"
          stroke="#00f2fe"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          strokeOpacity="0.4"
        />
        <text
          x={project(19.2, 85.8).x + 10}
          y={project(19.2, 85.8).y + 10}
          fill="#38bdf8"
          fontSize="10"
          fontFamily="monospace"
          opacity="0.5"
        >
          BAY OF BENGAL MARITIME CORRIDOR
        </text>

        {/* State Label Landmarks */}
        <text x="350" y="320" fill="#64748b" fontSize="14" fontWeight="bold" fontFamily="monospace" opacity="0.35">
          ODISHA HEALTH GRID
        </text>
        <text x="580" y="160" fill="#64748b" fontSize="13" fontWeight="bold" fontFamily="monospace" opacity="0.3">
          WEST BENGAL CORRIDOR
        </text>
        <text x="240" y="140" fill="#64748b" fontSize="13" fontWeight="bold" fontFamily="monospace" opacity="0.3">
          JHARKHAND BUFFER
        </text>
        <text x="180" y="480" fill="#64748b" fontSize="13" fontWeight="bold" fontFamily="monospace" opacity="0.3">
          ANDHRA PRADESH INTER-CONNECT
        </text>

        {/* Transit Corridors Polylines */}
        {redistributions.map((rec) => {
          if (!rec.route_coordinates || rec.route_coordinates.length < 2) return null;
          const points = rec.route_coordinates.map(c => {
            const pt = project(c[0], c[1]);
            return `${pt.x},${pt.y}`;
          }).join(' ');

          const isAccepted = rec.status === 'ACCEPTED';
          return (
            <g key={rec.id}>
              <polyline
                points={points}
                fill="none"
                stroke={isAccepted ? '#10b981' : '#00f2fe'}
                strokeWidth={isAccepted ? 2.5 : 1.8}
                strokeDasharray="6 4"
                strokeOpacity="0.8"
              />
            </g>
          );
        })}

        {/* PHC Nodes */}
        {phcs.map((phc) => {
          const pt = project(phc.lat, phc.lng);
          const isCritical = phc.risk_level === 'CRITICAL';
          const isWatch = phc.risk_level === 'WATCH';
          const color = isCritical ? '#ef4444' : isWatch ? '#f59e0b' : '#10b981';
          const isSelected = selectedPHC?.id === phc.id;

          return (
            <g
              key={phc.id}
              className="cursor-pointer"
              onClick={() => {
                if (onSelectPHC) onSelectPHC(phc);
                setHoveredPHC(phc);
              }}
              onMouseEnter={() => setHoveredPHC(phc)}
            >
              {/* Pulsing ring for Critical */}
              {isCritical && (
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="14"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  opacity="0.6"
                  className="animate-ping"
                />
              )}

              {/* Selection Ring */}
              {isSelected && (
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="18"
                  fill="none"
                  stroke="#00f2fe"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                />
              )}

              {/* Node Circle */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isCritical ? 7 : 5.5}
                fill="#0b172b"
                stroke={color}
                strokeWidth="2.5"
              />
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isCritical ? 3.5 : 2.5}
                fill={color}
              />

              {/* Node Short Label */}
              <text
                x={pt.x + 8}
                y={pt.y + 3}
                fill="#e2e8f0"
                fontSize="9"
                fontFamily="monospace"
                fontWeight="500"
                className="pointer-events-none drop-shadow"
              >
                {phc.name.replace('PHC ', '').slice(0, 12)}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Selected PHC Inspector Panel */}
      {hoveredPHC && (
        <div className="absolute top-16 right-4 z-20 w-72 p-4 rounded-xl bg-background-panel/95 border border-slate-700 shadow-2xl backdrop-blur-md animate-fadeIn">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {hoveredPHC.district}, {hoveredPHC.state}
            </span>
            <button
              onClick={() => setHoveredPHC(null)}
              className="text-slate-400 hover:text-white text-xs font-mono"
            >
              ✕
            </button>
          </div>

          <h4 className="text-sm font-bold text-white mb-1">{hoveredPHC.name}</h4>
          <p className="text-xs text-slate-400 mb-2">
            Pop. {hoveredPHC.population_served.toLocaleString()} &bull; Capacity: {hoveredPHC.bed_capacity} Beds
          </p>

          <div className="space-y-1.5 py-2 border-y border-slate-800 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Risk Assessment:</span>
              <RiskBadge level={hoveredPHC.risk_level} size="sm" showIcon={false} />
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Stockout Runway:</span>
              <span className={hoveredPHC.risk_level === 'CRITICAL' ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                {hoveredPHC.predicted_shortage_days ? `${hoveredPHC.predicted_shortage_days} Days` : 'Stable (>15d)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Bed Capacity:</span>
              <span className="text-slate-200">{hoveredPHC.beds_occupied} / {hoveredPHC.bed_capacity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Weather Signal:</span>
              <span className="text-cyan-300 text-[11px] truncate max-w-[130px]">{hoveredPHC.weather_signal}</span>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => navigate(`/phc/${hoveredPHC.id}`)}
              className="w-full py-1.5 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
            >
              <Eye className="h-3.5 w-3.5" />
              Open Detail Dossier
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
