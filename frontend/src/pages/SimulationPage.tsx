import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useWebSocket } from '../contexts/WebSocketContext';
import { SimulationState, ActionBrief } from '../types';
import { GlassCard } from '../components/GlassCard';
import { ActionBriefModal } from '../components/ActionBriefModal';
import {
  Zap,
  Play,
  Square,
  AlertTriangle,
  CloudRain,
  Flame,
  Bug,
  Pill,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const SimulationPage: React.FC = () => {
  const { refreshTrigger } = useWebSocket();

  const [simState, setSimState] = useState<SimulationState | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<string>('Flood');
  const [intensity, setIntensity] = useState<number>(1.2);
  const [targetDistrict, setTargetDistrict] = useState<string>('Cuttack');
  const [loading, setLoading] = useState(false);

  // Action brief
  const [briefOpen, setBriefOpen] = useState(false);
  const [brief, setBrief] = useState<ActionBrief | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);

  const scenarios = [
    {
      id: 'Flood',
      title: 'Mahanadi Monsoon Flood',
      desc: 'Severe waterlogging, riverbank overflow, acute enteric infection spike.',
      icon: CloudRain,
      impactMeds: 'ORS Sachets, IV Normal Saline, Zinc Sulphate'
    },
    {
      id: 'Dengue spike',
      title: 'Post-Monsoon Dengue Outbreak',
      desc: 'Rapid vector multiplication, acute febrile surge across peri-urban and rural centers.',
      icon: Bug,
      impactMeds: 'Paracetamol Tablets, IV Fluids, Platelet Support'
    },
    {
      id: 'Heatwave',
      title: 'Extreme Heatwave Wave (44°C+)',
      desc: 'Acute dehydration, heat-exhaustion cases, cold-chain temperature stress.',
      icon: Flame,
      impactMeds: 'ORS Sachets, IV Saline, Insulin Stability'
    },
    {
      id: 'Disease outbreak',
      title: 'Enteric Waterborne Cluster',
      desc: 'Contaminated community water sources causing localized diarrheal surges.',
      icon: AlertTriangle,
      impactMeds: 'Amoxicillin, ORS, Ciprofloxacin'
    },
    {
      id: 'Medicine shortage',
      title: 'National Supply Corridor Halt',
      desc: 'Transport strike and bulk-drug customs embargo halting inter-state deliveries.',
      icon: Pill,
      impactMeds: 'All Essential Formulary Items'
    }
  ];

  const timelineSteps = [
    { name: 'EVENT DETECTED', desc: 'Satellite weather anomaly / local clinical surge trigger' },
    { name: 'DEMAND SPIKE', desc: 'OPD patient presentation increases by +80% to +150%' },
    { name: 'PHCs AT RISK', desc: 'Buffer depletion timeline drops under 72-hour safety threshold' },
    { name: 'SHORTAGE FORECAST', desc: 'Bayesian ARIMA models project zero-inventory day' },
    { name: 'TRANSFER RECOMMENDED', desc: 'Inter-facility algorithm pairs shortage center with surplus hub' },
    { name: 'OFFICER ACTION', desc: 'District health officer accepts redistribution corridor' }
  ];

  const loadStatus = async () => {
    try {
      const res = await api.getSimulationStatus();
      setSimState(res);
    } catch (err) {
      console.error('Failed to load simulation status:', err);
    }
  };

  useEffect(() => {
    loadStatus();
  }, [refreshTrigger]);

  const handleStart = async () => {
    setLoading(true);
    try {
      await api.startSimulation(selectedScenario, intensity, targetDistrict);
      await loadStatus();
    } catch (err) {
      console.error('Failed to start simulation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      await api.stopSimulation();
      await loadStatus();
    } catch (err) {
      console.error('Failed to stop simulation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenActionBrief = async () => {
    setBriefOpen(true);
    setBriefLoading(true);
    try {
      const res = await api.generateActionBrief('phc-od-01', 'med-1');
      setBrief(res);
    } catch (err) {
      console.error('Failed to generate action brief:', err);
    } finally {
      setBriefLoading(false);
    }
  };

  const currentStepIndex = simState?.is_active
    ? timelineSteps.findIndex(s => s.name === simState.timeline_step)
    : -1;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-wide font-mono flex items-center gap-2">
              EMERGENCY SIMULATION
              <span className="text-rose-400 font-sans font-semibold text-base">
                STRESS-TESTING LAB
              </span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-bold uppercase tracking-wider">
              SANDBOX MODE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Test supply chain resilience against realistic natural disasters, localized outbreaks, and bulk medicine embargoes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
            SIMULATION MODE — NO REAL-WORLD ALERTS
          </span>
          <button
            onClick={loadStatus}
            className="p-1.5 rounded-lg border border-slate-800 bg-background-card text-slate-400 hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Cinematic Timeline Banner */}
      <GlassCard className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Zap className="h-4 w-4 text-rose-400" />
            Cascading Operational Timeline
          </span>
          <span className="text-xs font-mono text-cyan-400">
            {simState?.is_active ? `Active Step: ${simState.timeline_step}` : 'Baseline Status (Idle)'}
          </span>
        </div>

        {/* 6-step interactive visual progress */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-2">
          {timelineSteps.map((step, idx) => {
            const isActive = simState?.is_active && idx <= currentStepIndex;
            const isCurrent = simState?.is_active && step.name === simState.timeline_step;

            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border transition-all text-xs font-mono ${
                  isCurrent
                    ? 'bg-rose-500/20 border-rose-400 shadow-glow-red scale-105'
                    : isActive
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold">0{idx + 1}</span>
                  {isActive && <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />}
                </div>
                <div className="font-bold truncate text-white">{step.name}</div>
                <div className="text-[10px] text-slate-400 font-sans mt-1 line-clamp-2">
                  {step.desc}
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Controls & Scenario Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Scenario Picker */}
        <div className="lg:col-span-8 space-y-4">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 block">
            Select Disaster & Outbreak Scenario
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {scenarios.map((sc) => {
              const Icon = sc.icon;
              const isSelected = selectedScenario === sc.id;
              return (
                <GlassCard
                  key={sc.id}
                  onClick={() => setSelectedScenario(sc.id)}
                  glow={isSelected ? 'red' : 'none'}
                  className={`p-5 space-y-3 cursor-pointer transition-all ${
                    isSelected ? 'border-rose-500/60 shadow-glow-red' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-slate-800 text-rose-400 border border-slate-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-bold uppercase">
                        SELECTED
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">{sc.title}</h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {sc.desc}
                    </p>
                  </div>

                  <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-300">
                    Target Formulary: {sc.impactMeds}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>

        {/* Simulation Execution Panel */}
        <div className="lg:col-span-4 space-y-4">
          <GlassCard glow="cyan" className="p-5 space-y-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 block flex items-center gap-1.5">
              <Sliders className="h-4 w-4" />
              Simulation Parameters
            </span>

            {/* Intensity Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Demand Multiplier:</span>
                <span className="text-white font-bold">{intensity}x (+{Math.round((intensity - 1) * 100)}%)</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="2.5"
                step="0.1"
                value={intensity}
                onChange={(e) => setIntensity(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800"
              />
            </div>

            {/* Target Cluster */}
            <div className="space-y-1.5 text-xs font-mono">
              <span className="text-slate-400">Target District Cluster:</span>
              <select
                value={targetDistrict}
                onChange={(e) => setTargetDistrict(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2 focus:outline-none"
              >
                <option value="Cuttack">Cuttack District (Mahanadi Catchment)</option>
                <option value="Puri">Puri District (Coastal Storm Ingress)</option>
                <option value="Balasore">Balasore (Flood Plain Corridor)</option>
                <option value="South 24 Parganas">South 24 Parganas (Sundarbans Delta)</option>
              </select>
            </div>

            {/* Action Trigger Buttons */}
            <div className="pt-2 space-y-2">
              {!simState?.is_active ? (
                <button
                  onClick={handleStart}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-glow-red"
                >
                  <Play className="h-4 w-4 fill-current" />
                  START EMERGENCY SIMULATION
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 border border-rose-500/40 text-xs font-bold uppercase tracking-wider transition-all"
                >
                  <Square className="h-4 w-4 fill-current" />
                  STOP SIMULATION & RESET NETWORK
                </button>
              )}

              {simState?.is_active && (
                <button
                  onClick={handleOpenActionBrief}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-glow-cyan"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Generate Gemini Action Brief
                </button>
              )}
            </div>
          </GlassCard>

          {/* Quick links to review affected components */}
          {simState?.is_active && (
            <GlassCard glow="red" className="p-4 space-y-2 text-xs font-mono animate-in fade-in duration-200">
              <span className="text-[10px] uppercase font-bold text-rose-400 block">
                CASCADE CONSEQUENCES TRIGGERED:
              </span>
              <div className="space-y-1.5 text-slate-300">
                <Link to="/alerts" className="flex justify-between hover:text-cyan-400 py-1 border-b border-slate-800">
                  <span>New Critical Alerts</span>
                  <span className="text-rose-400 font-bold">Generated →</span>
                </Link>
                <Link to="/redistribution" className="flex justify-between hover:text-cyan-400 py-1 border-b border-slate-800">
                  <span>Emergency Transfer Orders</span>
                  <span className="text-cyan-400 font-bold">Matched →</span>
                </Link>
                <Link to="/dashboard" className="flex justify-between hover:text-cyan-400 py-1">
                  <span>Network Dashboard State</span>
                  <span className="text-amber-400 font-bold">Updated →</span>
                </Link>
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
