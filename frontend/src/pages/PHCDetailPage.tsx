import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { PHC, InventoryItem, Alert, ActionBrief } from '../types';
import { GlassCard } from '../components/GlassCard';
import { RiskBadge } from '../components/RiskBadge';
import { ActionBriefModal } from '../components/ActionBriefModal';
import {
  Activity,
  ArrowLeft,
  MapPin,
  Pill,
  Bed,
  Users,
  ShieldAlert,
  Sparkles,
  ArrowLeftRight,
  RefreshCw,
  TrendingDown,
  Calendar,
  Phone
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

export const PHCDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [phc, setPhc] = useState<PHC | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [aiSummary, setAiSummary] = useState('');
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [selectedMedicineId, setSelectedMedicineId] = useState('med-1');
  const [loading, setLoading] = useState(true);

  // Action brief modal
  const [briefOpen, setBriefOpen] = useState(false);
  const [brief, setBrief] = useState<ActionBrief | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await api.getPHCById(id);
        setPhc(res.phc);
        setInventory(res.inventory);
        setAlerts(res.alerts);
        setAiSummary(res.ai_summary);

        // Fetch forecast for top medicine
        const fRes = await api.getPHCForecast(id, selectedMedicineId, 14);
        setForecastData(fRes.chart_data);
      } catch (err) {
        console.error('Failed to load PHC detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, selectedMedicineId]);

  const handleOpenActionBrief = async () => {
    if (!id) return;
    setBriefOpen(true);
    setBriefLoading(true);
    try {
      const bRes = await api.generateActionBrief(id, selectedMedicineId);
      setBrief(bRes);
    } catch (err) {
      console.error('Failed to generate action brief:', err);
    } finally {
      setBriefLoading(false);
    }
  };

  if (loading && !phc) {
    return (
      <div className="py-24 text-center text-cyan-400 font-mono flex items-center justify-center gap-3">
        <RefreshCw className="h-6 w-6 animate-spin" />
        Loading facility telemetry...
      </div>
    );
  }

  if (!phc) {
    return (
      <div className="py-24 text-center text-slate-400 text-sm">
        PHC record not found.{' '}
        <Link to="/phc-network" className="text-cyan-400 underline">
          Return to network map
        </Link>
      </div>
    );
  }

  const bedOccupancyPct = Math.round((phc.beds_occupied / phc.bed_capacity) * 100);
  const staffAttendancePct = Math.round((phc.staff_present / phc.staff_total) * 100);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Back button and Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg border border-slate-800 bg-background-card text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {phc.district}, {phc.state}
              </span>
              <RiskBadge level={phc.risk_level} size="sm" />
            </div>
            <h1 className="text-2xl font-bold text-white mt-1">{phc.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenActionBrief}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-glow-cyan"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Generate Gemini Brief
          </button>

          <Link
            to={`/redistribution?target=${phc.id}`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            Initiate Transfer
          </Link>
        </div>
      </div>

      {/* AI Summary Card */}
      <GlassCard glow={phc.risk_level === 'CRITICAL' ? 'red' : 'cyan'} className="p-5">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
          <Sparkles className="h-4 w-4" />
          AI Operational Facility Summary
        </div>
        <p className="text-sm text-slate-200 leading-relaxed font-sans">
          {aiSummary}
        </p>
      </GlassCard>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-4 space-y-2">
          <span className="text-[11px] font-mono uppercase text-slate-400">POPULATION SERVED</span>
          <div className="text-2xl font-bold text-white font-mono">
            {phc.population_served.toLocaleString()}
          </div>
          <span className="text-xs text-slate-400">Rural catchment population</span>
        </GlassCard>

        <GlassCard className="p-4 space-y-2">
          <div className="flex justify-between items-center text-[11px] font-mono uppercase text-slate-400">
            <span>BED OCCUPANCY</span>
            <span className="text-white font-bold">{bedOccupancyPct}%</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {phc.beds_occupied} / {phc.bed_capacity}
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full ${bedOccupancyPct > 80 ? 'bg-rose-500' : 'bg-cyan-400'}`}
              style={{ width: `${bedOccupancyPct}%` }}
            />
          </div>
        </GlassCard>

        <GlassCard className="p-4 space-y-2">
          <div className="flex justify-between items-center text-[11px] font-mono uppercase text-slate-400">
            <span>STAFF ON DUTY</span>
            <span className="text-white font-bold">{staffAttendancePct}%</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {phc.staff_present} / {phc.staff_total}
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full"
              style={{ width: `${staffAttendancePct}%` }}
            />
          </div>
        </GlassCard>

        <GlassCard className="p-4 space-y-2">
          <span className="text-[11px] font-mono uppercase text-slate-400">FACILITY CONTACT</span>
          <div className="text-sm font-bold text-cyan-400 font-mono flex items-center gap-1.5 mt-1">
            <Phone className="h-4 w-4" />
            {phc.contact_phone}
          </div>
          <span className="text-xs text-slate-400">District Health Emergency Line</span>
        </GlassCard>
      </div>

      {/* Demand Forecast Chart for Selected Medicine */}
      <GlassCard className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">
              14-Day Demand & Buffer Depletion Forecast
            </h3>
            <p className="text-xs text-slate-400">
              Historical consumption vs projected daily patient demand with 95% confidence intervals.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400">Medicine:</span>
            <select
              value={selectedMedicineId}
              onChange={(e) => setSelectedMedicineId(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              {inventory.map(i => (
                <option key={i.medicine_id} value={i.medicine_id}>
                  {i.medicine_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00F2FE" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#00F2FE" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
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
              <Area type="monotone" dataKey="demand" stroke="#00F2FE" strokeWidth={2} fillOpacity={1} fill="url(#colorDemand)" name="Projected Demand (units)" />
              <Area type="monotone" dataKey="simulated_stock" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#colorStock)" name="Remaining Buffer Stock" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* 12 Essential Medicines Inventory Table */}
      <GlassCard className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">
              Essential Medicines Stock Register (12 Formulary Items)
            </h3>
            <p className="text-xs text-slate-400">
              Live facility inventory levels, daily run-rates, and calculated days-to-stock-out.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/30">
            {inventory.length} Verified Items
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-y border-slate-800">
              <tr>
                <th className="py-3 px-3">Medicine</th>
                <th className="py-3 px-3">Batch</th>
                <th className="py-3 px-3">Current Stock</th>
                <th className="py-3 px-3">Daily Run-rate</th>
                <th className="py-3 px-3">Days Remaining</th>
                <th className="py-3 px-3">Stock Buffer</th>
                <th className="py-3 px-3">Risk Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {inventory.map((item) => {
                const isCrit = item.risk_level === 'CRITICAL';
                const isWatch = item.risk_level === 'WATCH';
                const pct = Math.min(100, Math.round((item.days_remaining / 30) * 100));

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-semibold text-white font-sans">
                      {item.medicine_name}
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      {item.batch_no}
                    </td>
                    <td className="py-3 px-3 font-bold text-white">
                      {item.current_stock.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {item.daily_usage} / day
                    </td>
                    <td className="py-3 px-3 font-bold">
                      <span className={isCrit ? 'text-rose-400 animate-pulse' : (isWatch ? 'text-amber-400' : 'text-emerald-400')}>
                        {item.days_remaining} Days
                      </span>
                    </td>
                    <td className="py-3 px-3 w-36">
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isCrit ? 'bg-rose-500' : (isWatch ? 'bg-amber-400' : 'bg-emerald-400')}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <RiskBadge level={item.risk_level} size="sm" showIcon={false} />
                    </td>
                    <td className="py-3 px-3 text-right">
                      {isCrit ? (
                        <Link
                          to={`/redistribution?medicine=${item.medicine_id}&target=${phc.id}`}
                          className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[11px] font-bold uppercase transition-colors"
                        >
                          Redistribute
                        </Link>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedMedicineId(item.medicine_id);
                            window.scrollTo({ top: 380, behavior: 'smooth' });
                          }}
                          className="px-2.5 py-1 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white rounded text-[11px] transition-colors"
                        >
                          Forecast
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

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
