import React, { useState } from 'react';
import { ActionBrief } from '../types';
import { GlassCard } from './GlassCard';
import { Sparkles, X, Copy, Check, ShieldAlert, Cpu, ArrowRight } from 'lucide-react';

interface ActionBriefModalProps {
  brief: ActionBrief | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
}

export const ActionBriefModal: React.FC<ActionBriefModalProps> = ({
  brief,
  isOpen,
  onClose,
  isLoading = false
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!brief) return;
    const text = `
GEMINI AI HEALTHCARE ACTION BRIEF
Generated: ${brief.generated_at}

[SITUATION]
${brief.situation}

[RISK]
${brief.risk}

[RECOMMENDED ACTION]
${brief.recommended_action}

[RESOURCE IMPACT]
${brief.resource_impact}

[RATIONALE]
${brief.rationale}

DISCLAIMER: ${brief.disclaimer}
`.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-background-panel border border-cyan-500/40 rounded-2xl shadow-glow-cyan overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-background-card/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                GEMINI AI ACTION BRIEF
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  OPERATIONAL LOGISTICS
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Automated clinical supply-chain intelligence brief
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {brief && (
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:border-cyan-400 transition-colors"
                title="Copy Brief to Clipboard"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-cyan-400">
              <Cpu className="h-8 w-8 animate-spin" />
              <p className="text-sm font-mono tracking-wider animate-pulse">
                Querying Gemini Neural Engine & Synthesizing PHC Buffer Signals...
              </p>
            </div>
          ) : brief ? (
            <>
              {/* Mandatory AI Safety Disclaimer Banner */}
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-300">
                <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold uppercase tracking-wider block">
                    {brief.disclaimer}
                  </span>
                  <span>
                    This operational plan does not constitute clinical patient prescription. Officers must inspect cold-chain and transit feasibility prior to dispatch.
                  </span>
                </div>
              </div>

              {/* 1. Situation */}
              <GlassCard className="p-4 border-l-4 border-l-cyan-500">
                <div className="text-[11px] font-mono uppercase font-bold text-cyan-400 mb-1">
                  1. SITUATION — What is happening?
                </div>
                <div className="text-sm text-slate-200 leading-relaxed">
                  {brief.situation}
                </div>
              </GlassCard>

              {/* 2. Risk */}
              <GlassCard className="p-4 border-l-4 border-l-rose-500">
                <div className="text-[11px] font-mono uppercase font-bold text-rose-400 mb-1">
                  2. RISK — What could happen?
                </div>
                <div className="text-sm text-slate-200 leading-relaxed">
                  {brief.risk}
                </div>
              </GlassCard>

              {/* 3. Recommended Action */}
              <GlassCard className="p-4 border-l-4 border-l-emerald-500">
                <div className="text-[11px] font-mono uppercase font-bold text-emerald-400 mb-1">
                  3. RECOMMENDED ACTION — What should the officer review/do?
                </div>
                <div className="text-sm text-slate-200 leading-relaxed font-medium">
                  {brief.recommended_action}
                </div>
              </GlassCard>

              {/* 4. Resource Impact */}
              <GlassCard className="p-4 border-l-4 border-l-amber-500">
                <div className="text-[11px] font-mono uppercase font-bold text-amber-400 mb-1">
                  4. RESOURCE IMPACT — What medicine/resource is involved?
                </div>
                <div className="text-sm text-slate-200 leading-relaxed">
                  {brief.resource_impact}
                </div>
              </GlassCard>

              {/* 5. Rationale */}
              <GlassCard className="p-4 border-l-4 border-l-purple-500">
                <div className="text-[11px] font-mono uppercase font-bold text-purple-400 mb-1">
                  5. RATIONALE — Why this recommendation?
                </div>
                <div className="text-sm text-slate-200 leading-relaxed">
                  {brief.rationale}
                </div>
              </GlassCard>

              <div className="text-[11px] text-right font-mono text-slate-500 pt-2">
                Synthesized at {brief.generated_at}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-slate-400 text-sm">
              No brief available. Select an alert or facility to generate an action brief.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-background-card/90 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Model: Gemini 1.5 Flash • Supply Chain Ops V1
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs tracking-wider uppercase transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
