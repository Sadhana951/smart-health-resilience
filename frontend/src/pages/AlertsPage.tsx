import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Alert, ActionBrief } from '../types';
import { GlassCard } from '../components/GlassCard';
import { RiskBadge } from '../components/RiskBadge';
import { ActionBriefModal } from '../components/ActionBriefModal';
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  Sparkles,
  ArrowRight,
  Eye,
  CheckCircle,
  RefreshCw,
  Clock,
  Filter
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Action brief modal state
  const [briefOpen, setBriefOpen] = useState(false);
  const [brief, setBrief] = useState<ActionBrief | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const res = await api.getAlerts();
      setAlerts(res);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleOpenActionBrief = async (alert: Alert) => {
    setBriefOpen(true);
    setBriefLoading(true);
    try {
      const res = await api.generateActionBrief(alert.phc_id, alert.medicine_id);
      setBrief(res);
    } catch (err) {
      console.error('Failed to generate action brief:', err);
    } finally {
      setBriefLoading(false);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await api.resolveAlert(alertId);
      loadAlerts();
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  };

  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL');
  const warningAlerts = alerts.filter(a => a.severity === 'WARNING');
  const infoAlerts = alerts.filter(a => a.severity === 'INFO');

  const filteredAlerts = alerts.filter(a => {
    if (filterSeverity === 'ALL') return true;
    return a.severity === filterSeverity;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide font-mono flex items-center gap-2">
            EARLY WARNING ALERT CENTER
            <span className="text-cyan-400 font-sans font-semibold text-base">
              TRIAGE
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time supply disruption alerts, zero-buffer threshold breaches, and surge warnings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-slate-800 bg-background-card p-1 text-xs font-mono">
            {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-3 py-1 rounded font-bold uppercase transition-all ${
                  filterSeverity === sev
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <button
            onClick={loadAlerts}
            className="p-2 rounded-lg border border-slate-800 bg-background-card text-slate-400 hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Triage Summary Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard glow="red" className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase text-rose-400 font-bold block">
              CRITICAL STOCK-OUT RISK
            </span>
            <div className="text-3xl font-extrabold text-white font-mono mt-1">
              {criticalAlerts.length}
            </div>
            <span className="text-xs text-slate-400">Zero buffer projected &le; 5 Days</span>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <ShieldAlert className="h-6 w-6 animate-pulse" />
          </div>
        </GlassCard>

        <GlassCard glow="amber" className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase text-amber-400 font-bold block">
              SURVEILLANCE WARNINGS
            </span>
            <div className="text-3xl font-extrabold text-white font-mono mt-1">
              {warningAlerts.length}
            </div>
            <span className="text-xs text-slate-400">Demand acceleration &le; 10 Days</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </GlassCard>

        <GlassCard glow="cyan" className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase text-cyan-400 font-bold block">
              STRATEGIC SURPLUS NOTICES
            </span>
            <div className="text-3xl font-extrabold text-white font-mono mt-1">
              {infoAlerts.length}
            </div>
            <span className="text-xs text-slate-400">Mutual-aid donor hubs ready</span>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Info className="h-6 w-6" />
          </div>
        </GlassCard>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-4">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => {
            const isCrit = alert.severity === 'CRITICAL';
            const isWarn = alert.severity === 'WARNING';

            return (
              <GlassCard
                key={alert.id}
                glow={isCrit ? 'red' : isWarn ? 'amber' : 'cyan'}
                className="p-5 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <RiskBadge level={alert.severity} size="md" />
                    <div>
                      <span className="text-xs font-mono uppercase text-slate-400 block">
                        {alert.phc_name} • {alert.district}, {alert.state}
                      </span>
                      <h3 className="text-base font-bold text-white tracking-wide">
                        {alert.medicine_name ? `Stock-Out Risk: ${alert.medicine_name}` : alert.message}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {alert.message}
                </p>

                {/* Recommended Operational Action Box */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono flex items-start gap-2">
                  <span className="text-cyan-400 font-bold uppercase shrink-0">
                    RECOMMENDED LOGISTICS ACTION:
                  </span>
                  <span className="text-slate-200">
                    {alert.recommended_action}
                  </span>
                </div>

                {/* Card Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/phc/${alert.phc_id}`}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 bg-background-panel text-slate-200 hover:text-white hover:border-cyan-400 text-xs font-semibold uppercase tracking-wider transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View PHC
                    </Link>

                    <Link
                      to={`/redistribution?target=${alert.phc_id}&medicine=${alert.medicine_id || ''}`}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-glow-cyan"
                    >
                      View Transfer Corridor
                    </Link>

                    <button
                      onClick={() => handleOpenActionBrief(alert)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 text-xs font-semibold transition-colors"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Generate Brief
                    </button>
                  </div>

                  {alert.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleResolveAlert(alert.id)}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-400 font-mono transition-colors"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Mark Acknowledged
                    </button>
                  )}
                </div>
              </GlassCard>
            );
          })
        ) : (
          <GlassCard className="p-12 text-center text-slate-400 text-sm">
            No active alerts matching filter.
          </GlassCard>
        )}
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
