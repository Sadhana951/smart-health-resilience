import React from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';
import { api } from '../services/api';
import { AlertTriangle, Play, Square, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SimulationBannerProps {
  simulationState?: {
    is_active: boolean;
    scenario: string;
    intensity: number;
    demand_multiplier: number;
    affected_phcs_count: number;
    weather_anomaly: string;
    timeline_step: string;
  };
  onStop?: () => void;
}

export const SimulationBanner: React.FC<SimulationBannerProps> = ({
  simulationState,
  onStop
}) => {
  if (!simulationState?.is_active) {
    return null;
  }

  const handleStop = async () => {
    try {
      await api.stopSimulation();
      if (onStop) onStop();
    } catch (err) {
      console.error('Failed to stop simulation:', err);
    }
  };

  return (
    <div className="bg-gradient-to-r from-rose-950/90 via-slate-900/90 to-amber-950/90 border-b border-rose-500/50 px-4 py-2.5 backdrop-blur-md sticky top-0 z-50 shadow-glow-red">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
          </span>
          <div className="flex items-center gap-2 font-mono">
            <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
              EMERGENCY SIMULATION
            </span>
            <span className="text-white font-semibold">
              {simulationState.scenario.toUpperCase()}:
            </span>
            <span className="text-slate-300 text-xs hidden md:inline">
              {simulationState.weather_anomaly}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 text-xs font-mono">
            <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              Demand: +{Math.round((simulationState.demand_multiplier - 1) * 100)}%
            </span>
            <span className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
              Affected PHCs: {simulationState.affected_phcs_count}
            </span>
            <span className="text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
              Step: {simulationState.timeline_step}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/simulation"
              className="text-xs text-cyan-300 hover:text-white underline underline-offset-2 transition-colors flex items-center gap-1 font-medium"
            >
              <Activity className="h-3 w-3" />
              View Timeline
            </Link>
            <button
              onClick={handleStop}
              className="flex items-center gap-1.5 px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all uppercase tracking-wider"
            >
              <Square className="h-3 w-3 fill-current" />
              Stop Sim
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
