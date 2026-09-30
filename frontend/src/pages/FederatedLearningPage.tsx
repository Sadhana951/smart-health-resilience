import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FederatedNode } from '../types';
import { GlassCard } from '../components/GlassCard';
import {
  Cpu,
  ShieldCheck,
  Lock,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Server,
  Layers,
  Database,
  CheckCircle2,
  Play
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const FederatedLearningPage: React.FC = () => {
  const [nodes, setNodes] = useState<FederatedNode[]>([]);
  const [globalRound, setGlobalRound] = useState(12);
  const [globalLoss, setGlobalLoss] = useState(0.0474);
  const [globalAccuracy, setGlobalAccuracy] = useState(0.935);
  const [isTraining, setIsTraining] = useState(false);
  const [activeNodeIndex, setActiveNodeIndex] = useState<number | null>(null);

  const loadStatus = async () => {
    try {
      const res = await api.getFederatedStatus();
      setNodes(res.nodes);
      setGlobalRound(res.global_round);
      setGlobalLoss(res.global_loss);
      setGlobalAccuracy(res.global_accuracy);
    } catch (err) {
      console.error('Failed to load federated status:', err);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleRunRound = async () => {
    if (isTraining) return;
    setIsTraining(true);

    // Cinematic step-by-step progress through nodes
    setActiveNodeIndex(0);
    await new Promise(r => setTimeout(r, 800));
    setActiveNodeIndex(1);
    await new Promise(r => setTimeout(r, 800));
    setActiveNodeIndex(2);
    await new Promise(r => setTimeout(r, 800));
    setActiveNodeIndex(null);

    try {
      const res = await api.runFederatedRound();
      setNodes(res.nodes);
      setGlobalRound(res.global_round);
      setGlobalLoss(res.global_loss);
      setGlobalAccuracy(res.global_accuracy);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#00F2FE', '#8B5CF6', '#10B981']
      });
    } catch (err) {
      console.error('Failed to run federated round:', err);
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-wide font-mono flex items-center gap-2">
              FEDERATED LEARNING
              <span className="text-cyan-400 font-sans font-semibold text-base">
                MULTI-NODE CONSORTIUM
              </span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold uppercase tracking-wider">
              PRIVACY-PRESERVING AI
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-jurisdiction predictive training without patient record extraction. Models aggregate weight differentials only.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4" />
            FEDERATED LEARNING DEMONSTRATION
          </span>
          <button
            onClick={loadStatus}
            className="p-1.5 rounded-lg border border-slate-800 bg-background-card text-slate-400 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Primary Privacy Guarantee Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard glow="cyan" className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-mono uppercase font-bold text-cyan-300 block">
              RAW DATA STAYS LOCAL
            </span>
            <p className="text-xs text-slate-300 mt-0.5">
              Individual clinic patient footfalls and electronic registers remain on local premises behind hospital firewalls.
            </p>
          </div>
        </GlassCard>

        <GlassCard glow="green" className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-mono uppercase font-bold text-emerald-300 block">
              ONLY MODEL UPDATES ARE SHARED
            </span>
            <p className="text-xs text-slate-300 mt-0.5">
              Differential weight gradients with differential privacy noise (ε=1.2) are transmitted to the FedAvg aggregator.
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Global Consortium Performance Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <GlassCard className="p-4 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400">GLOBAL CONSORTIUM ROUND</span>
          <div className="text-3xl font-extrabold text-white font-mono">
            Round #{globalRound}
          </div>
          <span className="text-xs text-cyan-400 font-mono">FedAvg Synchronized</span>
        </GlassCard>

        <GlassCard className="p-4 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400">GLOBAL LOSS</span>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">
            {globalLoss}
          </div>
          <span className="text-xs text-slate-400 font-mono">Decreasing (-4.2% per round)</span>
        </GlassCard>

        <GlassCard className="p-4 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400">MODEL ACCURACY SCORE</span>
          <div className="text-3xl font-extrabold text-cyan-400 font-mono">
            {(globalAccuracy * 100).toFixed(1)}%
          </div>
          <span className="text-xs text-slate-400 font-mono">Ensemble Confidence</span>
        </GlassCard>

        <GlassCard className="p-4 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400">TOTAL SAMPLES TRAINED</span>
          <div className="text-3xl font-extrabold text-white font-mono">
            651,700
          </div>
          <span className="text-xs text-slate-400 font-mono">Cross-border cohort</span>
        </GlassCard>
      </div>

      {/* 3 Participating Federated Nodes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            Active Participating Consortium Nodes (3 Independent Enclaves)
          </span>
          <button
            onClick={handleRunRound}
            disabled={isTraining}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-glow-cyan"
          >
            <Play className={`h-3.5 w-3.5 fill-current ${isTraining ? 'animate-spin' : ''}`} />
            {isTraining ? 'Training Round in Progress...' : 'Execute Privacy-Preserving Round'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {nodes.map((node, idx) => {
            const isNodeActive = activeNodeIndex === idx;

            return (
              <GlassCard
                key={node.node_id}
                glow={isNodeActive ? 'cyan' : 'none'}
                className={`p-5 space-y-4 transition-all ${
                  isNodeActive ? 'border-cyan-400 shadow-glow-cyan scale-[1.02]' : ''
                }`}
              >
                <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {node.region}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5">{node.name}</h3>
                  </div>
                  <div
                    className={`p-2 rounded-lg border ${
                      isNodeActive
                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-400 animate-pulse'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    <Server className="h-5 w-5" />
                  </div>
                </div>

                {/* Node internal pipeline */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Local Samples:</span>
                    <span className="text-white font-bold">{node.samples_count.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Local Loss:</span>
                    <span className="text-emerald-400 font-bold">{node.local_loss}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Local Accuracy:</span>
                    <span className="text-cyan-400 font-bold">{(node.accuracy_score * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className={isNodeActive ? 'text-amber-400 font-bold animate-pulse' : 'text-emerald-400'}>
                      {isNodeActive ? 'TRAINING LOCAL MODEL' : node.status}
                    </span>
                  </div>
                </div>

                {/* Step Flow */}
                <div className="p-2.5 rounded-lg bg-background-deep border border-slate-800 text-[10px] font-mono text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    <span>LOCAL DATA ➔ LOCAL MODEL</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    <span>GRADIENT WEIGHTS ➔ SHARED MODEL</span>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
};
