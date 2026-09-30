import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useLanguage } from '../contexts/LanguageContext';
import { DashboardMetrics, PHC, RedistributionRecommendation, ActionBrief } from '../types';
import { MetricCard } from '../components/MetricCard';
import { GlassCard } from '../components/GlassCard';
import { PHCNetworkMap } from '../maps/PHCNetworkMap';
import { ActionBriefModal } from '../components/ActionBriefModal';
import { SimulationBanner } from '../components/SimulationBanner';
import {
  Activity,
  ShieldAlert,
  Pill,
  Bed,
  Users,
  Eye,
  ArrowRight,
  Sparkles,
  ArrowLeftRight,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Zap,
  Play
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { t } = useLanguage();
  const { refreshTrigger } = useWebSocket();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [criticalActions, setCriticalActions] = useState<any[]>([]);
  const [simulationState, setSimulationState] = useState<any>(null);
  const [phcs, setPhcs] = useState<PHC[]>([]);
  const [redistributions, setRedistributions] = useState<RedistributionRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  // Action Brief Modal state
  const [briefModalOpen, setBriefModalOpen] = useState(false);
  const [briefData, setBriefData] = useState<ActionBrief | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashRes, phcList, recList] = await Promise.all([
        api.getDashboardMetrics(),
        api.getPHCs(),
        api.getRedistributions()
      ]);

      setMetrics(dashRes.metrics);
      setCriticalActions(dashRes.critical_actions);
      setSimulationState(dashRes.simulation);
      setPhcs(phcList);
      setRedistributions(recList);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const handleOpenBrief = async (phcId: string = 'phc-od-01', medicineId: string = 'med-1') => {
    setBriefModalOpen(true);
    setBriefLoading(true);
    try {
      const res = await api.generateActionBrief(phcId, medicineId);
      setBriefData(res);
    } catch (err) {
      console.error('Failed to generate action brief:', err);
    } finally {
      setBriefLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Simulation Alert Banner if Active */}
      <SimulationBanner simulationState={simulationState} onStop={loadData} />

      {/* Header with Title and Simulation Data Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide font-mono flex items-center gap-2">
              SMART HEALTH
              <span className="text-cyan-400 font-sans font-semibold text-lg">
                COMMAND CENTER
              </span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold uppercase tracking-wider">
              LIVE NETWORK
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time supply chain observability, predictive triage & inter-facility mutual aid.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono font-bold">
            {t('sim_data_badge')}
          </span>

          <Link
            to="/simulation"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-glow-red"
          >
            <Zap className="h-3.5 w-3.5" />
            Simulation Mode
          </Link>

          <button
            onClick={loadData}
            className="p-1.5 rounded-lg border border-slate-800 bg-background-card text-slate-400 hover:text-white transition-colors"
            title="Refresh Live Metrics"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Top 5 Animated Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title={t('metric_total_phcs')}
          value={metrics?.total_phcs || 35}
          subtitle={`${metrics?.safe_phcs || 15} Safe • ${metrics?.critical_phcs || 2} Critical`}
          icon={Activity}
          status="info"
          glow="cyan"
          onClick={() => navigate('/phc-network')}
        />

        <MetricCard
          title={t('metric_active_alerts')}
          value={metrics?.active_alerts || 5}
          subtitle={`${metrics?.critical_alerts || 2} Imminent Stock-outs`}
          icon={ShieldAlert}
          status={(metrics?.critical_alerts || 0) > 0 ? 'critical' : 'warning'}
          glow="red"
          onClick={() => navigate('/alerts')}
        />

        <MetricCard
          title={t('metric_meds_at_risk')}
          value={metrics?.medicines_at_risk || 2}
          subtitle="Paracetamol & IV Saline < 5 Days"
          icon={Pill}
          status="warning"
          glow="amber"
          onClick={() => navigate('/inventory')}
        />

        <MetricCard
          title={t('metric_beds_avail')}
          value={metrics?.available_beds || 339}
          unit="Beds"
          subtitle={`${metrics?.bed_occupancy_pct || 55}% Occupied (${metrics?.occupied_beds || 414}/${metrics?.total_beds || 753})`}
          icon={Bed}
          status="healthy"
          glow="green"
        />

        <MetricCard
          title={t('metric_staff_present')}
          value={`${metrics?.staff_attendance_pct || 85.7}%`}
          subtitle={`${metrics?.present_staff || 336} / ${metrics?.total_staff || 392} On Active Duty`}
          icon={Users}
          status="healthy"
          glow="none"
        />
      </div>

      {/* Main Operational Area: LEFT Map Preview + RIGHT Critical Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Map View */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200">
                Geospatial PHC Network & Active Corridors
              </h2>
            </div>
            <Link
              to="/phc-network"
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
            >
              Full Interactive Map <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <PHCNetworkMap
            phcs={phcs}
            redistributions={redistributions}
            height="480px"
          />
        </div>

        {/* Right Critical Actions Feed */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200">
                Critical Operational Actions
              </h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Auto-Ranked by Risk
            </span>
          </div>

          <div className="space-y-3">
            {criticalActions.map((action, idx) => {
              const isCrit = action.type === 'CRITICAL';
              const isWarn = action.type === 'WARNING';
              return (
                <GlassCard
                  key={idx}
                  glow={isCrit ? 'red' : isWarn ? 'amber' : 'cyan'}
                  className="p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        isCrit
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : isWarn
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      }`}
                    >
                      {action.type}
                    </span>
                    <span className="text-xs font-semibold text-white font-mono">
                      {action.medicine}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-200">
                      {action.phc}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {action.message}
                    </p>
                  </div>

                  <div className="p-2 rounded bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-cyan-300">
                    Recommended: {action.action}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      to={action.link}
                      className="flex-1 text-center py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors uppercase tracking-wider"
                    >
                      Execute
                    </Link>

                    {isCrit && (
                      <button
                        onClick={() => handleOpenBrief('phc-od-01', 'med-1')}
                        className="flex items-center gap-1 py-1.5 px-2.5 bg-cyan-600/90 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition-colors"
                        title="Generate Gemini Action Brief"
                      >
                        <Sparkles className="h-3 w-3" />
                        AI Brief
                      </button>
                    )}
                  </div>
                </GlassCard>
              );
            })}
          </div>

          {/* Quick Assistant Callout Card */}
          <GlassCard glow="cyan" className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-cyan-400">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider font-mono">
                Ask HealthResilience AI
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Query inventory levels, calculate regional surplus, or simulate outbreak impacts via voice or text.
            </p>
            <Link
              to="/assistant"
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition-colors"
            >
              Open AI Assistant <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </GlassCard>
        </div>
      </div>

      {/* Action Brief Modal */}
      <ActionBriefModal
        brief={briefData}
        isOpen={briefModalOpen}
        onClose={() => setBriefModalOpen(false)}
        isLoading={briefLoading}
      />
    </div>
  );
};
