import React from 'react';
import { Activity, ShieldCheck, Cpu, Heart, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/90 bg-background-deep text-slate-400 py-12 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                <Activity className="h-4 w-4" />
              </div>
              <span className="font-bold text-white tracking-wider text-sm font-mono">
                SMART HEALTH & SUPPLY CHAIN RESILIENCE PLATFORM
              </span>
            </div>
            <p className="text-slate-400 max-w-md leading-relaxed text-xs">
              An AI-powered healthcare supply-chain command platform engineered for India's Primary Health Centres (PHCs).
              Predicts stock shortages, computes optimal redistribution corridors, and preserves data privacy via federated learning.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-400 pt-1">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              "Predict shortages. Move resources faster. Strengthen healthcare resilience."
            </div>
          </div>

          {/* Quick Platform Routes */}
          <div>
            <span className="font-bold uppercase tracking-wider text-slate-200 block mb-3 text-[11px] font-mono">
              Core Architecture
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/dashboard" className="hover:text-cyan-400 transition-colors">Command Center Overview</Link>
              </li>
              <li>
                <Link to="/phc-network" className="hover:text-cyan-400 transition-colors">Geospatial PHC Network</Link>
              </li>
              <li>
                <Link to="/forecasts" className="hover:text-cyan-400 transition-colors">Demand Forecasting Engine</Link>
              </li>
              <li>
                <Link to="/redistribution" className="hover:text-cyan-400 transition-colors">Inter-Facility Redistribution</Link>
              </li>
              <li>
                <Link to="/federated-learning" className="hover:text-cyan-400 transition-colors">Federated Learning (FedAvg)</Link>
              </li>
            </ul>
          </div>

          {/* Governance & Specifications */}
          <div>
            <span className="font-bold uppercase tracking-wider text-slate-200 block mb-3 text-[11px] font-mono">
              Compliance & Safety
            </span>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>AI Operational Safety Certified</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <Cpu className="h-3.5 w-3.5 text-cyan-400" />
                <span>Local Data Privacy Retained</span>
              </li>
              <li>
                <Link to="/simulation" className="text-amber-400 hover:text-amber-300 flex items-center gap-1">
                  <span>Emergency Disaster Simulation</span>
                </Link>
              </li>
              <li>
                <span className="text-[10px] font-mono text-slate-500 block pt-1">
                  Built for India-scale healthcare infrastructure and BRICS health resilience initiatives.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar with synthetic data badge */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-bold">
              PROTOTYPE / DEMO
            </span>
            <span className="text-slate-500">
              Synthetic Demonstration Data • Not Connected to Live National Registries
            </span>
          </div>
          <div className="text-slate-500 flex items-center gap-1">
            Engineered with <Heart className="h-3 w-3 text-rose-500 inline fill-rose-500" /> for Rural Public Health
          </div>
        </div>
      </div>
    </footer>
  );
};
