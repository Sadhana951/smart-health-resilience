import React from 'react';
import { RiskLevel, SeverityLevel } from '../types';
import { clsx } from 'clsx';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel | SeverityLevel | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  size = 'md',
  showIcon = true
}) => {
  const norm = level.toUpperCase();

  const isCritical = norm === 'CRITICAL';
  const isWatch = norm === 'WATCH' || norm === 'WARNING';
  const isSafe = norm === 'SAFE' || norm === 'HEALTHY' || norm === 'OPTIMAL';
  const isInfo = norm === 'INFO' || norm === 'SURPLUS';

  const badgeConfig = isCritical
    ? {
        bg: 'bg-rose-500/10 text-rose-400 border-rose-500/40 shadow-glow-red',
        dot: 'bg-rose-500',
        icon: AlertCircle,
        label: 'CRITICAL RISK'
      }
    : isWatch
    ? {
        bg: 'bg-amber-500/10 text-amber-400 border-amber-500/40 shadow-glow-amber',
        dot: 'bg-amber-500',
        icon: AlertTriangle,
        label: 'WATCH'
      }
    : isSafe
    ? {
        bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-glow-green',
        dot: 'bg-emerald-500',
        icon: CheckCircle,
        label: 'SAFE'
      }
    : {
        bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-glow-cyan',
        dot: 'bg-cyan-500',
        icon: Info,
        label: 'INFO / SURPLUS'
      };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs font-medium gap-1.5',
    lg: 'px-3 py-1.5 text-sm font-semibold gap-2'
  };

  const Icon = badgeConfig.icon;

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border transition-all duration-200 uppercase tracking-wider',
        sizeClasses[size],
        badgeConfig.bg
      )}
    >
      <span className={clsx('h-1.5 w-1.5 rounded-full animate-pulse', badgeConfig.dot)} />
      {showIcon && <Icon className="h-3.5 w-3.5" />}
      <span>{badgeConfig.label}</span>
    </span>
  );
};
