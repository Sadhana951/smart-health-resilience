import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { InventoryItem } from '../types';
import { GlassCard } from '../components/GlassCard';
import { RiskBadge } from '../components/RiskBadge';
import { Search, Filter, ArrowUpDown, Pill, RefreshCw, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const InventoryPage: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [medicineFilter, setMedicineFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [sortField, setSortField] = useState<'days_remaining' | 'current_stock' | 'daily_usage'>('days_remaining');
  const [sortAsc, setSortAsc] = useState(true);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invList, medList] = await Promise.all([
        api.getInventory(),
        api.getMedicines()
      ]);
      setInventory(invList);
      setMedicines(medList);
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSort = (field: 'days_remaining' | 'current_stock' | 'daily_usage') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filteredItems = inventory
    .filter(item => {
      const matchSearch = item.medicine_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.phc_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.district.toLowerCase().includes(searchQuery.toLowerCase());
      const matchMed = medicineFilter === 'ALL' || item.medicine_id === medicineFilter;
      const matchRisk = riskFilter === 'ALL' || item.risk_level === riskFilter;
      const matchState = stateFilter === 'ALL' || item.state === stateFilter;
      return matchSearch && matchMed && matchRisk && matchState;
    })
    .sort((a, b) => {
      const mult = sortAsc ? 1 : -1;
      return (a[sortField] - b[sortField]) * mult;
    });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide font-mono flex items-center gap-2">
            NETWORK INVENTORY
            <span className="text-cyan-400 font-sans font-semibold text-base">
              REGISTRY & SURVEILLANCE
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Multi-tier medicine stock registers, consumption velocities, and days-to-stock-out triage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/30">
            {filteredItems.length} Records Indexed
          </span>
          <button
            onClick={loadData}
            className="p-1.5 rounded-lg border border-slate-800 bg-background-card text-slate-400 hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <GlassCard className="p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Input */}
          <div className="flex items-center gap-2 flex-1 min-w-[260px]">
            <Search className="h-4 w-4 text-cyan-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search medicine name, PHC facility, or district..."
              className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none font-mono"
            />
          </div>

          {/* Quick Selectors */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            {/* Medicine filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Medicine:</span>
              <select
                value={medicineFilter}
                onChange={(e) => setMedicineFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1 focus:outline-none max-w-[160px] truncate"
              >
                <option value="ALL">All Medicines</option>
                {medicines.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            {/* State filter */}
            <div className="flex items-center gap-1.5">
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

            {/* Risk filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Risk:</span>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2 py-1 focus:outline-none uppercase"
              >
                <option value="ALL">All Risk Levels</option>
                <option value="CRITICAL">Critical (&le; 5 Days)</option>
                <option value="WATCH">Watch (&le; 10 Days)</option>
                <option value="SAFE">Safe (&gt; 10 Days)</option>
              </select>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Main Inventory Table */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Medicine Item</th>
                <th className="py-3.5 px-4">PHC Facility</th>
                <th className="py-3.5 px-4">District / State</th>
                <th
                  onClick={() => handleSort('current_stock')}
                  className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Stock</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('daily_usage')}
                  className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Daily Usage</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('days_remaining')}
                  className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Days Remaining</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Buffer Gauge</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Logistics Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredItems.slice(0, 100).map((item) => {
                const isCrit = item.risk_level === 'CRITICAL';
                const isWatch = item.risk_level === 'WATCH';
                const pct = Math.min(100, Math.round((item.days_remaining / 35) * 100));

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-800/40 transition-colors ${isCrit ? 'bg-rose-950/10' : ''}`}
                  >
                    <td className="py-3 px-4 font-semibold text-white font-sans">
                      {item.medicine_name}
                      <span className="block text-[10px] text-slate-400 font-mono">
                        Exp: {item.expiry_date}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-200 font-sans">
                      <Link
                        to={`/phc/${item.phc_id}`}
                        className="hover:text-cyan-400 transition-colors"
                      >
                        {item.phc_name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {item.district}, {item.state}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      {item.current_stock.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {item.daily_usage} / day
                    </td>
                    <td className="py-3 px-4 font-bold">
                      <span className={isCrit ? 'text-rose-400 animate-pulse' : (isWatch ? 'text-amber-400' : 'text-emerald-400')}>
                        {item.days_remaining} Days
                      </span>
                    </td>
                    <td className="py-3 px-4 w-36">
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isCrit ? 'bg-rose-500' : (isWatch ? 'bg-amber-400' : 'bg-emerald-400')}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <RiskBadge level={item.risk_level} size="sm" showIcon={false} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isCrit ? (
                        <Link
                          to={`/redistribution?medicine=${item.medicine_id}&target=${item.phc_id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-[10px] font-bold uppercase transition-colors"
                        >
                          Transfer <ArrowRight className="h-3 w-3" />
                        </Link>
                      ) : (
                        <Link
                          to={`/forecasts?phc=${item.phc_id}&medicine=${item.medicine_id}`}
                          className="px-2 py-1 text-slate-400 hover:text-white text-[11px] underline"
                        >
                          Forecast
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
