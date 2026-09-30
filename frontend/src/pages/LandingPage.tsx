import React from 'react';
import { Link } from 'react-router-dom';
import { HeroNetworkCanvas } from '../animations/HeroNetworkCanvas';
import { GlassCard } from '../components/GlassCard';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Activity,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  ArrowLeftRight,
  Bot,
  Mic,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  Building2,
  Users,
  Bed
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { t } = useLanguage();

  const workflowSteps = [
    {
      step: '01',
      title: 'DATA',
      desc: 'Telemetry on PHC stock, bed occupancy, staff roster, weather and disease signals.',
      icon: Layers,
      color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10'
    },
    {
      step: '02',
      title: 'FORECAST',
      desc: 'Ensemble statistical models project 7, 14, and 30-day medicine consumption.',
      icon: TrendingUp,
      color: 'text-sky-400 border-sky-500/30 bg-sky-500/10'
    },
    {
      step: '03',
      title: 'DETECT',
      desc: 'Real-time calculation of days-to-stock-out and zero-buffer vulnerabilities.',
      icon: AlertTriangle,
      color: 'text-amber-400 border-amber-500/30 bg-amber-500/10'
    },
    {
      step: '04',
      title: 'ALERT',
      desc: 'Automated notification triage prioritizing PHCs facing imminent stock-outs.',
      icon: ShieldAlert,
      color: 'text-rose-400 border-rose-500/30 bg-rose-500/10'
    },
    {
      step: '05',
      title: 'REDISTRIBUTE',
      desc: 'Haversine geospatial matching finds surplus facilities and plots transit corridors.',
      icon: ArrowLeftRight,
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
    },
    {
      step: '06',
      title: 'ASSIST',
      desc: 'Gemini synthesizes 5-point plain-language operational Action Briefs for officers.',
      icon: Bot,
      color: 'text-purple-400 border-purple-500/30 bg-purple-500/10'
    },
    {
      step: '07',
      title: 'VOICE',
      desc: 'Field health workers query stock and supplies naturally in English, Hindi or Odia.',
      icon: Mic,
      color: 'text-teal-400 border-teal-500/30 bg-teal-500/10'
    },
    {
      step: '08',
      title: 'LEARN',
      desc: 'Federated learning aggregates model weights across states without exporting raw patient data.',
      icon: Cpu,
      color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10'
    }
  ];

  return (
    <div className="space-y-24 py-6">
      {/* SECTION 1 — HERO */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
        <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto mb-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-mono tracking-wider uppercase shadow-glow-cyan/20 animate-in fade-in duration-300">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>BUILT FOR INDIA-SCALE HEALTH RESILIENCE</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] font-sans">
            Healthcare Supply Chains That{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-sky-400">
              See the Shortage Before It Happens.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
            An AI-powered resilience platform giving India's Primary Health Centres (PHCs) real-time visibility into medicines, beds, staff and emerging health risks.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-sm tracking-wider uppercase transition-all shadow-glow-cyan hover:scale-[1.02]"
            >
              <span>{t('btn_enter')}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="#how-it-works"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-700 bg-background-panel/80 hover:bg-slate-800 text-white font-semibold text-sm tracking-wider uppercase transition-colors"
            >
              <span>{t('btn_how_it_works')}</span>
              <ChevronRight className="h-4 w-4 text-cyan-400" />
            </a>
          </div>

          {/* Floating Indicators */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl text-xs font-mono">
            <div className="p-3 rounded-xl border border-slate-800 bg-background-card/90">
              <span className="text-cyan-400 font-bold text-lg block">1,284</span>
              <span className="text-slate-400 text-[11px]">PHCs Monitored</span>
              <span className="text-[9px] text-slate-500 block pt-0.5">Demo Network</span>
            </div>
            <div className="p-3 rounded-xl border border-slate-800 bg-background-card/90">
              <span className="text-emerald-400 font-bold text-lg block">94%</span>
              <span className="text-slate-400 text-[11px]">Stock Visibility</span>
              <span className="text-[9px] text-slate-500 block pt-0.5">Automated Telemetry</span>
            </div>
            <div className="p-3 rounded-xl border border-slate-800 bg-background-card/90">
              <span className="text-sky-400 font-bold text-lg block">7-Day</span>
              <span className="text-slate-400 text-[11px]">Demand Forecast</span>
              <span className="text-[9px] text-slate-500 block pt-0.5">Bayesian ARIMA</span>
            </div>
            <div className="p-3 rounded-xl border border-slate-800 bg-background-card/90">
              <span className="text-rose-400 font-bold text-lg block">24</span>
              <span className="text-slate-400 text-[11px]">Active Alerts</span>
              <span className="text-[9px] text-slate-500 block pt-0.5">Early Warning</span>
            </div>
          </div>
        </div>

        {/* 3D India Healthcare Network Hero Visualization */}
        <div className="relative mt-8">
          <HeroNetworkCanvas />
        </div>
      </section>

      {/* SECTION 2 — PROBLEM & TRANSFORMATION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/30">
            SYSTEMIC CHALLENGE
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t('problem_title')}
          </h2>
          <p className="text-slate-400 text-sm">
            Primary Health Centres in rural India face asymmetric demand surges driven by monsoons, heatwaves, and localized seasonal outbreaks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <GlassCard glow="red" className="p-6">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 w-fit mb-4">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">MEDICINE STOCK-OUTS</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Critical antibiotics, anti-malarials, and ORS run low before officers have a complete network-wide view, causing avoidable emergency stock-outs.
            </p>
          </GlassCard>

          <GlassCard glow="amber" className="p-6">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 w-fit mb-4">
              <Building2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">RESOURCE BLIND SPOTS</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Stock, bed occupancy, and staff attendance are difficult to monitor simultaneously across distributed rural PHCs with fragmented paper logs.
            </p>
          </GlassCard>

          <GlassCard glow="cyan" className="p-6">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 w-fit mb-4">
              <Activity className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">EMERGENCY SURGES</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Floods, vector-borne outbreaks, and extreme heatwaves can rapidly change acute healthcare demand by 80% to 150% in under 72 hours.
            </p>
          </GlassCard>
        </div>

        {/* Animated Transformation: BEFORE vs AFTER */}
        <div className="rounded-2xl border border-slate-800 bg-background-card/90 p-8 shadow-glass">
          <div className="text-center mb-8">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
              PARADIGM SHIFT
            </span>
            <h3 className="text-2xl font-bold text-white">How Smart Health Transforms Healthcare Logistics</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* BEFORE */}
            <div className="p-6 rounded-xl border border-rose-500/30 bg-rose-950/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400 bg-rose-500/15 px-2.5 py-1 rounded">
                  TRADITIONAL / BEFORE
                </span>
                <span className="text-xs text-slate-400 font-mono">Reactive Routine</span>
              </div>
              <div className="space-y-3 font-mono text-xs text-slate-300">
                <div className="p-2.5 rounded bg-background-panel border border-slate-800 flex items-center gap-2">
                  <span className="text-rose-400 font-bold">1.</span>
                  <span>Fragmented, siloed weekly paper registers</span>
                </div>
                <div className="text-center text-slate-600">↓</div>
                <div className="p-2.5 rounded bg-background-panel border border-slate-800 flex items-center gap-2">
                  <span className="text-rose-400 font-bold">2.</span>
                  <span>Delayed outbreak recognition (5-7 days lag)</span>
                </div>
                <div className="text-center text-slate-600">↓</div>
                <div className="p-2.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold flex items-center gap-2">
                  <span className="text-rose-400">3.</span>
                  <span>Critical Stock-Out & Patient Distress</span>
                </div>
              </div>
            </div>

            {/* AFTER */}
            <div className="p-6 rounded-xl border border-emerald-500/40 bg-emerald-950/20 space-y-4 shadow-glow-green/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded">
                  SMART HEALTH / AFTER
                </span>
                <span className="text-xs text-cyan-300 font-mono">Predictive Resilience</span>
              </div>
              <div className="space-y-2.5 font-mono text-xs text-slate-200">
                <div className="p-2.5 rounded bg-background-panel border border-slate-800 flex items-center justify-between">
                  <span>Live Telemetry & Signals</span>
                  <span className="text-emerald-400 font-bold">Real-time</span>
                </div>
                <div className="p-2.5 rounded bg-background-panel border border-slate-800 flex items-center justify-between">
                  <span>AI Demand Forecasting</span>
                  <span className="text-cyan-400 font-bold">7-30 Days Ahead</span>
                </div>
                <div className="p-2.5 rounded bg-background-panel border border-slate-800 flex items-center justify-between">
                  <span>Early Warning Map Alert</span>
                  <span className="text-amber-400 font-bold">Triage Active</span>
                </div>
                <div className="p-2.5 rounded bg-background-panel border border-slate-800 flex items-center justify-between">
                  <span>Redistribution Corridors</span>
                  <span className="text-cyan-400 font-bold">Auto-Matched</span>
                </div>
                <div className="p-2.5 rounded bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-bold flex items-center justify-between">
                  <span>Unbroken Healthcare Resilience</span>
                  <span>Zero Stock-Out</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — HOW IT WORKS (8-Step Horizontal Workflow) */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30">
            SYSTEM ARCHITECTURE
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How It Works: End-to-End Operational Pipeline
          </h2>
          <p className="text-slate-400 text-sm">
            From rural facility data ingestion to Gemini Action Briefs and privacy-preserving federated model convergence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {workflowSteps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <GlassCard key={idx} className="p-5 relative flex flex-col justify-between hover:border-cyan-400/50">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-extrabold text-slate-500">
                      STEP {s.step}
                    </span>
                    <div className={`p-2 rounded-xl border ${s.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <h4 className="text-base font-bold text-white mb-2 tracking-wide font-mono">
                    {s.title}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>STAGE {idx + 1} OF 8</span>
                  <ArrowRight className="h-3 w-3 text-cyan-400" />
                </div>
              </GlassCard>
            );
          })}
        </div>
      </section>

      {/* SECTION 4 — CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl border border-cyan-500/40 bg-gradient-to-tr from-background-panel via-slate-900 to-cyan-950/40 p-8 sm:p-14 overflow-hidden shadow-glow-cyan text-center space-y-6">
          <div className="max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300 bg-cyan-500/20 px-3 py-1 rounded-full border border-cyan-500/40">
              OPERATIONAL READY
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              See the Shortage. Predict the Demand. Move Resources. Build Resilience.
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Experience the full interactive dashboard, live emergency simulation engine, and Gemini conversational assistant.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 font-bold text-sm tracking-wider uppercase transition-all shadow-glow-cyan scale-105"
            >
              <span>{t('btn_enter')}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/simulation"
              className="flex items-center gap-2 px-6 py-4 rounded-xl border border-rose-500/50 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-semibold text-sm tracking-wider uppercase transition-colors"
            >
              <span>Launch Emergency Simulation</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
