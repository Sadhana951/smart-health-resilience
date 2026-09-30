import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { GlassCard } from '../components/GlassCard';
import { RiskBadge } from '../components/RiskBadge';
import {
  TrendingUp,
  Activity,
  Calendar,
  CloudRain,
  ShieldAlert,
  AlertTriangle,
  Info,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export const ForecastPage: React.FC = () => {
  const [daysWindow, setDaysWindow] = useState<7 | 14 | 30>(14);
  const [forecastSummary, setForecastSummary] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getForecastSummary();
      setForecastSummary(res);
      setChartData(res.chart_data);
    } catch (err) {
      console.error('Failed to load forecast data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [daysWindow]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-wide font-mono flex items-center gap-2">
              DEMAND FORECASTING
              <span className="text-cyan-400 font-sans font-semibold text-base">
                PREDICTIVE ENGINE
              </span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold uppercase tracking-wider">
              DEMO FORECAST
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Vertex AI / Seasonal Bayesian ARIMA demand trajectory modeling across Primary Health Centres.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">Forecast Horizon:</span>
          {( [7, 14, 30] as const).map(d => (
            <button
              key={d}
              onClick={() => setDaysWindow(d)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                daysWindow === d
                  ? 'bg-cyan-600 text-white shadow-glow-cyan'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              {d} Days
            </button>
          ))}
          <button
            onClick={loadData}
            className="p-1.5 rounded-lg border border-slate-800 bg-background-card text-slate-400 hover:text-white ml-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Prominent Accuracy and Synthetic Disclaimer */}
      <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-cyan-300">
          <Info className="h-4 w-4 text-cyan-400 shrink-0" />
          <span>
            METHODOLOGY: Ensemble Seasonal ARIMA with 95% Bayesian Confidence Intervals.
            Influenced by historic run-rates, weather anomalies, and simulated fever clusters.
          </span>
        </div>
        <span className="hidden md:inline px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 text-[10px]">
          Confidence Band: 95%
        </span>
      </div>

      {/* Highlight Top Medicine Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard glow="cyan" className="p-5 space-y-2">
          <span className="text-[11px] font-mono uppercase text-slate-400">
            FOCAL FORMULARY ITEM
          </span>
          <div className="text-xl font-bold text-white font-sans">
            Paracetamol 500mg Tablets
          </div>
          <span className="text-xs text-slate-400 block">
            Most consumed antipyretic across rural OPD clinics
          </span>
        </GlassCard>

        <GlassCard glow="red" className="p-5 space-y-2">
          <span className="text-[11px] font-mono uppercase text-slate-400">
            TOTAL NETWORK STOCK
          </span>
          <div className="text-2xl font-bold text-white font-mono">
            {forecastSummary?.current_network_stock?.toLocaleString() || '18,450'} Units
          </div>
          <span className="text-xs text-rose-400 font-mono flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            2 facilities breach buffer within 4-5 days
          </span>
        </GlassCard>

        <GlassCard className="p-5 space-y-2">
          <span className="text-[11px] font-mono uppercase text-slate-400">
            PREDICTED DAILY NETWORK CONSUMPTION
          </span>
          <div className="text-2xl font-bold text-cyan-400 font-mono">
            ~{forecastSummary?.daily_network_demand?.toLocaleString() || '1,420'} Units / Day
          </div>
          <span className="text-xs text-slate-400">
            Elevated by +14% due to seasonal monsoon humidity
          </span>
        </GlassCard>
      </div>

      {/* Main Interactive Forecast Area Chart */}
      <GlassCard className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">
              Network Demand Trajectory (Historical 7-Day & Forward {daysWindow}-Day Forecast)
            </h3>
            <p className="text-xs text-slate-400">
              Dotted bands represent upper (95%) and lower bounds of expected patient demand.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              Projected Demand
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              Upper 95% Bound
            </span>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="areaDemand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00F2FE" stopOpacity={0.45}/>
                  <stop offset="95%" stopColor="#00F2FE" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="areaUpper" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="date" stroke="#64748B" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748B" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0B172B',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#F8FAFC',
                  fontSize: '12px',
                  fontFamily: 'monospace'
                }}
              />
              <Area type="monotone" dataKey="upper_ci" stroke="#F59E0B" strokeWidth={1} strokeDasharray="4 4" fillOpacity={1} fill="url(#areaUpper)" name="Upper 95% Bound" />
              <Area type="monotone" dataKey="demand" stroke="#00F2FE" strokeWidth={2.5} fillOpacity={1} fill="url(#areaDemand)" name="Projected Daily Demand" />
              <Area type="monotone" dataKey="lower_ci" stroke="#10B981" strokeWidth={1} strokeDasharray="4 4" fill="none" name="Lower 95% Bound" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Explanatory Intelligence Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
            <CloudRain className="h-4 w-4" />
            Environmental & Weather Signal Covariates
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Forecast weights incorporate live IMD (India Meteorological Department) monsoon flood warnings across the Mahanadi basin.
            Elevated relative humidity (&gt;85%) correlates with an observed +22% bump in acute febrile illness presentation at riparian PHCs.
          </p>
        </GlassCard>

        <GlassCard className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
            <Activity className="h-4 w-4" />
            Simulated Outbreak & Surge Elasticity
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            In the event of localized dengue or acute diarrheal disease outbreaks, demand elasticity spikes up to +1.8x.
            The engine automatically recalibrates reorder points and alerts the district medical officer 7 days ahead of stock-out.
          </p>
        </GlassCard>
      </div>
    </div>
  );
};
