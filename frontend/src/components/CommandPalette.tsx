import React, { useState, useEffect } from 'react';
import { Search, X, MapPin, Pill, Activity, ShieldAlert, Cpu, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const quickLinks = [
    { title: 'PHC Cuttack Rural (Salipur)', subtitle: 'Critical Shortage — Paracetamol 4 Days', icon: MapPin, path: '/phc/phc-od-01', category: 'PHC' },
    { title: 'PHC Bhubaneswar North (Chandaka)', subtitle: 'Surplus Buffer Hub — 35 Days', icon: MapPin, path: '/phc/phc-od-02', category: 'PHC' },
    { title: 'Paracetamol 500mg Tablets', subtitle: 'Critical Network Shortage Watch', icon: Pill, path: '/inventory?medicine=med-1', category: 'Medicine' },
    { title: 'IV Normal Saline 0.9%', subtitle: 'Demand Surge in Riparian Clusters', icon: Pill, path: '/inventory?medicine=med-8', category: 'Medicine' },
    { title: 'Active Emergency Simulation', subtitle: 'Model Flood, Outbreak or Shortage Shock', icon: Activity, path: '/simulation', category: 'Command' },
    { title: 'Federated Learning Cluster', subtitle: 'Privacy-Preserving Multi-Node Model', icon: Cpu, path: '/federated-learning', category: 'Intelligence' },
    { title: 'Critical Stock-Out Alerts', subtitle: '5 Active Supply Warnings', icon: ShieldAlert, path: '/alerts', category: 'Alert' },
    { title: 'Inter-Facility Redistribution Engine', subtitle: 'Shortage <-> Surplus Auto-Matching', icon: ArrowRight, path: '/redistribution', category: 'Logistics' }
  ];

  const filtered = query.trim() === ''
    ? quickLinks
    : quickLinks.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-background-panel border border-cyan-500/40 rounded-2xl shadow-glow-cyan overflow-hidden">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-background-card">
          <Search className="h-5 w-5 text-cyan-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search PHC, Medicine, District, Alert, or Forecast..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none font-mono"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono bg-slate-800 border border-slate-700 rounded text-slate-400">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results list */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-800/40">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  onClick={() => handleSelect(item.path)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-cyan-500/10 hover:border hover:border-cyan-500/30 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 group-hover:border-cyan-400 group-hover:text-cyan-400 text-slate-400 transition-colors">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-200 group-hover:text-white flex items-center gap-2">
                        {item.title}
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {item.category}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-cyan-400 transform group-hover:translate-x-1 transition-all" />
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-sm text-slate-400">
              No matching resources found for "{query}". Try "Paracetamol", "Cuttack", or "Simulation".
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-background-card/90 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between font-mono">
          <span>Navigate with mouse or arrow keys</span>
          <span>Press ESC to dismiss</span>
        </div>
      </div>
    </div>
  );
};
