import React, { useEffect, useState } from 'react';
import { GlassCard } from './GlassCard';
import { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface MetricCardProps {
  title: string;
  value: number | string;
  unit?: string;
  subtitle?: string;
  icon: LucideIcon;
  status?: 'healthy' | 'warning' | 'critical' | 'info';
  glow?: 'cyan' | 'red' | 'amber' | 'green' | 'none';
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit = '',
  subtitle,
  icon: Icon,
  status = 'info',
  glow = 'none',
  onClick
}) => {
  const [displayValue, setDisplayValue] = useState<number | string>(
    typeof value === 'number' ? 0 : value
  );

  useEffect(() => {
    if (typeof value === 'number') {
      const start = 0;
      const end = value;
      const duration = 800;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (end - start) * easeOut);
        setDisplayValue(current);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayValue(end);
        }
      };

      requestAnimationFrame(animate);
    } else {
      setDisplayValue(value);
    }
  }, [value]);

  const statusColors = {
    healthy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    warning: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    critical: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    info: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
  };

  const statusDot = {
    healthy: 'bg-emerald-400 shadow-glow-green',
    warning: 'bg-amber-400 shadow-glow-amber',
    critical: 'bg-rose-400 shadow-glow-red animate-pulse',
    info: 'bg-cyan-400 shadow-glow-cyan'
  };

  return (
    <GlassCard glow={glow} onClick={onClick} className="p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className={clsx('p-2 rounded-lg border', statusColors[status])}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <div className="text-3xl font-extrabold tracking-tight text-white font-mono">
          {typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}
        </div>
        {unit && <span className="text-xs font-semibold text-slate-400 uppercase">{unit}</span>}
      </div>

      {subtitle && (
        <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-400">
          <span className={clsx('h-1.5 w-1.5 rounded-full', statusDot[status])} />
          <span className="truncate">{subtitle}</span>
        </div>
      )}
    </GlassCard>
  );
};
