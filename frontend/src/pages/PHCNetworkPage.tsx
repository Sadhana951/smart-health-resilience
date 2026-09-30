import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PHC, RedistributionRecommendation } from '../types';
import { PHCNetworkMap } from '../maps/PHCNetworkMap';
import { GlassCard } from '../components/GlassCard';
import { RiskBadge } from '../components/RiskBadge';
import { Search, Filter, MapPin, Eye, Building2, Users, Bed, RefreshCw, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PHCNetworkPage: React.FC = () => {
  const [phcs, setPhcs] = useState<PHC[]>([]);
  const [redistributions, setRedistributions] = useState<RedistributionRecommendation[]>([]);
  const [selectedPHC, setSelectedPHC] = useState<PHC | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      const [phcList, recList] = await Promise.all([
        api.getPHCs(),
        api.getRedistributions()
      ]);
      setPhcs(phcList);
      setRedistributions(recList);
      if (phcList.length > 0) {
        setSelectedPHC(phcList[0]);
      }
    } catch (err) {
      console.error('Failed to load PHC network:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredPHCs = phcs.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.state.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesState = stateFilter === 'ALL' || p.state === stateFilter;
    const matchesRisk = riskFilter === 'ALL' || p.risk_level === riskFilter;
    return matchesSearch && matchesState && matchesRisk;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide font-mono flex items-center gap-2">
            PRIMARY HEALTH CENTRES
            <span className="text-cyan-400 font-sans font-semibold text-base">
              NETWORK MAP
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Geospatial surveillance across 35 facilities in 4 states. Click any marker for facility telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/30">
            {filteredPHCs.length} Active Nodes Visible
          </span>
          <button
            onClick={loadData}
            className="p-1.5 rounded-lg border border-slate-800 bg-background-card text-slate-400 hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <GlassCard className="p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="h-4 w-4 text-cyan-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search facility name, district, or block..."
            className="w-full bg-transparent text-white placeholder-slate-400 focus:outline-none font-mono"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* State filter */}
          <div className="flex items-center gap-1.5 font-mono">
            <span className="text-slate-400">State:</span>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2 py-1 focus:outline-none"
            >
              <option value="ALL">All States</option>
              <option value="Odisha">Odisha</option>
              <option value="West Bengal">West Bengal</option>
              <option value="Jharkhand">Jharkhand</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
            </select>
          </div>

          {/* Risk Filter */}
          <div className="flex items-center gap-1.5 font-mono">
            <span className="text-slate-400">Risk:</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2 py-1 focus:outline-none uppercase"
            >
              <option value="ALL">All Status</option>
              <option value="CRITICAL">Critical</option>
              <option value="WATCH">Watch</option>
              <option value="SAFE">Safe</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Map & Selected PHC Drawer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Map */}
        <div className="lg:col-span-8">
          <PHCNetworkMap
            phcs={filteredPHCs}
            redistributions={redistributions}
            selectedPHCId={selectedPHC?.id}
            onSelectPHC={(p) => setSelectedPHC(p)}
            height="620px"
          />
        </div>

        {/* Selected Facility Detail Card */}
        <div className="lg:col-span-4 space-y-4">
          {selectedPHC ? (
            <GlassCard glow={selectedPHC.risk_level === 'CRITICAL' ? 'red' : selectedPHC.risk_level === 'WATCH' ? 'amber' : 'green'} className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {selectedPHC.district}, {selectedPHC.state}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1.5 leading-snug">
                    {selectedPHC.name}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    ID: {selectedPHC.id} • Pop: {selectedPHC.population_served.toLocaleString()}
                  </span>
                </div>
                <RiskBadge level={selectedPHC.risk_level} size="sm" />
              </div>

              {/* Quick stats metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-background-deep border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">PREDICTED SHORTAGE</span>
                  <span className={`text-base font-bold ${selectedPHC.risk_level === 'CRITICAL' ? 'text-rose-400' : 'text-slate-200'}`}>
                    {selectedPHC.predicted_shortage_days ? `${selectedPHC.predicted_shortage_days} Days` : '>15 Days'}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-background-deep border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">BEDS OCCUPIED</span>
                  <span className="text-base font-bold text-white">
                    {selectedPHC.beds_occupied} / {selectedPHC.bed_capacity}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-background-deep border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">STAFF PRESENT</span>
                  <span className="text-base font-bold text-white">
                    {selectedPHC.staff_present} / {selectedPHC.staff_total}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-background-deep border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">CONTACT PHONE</span>
                  <span className="text-xs font-bold text-cyan-400 truncate block">
                    {selectedPHC.contact_phone}
                  </span>
                </div>
              </div>

              {/* Signals */}
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] uppercase font-mono text-cyan-400 font-bold block mb-0.5">
                    Weather Telemetry:
                  </span>
                  <p className="text-slate-300">{selectedPHC.weather_signal}</p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] uppercase font-mono text-amber-400 font-bold block mb-0.5">
                    Disease & Surveillance Signal:
                  </span>
                  <p className="text-slate-300">{selectedPHC.disease_signal}</p>
                </div>
              </div>

              <button
                onClick={() => navigate(`/phc/${selectedPHC.id}`)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-glow-cyan"
              >
                <span>Full Facility Intelligence</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </GlassCard>
          ) : (
            <GlassCard className="p-8 text-center text-slate-400 text-xs">
              Click a marker on the map to inspect facility parameters.
            </GlassCard>
          )}

          {/* Quick list of facilities in district */}
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 block">
              Nearby Monitored Centres ({filteredPHCs.slice(0, 4).length})
            </span>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredPHCs.slice(0, 5).map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPHC(p)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedPHC?.id === p.id
                      ? 'bg-cyan-500/15 border-cyan-500/50 shadow-glow-cyan/20'
                      : 'bg-background-panel border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white truncate max-w-[190px]">
                      {p.name}
                    </span>
                    <RiskBadge level={p.risk_level} size="sm" showIcon={false} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>{p.district}</span>
                    <span>Shortage: {p.predicted_shortage_days ? `${p.predicted_shortage_days}d` : '>15d'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
