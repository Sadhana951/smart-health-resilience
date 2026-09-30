import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { RedistributionRecommendation, PHC } from '../types';
import { GlassCard } from '../components/GlassCard';
import { PHCNetworkMap } from '../maps/PHCNetworkMap';
import { ActionBriefModal } from '../components/ActionBriefModal';
import {
  ArrowLeftRight,
  MapPin,
  Pill,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  Truck,
  ShieldCheck,
  RefreshCw,
  Navigation,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const RedistributionPage: React.FC = () => {
  const [recommendations, setRecommendations] = useState<RedistributionRecommendation[]>([]);
  const [phcs, setPhcs] = useState<PHC[]>([]);
  const [selectedRec, setSelectedRec] = useState<RedistributionRecommendation | null>(null);
  const [acceptedTimeline, setAcceptedTimeline] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);

  // Gemini action brief modal
  const [briefOpen, setBriefOpen] = useState(false);
  const [brief, setBrief] = useState<any>(null);
  const [briefLoading, setBriefLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recList, phcList] = await Promise.all([
        api.getRedistributions(),
        api.getPHCs()
      ]);
      setRecommendations(recList);
      setPhcs(phcList);
      if (recList.length > 0) {
        setSelectedRec(recList[0]);
      }
    } catch (err) {
      console.error('Failed to load redistribution data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAccept = async (recId: string) => {
    try {
      const res = await api.acceptRedistribution(recId);
      setAcceptedTimeline(res.timeline);

      // Trigger celebratory confetti effect
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00F2FE', '#10B981', '#38BDF8']
      });

      // Refresh list
      loadData();
    } catch (err) {
      console.error('Failed to accept transfer recommendation:', err);
    }
  };

  const handleReject = async (recId: string) => {
    try {
      await api.rejectRedistribution(recId);
      loadData();
    } catch (err) {
      console.error('Failed to reject transfer recommendation:', err);
    }
  };

  const handleOpenActionBrief = async (rec: RedistributionRecommendation) => {
    setBriefOpen(true);
    setBriefLoading(true);
    try {
      const res = await api.generateActionBrief(rec.to_phc_id, rec.medicine_id);
      setBrief(res);
    } catch (err) {
      console.error('Failed to generate action brief:', err);
    } finally {
      setBriefLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-wide font-mono flex items-center gap-2">
              INTER-FACILITY REDISTRIBUTION
              <span className="text-cyan-400 font-sans font-semibold text-base">
                MATCHING ENGINE
              </span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold uppercase tracking-wider">
              AUTO-MATCH ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Geospatial mutual-aid matching. Transfers excess reserves to vulnerable facilities before stock-out occurs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/30">
            {recommendations.filter(r => r.status === 'PENDING').length} Recommendations Queued
          </span>
          <button
            onClick={loadData}
            className="p-1.5 rounded-lg border border-slate-800 bg-background-card text-slate-400 hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Layout: Left Recommendations List + Right Active Route Visual */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Recommendations Cards */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>SHORTAGE FACILITY ➔ SURPLUS FACILITY</span>
            <span>RANKED BY DISTANCE</span>
          </div>

          <div className="space-y-4">
            {recommendations.map((rec) => {
              const isSelected = selectedRec?.id === rec.id;
              const isAccepted = rec.status === 'ACCEPTED';
              const isRejected = rec.status === 'REJECTED';

              return (
                <GlassCard
                  key={rec.id}
                  glow={isAccepted ? 'green' : (isSelected ? 'cyan' : 'none')}
                  onClick={() => setSelectedRec(rec)}
                  className={`p-5 space-y-4 cursor-pointer transition-all ${
                    isSelected ? 'border-cyan-500/60 shadow-glow-cyan' : ''
                  }`}
                >
                  {/* Status Banner */}
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                      ORDER #{rec.id.toUpperCase()}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        isAccepted
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-glow-green'
                          : isRejected
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {rec.status}
                    </span>
                  </div>

                  {/* Transfer Pipeline Nodes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                    {/* FROM: Donor */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">
                        FROM (SURPLUS BUFFER):
                      </span>
                      <div className="font-bold text-white leading-snug">
                        {rec.from_phc_name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Available Reserve: {rec.from_current_stock.toLocaleString()} units
                      </div>
                    </div>

                    {/* TO: Shortage */}
                    <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-3">
                      <span className="text-[10px] font-mono uppercase text-rose-400 font-bold block">
                        TO (SHORTAGE NODE):
                      </span>
                      <div className="font-bold text-white leading-snug">
                        {rec.to_phc_name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Depleted Buffer: {rec.to_current_stock.toLocaleString()} units
                      </div>
                    </div>
                  </div>

                  {/* Details strip */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-300 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Pill className="h-4 w-4 text-cyan-400" />
                      <span className="font-bold text-white">{rec.quantity.toLocaleString()} Units</span>
                      <span className="text-slate-400">({rec.medicine_name})</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">Distance: <strong className="text-white">{rec.distance_km} km</strong></span>
                      <span className="text-slate-400">ETA: <strong className="text-cyan-400">~{rec.eta_hours} hrs</strong></span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 italic font-sans">
                    Reason: "{rec.reason}"
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenActionBrief(rec);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 text-xs font-semibold transition-colors"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        AI Brief
                      </button>
                    </div>

                    {rec.status === 'PENDING' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReject(rec.id);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-rose-400 text-xs font-semibold uppercase tracking-wider transition-colors"
                        >
                          Reject
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAccept(rec.id);
                          }}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-glow-green"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Accept Recommendation
                        </button>
                      </div>
                    )}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>

        {/* Right Column: Route Map & Live Dispatch Timeline */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>TRANSIT CORRIDOR GEOSPATIAL PATH</span>
            <span>HIGHWAY ROUTE OPTIMIZATION</span>
          </div>

          <PHCNetworkMap
            phcs={phcs}
            redistributions={selectedRec ? [selectedRec] : recommendations}
            height="460px"
          />

          {/* Confirmation Timeline after Acceptance */}
          {acceptedTimeline && (
            <GlassCard glow="green" className="p-5 space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
                <Truck className="h-4 w-4" />
                Inter-Facility Dispatch Tracking Timeline
              </div>

              <div className="space-y-3 font-mono text-xs pt-1">
                {acceptedTimeline.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span
                      className={`h-4 w-4 rounded-full mt-0.5 flex items-center justify-center text-[10px] font-bold ${
                        step.status === 'COMPLETED'
                          ? 'bg-emerald-500 text-slate-950'
                          : (step.status === 'IN_PROGRESS' ? 'bg-cyan-400 text-slate-950 animate-pulse' : 'bg-slate-700 text-slate-400')
                      }`}
                    >
                      ✓
                    </span>
                    <div>
                      <div className="font-bold text-white">{step.step}</div>
                      <div className="text-slate-300 text-[11px]">{step.note}</div>
                      {step.timestamp && (
                        <div className="text-[10px] text-slate-500">
                          {new Date(step.timestamp).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      </div>

      {/* Action Brief Modal */}
      <ActionBriefModal
        brief={brief}
        isOpen={briefOpen}
        onClose={() => setBriefOpen(false)}
        isLoading={briefLoading}
      />
    </div>
  );
};
